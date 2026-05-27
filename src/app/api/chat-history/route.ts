import { z } from "zod";
import {
  archiveAllChatSessions,
  databaseErrorResponse,
  getChatHistory,
  getVisitorIdFromRequest,
  visitorCookie,
} from "../_lib/estate-chat-store";

export const runtime = "nodejs";

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  ending_before: z.string().min(8).max(96).regex(/^[A-Za-z0-9_-]+$/).nullable().optional(),
});

function jsonError(code: string, message: string, status: number, headers?: HeadersInit) {
  return Response.json({ code, message }, { status, headers });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const visitorId = getVisitorIdFromRequest(request);
  const headers = { "set-cookie": visitorCookie(visitorId) };
  const parsed = historyQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    ending_before: url.searchParams.get("ending_before"),
  });

  if (!parsed.success) {
    return jsonError("bad_request:history", "The chat history request could not be processed.", 400, headers);
  }

  try {
    const history = await getChatHistory({
      visitorId,
      limit: parsed.data.limit,
      endingBefore: parsed.data.ending_before,
    });
    return Response.json(history, { headers });
  } catch (error) {
    return databaseErrorResponse(error) ?? jsonError("offline:history", "The chat history could not be loaded.", 503, headers);
  }
}

export async function DELETE(request: Request) {
  const visitorId = getVisitorIdFromRequest(request);
  const headers = { "set-cookie": visitorCookie(visitorId) };

  try {
    await archiveAllChatSessions(visitorId);
    return Response.json({ status: "archived" }, { headers });
  } catch (error) {
    return databaseErrorResponse(error) ?? jsonError("offline:history", "The chat history could not be cleared.", 503, headers);
  }
}
