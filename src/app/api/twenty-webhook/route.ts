import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { estateDatabaseConfigured, getChatMessages } from "@/app/api/_lib/estate-chat-store";

export const runtime = "nodejs";

const DEFAULT_EVENTS_PATH = "/home/ubuntu/repos/estate-planning/data/leads/twenty-webhook-events.jsonl";
const DEFAULT_SUMMARY_STATE_PATH = "/home/ubuntu/repos/estate-planning/data/leads/twenty-lead-summary-state.json";
const DEFAULT_SUMMARIES_PATH = "/home/ubuntu/repos/estate-planning/data/leads/twenty-lead-summaries.jsonl";
const DEFAULT_HERMES_DISPATCHES_PATH = "/home/ubuntu/repos/estate-planning/data/leads/hermes-lead-dispatches.jsonl";
const DEFAULT_HERMES_FAILURES_PATH = "/home/ubuntu/repos/estate-planning/data/leads/hermes-lead-dispatch-failures.jsonl";
const DEFAULT_WHATSAPP_DISPATCHES_PATH = "/home/ubuntu/repos/estate-planning/data/leads/whatsapp-lead-dispatches.jsonl";
const DEFAULT_WHATSAPP_FAILURES_PATH = "/home/ubuntu/repos/estate-planning/data/leads/whatsapp-lead-dispatch-failures.jsonl";
const LEAD_EVENT_NAMES = new Set(["person.created", "note.created", "noteTarget.created"]);

type TwentyPerson = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
};

type TwentyNote = {
  id: string;
  title: string;
  markdown: string;
  source: string;
  pageUrl: string;
  chatId: string;
  message: string;
  createdAt: string;
};

type TwentyNoteTarget = {
  id: string;
  noteId: string;
  personId: string;
  createdAt: string;
};

type SummaryState = {
  persons: Record<string, TwentyPerson>;
  notes: Record<string, TwentyNote>;
  noteTargets: Record<string, TwentyNoteTarget>;
  completedNoteTargetIds: Record<string, true>;
};

type LeadSummary = {
  id: string;
  createdAt: string;
  source: string;
  personId: string;
  noteId: string;
  noteTargetId: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  pageUrl: string;
  chatId: string;
  message: string;
};

type LeadContext = {
  recentConversation: string;
};

type HermesDispatchResult =
  | {
      status: "accepted";
      response: unknown;
      output?: string;
    }
  | {
      status: "skipped" | "failed";
      reason?: string;
      response?: unknown;
      httpStatus?: number;
    };

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function configuredSecret() {
  return clean(process.env.TWENTY_WEBHOOK_SECRET);
}

function signatureHeader(headers: Headers) {
  return clean(headers.get("x-twenty-webhook-signature"));
}

function timestampHeader(headers: Headers) {
  return clean(headers.get("x-twenty-webhook-timestamp"));
}

function normalizeSignature(value: string) {
  return value.startsWith("sha256=") ? value.slice("sha256=".length) : value;
}

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) return false;
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function verifySignature(input: { body: string; headers: Headers }) {
  const secret = configuredSecret();
  if (!secret) return { ok: true, configured: false };

  const provided = normalizeSignature(signatureHeader(input.headers));
  const timestamp = timestampHeader(input.headers);
  if (!provided || !timestamp) return { ok: false, configured: true, reason: "missing_signature" };

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}:${input.body}`)
    .digest("hex");

  if (!safeEqualHex(provided, expected)) {
    return { ok: false, configured: true, reason: "invalid_signature" };
  }

  return { ok: true, configured: true };
}

function eventName(payload: unknown) {
  if (!payload || typeof payload !== "object") return "unknown";
  const record = payload as Record<string, unknown>;
  return clean(record.eventName) || clean(record.event) || "unknown";
}

function eventRecord(payload: unknown) {
  if (!payload || typeof payload !== "object") return {};
  const body = payload as Record<string, unknown>;
  const record = body.record ?? (body.data as unknown);
  return record && typeof record === "object" ? (record as Record<string, unknown>) : {};
}

function eventsPath() {
  return process.env.TWENTY_WEBHOOK_EVENTS_PATH ?? DEFAULT_EVENTS_PATH;
}

function summaryStatePath() {
  return process.env.TWENTY_LEAD_SUMMARY_STATE_PATH ?? DEFAULT_SUMMARY_STATE_PATH;
}

function summariesPath() {
  return process.env.TWENTY_LEAD_SUMMARIES_PATH ?? DEFAULT_SUMMARIES_PATH;
}

function hermesDispatchesPath() {
  return process.env.HERMES_LEAD_DISPATCHES_PATH ?? DEFAULT_HERMES_DISPATCHES_PATH;
}

function hermesFailuresPath() {
  return process.env.HERMES_LEAD_DISPATCH_FAILURES_PATH ?? DEFAULT_HERMES_FAILURES_PATH;
}

function whatsappDispatchesPath() {
  return process.env.HERMES_WHATSAPP_LEAD_DISPATCHES_PATH ?? DEFAULT_WHATSAPP_DISPATCHES_PATH;
}

function whatsappFailuresPath() {
  return process.env.HERMES_WHATSAPP_LEAD_DISPATCH_FAILURES_PATH ?? DEFAULT_WHATSAPP_FAILURES_PATH;
}

async function appendJsonl(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(value)}\n`, "utf8");
}

async function readSummaryState(): Promise<SummaryState> {
  try {
    const raw = await readFile(summaryStatePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<SummaryState>;
    return {
      persons: parsed.persons ?? {},
      notes: parsed.notes ?? {},
      noteTargets: parsed.noteTargets ?? {},
      completedNoteTargetIds: parsed.completedNoteTargetIds ?? {},
    };
  } catch {
    return { persons: {}, notes: {}, noteTargets: {}, completedNoteTargetIds: {} };
  }
}

async function writeSummaryState(state: SummaryState) {
  const path = summaryStatePath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function parseMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const source = clean(lines.find((line) => line.startsWith("Source:"))?.slice("Source:".length));
  const pageUrl = clean(lines.find((line) => line.startsWith("Page:"))?.slice("Page:".length));
  const chatId = clean(lines.find((line) => line.startsWith("Chat:"))?.slice("Chat:".length));
  const message = clean(lines.filter((line) => !/^(Source|Page|Chat):/.test(line)).join("\n"));
  return { source, pageUrl, chatId, message };
}

function asPerson(record: Record<string, unknown>): TwentyPerson | null {
  const id = clean(record.id);
  if (!id) return null;
  const name = record.name && typeof record.name === "object" ? (record.name as Record<string, unknown>) : {};
  const emails = record.emails && typeof record.emails === "object" ? (record.emails as Record<string, unknown>) : {};
  const phones = record.phones && typeof record.phones === "object" ? (record.phones as Record<string, unknown>) : {};
  return {
    id,
    firstName: clean(name.firstName),
    lastName: clean(name.lastName),
    email: clean(emails.primaryEmail),
    phone: [clean(phones.primaryPhoneCallingCode), clean(phones.primaryPhoneNumber)].filter(Boolean).join(" "),
    createdAt: clean(record.createdAt),
  };
}

function asNote(record: Record<string, unknown>): TwentyNote | null {
  const id = clean(record.id);
  if (!id) return null;
  const bodyV2 = record.bodyV2 && typeof record.bodyV2 === "object" ? (record.bodyV2 as Record<string, unknown>) : {};
  const markdown = clean(bodyV2.markdown);
  const parsed = parseMarkdown(markdown);
  return {
    id,
    title: clean(record.title),
    markdown,
    source: parsed.source,
    pageUrl: parsed.pageUrl,
    chatId: parsed.chatId,
    message: parsed.message,
    createdAt: clean(record.createdAt),
  };
}

function asNoteTarget(record: Record<string, unknown>): TwentyNoteTarget | null {
  const id = clean(record.id);
  const noteId = clean(record.noteId);
  const personId = clean(record.targetPersonId);
  if (!id || !noteId || !personId) return null;
  return {
    id,
    noteId,
    personId,
    createdAt: clean(record.createdAt),
  };
}

function buildLeadSummary(state: SummaryState, noteTarget: TwentyNoteTarget) {
  const person = state.persons[noteTarget.personId];
  const note = state.notes[noteTarget.noteId];
  if (!person || !note) return null;
  if (!note.source && !note.title) return null;

  return {
    id: `lead_summary_${noteTarget.id}`,
    createdAt: new Date().toISOString(),
    source: note.source || note.title,
    personId: person.id,
    noteId: note.id,
    noteTargetId: noteTarget.id,
    contact: {
      name: [person.firstName, person.lastName].filter(Boolean).join(" "),
      email: person.email,
      phone: person.phone,
    },
    pageUrl: note.pageUrl,
    chatId: note.chatId,
    message: note.message,
  };
}

function hermesConfig() {
  const enabled = ["1", "true", "yes"].includes(clean(process.env.HERMES_LEAD_AUTOMATION_ENABLED).toLowerCase());
  return {
    enabled,
    baseUrl: (process.env.HERMES_API_BASE_URL ?? "http://127.0.0.1:8642").replace(/\/$/, ""),
    apiKey: clean(process.env.HERMES_API_KEY),
    sessionKey: clean(process.env.HERMES_SESSION_KEY) || "pathway-estate-leads",
    timeoutMs: Number(process.env.HERMES_LEAD_TIMEOUT_MS ?? 8000),
    strategyWaitMs: Number(process.env.HERMES_LEAD_STRATEGY_WAIT_MS ?? 12000),
  };
}

function partText(part: unknown) {
  if (!part || typeof part !== "object") return "";
  const record = part as Record<string, unknown>;
  const text = record.text;
  if (typeof text === "string") return text;
  return "";
}

function messageText(message: { role: string; parts: unknown[] }) {
  return message.parts.map(partText).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

async function getLeadContext(summary: LeadSummary): Promise<LeadContext> {
  if (!summary.chatId || !estateDatabaseConfigured()) return { recentConversation: "" };

  try {
    const messages = await getChatMessages(summary.chatId);
    const recent = messages
      .filter((message) => message.role === "user")
      .map((message) => ({ role: message.role, text: messageText({ role: message.role, parts: message.parts as unknown[] }) }))
      .filter((message) => message.text)
      .slice(-6)
      .map((message) => `Visitor: ${message.text}`)
      .join("\n");

    return { recentConversation: recent.slice(0, 1400) };
  } catch {
    return { recentConversation: "" };
  }
}

function hermesLeadPrompt(summary: LeadSummary, context: LeadContext) {
  return [
    "A new Pathway Estate Planning website lead has been captured in Twenty CRM.",
    "",
    "Create a short internal follow-up strategy for the Pathway team. Do not provide legal, tax, or financial advice. Do not contact the public website visitor directly unless a separate Hermes workflow explicitly does that.",
    "",
    "Return a concise internal note with:",
    "- Lead intent",
    "- Useful context",
    "- Recommended next step",
    "- Any caution or missing information",
    "",
    `Lead summary ID: ${summary.id}`,
    `Source: ${summary.source}`,
    `Name: ${summary.contact.name || "Not provided"}`,
    `Email: ${summary.contact.email || "Not provided"}`,
    `Phone: ${summary.contact.phone || "Not provided"}`,
    `Page URL: ${summary.pageUrl || "Not provided"}`,
    `Chat ID: ${summary.chatId || "Not provided"}`,
    `Twenty Person ID: ${summary.personId}`,
    `Twenty Note ID: ${summary.noteId}`,
    `Twenty NoteTarget ID: ${summary.noteTargetId}`,
    "",
    "Message:",
    summary.message || "No message provided.",
    "",
    context.recentConversation ? `Recent chat context:\n${context.recentConversation}` : "Recent chat context: Not available.",
  ].join("\n");
}

function whatsappConfig() {
  const enabled = ["1", "true", "yes"].includes(clean(process.env.HERMES_WHATSAPP_NOTIFY_ENABLED).toLowerCase());
  return {
    enabled,
    bridgeUrl: (process.env.HERMES_WHATSAPP_BRIDGE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, ""),
    chatId: clean(process.env.HERMES_WHATSAPP_CHAT_ID),
    timeoutMs: Number(process.env.HERMES_WHATSAPP_TIMEOUT_MS ?? 8000),
  };
}

function whatsappLeadMessage(summary: LeadSummary, context: LeadContext, hermes?: HermesDispatchResult) {
  const strategy = hermes?.status === "accepted" ? clean(hermes.output) : "";
  return [
    "New Pathway lead",
    "",
    `Name: ${summary.contact.name || "Not provided"}`,
    `Email: ${summary.contact.email || "Not provided"}`,
    `Phone: ${summary.contact.phone || "Not provided"}`,
    `Source: ${summary.source}`,
    summary.pageUrl ? `Page: ${summary.pageUrl}` : "",
    "",
    "Message:",
    summary.message || "No message provided.",
    "",
    context.recentConversation ? `Context:\n${context.recentConversation}` : "Context: Not available.",
    "",
    strategy ? `Hermes strategy:\n${strategy}` : "",
    "",
    `Twenty Person: ${summary.personId}`,
    `Twenty Note: ${summary.noteId}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

async function dispatchLeadSummaryToWhatsapp(summary: LeadSummary, context: LeadContext, hermes?: HermesDispatchResult) {
  const config = whatsappConfig();
  const dispatchBase = {
    id: `whatsapp_dispatch_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
    createdAt: new Date().toISOString(),
    summaryId: summary.id,
    personId: summary.personId,
    noteId: summary.noteId,
    source: summary.source,
  };

  if (!config.enabled) {
    return { status: "skipped", reason: "HERMES_WHATSAPP_NOTIFY_ENABLED is not true" };
  }

  if (!config.chatId) {
    const failure = { ...dispatchBase, status: "failed" as const, reason: "HERMES_WHATSAPP_CHAT_ID is not set" };
    await appendJsonl(whatsappFailuresPath(), failure);
    return failure;
  }

  try {
    const response = await fetch(`${config.bridgeUrl}/send`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chatId: config.chatId,
        message: whatsappLeadMessage(summary, context, hermes),
      }),
      signal: AbortSignal.timeout(Number.isFinite(config.timeoutMs) ? config.timeoutMs : 8000),
    });

    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text.slice(0, 500);
    }

    if (!response.ok) {
      const failure = {
        ...dispatchBase,
        status: "failed" as const,
        httpStatus: response.status,
        response: payload,
      };
      await appendJsonl(whatsappFailuresPath(), failure);
      return failure;
    }

    const success = {
      ...dispatchBase,
      status: "sent",
      response: payload,
    };
    await appendJsonl(whatsappDispatchesPath(), success);
    return success;
  } catch (error) {
    const failure = {
      ...dispatchBase,
      status: "failed" as const,
      reason: error instanceof Error ? error.message : "Unknown WhatsApp dispatch error",
    };
    await appendJsonl(whatsappFailuresPath(), failure);
    return failure;
  }
}

function runIdFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  return clean(record.run_id) || clean(record.runId);
}

function runOutputFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  return clean(record.output);
}

async function pollHermesRunOutput(config: ReturnType<typeof hermesConfig>, runId: string) {
  if (!runId || !config.strategyWaitMs || config.strategyWaitMs <= 0) return "";

  const startedAt = Date.now();
  while (Date.now() - startedAt < config.strategyWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 750));
    const response = await fetch(`${config.baseUrl}/v1/runs/${encodeURIComponent(runId)}`, {
      headers: { authorization: `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(Math.min(5000, Math.max(1000, config.strategyWaitMs))),
    });
    if (!response.ok) continue;
    const payload = await response.json().catch(() => null);
    const status = payload && typeof payload === "object" ? clean((payload as Record<string, unknown>).status) : "";
    if (status === "completed") return runOutputFromPayload(payload);
    if (status === "failed" || status === "cancelled") return "";
  }

  return "";
}

async function dispatchLeadSummaryToHermes(summary: LeadSummary, context: LeadContext): Promise<HermesDispatchResult> {
  const config = hermesConfig();
  const dispatchBase = {
    id: `hermes_dispatch_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
    createdAt: new Date().toISOString(),
    summaryId: summary.id,
    personId: summary.personId,
    noteId: summary.noteId,
    source: summary.source,
  };

  if (!config.enabled) {
    return { status: "skipped", reason: "HERMES_LEAD_AUTOMATION_ENABLED is not true" };
  }

  if (!config.apiKey) {
    const failure = { ...dispatchBase, status: "failed" as const, reason: "HERMES_API_KEY is not set" };
    await appendJsonl(hermesFailuresPath(), failure);
    return failure;
  }

  try {
    const response = await fetch(`${config.baseUrl}/v1/runs`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
        "x-hermes-session-key": config.sessionKey,
      },
      body: JSON.stringify({
        input: hermesLeadPrompt(summary, context),
        instructions:
          "You are Agent Hermes handling Pathway Estate Planning lead operations. Produce a concise internal follow-up strategy. Keep actions practical, warm, and auditable. Treat this as internal business data.",
        metadata: {
          source: "pathway_estate",
          event: "lead.summary.created",
          summaryId: summary.id,
          personId: summary.personId,
          noteId: summary.noteId,
        },
      }),
      signal: AbortSignal.timeout(Number.isFinite(config.timeoutMs) ? config.timeoutMs : 8000),
    });

    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text.slice(0, 500);
    }

    if (!response.ok) {
      const failure = {
        ...dispatchBase,
        status: "failed" as const,
        httpStatus: response.status,
        response: payload,
      };
      await appendJsonl(hermesFailuresPath(), failure);
      return failure;
    }

    const success = {
      ...dispatchBase,
      status: "accepted" as const,
      response: payload,
    };
    const runId = runIdFromPayload(payload);
    const output = await pollHermesRunOutput(config, runId).catch(() => "");
    const enrichedSuccess = output ? { ...success, output } : success;
    await appendJsonl(hermesDispatchesPath(), enrichedSuccess);
    return enrichedSuccess;
  } catch (error) {
    const failure = {
      ...dispatchBase,
      status: "failed" as const,
      reason: error instanceof Error ? error.message : "Unknown Hermes dispatch error",
    };
    await appendJsonl(hermesFailuresPath(), failure);
    return failure;
  }
}

async function updateLeadSummary(event: string, record: Record<string, unknown>) {
  if (!LEAD_EVENT_NAMES.has(event)) return null;

  const state = await readSummaryState();
  if (event === "person.created") {
    const person = asPerson(record);
    if (person) state.persons[person.id] = person;
  }
  if (event === "note.created") {
    const note = asNote(record);
    if (note) state.notes[note.id] = note;
  }
  if (event === "noteTarget.created") {
    const noteTarget = asNoteTarget(record);
    if (noteTarget) state.noteTargets[noteTarget.id] = noteTarget;
  }

  const completedSummaries = Object.values(state.noteTargets)
    .filter((noteTarget) => !state.completedNoteTargetIds[noteTarget.id])
    .map((noteTarget) => ({ noteTarget, summary: buildLeadSummary(state, noteTarget) }))
    .filter((item): item is { noteTarget: TwentyNoteTarget; summary: NonNullable<ReturnType<typeof buildLeadSummary>> } =>
      Boolean(item.summary),
    );

  for (const { noteTarget, summary } of completedSummaries) {
    await appendJsonl(summariesPath(), summary);
    const context = await getLeadContext(summary);
    const hermes = await dispatchLeadSummaryToHermes(summary, context);
    await dispatchLeadSummaryToWhatsapp(summary, context, hermes);
    state.completedNoteTargetIds[noteTarget.id] = true;
  }

  await writeSummaryState(state);
  return completedSummaries.map(({ summary }) => summary);
}

export async function POST(request: Request) {
  const receivedAt = new Date().toISOString();
  const body = await request.text();
  const signature = verifySignature({ body, headers: request.headers });

  if (!signature.ok) {
    return Response.json({ status: "rejected", reason: signature.reason }, { status: 401 });
  }

  let payload: unknown = null;
  try {
    payload = body ? JSON.parse(body) : null;
  } catch {
    return Response.json({ status: "rejected", reason: "invalid_json" }, { status: 400 });
  }

  const event = eventName(payload);
  if (!LEAD_EVENT_NAMES.has(event)) {
    return Response.json({ status: "ignored", eventName: event });
  }

  const rawEvent = {
    id: `twenty_webhook_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
    receivedAt,
    eventName: event,
    signatureConfigured: signature.configured,
    payload,
  };

  await appendJsonl(eventsPath(), rawEvent);
  const summaries = await updateLeadSummary(event, eventRecord(payload));

  return Response.json({
    id: rawEvent.id,
    status: "received",
    summariesCreated: summaries?.length ?? 0,
  });
}
