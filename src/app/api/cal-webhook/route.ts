import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { NextResponse } from "next/server";
import {
  parseCalWebhookBooking,
  verifyCalWebhookSignature,
} from "../_lib/cal";
import { captureEstateLead } from "../_lib/twenty";

export const runtime = "nodejs";

const DEFAULT_CAL_EVENTS_PATH = join(process.cwd(), "data", "leads", "cal-webhook-events.jsonl");
const BOOKING_TRIGGERS = new Set([
  "BOOKING_CREATED",
  "BOOKING_REQUESTED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
  "BOOKING_REJECTED",
]);

function eventPath() {
  return process.env.CAL_WEBHOOK_EVENTS_PATH ?? DEFAULT_CAL_EVENTS_PATH;
}

async function recordCalWebhook(event: unknown) {
  const target = eventPath();
  await mkdir(dirname(target), { recursive: true });
  await appendFile(target, `${JSON.stringify(event)}\n`, "utf8");
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-cal-signature-256") ?? "";

  if (!verifyCalWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid Cal webhook signature." }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}") as unknown;
  const booking = parseCalWebhookBooking(body);
  const event = {
    id: `cal_webhook_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`,
    receivedAt: new Date().toISOString(),
    booking,
  };

  await recordCalWebhook(event);

  let lead = null;
  let leadError = null;
  if (BOOKING_TRIGGERS.has(booking.triggerEvent)) {
    try {
      lead = await captureEstateLead({
        source: "cal_booking",
        name: booking.attendeeName || "Cal booking attendee",
        email: booking.attendeeEmail,
        phone: booking.attendeePhone,
        message: [
          `Cal trigger: ${booking.triggerEvent}`,
          booking.title ? `Event: ${booking.title}` : "",
          booking.startTime ? `Starts: ${booking.startTime}` : "",
          booking.endTime ? `Ends: ${booking.endTime}` : "",
          booking.bookingUid ? `Booking UID: ${booking.bookingUid}` : "",
          booking.eventTypeSlug ? `Event type: ${booking.eventTypeSlug}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        pageUrl: process.env.CAL_BOOKING_URL,
      });
    } catch (error) {
      leadError = error instanceof Error ? error.message : "Unknown lead capture error";
    }
  }

  return NextResponse.json({
    status: "received",
    triggerEvent: booking.triggerEvent,
    lead,
    leadError,
  });
}
