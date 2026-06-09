import { answerEstateChatWithLiteRouter } from "../../_lib/estate-lite";
import type { EstateUIMessage } from "@/app/types/estate-chat";

export const runtime = "nodejs";
export const maxDuration = 60;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function authorized(request: Request) {
  const key = clean(process.env.HERMES_API_KEY);
  if (!key) return true;
  return clean(request.headers.get("authorization")) === `Bearer ${key}`;
}

function messageId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function toEstateMessage(input: unknown, fallbackRole: "user" | "assistant"): EstateUIMessage | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const role = record.role === "assistant" ? "assistant" : record.role === "user" ? "user" : fallbackRole;
  const content = clean(record.content ?? record.text ?? record.message);
  if (!content) return null;
  return {
    id: clean(record.id) || messageId(role === "user" ? "hermes_user" : "hermes_assistant"),
    role,
    parts: [{ type: "text", text: content }],
  } as EstateUIMessage;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const message = clean(record.message ?? record.input);
  const id = clean(record.id ?? record.sessionId ?? record.chatId) || messageId("hermes_chat");
  const history = Array.isArray(record.messages)
    ? record.messages.flatMap((item) => {
        const converted = toEstateMessage(item, "user");
        return converted ? [converted] : [];
      })
    : [];

  if (message) {
    history.push({
      id: messageId("hermes_user"),
      role: "user",
      parts: [{ type: "text", text: message }],
    } as EstateUIMessage);
  }

  if (!history.some((item) => item.role === "user")) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const result = await answerEstateChatWithLiteRouter({
    id,
    messages: history,
    metadata: {
      ...(record.metadata && typeof record.metadata === "object" ? record.metadata : {}),
      source: "hermes",
    },
  });

  return Response.json({
    id: result.id,
    text: result.text,
    matchedRoutes: result.matchedRoutes ?? [],
    handoff: result.handoff ?? null,
    guardrails: result.guardrails ?? [],
    navigation: result.navigation ?? null,
    model: result.model ?? null,
  });
}
