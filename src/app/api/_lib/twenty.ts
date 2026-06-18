import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { recordControlLeadCapture } from "./nakano-control";

export type EstateLeadInput = {
  source: "contact_form" | "assistant_handoff" | "cal_booking" | "newsletter_signup" | "initial_chat_request";
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  message?: string;
  pageUrl?: string;
  chatId?: string;
};

type TwentyResult =
  | {
      status: "created";
      personId?: string;
      noteId?: string;
    }
  | {
      status: "skipped" | "failed";
      reason: string;
    };

type TwentyCreateResponse = {
  id?: string;
  data?: {
    id?: string;
    createPerson?: { id?: string };
    createNote?: { id?: string };
  };
};

export type EstateLeadResult = {
  id: string;
  createdAt: string;
  crm: TwentyResult;
  fallbackPath: string;
};

const DEFAULT_LEADS_PATH = join(process.cwd(), "data", "leads", "estate-handoffs.jsonl");

function compact(value: string | undefined) {
  return value?.trim() ?? "";
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function twentyConfig() {
  return {
    baseUrl: (process.env.TWENTY_BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, ""),
    token: process.env.TWENTY_API_TOKEN ?? "",
  };
}

async function createTwentyPerson(input: EstateLeadInput): Promise<TwentyResult> {
  const { baseUrl, token } = twentyConfig();
  if (!token) return { status: "skipped", reason: "TWENTY_API_TOKEN is not set" };

  const name = compact(input.name) || compact(input.company) || "Website enquiry";
  const { firstName, lastName } = splitName(name);
  const email = compact(input.email);
  const phone = compact(input.phone);

  const body = {
    name: { firstName, lastName },
    ...(email ? { emails: { primaryEmail: email } } : {}),
    ...(phone ? { phones: { primaryPhoneNumber: phone, primaryPhoneCountryCode: "GB", primaryPhoneCallingCode: "+44" } } : {}),
  };

  try {
    const response = await fetch(`${baseUrl}/rest/people`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return { status: "failed", reason: `Twenty returned ${response.status}: ${text.slice(0, 240)}` };
    }

    const payload = (await response.json().catch(() => null)) as TwentyCreateResponse | null;
    const personId = payload?.data?.createPerson?.id ?? payload?.data?.id ?? payload?.id;
    const noteId = personId ? await createTwentyNote(input, personId) : undefined;
    return { status: "created", personId, noteId };
  } catch (error) {
    return { status: "failed", reason: error instanceof Error ? error.message : "Unknown Twenty error" };
  }
}

async function createTwentyNote(input: EstateLeadInput, personId: string) {
  const { baseUrl, token } = twentyConfig();
  const message = compact(input.message);
  if (!token || !message) return undefined;

  const noteResponse = await fetch(`${baseUrl}/rest/notes`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title:
        input.source === "contact_form"
          ? "Website enquiry"
          : input.source === "newsletter_signup"
            ? "Newsletter signup"
            : input.source === "initial_chat_request"
              ? "Initial chat request"
              : input.source === "cal_booking"
                ? "Cal.diy booking"
                : "Assistant handoff",
      bodyV2: {
        markdown: [
          `Source: ${input.source}`,
          input.company ? `Company: ${input.company}` : "",
          input.pageUrl ? `Page: ${input.pageUrl}` : "",
          input.chatId ? `Chat: ${input.chatId}` : "",
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
        blocknote: "",
      },
    }),
  });

  if (!noteResponse.ok) return undefined;
  const notePayload = (await noteResponse.json().catch(() => null)) as TwentyCreateResponse | null;
  const noteId = notePayload?.data?.createNote?.id ?? notePayload?.data?.id ?? notePayload?.id;
  if (!noteId) return undefined;

  await fetch(`${baseUrl}/rest/noteTargets`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      noteId,
      targetPersonId: personId,
    }),
  }).catch(() => undefined);

  return noteId;
}

export async function captureEstateLead(input: EstateLeadInput): Promise<EstateLeadResult> {
  const record = {
    id: `lead_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`,
    createdAt: new Date().toISOString(),
    source: input.source,
    contact: {
      name: compact(input.name),
      phone: compact(input.phone),
      email: compact(input.email),
      company: compact(input.company),
    },
    message: compact(input.message),
    pageUrl: compact(input.pageUrl),
    chatId: compact(input.chatId),
  };
  const crm = await createTwentyPerson(input);
  const fallbackPath = process.env.ESTATE_LEADS_PATH ?? DEFAULT_LEADS_PATH;

  await mkdir(dirname(fallbackPath), { recursive: true });
  await appendFile(fallbackPath, `${JSON.stringify({ ...record, crm })}\n`, "utf8");
  await recordControlLeadCapture({ ...record, crm });

  return {
    id: record.id,
    createdAt: record.createdAt,
    crm,
    fallbackPath,
  };
}
