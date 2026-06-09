import type { UIMessage } from "ai";

export type NavigationTarget = {
  title: string;
  url: string;
  summary: string;
  score?: number;
};

export type ParlantChatMessage = {
  role: string;
  content: string;
};

export type ParlantChatResponse = {
  id: string;
  text: string;
  matchedRoutes?: string[];
  handoff?: unknown;
  guardrails?: string[];
  model?: unknown;
  navigation?: {
    type: string;
    auto?: boolean;
    targets?: NavigationTarget[];
    query?: string;
  } | null;
};

export function fallbackAnswer() {
  return [
    "The Pathway AI chat cannot complete that answer right now.",
    "You can still call 07902 863999 or email info@pathwayestateplanning.co.uk.",
    "For safety, please do not rely on chat for legal, tax, financial, urgent, or personal advice.",
  ].join("\n\n");
}

export function chunkText(text: string) {
  return text.match(/\S+\s*/g) ?? [text];
}

export function messageText(message: UIMessage): string {
  return message.parts
    .map((part) => {
      if (part.type === "text") return part.text;
      return "";
    })
    .join("")
    .trim();
}

export function toParlantMessages(messages: UIMessage[]): ParlantChatMessage[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: messageText(message),
    }))
    .filter((message) => message.content.length > 0);
}

export async function fetchParlantAnswer(body: {
  id?: string;
  messages: ParlantChatMessage[];
  metadata?: Record<string, unknown>;
}): Promise<ParlantChatResponse> {
  const baseUrl = process.env.PARLANT_BASE_URL ?? "http://127.0.0.1:8800";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      id: body.id,
      messages: body.messages,
      metadata: body.metadata ?? {},
    }),
    signal: AbortSignal.timeout(55_000),
  });

  if (!response.ok) {
    throw new Error(`Parlant service returned ${response.status}`);
  }

  return (await response.json()) as ParlantChatResponse;
}
