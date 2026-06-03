import { readFileSync } from "node:fs";
import path from "node:path";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  fetchParlantAnswer,
  messageText,
  type ParlantChatMessage,
  type ParlantChatResponse,
} from "./estate-chat";
import { captureEstateLead } from "./twenty";
import type { EstateUIMessage } from "@/app/types/estate-chat";

type KnowledgePage = {
  route: string;
  title: string;
  text: string;
};

type SiteGraphNode = {
  title?: string;
  url?: string;
  summary?: string;
  text?: string;
  keywords?: string[];
  priority?: number;
};

type EstateKnowledge = {
  pages: KnowledgePage[];
  siteGraph: SiteGraphNode[];
  guardrails: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
};

type RouteDecision = {
  route: "fast" | "direct" | "parlant";
  reason: string;
};

const ESTATE_ROOT = process.env.ESTATE_ROOT ?? process.cwd();
const KNOWLEDGE_PATH =
  process.env.ESTATE_KNOWLEDGE_PATH ?? path.join(ESTATE_ROOT, "data", "estate-knowledge.json");
const FAST_MODEL = process.env.AI_SDK_FAST_MODEL ?? "gpt-5-nano-2025-08-07";
const FAST_REASONING_EFFORT = process.env.AI_SDK_FAST_REASONING_EFFORT ?? "minimal";
const PARLANT_ESCALATION_ENABLED = process.env.PARLANT_ESCALATION_ENABLED === "true";

let knowledgeCache: EstateKnowledge | null = null;

function knowledge() {
  if (!knowledgeCache) {
    knowledgeCache = JSON.parse(readFileSync(KNOWLEDGE_PATH, "utf8")) as EstateKnowledge;
  }
  return knowledgeCache;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9£\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(text: string) {
  const stop = new Set([
    "the",
    "and",
    "for",
    "you",
    "your",
    "with",
    "what",
    "where",
    "when",
    "how",
    "can",
    "could",
    "would",
    "should",
    "about",
    "more",
    "tell",
    "show",
    "site",
    "page",
  ]);
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 2 && !stop.has(token));
}

function isGreeting(text: string) {
  return /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[!. ]*$/i.test(text.trim());
}

function asksCapability(text: string) {
  return /\b(what can you do|how can you help|what should i ask)\b/i.test(text);
}

function isBookingOrLead(text: string) {
  return /\b(book|callback|call me|contact me|speak|appointment|consultation|human|adviser|advisor|email me|phone me)\b/i.test(
    text,
  );
}

function isHighRisk(text: string) {
  return /\b(guarantee|definitely|avoid all tax|hide assets|court dispute|safeguarding|abuse|deadline|lawsuit|sue|urgent|complex estate|farm|agricultural|complex business|business dispute|shareholder dispute)\b/i.test(
    text,
  );
}

function isSensitiveIntent(text: string) {
  return /\b(should i|do i need|what should i|would i need|is it right for me|best option|recommend|recommendation|avoid tax|reduce tax|inheritance tax|iht|tax planning|care fees?|care costs?|care funding|legal advice|financial advice|probate advice|eligibility|eligible|entitled|capacity|mental capacity|put my house|protect my house|protect my home|protect my assets|second marriage|blended family)\b/i.test(
    text,
  );
}

function isOutOfScope(text: string) {
  return /\b(boiler|plumb(?:er|ing)?|electrician|roof|car|mot|insurance claim|mortgage broker|conveyancing|divorce|criminal|employment tribunal)\b/i.test(
    text,
  );
}

function isSimpleNavigation(text: string) {
  return /\b(where|show|take me|find|reviews?|testimonials?|contact|email|phone|number|where we work|leamington|warwickshire|home visits?)\b/i.test(
    text,
  );
}

function routeFor(userText: string): RouteDecision {
  if (!userText.trim()) return { route: "fast", reason: "empty" };
  if (isGreeting(userText)) return { route: "fast", reason: "greeting" };
  if (isBookingOrLead(userText)) return { route: "fast", reason: "handoff" };
  if (isHighRisk(userText) || isSensitiveIntent(userText)) {
    return PARLANT_ESCALATION_ENABLED
      ? { route: "parlant", reason: "governed_intent" }
      : { route: "direct", reason: "governed_intent" };
  }
  if (isSimpleNavigation(userText)) return { route: "fast", reason: "navigation" };
  if (asksCapability(userText) || isOutOfScope(userText)) return { route: "fast", reason: "guardrail_draft" };
  return { route: "direct", reason: "site_answer" };
}

function extractContact(text: string) {
  const email = text.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] ?? "";
  const phone = text.match(/(?:\+44\s?|0)(?:\d[\s-]?){9,10}/)?.[0]?.trim() ?? "";
  const name =
    text.match(
      /(?:my name is|i am|i'm)\s+([a-z]+(?:\s+(?!and\b|my\b|email\b|phone\b|number\b|tel\b|telephone\b)[a-z]+)?)(?=\s+(?:and|my|email|phone|number|tel|telephone)\b|[,.]|$)/i,
    )?.[1] ?? "";
  return { name, email, phone };
}

async function nativeHandoff(input: {
  userText: string;
  id: string;
  metadata?: Record<string, unknown>;
}) {
  const contact = extractContact(input.userText);
  if (!contact.email && !contact.phone) {
    return {
      status: "needs_details",
      contact,
      required: ["name", "email or phone"],
    };
  }

  const result = await captureEstateLead({
    source: "assistant_handoff",
    name: contact.name || "Website chat visitor",
    email: contact.email,
    phone: contact.phone,
    message: input.userText,
    pageUrl: typeof input.metadata?.pageUrl === "string" ? input.metadata.pageUrl : "",
    chatId: input.id,
  });

  return {
    id: result.id,
    intent: "human_handoff",
    contact,
    crm: result.crm,
  };
}

function scoreText(queryTokens: string[], text: string, priority = 0) {
  const haystack = normalize(text);
  let score = priority / 10;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += token.length > 5 ? 4 : 2;
  }
  return score;
}

function retrievePages(userText: string, limit = 3) {
  const queryTokens = tokens(userText);
  return knowledge()
    .pages.map((page) => ({
      page,
      score: scoreText(queryTokens, `${page.title} ${page.route} ${page.text}`),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.page);
}

function inferNavigation(userText: string, limit = 4) {
  const queryTokens = tokens(userText);
  if (!queryTokens.length) return null;
  const lowered = normalize(userText);
  const explicitNavigation = /\b(where|show|take me|find|page|site|reviews?|services?|contact|email|phone|pricing|cost)\b/i.test(
    userText,
  );
  const targets = knowledge()
    .siteGraph.map((node) => {
      const text = `${node.title ?? ""} ${node.url ?? ""} ${node.summary ?? ""} ${node.text ?? ""} ${(node.keywords ?? []).join(" ")}`;
      let score = scoreText(queryTokens, text, node.priority ?? 0);
      const url = node.url ?? "";
      if (/\bservices?\b/.test(lowered) && url === "/#services") score += 100;
      if (/\breviews?|testimonials?\b/.test(lowered) && url === "/#reviews") score += 100;
      if (/\b(contact|email|phone|number)\b/.test(lowered) && url === "/contact#contact-details") score += 100;
      if (/\b(book|appointment|consultation|speak|callback|call me|contact me)\b/.test(lowered) && url === "/contact") {
        score += 100;
      }
      if (/\b(where we work|leamington|warwickshire|home visits?)\b/.test(lowered) && url === "/#where-we-work") {
        score += 100;
      }
      return { node, score };
    })
    .filter((item) => item.node.url && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ node, score }) => ({
      title: node.title ?? node.url ?? "Pathway page",
      url: node.url ?? "/",
      summary: node.summary ?? "",
      score: Math.round(score),
    }));

  if (!targets.length) return null;
  return {
    type: "semantic-navigation",
    auto: explicitNavigation,
    targets,
    query: userText,
  };
}

function draftAnswer(userText: string, navigation: ReturnType<typeof inferNavigation>) {
  const { contact } = knowledge();
  const phone = contact?.phone ?? "07902 863999";
  const email = contact?.email ?? "info@pathwayestateplanning.co.uk";

  if (isGreeting(userText)) {
    return "Hi, I can help you find the right starting point for estate planning. You can ask about Wills, Trusts, LPAs, inheritance tax planning, care planning, or where to find something on the site.";
  }
  if (asksCapability(userText)) {
    return "I can explain the basics, find the right page on the site, or help you arrange a conversation with Pathway. A good starting point is to tell me what prompted you to think about estate planning today.";
  }
  if (isBookingOrLead(userText)) {
    return "I can help pass your details to Pathway. Please only share the minimum contact details you are comfortable sending, such as your name and either an email address or phone number.";
  }
  if (isOutOfScope(userText)) {
    return `I do not have enough information in the Pathway knowledgebase to answer that confidently.\n\nPathway's website focuses on estate planning, Wills, Trusts, LPAs, inheritance tax planning, care planning, and related family planning questions.\n\nIf your question is about estate planning, the best next step is to speak with Pathway directly on ${phone} or email ${email}.`;
  }
  if (/\b(phone|number|email|contact)\b/i.test(userText)) {
    return `Here are Pathway's contact details:\n\n- Phone: ${phone}\n- Email: ${email}`;
  }
  if (navigation?.auto && navigation.targets.length) {
    const title = navigation.targets[0].title.replace(/[.。]+$/, "");
    return `I found the closest place on the site: ${title}.`;
  }
  return "I can help with general Pathway estate-planning information, but I cannot give personal legal, tax, financial, probate, or care-funding advice.";
}

function toModelMessages(messages: EstateUIMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-8)
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: messageText(message),
    }))
    .filter((message) => message.content);
}

function pageContext(pages: KnowledgePage[]) {
  return pages
    .map((page) => {
      const text = page.text.replace(/\s+/g, " ").slice(0, 900);
      return `TITLE: ${page.title}\nROUTE: ${page.route}\nCONTENT: ${text}`;
    })
    .join("\n\n---\n\n");
}

async function directAiSdkAnswer(userText: string, messages: EstateUIMessage[], pages: KnowledgePage[], navigation: ReturnType<typeof inferNavigation>) {
  if (!process.env.OPENAI_API_KEY) return draftAnswer(userText, navigation);

  const navContext = JSON.stringify(navigation?.targets?.slice(0, 4) ?? []);
  const result = await generateText({
    model: openai(FAST_MODEL),
    system: [
      "You are the Pathway Estate Planning website assistant for England and Wales.",
      "Use only the supplied Pathway website context and site graph targets.",
      "Keep answers concise, warm, and plain-English.",
      "Never provide definitive legal, tax, financial, probate, eligibility, care-funding, fee, timeframe, or outcome advice.",
      "For personal recommendations or sensitive advice, say Pathway should speak with them directly.",
      "For governed or personal questions, give only general context and explicitly say Pathway should understand the details before anyone relies on a recommendation.",
      "Do not ask for sensitive personal details in chat.",
      "Use Markdown with short paragraphs and only occasional bullets.",
    ].join(" "),
    messages: [
      ...toModelMessages(messages),
      {
        role: "user",
        content: [
          `Latest user message: ${userText}`,
          `Website context:\n${pageContext(pages) || "No matching page context."}`,
          `Site graph targets:\n${navContext}`,
          "Return only the answer text.",
        ].join("\n\n"),
      },
    ],
    maxOutputTokens: 450,
    providerOptions: {
      openai: {
        reasoningEffort: FAST_REASONING_EFFORT,
      },
    },
  });
  let answer = result.text.trim() || draftAnswer(userText, navigation);
  if ((isSensitiveIntent(userText) || isHighRisk(userText)) && !/\b(Pathway|speak directly|personal advice)\b/i.test(answer)) {
    answer += "\n\nThis is general information, not personal legal, tax, financial, probate, or care-funding advice. Pathway should understand the details before anyone relies on a recommendation.";
  }
  return answer;
}

export async function answerEstateChatWithLiteRouter(input: {
  id: string;
  messages: EstateUIMessage[];
  metadata?: Record<string, unknown>;
}): Promise<ParlantChatResponse> {
  const userText = [...input.messages].reverse().find((message) => message.role === "user")
    ? messageText([...input.messages].reverse().find((message) => message.role === "user") as EstateUIMessage)
    : "";
  const decision = routeFor(userText);
  const pages = retrievePages(userText);
  const navigation = inferNavigation(userText);

  if (decision.route === "parlant") {
    const parlantMessages: ParlantChatMessage[] = input.messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({ role: message.role, content: messageText(message) }))
      .filter((message) => message.content.length > 0);
    const response = await fetchParlantAnswer({
      id: input.id,
      messages: parlantMessages,
      metadata: input.metadata,
    });
    return {
      ...response,
      model: {
        ...(typeof response.model === "object" && response.model ? response.model : {}),
        routeOwner: "ai-sdk-lite-router",
        route: "parlant",
        routeReason: decision.reason,
      },
    };
  }

  const handoff = decision.reason === "handoff"
    ? await nativeHandoff({
        userText,
        id: input.id,
        metadata: input.metadata,
      })
    : null;
  const text =
    decision.route === "fast"
      ? draftAnswer(userText, navigation)
      : await directAiSdkAnswer(userText, input.messages, pages, navigation);

  return {
    id: input.id,
    text,
    matchedRoutes: pages.map((page) => page.route),
    handoff,
    guardrails: knowledge().guardrails,
    navigation,
    model: {
      provider: decision.route === "direct" ? "openai" : "deterministic",
      id: decision.route === "direct" ? FAST_MODEL : "sitegraph-draft",
      routeOwner: "ai-sdk-lite-router",
      route: decision.route,
      routeReason: decision.reason,
      used: decision.route === "direct",
      nativeFallback: {
        provider: "parlant",
        skipped: true,
        enabled: PARLANT_ESCALATION_ENABLED,
      },
    },
  };
}
