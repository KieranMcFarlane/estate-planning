import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  tool,
  validateUIMessages,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  MESSAGE_ID_PREFIX,
  type EstateUIMessage,
} from "@/app/types/estate-chat";
import {
  calBookingToolResult,
  createCalBooking,
  getCalAvailableSlots,
} from "../_lib/cal";
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

const CHAT_MODEL = process.env.AI_SDK_CHAT_MODEL ?? process.env.AI_SDK_FAST_MODEL ?? "gpt-5-nano-2025-08-07";
const CHAT_REASONING_EFFORT = process.env.AI_SDK_CHAT_REASONING_EFFORT ?? process.env.AI_SDK_FAST_REASONING_EFFORT ?? "minimal";
const PATHWAY_GUARDRAIL_PROMPT = [
  "You are the Pathway Estate Planning website assistant for England and Wales.",
  "Answer general estate-planning questions in clear, plain English.",
  "Keep responses concise and helpful. Use short paragraphs and occasional bullets when useful.",
  "You may discuss general topics such as Wills, Trusts, Lasting Powers of Attorney, inheritance tax planning, care planning, business protection, agricultural land, asset protection, gifting, probate, and finding information on the Pathway site.",
  "Do not provide definitive legal, tax, financial, probate, care-funding, eligibility, fee, timeframe, or outcome advice.",
  "Do not guarantee tax savings, legal outcomes, asset protection, eligibility, availability, or timeframes.",
  "For personal recommendations, estate values, tax exposure, care fees, capacity, disputes, business assets, agricultural assets, or urgent matters, explain that Pathway needs to understand the details before anyone relies on a next step.",
  "Do not ask for sensitive personal details in chat. If the visitor wants Pathway to contact them, ask only for a name and either an email address or phone number.",
  "If the visitor asks to book, schedule, arrange, or make an appointment, use the Cal tools when helpful.",
  "Before creating a booking, collect and repeat back the exact slot/start time, attendee name, attendee email, timezone, and optional phone/message. Only call createBooking after the visitor explicitly confirms those exact details.",
  "If Cal API tools are not configured or fail, offer the booking link if available, or the Pathway phone/email.",
  "If a question is outside estate planning or not something you can answer safely, say so and suggest contacting Pathway.",
  "Pathway contact details: phone 07902 863999; email info@pathwayestateplanning.co.uk.",
].join("\n\n");

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
        const result = streamText({
          model: openai(CHAT_MODEL),
          system: PATHWAY_GUARDRAIL_PROMPT,
          messages: await convertToModelMessages(uiMessages),
          maxOutputTokens: 450,
          tools: {
            bookingLink: tool({
              description: "Get the configured Cal.diy booking link for arranging an initial Pathway conversation.",
              inputSchema: z.object({
                reason: z.string().describe("Short reason the visitor wants to book."),
              }),
              execute: async () => calBookingToolResult(),
            }),
            getAvailableSlots: tool({
              description: "Check live Cal.diy availability for an initial Pathway conversation.",
              inputSchema: z.object({
                start: z.string().describe("UTC ISO date or datetime for the beginning of the slot search range, e.g. 2026-06-05 or 2026-06-05T09:00:00Z."),
                end: z.string().describe("UTC ISO date or datetime for the end of the slot search range, e.g. 2026-06-12 or 2026-06-12T18:00:00Z."),
                timeZone: z.string().optional().describe("IANA timezone to display slots in, e.g. Europe/London."),
                duration: z.number().int().positive().optional().describe("Optional meeting duration in minutes."),
                limit: z.number().int().positive().max(12).optional().describe("Maximum number of slots to return."),
              }),
              execute: async ({ start, end, timeZone, duration, limit }) =>
                getCalAvailableSlots({ start, end, timeZone, duration, limit }),
            }),
            createBooking: tool({
              description: "Create a Cal.diy booking after the visitor has explicitly confirmed the exact slot and attendee details.",
              inputSchema: z.object({
                start: z.string().describe("UTC ISO datetime for the confirmed slot start, e.g. 2026-06-05T10:00:00Z."),
                attendeeName: z.string().min(1).describe("Confirmed attendee name."),
                attendeeEmail: z.string().email().describe("Confirmed attendee email address."),
                attendeeTimeZone: z.string().optional().describe("IANA timezone for the attendee, e.g. Europe/London."),
                attendeePhone: z.string().optional().describe("Optional attendee phone number."),
                notes: z.string().optional().describe("Optional short message or booking context from the visitor."),
                confirmed: z.boolean().describe("Must be true only after the visitor explicitly confirms the exact slot and contact details."),
              }),
              execute: async (input) => createCalBooking(input),
            }),
          },
          providerOptions: {
            openai: {
              reasoningEffort: CHAT_REASONING_EFFORT,
            },
          },
        });

        writer.merge(result.toUIMessageStream({
          onError: () => "The model could not complete the response. Please try again.",
        }));
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
