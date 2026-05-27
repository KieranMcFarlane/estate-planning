import { NextResponse } from "next/server";
import {
  estateDatabaseConfigured,
  getVisitorIdFromRequest,
  saveEstateHandoff,
  upsertChatSession,
  visitorCookie,
} from "../_lib/estate-chat-store";
import { captureEstateLead } from "../_lib/twenty";

export const runtime = "nodejs";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const visitorId = getVisitorIdFromRequest(request);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(body.name);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const message = clean(body.message);
  const chatId = clean(body.chatId);

  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { error: "Please include a name and either an email address or phone number." },
      { status: 400 },
    );
  }

  const result = await captureEstateLead({
    source: "assistant_handoff",
    name,
    email,
    phone,
    message,
    pageUrl: clean(body.pageUrl),
    chatId,
  });

  if (estateDatabaseConfigured()) {
    if (chatId) {
      await upsertChatSession({
        id: chatId,
        visitorId,
        sourcePage: clean(body.pageUrl),
        title: "Pathway handoff",
      });
    }
    await saveEstateHandoff({
      id: result.id,
      sessionId: chatId,
      name,
      email,
      phone,
      message,
      pageUrl: clean(body.pageUrl),
      crm: result.crm,
    });
  }

  return NextResponse.json({
    id: result.id,
    status: result.crm.status === "created" ? "sent" : "saved",
    crm: result.crm,
  }, {
    headers: {
      "set-cookie": visitorCookie(visitorId),
    },
  });
}
