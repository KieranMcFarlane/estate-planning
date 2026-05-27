import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const routes = [
  "/",
  "/wills",
  "/trusts",
  "/lpa",
  "/inheritance-tax-planning",
  "/business-protection",
  "/agricultural-land",
  "/asset-protection",
  "/care-planning",
  "/estate-planning",
  "/extended-services",
  "/helpful-info",
  "/glossary",
  "/faq",
  "/how-it-works",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/complaints",
];

const baseUrl = process.env.ESTATE_KNOWLEDGE_BASE_URL ?? "https://estate.nakanodigital.com";
const outPath = process.env.ESTATE_KNOWLEDGE_PATH ?? path.join(process.cwd(), "data", "estate-knowledge.json");

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)));
}

function pageShell(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i);
  if (main) return main[0];

  const body = html.match(/<body[\s\S]*?<\/body>/i);
  return body?.[0] ?? html;
}

function extractText(html) {
  return decodeEntities(
    pageShell(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function slugTitle(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summaryFromText(text, maxLength = 180) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  let summary = "";
  for (const sentence of sentences) {
    if (!sentence) continue;
    const next = summary ? `${summary} ${sentence}` : sentence;
    if (next.length > maxLength) break;
    summary = next;
  }
  if (summary.length >= 60) return summary;
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

function tokenize(value) {
  const stop = new Set([
    "about",
    "after",
    "also",
    "and",
    "are",
    "can",
    "for",
    "from",
    "have",
    "help",
    "how",
    "into",
    "our",
    "pathway",
    "that",
    "the",
    "their",
    "this",
    "through",
    "what",
    "when",
    "where",
    "with",
    "you",
    "your",
  ]);
  const counts = new Map();
  for (const match of value.toLowerCase().matchAll(/[a-z0-9']+/g)) {
    const token = match[0];
    if (token.length <= 2 || stop.has(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
    if (token.endsWith("s") && token.length > 3) {
      const singular = token.slice(0, -1);
      counts.set(singular, (counts.get(singular) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([token]) => token);
}

function extractHeadings(html) {
  const headings = [];
  const shell = pageShell(html);
  const headingPattern = /<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  for (const match of shell.matchAll(headingPattern)) {
    const text = stripHtml(match[3]);
    if (!text) continue;
    const id = match[2].match(/\sid=["']([^"']+)["']/i)?.[1] ?? null;
    headings.push({
      level: Number(match[1]),
      id,
      text,
    });
  }
  return headings;
}

function extractSectionNodes(route, html, pageTitle) {
  const shell = pageShell(html);
  const nodes = [];
  const sectionPattern = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  for (const match of shell.matchAll(sectionPattern)) {
    const id = match[1].match(/\sid=["']([^"']+)["']/i)?.[1];
    if (!id) continue;
    const sectionHtml = match[2];
    const heading = sectionHtml.match(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/i);
    const title = heading ? stripHtml(heading[2]) : slugTitle(id);
    const text = stripHtml(sectionHtml);
    if (!text) continue;
    const url = route === "/" ? `/#${id}` : `${route}#${id}`;
    nodes.push({
      kind: "section",
      route,
      url,
      title,
      summary: summaryFromText(text),
      text,
      headings: [{ level: heading ? Number(heading[1]) : 2, id, text: title }],
      sectionIds: [id],
      keywords: tokenize(`${title} ${id.replace(/[-_]/g, " ")} ${text}`).slice(0, 30),
      synonyms: [],
      priority: route === "/" ? 75 : 55,
      relatedRoutes: [route],
      parentTitle: pageTitle,
    });
  }
  return nodes;
}

function attributeValue(attrs, name) {
  return attrs.match(new RegExp(`\\s${name}=["']([^"']+)["']`, "i"))?.[1] ?? null;
}

function extractSemanticBlockNodes(route, html, pageTitle) {
  const shell = pageShell(html);
  const nodes = [];
  const semanticPattern = /<(section|article|div|p|li|figure|a)\b([^>]*)data-semantic-id=["']([^"']+)["'][^>]*>/gi;
  const seen = new Set();

  for (const match of shell.matchAll(semanticPattern)) {
    const attrs = match[2] ?? "";
    const semanticId = match[3];
    if (!semanticId || seen.has(semanticId)) continue;
    seen.add(semanticId);

    const tag = match[1];
    const contentStart = (match.index ?? 0) + match[0].length;
    const closePattern = new RegExp(`</${tag}>`, "i");
    const closeMatch = closePattern.exec(shell.slice(contentStart));
    if (!closeMatch) continue;
    const blockHtml = shell.slice(contentStart, contentStart + closeMatch.index);
    const text = stripHtml(blockHtml);
    if (!text || text.length < 24) continue;

    const heading = blockHtml.match(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/i);
    const explicitTitle = attributeValue(attrs, "data-semantic-title");
    const fallbackTitle = text.length <= 90 ? text : slugTitle(semanticId);
    const title = explicitTitle ?? (heading ? stripHtml(heading[2]) : fallbackTitle);
    const url = route === "/" ? `/#${semanticId}` : `${route}#${semanticId}`;

    nodes.push({
      kind: "semantic-block",
      route,
      url,
      title,
      summary: summaryFromText(text),
      text,
      headings: [{ level: heading ? Number(heading[1]) : 3, id: semanticId, text: title }],
      sectionIds: [semanticId],
      keywords: tokenize(`${title} ${semanticId.replace(/[-_]/g, " ")} ${text}`).slice(0, 40),
      synonyms: [],
      priority: route === "/" ? 72 : 76,
      relatedRoutes: [route],
      parentTitle: pageTitle,
    });
  }

  return nodes;
}

function titleFromRoute(route, html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const title = stripHtml(h1[1]);
    if (title) return title;
  }

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    const cleaned = decodeEntities(title[1])
      .replace(/\s*\|\s*Pathway Estate Planning.*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned) return cleaned;
  }

  if (route === "/") return "Home";
  return route
    .slice(1)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function fetchRoute(route) {
  const url = new URL(route, baseUrl).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const html = await response.text();
  const text = extractText(html);
  const title = titleFromRoute(route, html);
  const headings = extractHeadings(html);
  return {
    route,
    url,
    title,
    text,
    headings,
    sections: extractSectionNodes(route, html, title),
    semanticBlocks: extractSemanticBlockNodes(route, html, title),
  };
}

const pages = [];
for (const route of routes) {
  pages.push(await fetchRoute(route));
}

const priorityByRoute = new Map([
  ["/", 70],
  ["/wills", 95],
  ["/trusts", 94],
  ["/lpa", 93],
  ["/contact", 92],
  ["/estate-planning", 88],
  ["/how-it-works", 84],
  ["/care-planning", 82],
  ["/inheritance-tax-planning", 82],
  ["/asset-protection", 80],
  ["/extended-services", 78],
  ["/helpful-info", 76],
  ["/faq", 74],
  ["/glossary", 72],
]);

const routeSynonyms = {
  "/wills": ["will", "wills", "last will", "testament", "executor", "executors", "inheritance wishes", "children guardians", "guardianship", "who inherits", "what happens when I die", "leave money", "leave property"],
  "/trusts": ["trust", "trusts", "trustee", "beneficiary", "beneficiaries", "protecting assets for children", "future generations", "asset protection", "family trust", "will trust", "vulnerable beneficiary", "control inheritance", "protect inheritance", "second marriage", "blended family", "children from first marriage", "children from previous marriage", "life interest", "property protection", "protect the house", "protecting the house", "husband can stay in the house", "wife can stay in the house"],
  "/lpa": ["lasting power of attorney", "lasting powers of attorney", "power of attorney", "LPAs", "LPA", "capacity", "mental capacity", "loss of capacity", "memory problems", "dementia", "health decisions", "financial decisions", "property and affairs", "health and welfare", "decision maker", "mum", "dad", "parent", "mother", "father", "make decisions", "decisions for me"],
  "/inheritance-tax-planning": ["inheritance tax", "IHT", "mitigating tax", "tax planning", "tax exposure", "tax allowance", "tax relief", "nil rate band", "residence nil rate band", "reduce inheritance tax", "estate tax"],
  "/care-planning": ["care fees", "care costs", "care home fees", "later life", "later-life care", "care home", "home care", "elderly parent", "care decisions", "care planning", "funding care", "paying for care", "mum care", "dad care", "protect home from care costs", "family care decisions"],
  "/business-protection": ["business owner", "company", "shareholder", "partnership", "succession planning", "business succession", "director", "limited company", "key person", "business continuity"],
  "/agricultural-land": ["farm", "farming", "farmer", "agricultural", "rural estate", "land", "agricultural property", "agricultural land", "acreage", "farm succession", "rural planning"],
  "/asset-protection": ["protect assets", "protect property", "family assets", "gifting", "protect house", "protect home", "protect the house", "protect wealth", "care costs", "care fees", "property protection", "lifetime gifts", "asset protection"],
  "/extended-services": ["probate", "grant of probate", "estate administration", "connected advice", "property support", "financial advice", "related support", "extended services"],
  "/helpful-info": ["checklist", "estate planning checklist", "helpful information", "guide", "guides", "review documents", "what to check", "planning checklist"],
  "/glossary": ["glossary", "terms", "jargon", "meaning", "define", "definition", "what does it mean", "what does that mean", "executor meaning", "beneficiary meaning", "trustee meaning", "probate meaning", "intestacy meaning", "rules of intestacy", "legal words"],
  "/contact": ["call", "call me", "email", "book", "appointment", "conversation", "evening call", "human follow-up", "contact details", "phone number", "speak to someone", "talk to someone", "sensitive details", "get in touch", "consultation", "enquiry"],
  "/how-it-works": ["process", "steps", "what happens", "first step", "signing", "drafting", "how it works", "journey", "what to expect", "next step"],
  "/#where-we-work": ["Leamington Spa", "Warwickshire", "home visits", "office", "location", "where based", "where do you work", "visiting families", "local"],
  "/#services": ["services", "what Pathway helps with", "service list", "what do you offer", "what can you help with", "range of services"],
  "/#reviews": ["reviews", "review", "testimonials", "testimonial", "feedback", "what clients say", "client stories"],
  "/#faq": ["homepage faq", "homepage questions", "common homepage questions"],
  "/#newsletter": ["newsletter", "celebrity fun facts", "celebrity stories", "plain english guides", "updates", "sign up"],
  "/#contact": ["book", "contact", "initial chat", "conversation", "start a chat", "final cta"],
};

const semanticSynonymRules = [
  {
    when: ({ route, haystack }) => route === "/trusts" && /\b(children|grandchildren|inheritance|asset|assets|family|trust|protect|future|vulnerable)\b/i.test(haystack),
    synonyms: ["second marriage", "blended family", "children from first marriage", "children from previous marriage", "protect the house", "property protection", "life interest", "protect inheritance", "protecting assets for children"],
  },
  {
    when: ({ route, haystack }) => route === "/lpa" && /\b(lpa|attorney|capacity|health|welfare|financial|decision|decisions|support|family)\b/i.test(haystack),
    synonyms: ["memory problems", "mum has memory problems", "dad has memory problems", "loss of capacity", "mental capacity", "make decisions", "health decisions", "financial decisions", "who should be involved"],
  },
  {
    when: ({ route, haystack }) => route === "/care-planning" && /\b(care|later|life|family|decision|support|funding|home)\b/i.test(haystack),
    synonyms: ["care costs", "care fees", "care home fees", "funding care", "paying for care", "later-life care", "care home", "protect home from care costs"],
  },
  {
    when: ({ route, haystack }) => route === "/inheritance-tax-planning" && /\b(tax|inheritance|estate|relief|allowance|planning)\b/i.test(haystack),
    synonyms: ["IHT", "inheritance tax", "mitigating tax", "tax exposure", "reduce inheritance tax", "tax planning"],
  },
  {
    when: ({ route, haystack }) => route === "/contact" && /\b(contact|call|email|phone|conversation|appointment|enquiry|consultation)\b/i.test(haystack),
    synonyms: ["call me", "evening call", "speak to someone", "talk to someone", "contact details", "sensitive details", "human follow-up"],
  },
  {
    when: ({ route, haystack }) => route === "/glossary" && /\b(executor|trustee|beneficiary|probate|intestacy|term|meaning|definition|glossary)\b/i.test(haystack),
    synonyms: ["what does this mean", "what does it mean", "define this", "define term", "meaning of", "executor meaning", "trustee meaning", "beneficiary meaning", "probate meaning"],
  },
];

function uniqueStrings(values) {
  const seen = new Set();
  const results = [];
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    results.push(text);
  }
  return results;
}

function synonymsForNode(node) {
  const haystack = `${node.url ?? ""} ${node.title ?? ""} ${node.summary ?? ""} ${node.text ?? ""}`;
  const ruleSynonyms = semanticSynonymRules.flatMap((rule) => (rule.when({ route: node.route, haystack }) ? rule.synonyms : []));
  return uniqueStrings([
    ...(routeSynonyms[node.route] ?? []),
    ...(routeSynonyms[node.url] ?? []),
    ...(node.synonyms ?? []),
    ...ruleSynonyms,
  ]);
}

function buildPageGraphNode(page) {
  const synonyms = routeSynonyms[page.route] ?? [];
  return {
    kind: "page",
    route: page.route,
    url: page.route,
    title: page.title,
    summary: summaryFromText(page.text),
    text: page.text,
    headings: page.headings,
    sectionIds: page.sections.map((section) => section.sectionIds[0]),
    keywords: tokenize(`${page.title} ${page.route.replace(/[-/]/g, " ")} ${synonyms.join(" ")} ${page.text}`).slice(0, 45),
    synonyms,
    priority: priorityByRoute.get(page.route) ?? 60,
    relatedRoutes: [],
  };
}

const siteGraph = pages.flatMap((page) => {
  const pageNode = buildPageGraphNode(page);
  const sections = page.sections.map((section) => ({
    ...section,
    synonyms: synonymsForNode(section),
    keywords: tokenize(`${section.title} ${section.sectionIds.join(" ")} ${section.text} ${synonymsForNode(section).join(" ")}`).slice(0, 45),
    priority: section.url === "/#where-we-work" ? 88 : section.priority,
  }));
  const semanticBlocks = page.semanticBlocks.map((block) => ({
    ...block,
    synonyms: synonymsForNode(block),
    keywords: tokenize(`${block.title} ${block.sectionIds.join(" ")} ${block.text} ${synonymsForNode(block).join(" ")}`).slice(0, 50),
  }));
  return [pageNode, ...sections, ...semanticBlocks];
});

const glossary = [
  ["Will", "A legal document that sets out who should receive your estate and who should manage it after you die.", ["wills", "last will", "testament"]],
  ["Trust", "A legal arrangement where assets are held and managed by trustees for beneficiaries.", ["trusts", "asset protection"]],
  ["Trustee", "A person or professional appointed to manage trust assets responsibly.", ["trustees"]],
  ["Executor", "The person or people appointed in a Will to carry out wishes and administer an estate.", ["executors"]],
  ["Beneficiary", "A person, charity or organisation who receives something from an estate or trust.", ["beneficiaries"]],
  ["Lasting Power of Attorney", "A document that appoints trusted people to make decisions if someone cannot make them themselves.", ["LPA", "LPAs", "power of attorney"]],
  ["Probate", "The legal and administrative process of dealing with someone's estate after they have died.", ["estate administration"]],
  ["Inheritance Tax", "A tax that may apply to an estate depending on value, allowances, reliefs and exemptions.", ["IHT", "tax planning"]],
  ["Rules of Intestacy", "The legal rules that decide who inherits if someone dies without a valid Will.", ["intestacy", "no will"]],
  ["Care Planning", "Planning ahead for later-life care decisions, family roles and practical options.", ["later-life planning", "care fees"]],
  ["Mitigating Tax", "Exploring appropriate planning options that may reduce unnecessary tax exposure.", ["reduce inheritance tax", "tax mitigation"]],
  ["Pathway Estate Planning", "A Leamington Spa estate planning practice supporting wills, trusts, LPAs, care planning and related services.", ["Pathway", "Pathway Estate Planning Specialists"]],
];

const payload = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pages: pages.map(({ sections, semanticBlocks, ...page }) => page),
  siteGraph,
  glossary: glossary.map(([term, description, synonyms]) => ({ term, description, synonyms })),
  guardrails: [
    "Never provide definitive legal, tax, financial, probate, or care funding advice.",
    "Do not invent fees, timeframes, tax savings, legal outcomes, eligibility, accreditations, or availability.",
    "Use plain English, a warm tone, and avoid cold or morbid framing.",
    "If the answer is not supported by the knowledgebase, say so and offer a human follow-up.",
    "For urgent deadlines, disputes, safeguarding, complex tax, business, land, or personal legal questions, recommend speaking directly to Pathway.",
    "Ask only for minimal contact information when arranging a handoff.",
  ],
  contact: {
    phone: "07902 863999",
    email: "info@pathwayestateplanning.co.uk",
    location: "Leamington Spa, Warwickshire",
  },
};

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${pages.length} pages to ${outPath}`);
