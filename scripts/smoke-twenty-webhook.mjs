import { readFile } from "node:fs/promises";

const baseUrl = process.env.ESTATE_PUBLIC_URL ?? "https://estate.nakanodigital.com";
const eventsPath =
  process.env.TWENTY_WEBHOOK_EVENTS_PATH ??
  "/home/ubuntu/repos/estate-planning/data/leads/twenty-webhook-events.jsonl";
const summariesPath =
  process.env.TWENTY_LEAD_SUMMARIES_PATH ??
  "/home/ubuntu/repos/estate-planning/data/leads/twenty-lead-summaries.jsonl";
const hermesDispatchesPath =
  process.env.HERMES_LEAD_DISPATCHES_PATH ??
  "/home/ubuntu/repos/estate-planning/data/leads/hermes-lead-dispatches.jsonl";
const hermesFailuresPath =
  process.env.HERMES_LEAD_DISPATCH_FAILURES_PATH ??
  "/home/ubuntu/repos/estate-planning/data/leads/hermes-lead-dispatch-failures.jsonl";
const expectHermes = ["1", "true", "yes"].includes(String(process.env.HERMES_LEAD_AUTOMATION_ENABLED ?? "").toLowerCase());
const whatsappDispatchesPath =
  process.env.HERMES_WHATSAPP_LEAD_DISPATCHES_PATH ??
  "/home/ubuntu/repos/estate-planning/data/leads/whatsapp-lead-dispatches.jsonl";
const whatsappFailuresPath =
  process.env.HERMES_WHATSAPP_LEAD_DISPATCH_FAILURES_PATH ??
  "/home/ubuntu/repos/estate-planning/data/leads/whatsapp-lead-dispatch-failures.jsonl";
const expectWhatsapp = ["1", "true", "yes"].includes(
  String(process.env.HERMES_WHATSAPP_NOTIFY_ENABLED ?? "").toLowerCase(),
);

function lines(raw) {
  return raw.trim() ? raw.trim().split("\n") : [];
}

async function readJsonl(path) {
  try {
    const raw = await readFile(path, "utf8");
    return lines(raw).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function waitFor(check, timeoutMs = 15000) {
  const startedAt = Date.now();
  let lastValue;
  while (Date.now() - startedAt < timeoutMs) {
    lastValue = await check();
    if (lastValue.ok) return lastValue;
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  throw new Error(lastValue?.message ?? "Timed out waiting for Twenty webhook events.");
}

const ts = Date.now();
const email = `twenty-smoke+${ts}@example.com`;
const chatId = `twenty_smoke_${ts}`;
const marker = `Twenty webhook smoke ${ts}`;

const beforeEvents = await readJsonl(eventsPath);
const beforeSummaries = await readJsonl(summariesPath);
const beforeHermesDispatches = await readJsonl(hermesDispatchesPath);
const beforeHermesFailures = await readJsonl(hermesFailuresPath);
const beforeWhatsappDispatches = await readJsonl(whatsappDispatchesPath);
const beforeWhatsappFailures = await readJsonl(whatsappFailuresPath);

const response = await fetch(`${baseUrl}/api/assistant-handoff`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    name: `Twenty Smoke ${ts}`,
    email,
    phone: "07902 000000",
    message: `${marker}. Safe to delete.`,
    pageUrl: `${baseUrl}/webhook-smoke`,
    chatId,
  }),
});

if (!response.ok) {
  throw new Error(`Assistant handoff returned ${response.status}: ${await response.text()}`);
}

const handoff = await response.json();
const personId = handoff?.crm?.personId;
const noteId = handoff?.crm?.noteId;

if (!personId || !noteId) {
  throw new Error(`Handoff did not create Twenty person/note: ${JSON.stringify(handoff)}`);
}

const result = await waitFor(async () => {
  const events = await readJsonl(eventsPath);
  const summaries = await readJsonl(summariesPath);
  const hermesDispatches = await readJsonl(hermesDispatchesPath);
  const hermesFailures = await readJsonl(hermesFailuresPath);
  const whatsappDispatches = await readJsonl(whatsappDispatchesPath);
  const whatsappFailures = await readJsonl(whatsappFailuresPath);
  const newEvents = events.slice(beforeEvents.length);
  const newSummaries = summaries.slice(beforeSummaries.length);
  const newHermesDispatches = hermesDispatches.slice(beforeHermesDispatches.length);
  const newHermesFailures = hermesFailures.slice(beforeHermesFailures.length);
  const newWhatsappDispatches = whatsappDispatches.slice(beforeWhatsappDispatches.length);
  const newWhatsappFailures = whatsappFailures.slice(beforeWhatsappFailures.length);
  const matchingEvents = newEvents.filter((event) => {
    const record = event.payload?.record ?? event.payload?.data ?? {};
    return record.id === personId || record.id === noteId || record.noteId === noteId || record.targetPersonId === personId;
  });
  const matchingSummary = newSummaries.find(
    (summary) => summary.personId === personId && summary.noteId === noteId && summary.chatId === chatId,
  );
  const matchingHermesDispatch = matchingSummary
    ? newHermesDispatches.find((dispatch) => dispatch.summaryId === matchingSummary.id)
    : null;
  const matchingHermesFailure = matchingSummary
    ? newHermesFailures.find((dispatch) => dispatch.summaryId === matchingSummary.id)
    : null;
  const matchingWhatsappDispatch = matchingSummary
    ? newWhatsappDispatches.find((dispatch) => dispatch.summaryId === matchingSummary.id)
    : null;
  const matchingWhatsappFailure = matchingSummary
    ? newWhatsappFailures.find((dispatch) => dispatch.summaryId === matchingSummary.id)
    : null;

  const hermesOk = !expectHermes || Boolean(matchingHermesDispatch);
  const whatsappOk = !expectWhatsapp || Boolean(matchingWhatsappDispatch);

  if (matchingEvents.length >= 3 && matchingSummary && hermesOk && whatsappOk) {
    return { ok: true, matchingEvents, matchingSummary, matchingHermesDispatch, matchingWhatsappDispatch };
  }

  return {
    ok: false,
    message: [
      `Saw ${matchingEvents.length} matching event(s) and ${matchingSummary ? 1 : 0} summary record(s).`,
      expectHermes
        ? `Hermes dispatch=${matchingHermesDispatch ? 1 : 0}, failure=${matchingHermesFailure ? JSON.stringify(matchingHermesFailure) : 0}.`
        : "",
      expectWhatsapp
        ? `WhatsApp dispatch=${matchingWhatsappDispatch ? 1 : 0}, failure=${matchingWhatsappFailure ? JSON.stringify(matchingWhatsappFailure) : 0}.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
  };
}, 30000);

const eventNames = result.matchingEvents.map((event) => event.eventName).sort();
const expected = ["note.created", "noteTarget.created", "person.created"];
if (eventNames.join(",") !== expected.join(",")) {
  throw new Error(`Expected ${expected.join(", ")} events, saw ${eventNames.join(", ")}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      personId,
      noteId,
      summaryId: result.matchingSummary.id,
      events: eventNames,
      hermes: result.matchingHermesDispatch
        ? {
            status: result.matchingHermesDispatch.status,
            runId: result.matchingHermesDispatch.response?.run_id,
            hasStrategy: Boolean(result.matchingHermesDispatch.output),
          }
        : { status: "not_checked" },
      whatsapp: result.matchingWhatsappDispatch
        ? { status: result.matchingWhatsappDispatch.status, messageId: result.matchingWhatsappDispatch.response?.messageId }
        : { status: "not_checked" },
    },
    null,
    2,
  ),
);
