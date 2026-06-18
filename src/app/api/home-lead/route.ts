import { NextResponse } from "next/server";
import { captureEstateLead, type EstateLeadInput } from "../_lib/twenty";

export const runtime = "nodejs";

type HomeLeadSource = Extract<EstateLeadInput["source"], "newsletter_signup" | "initial_chat_request">;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sourceFrom(value: unknown): HomeLeadSource | null {
  return value === "newsletter_signup" || value === "initial_chat_request" ? value : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const source = sourceFrom(body.source);
  if (!source) return NextResponse.json({ error: "Unknown lead source." }, { status: 400 });

  const name = clean(body.name);
  const phone = clean(body.phone);
  const email = clean(body.email);
  const message = clean(body.message);

  if (source === "newsletter_signup" && !email) {
    return NextResponse.json({ error: "Please include an email address." }, { status: 400 });
  }

  if (source === "initial_chat_request" && (!name || (!email && !phone))) {
    return NextResponse.json(
      { error: "Please include a name and either an email address or phone number." },
      { status: 400 },
    );
  }

  const result = await captureEstateLead({
    source,
    name,
    phone,
    email,
    message,
    pageUrl: clean(body.pageUrl),
  });

  return NextResponse.json({
    id: result.id,
    status: result.crm.status === "created" ? "sent" : "saved",
    crm: result.crm,
  });
}
