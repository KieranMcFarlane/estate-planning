import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

const CAL_ENV_KEYS = [
  "CAL_API_BASE_URL",
  "CAL_WEBAPP_URL",
  "CAL_API_KEY",
  "CAL_API_TOKEN",
  "CAL_BOOKING_URL",
  "CAL_EVENT_TYPE_ID",
  "CAL_EVENT_TYPE_SLUG",
  "CAL_USERNAME",
  "CAL_TEAM_SLUG",
  "CAL_ORGANIZATION_SLUG",
  "CAL_BOOKING_TIMEZONE",
  "CAL_SLOTS_API_VERSION",
  "CAL_BOOKINGS_API_VERSION",
  "CAL_WEBHOOK_SECRET",
  "NAKANO_ADMIN_DATABASE_URL",
  "NAKANO_SECRETS_KEY",
  "TENANT_ID",
];

const originalEnv = Object.fromEntries(CAL_ENV_KEYS.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

function restoreEnv() {
  for (const key of CAL_ENV_KEYS) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
}

function configureCal(overrides = {}) {
  restoreEnv();
  Object.assign(process.env, {
    CAL_API_BASE_URL: "https://cal.example.test/api",
    CAL_API_KEY: "cal_test_key",
    CAL_BOOKING_URL: "https://cal.example.test/pathway/initial-chat",
    CAL_EVENT_TYPE_ID: "123",
    CAL_BOOKING_TIMEZONE: "Europe/London",
    CAL_SLOTS_API_VERSION: "2024-09-04",
    CAL_BOOKINGS_API_VERSION: "2026-02-25",
    ...overrides,
  });
}

function mockFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init);
  };
  return calls;
}

test.afterEach(() => {
  restoreEnv();
  globalThis.fetch = originalFetch;
});

const cal = await import("../src/app/api/_lib/cal.ts");

test("getCalAvailableSlots returns missing API key without fetching", async () => {
  configureCal({ CAL_API_KEY: "" });
  const calls = mockFetch(() => Response.json({}));

  const result = await cal.getCalAvailableSlots({
    start: "2026-06-05",
    end: "2026-06-06",
  });

  assert.equal(result.ok, false);
  assert.match(result.message, /CAL_API_KEY or CAL_API_TOKEN/);
  assert.equal(result.bookingUrl, "https://cal.example.test/pathway/initial-chat");
  assert.equal(calls.length, 0);
});

test("getCalAvailableSlots accepts CAL_API_TOKEN as an API key alias", async () => {
  configureCal({ CAL_API_KEY: "", CAL_API_TOKEN: "cal_token_alias" });
  const calls = mockFetch(() =>
    Response.json({
      status: "success",
      data: {
        "2026-06-05": ["2026-06-05T10:00:00.000+01:00"],
      },
    }),
  );

  const result = await cal.getCalAvailableSlots({
    start: "2026-06-05",
    end: "2026-06-06",
    limit: 1,
  });

  assert.equal(result.ok, true);
  assert.equal(calls[0].init.headers.authorization, "Bearer cal_token_alias");
});

test("getCalAvailableSlots builds a v2 slots request and normalizes returned slots", async () => {
  configureCal();
  const calls = mockFetch(() =>
    Response.json({
      status: "success",
      data: {
        "2026-06-05": [
          {
            start: "2026-06-05T10:00:00.000+01:00",
            end: "2026-06-05T10:30:00.000+01:00",
          },
        ],
      },
    }),
  );

  const result = await cal.getCalAvailableSlots({
    start: "2026-06-05",
    end: "2026-06-06",
    duration: 30,
    limit: 1,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.slots, [
    {
      date: "2026-06-05",
      start: "2026-06-05T10:00:00.000+01:00",
      end: "2026-06-05T10:30:00.000+01:00",
    },
  ]);
  assert.equal(calls.length, 1);
  const requestUrl = new URL(calls[0].url);
  assert.equal(requestUrl.pathname, "/api/v2/slots");
  assert.equal(requestUrl.searchParams.get("eventTypeId"), "123");
  assert.equal(requestUrl.searchParams.get("timeZone"), "Europe/London");
  assert.equal(requestUrl.searchParams.get("duration"), "30");
  assert.equal(calls[0].init.headers.authorization, "Bearer cal_test_key");
  assert.equal(calls[0].init.headers["cal-api-version"], "2024-09-04");
});

test("getCalAvailableSlots derives the Cal.diy API URL from the web app URL", async () => {
  configureCal({
    CAL_API_BASE_URL: "",
    CAL_WEBAPP_URL: "https://cal.example.test",
  });
  const calls = mockFetch(() => Response.json({ data: {} }));

  await cal.getCalAvailableSlots({
    start: "2026-06-05",
    end: "2026-06-06",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.split("?")[0], "https://cal.example.test/api/v2/slots");
});

test("getCalAvailableSlots accepts a Cal.diy API base URL with or without /v2", async () => {
  configureCal({ CAL_API_BASE_URL: "https://cal.example.test/api/v2" });
  const calls = mockFetch(() => Response.json({ data: {} }));

  await cal.getCalAvailableSlots({
    start: "2026-06-05",
    end: "2026-06-06",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.split("?")[0], "https://cal.example.test/api/v2/slots");
});

test("createCalBooking refuses to book without explicit confirmation", async () => {
  configureCal();
  const calls = mockFetch(() => Response.json({}));

  const result = await cal.createCalBooking({
    start: "2026-06-05T09:00:00Z",
    attendeeName: "Jane Smith",
    attendeeEmail: "jane@example.com",
    confirmed: false,
  });

  assert.equal(result.ok, false);
  assert.match(result.message, /not explicitly confirmed/);
  assert.equal(calls.length, 0);
});

test("createCalBooking sends the expected v2 booking body", async () => {
  configureCal();
  const calls = mockFetch(() =>
    Response.json(
      {
        status: "success",
        data: {
          uid: "booking_123",
          status: "accepted",
          start: "2026-06-05T09:00:00Z",
          end: "2026-06-05T09:30:00Z",
        },
      },
      { status: 201 },
    ),
  );

  const result = await cal.createCalBooking({
    start: "2026-06-05T09:00:00Z",
    attendeeName: "Jane Smith",
    attendeeEmail: "jane@example.com",
    attendeeTimeZone: "Europe/London",
    attendeePhone: "07902000000",
    notes: "Initial chat about Wills",
    confirmed: true,
  });

  assert.equal(result.ok, true);
  assert.equal(result.bookingUid, "booking_123");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://cal.example.test/api/v2/bookings");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.authorization, "Bearer cal_test_key");
  assert.equal(calls[0].init.headers["cal-api-version"], "2026-02-25");

  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.start, "2026-06-05T09:00:00Z");
  assert.equal(body.eventTypeId, 123);
  assert.deepEqual(body.attendee, {
    name: "Jane Smith",
    email: "jane@example.com",
    timeZone: "Europe/London",
    phoneNumber: "07902000000",
    language: "en",
  });
  assert.equal(body.metadata.source, "pathway_ai_chat");
  assert.equal(body.metadata.notes, "Initial chat about Wills");
});

test("createCalBooking supports slug and username event type configuration", async () => {
  configureCal({
    CAL_EVENT_TYPE_ID: "",
    CAL_EVENT_TYPE_SLUG: "initial-chat",
    CAL_USERNAME: "pathway",
  });
  const calls = mockFetch(() => Response.json({ data: { uid: "booking_slug" } }, { status: 201 }));

  const result = await cal.createCalBooking({
    start: "2026-06-05T09:00:00Z",
    attendeeName: "Jane Smith",
    attendeeEmail: "jane@example.com",
    confirmed: true,
  });

  assert.equal(result.ok, true);
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.eventTypeId, undefined);
  assert.equal(body.eventTypeSlug, "initial-chat");
  assert.equal(body.username, "pathway");
});

test("Cal webhook signatures are verified with x-cal-signature-256 compatible HMAC", () => {
  configureCal({ CAL_WEBHOOK_SECRET: "webhook_secret" });
  const rawBody = JSON.stringify({ triggerEvent: "BOOKING_CREATED" });
  const signature = createHmac("sha256", "webhook_secret").update(rawBody).digest("hex");

  assert.equal(cal.verifyCalWebhookSignature(rawBody, signature), true);
  assert.equal(cal.verifyCalWebhookSignature(rawBody, `sha256=${signature}`), true);
  assert.equal(cal.verifyCalWebhookSignature(rawBody, "00"), false);
});

test("parseCalWebhookBooking extracts attendee and booking metadata", () => {
  const booking = cal.parseCalWebhookBooking({
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: "booking_abc",
      title: "Initial Pathway chat",
      startTime: "2026-06-05T10:00:00.000Z",
      endTime: "2026-06-05T10:30:00.000Z",
      attendees: [{ name: "Jane Smith", email: "jane@example.com", phoneNumber: "07902000000" }],
      type: "initial-chat",
    },
  });

  assert.equal(booking.triggerEvent, "BOOKING_CREATED");
  assert.equal(booking.bookingUid, "booking_abc");
  assert.equal(booking.attendeeName, "Jane Smith");
  assert.equal(booking.attendeeEmail, "jane@example.com");
  assert.equal(booking.attendeePhone, "07902000000");
  assert.equal(booking.eventTypeSlug, "initial-chat");
});
