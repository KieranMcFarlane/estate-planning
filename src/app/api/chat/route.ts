import {
  createIdGenerator,
  createUIMessageStream,
  createUIMessageStreamResponse,
  validateUIMessages,
} from "ai";
import { z } from "zod";
import {
  MESSAGE_ID_PREFIX,
  type EstateUIMessage,
} from "@/app/types/estate-chat";
import {
  chunkText,
  fallbackAnswer,
} from "../_lib/estate-chat";
import { answerEstateChatWithLiteRouter } from "../_lib/estate-lite";
import {
  assertWithinRateLimit,
  databaseErrorResponse,
  archiveChatSession,
  getChatMessages,
  getVisitorIdFromRequest,
  requestIp,
  saveFinishedMessages,
  upsertChatSession,
  visitorCookie,
} from "../_lib/estate-chat-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const idSchema = z.string().min(8).max(96).regex(/^[A-Za-z0-9_-]+$/);
const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(4000),
});
const messageSchema = z.object({
  id: idSchema,
  role: z.literal("user"),
  parts: z.array(textPartSchema).min(1),
});
const postRequestSchema = z.object({
  id: idSchema,
  message: messageSchema.optional(),
  messages: z.array(z.object({ id: idSchema, role: z.enum(["user", "assistant", "system"]), parts: z.array(z.record(z.string(), z.unknown())) })).optional(),
  metadata: z
    .object({
      pageUrl: z.string().max(1200).optional(),
    })
    .optional(),
});

function jsonError(code: string, message: string, status: number, headers?: HeadersInit) {
  return Response.json({ code, message }, { status, headers });
}

function titleFromMessage(message: EstateUIMessage) {
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();
  return text ? text.slice(0, 72) : "Pathway chat";
}

function latestUserText(messages: EstateUIMessage[]) {
  const message = [...messages].reverse().find((item) => item.role === "user");
  return message?.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim()
    .slice(0, 220);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const visitorId = getVisitorIdFromRequest(request);
  const headers = { "set-cookie": visitorCookie(visitorId) };

  if (!idSchema.safeParse(id).success) {
    return jsonError("bad_request:chat", "A valid chat id is required.", 400, headers);
  }

  try {
    await upsertChatSession({ id, visitorId });
    const messages = await getChatMessages(id);
    return Response.json({ id, messages }, { headers });
  } catch (error) {
    return databaseErrorResponse(error) ?? jsonError("offline:chat", "The chat could not be loaded.", 503, headers);
  }
}

export async function POST(request: Request) {
  const visitorId = getVisitorIdFromRequest(request);
  const headers = { "set-cookie": visitorCookie(visitorId) };
  const parsed = postRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return jsonError("bad_request:chat", "The chat request could not be processed.", 400, headers);
  }

  const body = parsed.data;
  const latestMessage = body.message as EstateUIMessage | undefined;

  if (!latestMessage && !body.messages?.length) {
    return jsonError("bad_request:chat", "A user message is required.", 400, headers);
  }

  try {
    await assertWithinRateLimit({ visitorId, ip: requestIp(request) });
    await upsertChatSession({
      id: body.id,
      visitorId,
      sourcePage: body.metadata?.pageUrl,
      title: latestMessage ? titleFromMessage(latestMessage) : undefined,
    });

    const storedMessages = await getChatMessages(body.id);
    const validatedLatest = latestMessage
      ? await validateUIMessages<EstateUIMessage>({ messages: [latestMessage] })
      : [];
    const uiMessages = [...storedMessages, ...validatedLatest];

    if (latestMessage) {
      await saveFinishedMessages({ sessionId: body.id, messages: validatedLatest });
    }

    const stream = createUIMessageStream<EstateUIMessage>({
      originalMessages: uiMessages,
      generateId: createIdGenerator({
        prefix: MESSAGE_ID_PREFIX.replace(/_$/, ""),
        size: 16,
      }),
      async execute({ writer }) {
        const textId = `${MESSAGE_ID_PREFIX}${Date.now()}`;
        let text = fallbackAnswer();

        try {
          const result = await answerEstateChatWithLiteRouter({
            id: body.id,
            messages: uiMessages,
            metadata: body.metadata,
          });
          text = result.text || fallbackAnswer();
          writer.write({
            type: "data-chat-metadata",
            data: {
              matchedRoutes: result.matchedRoutes ?? [],
              handoff: result.handoff ?? null,
              guardrails: result.guardrails ?? [],
              model: result.model ?? null,
              navigation: result.navigation ?? null,
            },
            transient: true,
          });
          if (result.navigation?.targets?.length) {
            writer.write({
              type: "data-ui-action",
              data: {
                kind: "semantic-navigation",
                auto: Boolean(result.navigation.auto),
                targets: result.navigation.targets,
                query: typeof result.navigation.query === "string" ? result.navigation.query : latestUserText(uiMessages),
              },
              transient: true,
            });
          }
        } catch (error) {
          writer.write({
            type: "data-chat-metadata",
            data: {
              error: error instanceof Error ? error.message : "unknown_error",
              fallback: true,
            },
            transient: true,
          });
        }

        writer.write({ type: "text-start", id: textId });
        for (const chunk of chunkText(text)) {
          writer.write({ type: "text-delta", id: textId, delta: chunk });
          await new Promise((resolve) => setTimeout(resolve, 14));
        }
        writer.write({ type: "text-end", id: textId });
      },
      onFinish: async ({ messages }) => {
        await saveFinishedMessages({ sessionId: body.id, messages });
      },
      onError: () => "The Pathway chat had trouble responding. Please try again.",
    });

    return createUIMessageStreamResponse({ stream, headers });
  } catch (error) {
    return databaseErrorResponse(error) ?? jsonError("offline:chat", "The chat could not respond.", 503, headers);
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const visitorId = getVisitorIdFromRequest(request);
  const headers = { "set-cookie": visitorCookie(visitorId) };

  if (!idSchema.safeParse(id).success) {
    return jsonError("bad_request:chat", "A valid chat id is required.", 400, headers);
  }

  try {
    await archiveChatSession({ id, visitorId });
    return Response.json({ status: "archived" }, { headers });
  } catch (error) {
    return databaseErrorResponse(error) ?? jsonError("offline:chat", "The chat could not be archived.", 503, headers);
  }
}
