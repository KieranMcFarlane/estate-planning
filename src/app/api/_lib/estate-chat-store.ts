import { createHash, randomUUID } from "node:crypto";
import postgres from "postgres";
import type { EstateUIMessage } from "@/app/types/estate-chat";

type Sql = ReturnType<typeof postgres>;

let sqlClient: Sql | null = null;

export class EstateDatabaseMissingError extends Error {
  constructor() {
    super("ESTATE_DATABASE_URL is not set");
    this.name = "EstateDatabaseMissingError";
  }
}

export class EstateRateLimitError extends Error {
  constructor() {
    super("Too many chat messages. Please try again later.");
    this.name = "EstateRateLimitError";
  }
}

export function estateDatabaseConfigured() {
  return Boolean(process.env.ESTATE_DATABASE_URL);
}

function sql() {
  const url = process.env.ESTATE_DATABASE_URL;
  if (!url) throw new EstateDatabaseMissingError();
  sqlClient ??= postgres(url, {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return sqlClient;
}

function cleanText(value: string | undefined | null) {
  return value?.trim() ?? "";
}

export function makeVisitorId() {
  return `visitor_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}

export function getVisitorIdFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)pathway_visitor_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : makeVisitorId();
}

export function visitorCookie(visitorId: string) {
  return [
    `pathway_visitor_id=${encodeURIComponent(visitorId)}`,
    "Path=/",
    "Max-Age=31536000",
    "SameSite=Lax",
    "HttpOnly",
  ].join("; ");
}

export function requestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

export function hashRateLimitKey(input: string) {
  const secret = process.env.ESTATE_RATE_LIMIT_SECRET || "pathway-estate-chat-dev-secret";
  return createHash("sha256").update(`${secret}:${input}`).digest("hex");
}

export async function assertWithinRateLimit(input: {
  visitorId: string;
  ip: string;
  limit?: number;
}) {
  const db = sql();
  const limit = input.limit ?? Number(process.env.ESTATE_CHAT_HOURLY_LIMIT ?? 60);
  const bucketKey = hashRateLimitKey(`${input.visitorId}:${input.ip}`);

  await db`delete from estate_rate_limit_events where created_at < now() - interval '1 hour'`;
  const rows = await db<{ count: string }[]>`
    select count(*)::text as count
    from estate_rate_limit_events
    where bucket_key = ${bucketKey}
      and created_at > now() - interval '1 hour'
  `;

  if (Number(rows[0]?.count ?? 0) >= limit) {
    throw new EstateRateLimitError();
  }

  await db`insert into estate_rate_limit_events (bucket_key) values (${bucketKey})`;
}

export async function upsertChatSession(input: {
  id: string;
  visitorId: string;
  sourcePage?: string;
  title?: string;
}) {
  const db = sql();
  await db`
    insert into estate_chat_sessions (id, anonymous_visitor_id, source_page, title)
    values (${input.id}, ${input.visitorId}, ${cleanText(input.sourcePage)}, ${cleanText(input.title) || "Pathway chat"})
    on conflict (id) do update set
      updated_at = now(),
      title = coalesce(nullif(${cleanText(input.title)}, ''), estate_chat_sessions.title),
      source_page = coalesce(nullif(${cleanText(input.sourcePage)}, ''), estate_chat_sessions.source_page)
  `;
}

export async function getChatMessages(sessionId: string): Promise<EstateUIMessage[]> {
  const db = sql();
  const rows = await db<{
    id: string;
    role: EstateUIMessage["role"];
    parts: EstateUIMessage["parts"];
  }[]>`
    select id, role, parts
    from estate_chat_messages
    where session_id = ${sessionId}
    order by created_at asc
  `;

  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    parts: row.parts,
  }));
}

export type EstateChatSessionSummary = {
  id: string;
  title: string;
  sourcePage: string;
  createdAt: string;
  updatedAt: string;
};

export async function getChatHistory(input: {
  visitorId: string;
  limit: number;
  endingBefore?: string | null;
}): Promise<{ chats: EstateChatSessionSummary[]; hasMore: boolean }> {
  const db = sql();
  let cursorUpdatedAt: Date | null = null;

  if (input.endingBefore) {
    const cursorRows = await db<{ updated_at: Date }[]>`
      select updated_at
      from estate_chat_sessions
      where id = ${input.endingBefore}
        and anonymous_visitor_id = ${input.visitorId}
        and archived = false
      limit 1
    `;
    cursorUpdatedAt = cursorRows[0]?.updated_at ?? null;
  }

  const rows = await db<{
    id: string;
    title: string;
    source_page: string;
    created_at: Date;
    updated_at: Date;
  }[]>`
    select id, title, source_page, created_at, updated_at
    from estate_chat_sessions
    where anonymous_visitor_id = ${input.visitorId}
      and archived = false
      ${cursorUpdatedAt ? db`and updated_at < ${cursorUpdatedAt}` : db``}
    order by updated_at desc
    limit ${input.limit + 1}
  `;

  const hasMore = rows.length > input.limit;
  return {
    chats: rows.slice(0, input.limit).map((row) => ({
      id: row.id,
      title: row.title || "Pathway chat",
      sourcePage: row.source_page,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    })),
    hasMore,
  };
}

export async function archiveChatSession(input: {
  id: string;
  visitorId: string;
}) {
  const db = sql();
  await db`
    update estate_chat_sessions
    set archived = true,
        updated_at = now()
    where id = ${input.id}
      and anonymous_visitor_id = ${input.visitorId}
  `;
}

export async function archiveAllChatSessions(visitorId: string) {
  const db = sql();
  await db`
    update estate_chat_sessions
    set archived = true,
        updated_at = now()
    where anonymous_visitor_id = ${visitorId}
      and archived = false
  `;
}

export async function saveChatMessage(input: {
  sessionId: string;
  message: EstateUIMessage;
}) {
  const db = sql();
  await db`
    insert into estate_chat_messages (id, session_id, role, parts)
    values (${input.message.id}, ${input.sessionId}, ${input.message.role}, ${db.json(input.message.parts as unknown as postgres.JSONValue)})
    on conflict (id) do update set
      role = excluded.role,
      parts = excluded.parts
  `;
  await db`update estate_chat_sessions set updated_at = now() where id = ${input.sessionId}`;
}

export async function saveFinishedMessages(input: {
  sessionId: string;
  messages: EstateUIMessage[];
}) {
  for (const message of input.messages) {
    if (message.role !== "user" && message.role !== "assistant") continue;
    await saveChatMessage({ sessionId: input.sessionId, message });
  }
}

export async function saveEstateHandoff(input: {
  id: string;
  sessionId?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  pageUrl?: string;
  crm: { status: string; personId?: string; noteId?: string; reason?: string };
}) {
  const db = sql();
  await db`
    insert into estate_chat_handoffs (
      id,
      session_id,
      name,
      email,
      phone,
      message,
      page_url,
      twenty_person_id,
      twenty_note_id,
      crm_status,
      crm_reason
    )
    values (
      ${input.id},
      ${cleanText(input.sessionId) || null},
      ${cleanText(input.name)},
      ${cleanText(input.email)},
      ${cleanText(input.phone)},
      ${cleanText(input.message)},
      ${cleanText(input.pageUrl)},
      ${input.crm.personId ?? null},
      ${input.crm.noteId ?? null},
      ${input.crm.status},
      ${input.crm.reason ?? null}
    )
  `;
}

export function databaseErrorResponse(error: unknown) {
  if (error instanceof EstateDatabaseMissingError) {
    return Response.json(
      {
        code: "offline:database",
        message: "The Pathway chat database is not configured yet.",
      },
      { status: 503 },
    );
  }

  if (error instanceof EstateRateLimitError) {
    return Response.json(
      {
        code: "rate_limit:chat",
        message: "You've reached the message limit. Please try again later.",
      },
      { status: 429 },
    );
  }

  return null;
}
