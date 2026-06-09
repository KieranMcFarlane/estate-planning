import { createDecipheriv, createHmac, timingSafeEqual } from "node:crypto";

export type CalBookingToolResult = {
  enabled: boolean;
  bookingUrl?: string;
  eventTypeId?: string;
  note: string;
};

export type CalSlot = {
  date: string;
  start: string;
  end?: string;
};

export type CalSlotsResult = {
  ok: boolean;
  slots: CalSlot[];
  message: string;
  bookingUrl?: string;
};

export type CalCreateBookingInput = {
  start: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeTimeZone?: string;
  attendeePhone?: string;
  notes?: string;
  confirmed: boolean;
};

export type CalCreateBookingResult = {
  ok: boolean;
  message: string;
  bookingUid?: string;
  status?: string;
  start?: string;
  end?: string;
  bookingUrl?: string;
};

export type CalWebhookBooking = {
  triggerEvent: string;
  title: string;
  startTime: string;
  endTime: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  bookingUid: string;
  eventTypeSlug: string;
  raw: unknown;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalNumber(value: string) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeCalApiBaseUrl(apiBaseUrl: string, webappUrl: string) {
  const configured = clean(apiBaseUrl) || clean(webappUrl) || "https://api.cal.com";
  const withoutTrailingSlash = configured.replace(/\/+$/, "");
  const withoutVersion = withoutTrailingSlash.replace(/\/v2$/i, "");

  if (/^https:\/\/api\.cal\.com$/i.test(withoutVersion)) return withoutVersion;
  if (/\/api$/i.test(withoutVersion)) return withoutVersion;
  return `${withoutVersion}/api`;
}

let tenantCalApiKeyPromise: Promise<string> | null = null;

function decryptTenantSecret(row: { encrypted_value: string; iv: string; auth_tag: string }) {
  const rawKey = clean(process.env.NAKANO_SECRETS_KEY);
  if (!rawKey) return "";
  const key = Buffer.from(rawKey, "base64url");
  if (key.length !== 32) return "";

  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(row.iv, "base64url"));
  decipher.setAuthTag(Buffer.from(row.auth_tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(row.encrypted_value, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

async function getTenantCalApiKey() {
  const databaseUrl = clean(process.env.NAKANO_ADMIN_DATABASE_URL);
  if (!databaseUrl || !clean(process.env.NAKANO_SECRETS_KEY)) return "";

  const tenantId = clean(process.env.TENANT_ID) || "estate-planning";
  tenantCalApiKeyPromise ??= (async () => {
    try {
      const postgres = (await import("postgres")).default;
      const sql = postgres(databaseUrl, { max: 1, idle_timeout: 5 });
      try {
        const rows = await sql<{ encrypted_value: string; iv: string; auth_tag: string }[]>`
          select encrypted_value, iv, auth_tag
          from tenant_api_keys
          where tenant_id = ${tenantId}
            and key_name in ('cal_api_token', 'cal_api_key', 'CAL_API_TOKEN', 'CAL_API_KEY')
          order by case key_name
            when 'cal_api_token' then 1
            when 'cal_api_key' then 2
            when 'CAL_API_TOKEN' then 3
            else 4
          end
          limit 1
        `;
        return rows[0] ? clean(decryptTenantSecret(rows[0])) : "";
      } finally {
        await sql.end({ timeout: 1 });
      }
    } catch {
      return "";
    }
  })();

  return tenantCalApiKeyPromise;
}

async function calConfigWithTenantKey() {
  const config = calConfig();
  if (config.apiKey) return config;
  return {
    ...config,
    apiKey: await getTenantCalApiKey(),
  };
}

function calConfig() {
  const eventTypeId = optionalNumber(clean(process.env.CAL_EVENT_TYPE_ID));
  const eventTypeSlug = clean(process.env.CAL_EVENT_TYPE_SLUG);
  const username = clean(process.env.CAL_USERNAME);
  const teamSlug = clean(process.env.CAL_TEAM_SLUG);
  const organizationSlug = clean(process.env.CAL_ORGANIZATION_SLUG);

  return {
    apiBaseUrl: normalizeCalApiBaseUrl(process.env.CAL_API_BASE_URL ?? "", process.env.CAL_WEBAPP_URL ?? ""),
    apiKey: clean(process.env.CAL_API_KEY) || clean(process.env.CAL_API_TOKEN),
    bookingUrl: clean(process.env.CAL_BOOKING_URL),
    eventTypeId,
    eventTypeSlug,
    username,
    teamSlug,
    organizationSlug,
    defaultTimeZone: clean(process.env.CAL_BOOKING_TIMEZONE) || "Europe/London",
    slotsApiVersion: clean(process.env.CAL_SLOTS_API_VERSION) || "2024-09-04",
    bookingsApiVersion: clean(process.env.CAL_BOOKINGS_API_VERSION) || "2026-02-25",
  };
}

function eventTypeConfigured(config = calConfig()) {
  return Boolean(config.eventTypeId || (config.eventTypeSlug && (config.username || config.teamSlug)));
}

function appendEventTypeParams(searchParams: URLSearchParams, config = calConfig()) {
  if (config.eventTypeId) {
    searchParams.set("eventTypeId", String(config.eventTypeId));
    return;
  }
  if (config.eventTypeSlug) searchParams.set("eventTypeSlug", config.eventTypeSlug);
  if (config.username) searchParams.set("username", config.username);
  if (config.teamSlug) searchParams.set("teamSlug", config.teamSlug);
  if (config.organizationSlug) searchParams.set("organizationSlug", config.organizationSlug);
}

function eventTypeBody(config = calConfig()) {
  if (config.eventTypeId) return { eventTypeId: config.eventTypeId };
  return {
    ...(config.eventTypeSlug ? { eventTypeSlug: config.eventTypeSlug } : {}),
    ...(config.username ? { username: config.username } : {}),
    ...(config.teamSlug ? { teamSlug: config.teamSlug } : {}),
    ...(config.organizationSlug ? { organizationSlug: config.organizationSlug } : {}),
  };
}

export function calBookingToolResult(): CalBookingToolResult {
  const config = calConfig();

  if (!config.bookingUrl) {
    return {
      enabled: false,
      note: "No Cal.diy booking URL is configured. Ask the visitor to call 07902 863999 or email info@pathwayestateplanning.co.uk.",
    };
  }

  return {
    enabled: true,
    bookingUrl: config.bookingUrl,
    eventTypeId: config.eventTypeId ? String(config.eventTypeId) : undefined,
    note: "Use this link for booking an initial Pathway conversation. Do not claim that a booking has been made until Cal confirms it.",
  };
}

function normalizeSlots(data: unknown): CalSlot[] {
  if (!data || typeof data !== "object") return [];
  return Object.entries(data as Record<string, unknown>).flatMap(([date, slots]) => {
    if (!Array.isArray(slots)) return [];
    return slots.flatMap((slot) => {
      if (typeof slot === "string") return [{ date, start: slot }];
      if (!slot || typeof slot !== "object") return [];
      const row = slot as Record<string, unknown>;
      const start = clean(row.start);
      if (!start) return [];
      return [{
        date,
        start,
        end: clean(row.end) || undefined,
      }];
    });
  });
}

export async function getCalAvailableSlots(input: {
  start: string;
  end: string;
  timeZone?: string;
  duration?: number;
  limit?: number;
}): Promise<CalSlotsResult> {
  const config = await calConfigWithTenantKey();
  if (!config.apiKey) {
    return {
      ok: false,
      slots: [],
      bookingUrl: config.bookingUrl || undefined,
      message: "Cal API is not configured. CAL_API_KEY or CAL_API_TOKEN is required to check live availability.",
    };
  }
  if (!eventTypeConfigured(config)) {
    return {
      ok: false,
      slots: [],
      bookingUrl: config.bookingUrl || undefined,
      message: "Cal event type is not configured. Set CAL_EVENT_TYPE_ID, or CAL_EVENT_TYPE_SLUG with CAL_USERNAME or CAL_TEAM_SLUG.",
    };
  }

  const url = new URL(`${config.apiBaseUrl}/v2/slots`);
  url.searchParams.set("start", input.start);
  url.searchParams.set("end", input.end);
  url.searchParams.set("timeZone", input.timeZone || config.defaultTimeZone);
  url.searchParams.set("format", "range");
  if (input.duration) url.searchParams.set("duration", String(input.duration));
  appendEventTypeParams(url.searchParams, config);

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      "cal-api-version": config.slotsApiVersion,
    },
  });
  const payload = (await response.json().catch(() => null)) as { data?: unknown; message?: string; error?: string } | null;

  if (!response.ok) {
    return {
      ok: false,
      slots: [],
      bookingUrl: config.bookingUrl || undefined,
      message: payload?.message || payload?.error || `Cal slots request failed with ${response.status}.`,
    };
  }

  const slots = normalizeSlots(payload?.data).slice(0, input.limit ?? 8);
  return {
    ok: true,
    slots,
    bookingUrl: config.bookingUrl || undefined,
    message: slots.length ? "Available slots found." : "No available slots found for that range.",
  };
}

export async function createCalBooking(input: CalCreateBookingInput): Promise<CalCreateBookingResult> {
  const config = await calConfigWithTenantKey();
  if (!input.confirmed) {
    return {
      ok: false,
      bookingUrl: config.bookingUrl || undefined,
      message: "Booking was not created because the visitor has not explicitly confirmed the exact slot and contact details.",
    };
  }
  if (!eventTypeConfigured(config)) {
    return {
      ok: false,
      bookingUrl: config.bookingUrl || undefined,
      message: "Cal event type is not configured. Set CAL_EVENT_TYPE_ID, or CAL_EVENT_TYPE_SLUG with CAL_USERNAME or CAL_TEAM_SLUG.",
    };
  }

  const body = {
    start: input.start,
    attendee: {
      name: input.attendeeName,
      email: input.attendeeEmail,
      timeZone: input.attendeeTimeZone || config.defaultTimeZone,
      ...(input.attendeePhone ? { phoneNumber: input.attendeePhone } : {}),
      language: "en",
    },
    ...eventTypeBody(config),
    metadata: {
      source: "pathway_ai_chat",
      ...(input.notes ? { notes: input.notes.slice(0, 500) } : {}),
    },
  };

  const response = await fetch(`${config.apiBaseUrl}/v2/bookings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cal-api-version": config.bookingsApiVersion,
      ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as {
    data?: {
      uid?: string;
      status?: string;
      start?: string;
      end?: string;
    };
    message?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    return {
      ok: false,
      bookingUrl: config.bookingUrl || undefined,
      message: payload?.message || payload?.error || `Cal booking request failed with ${response.status}.`,
    };
  }

  return {
    ok: true,
    bookingUrl: config.bookingUrl || undefined,
    bookingUid: payload?.data?.uid,
    status: payload?.data?.status,
    start: payload?.data?.start,
    end: payload?.data?.end,
    message: "Booking request sent to Cal. Use the returned booking details and remind the visitor to check Cal/email confirmation.",
  };
}

export function verifyCalWebhookSignature(rawBody: string, signature: string) {
  const secret = clean(process.env.CAL_WEBHOOK_SECRET);
  if (!secret) return true;
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signature.replace(/^sha256=/i, "").trim();
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function payloadRoot(body: Record<string, unknown>) {
  const payload = body.payload;
  return payload && typeof payload === "object" ? payload as Record<string, unknown> : body;
}

function firstAttendee(root: Record<string, unknown>) {
  const attendees = root.attendees;
  if (!Array.isArray(attendees)) return {};
  const attendee = attendees[0];
  return attendee && typeof attendee === "object" ? attendee as Record<string, unknown> : {};
}

export function parseCalWebhookBooking(body: unknown): CalWebhookBooking {
  const wrapper = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const root = payloadRoot(wrapper);
  const attendee = firstAttendee(root);

  return {
    triggerEvent: clean(wrapper.triggerEvent) || clean(root.triggerEvent),
    title: clean(root.title) || clean(root.eventTitle) || clean(root.eventType?.toString()),
    startTime: clean(root.startTime) || clean(root.start),
    endTime: clean(root.endTime) || clean(root.end),
    attendeeName: clean(attendee.name) || clean(root.name),
    attendeeEmail: clean(attendee.email) || clean(root.email),
    attendeePhone: clean(attendee.phoneNumber) || clean(attendee.phone) || clean(root.phone),
    bookingUid: clean(root.uid) || clean(root.bookingUid),
    eventTypeSlug: clean(root.type) || clean(root.eventTypeSlug),
    raw: body,
  };
}
