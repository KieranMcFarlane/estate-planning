import assert from "node:assert/strict";
import test from "node:test";

const APP_URL = process.env.ESTATE_APP_TEST_URL ?? "http://127.0.0.1:3006";

async function appAvailable() {
  try {
    const response = await fetch(`${APP_URL}/api/chat?id=healthcheck`);
    return response.status < 500;
  } catch {
    return false;
  }
}

function makeMessage(text) {
  return {
    id: `pathway_msg_test_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role: "user",
    parts: [{ type: "text", text }],
  };
}

test("chat API validates request bodies", async (t) => {
  if (!(await appAvailable())) t.skip(`Estate app is not running at ${APP_URL}`);

  const response = await fetch(`${APP_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.code, "bad_request:chat");
});

test("chat API persists a public anonymous conversation", async (t) => {
  if (!(await appAvailable())) t.skip(`Estate app is not running at ${APP_URL}`);

  const id = `pathway_chat_test_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const response = await fetch(`${APP_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      message: makeMessage("Care planning"),
      metadata: { pageUrl: `${APP_URL}/chat` },
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/event-stream|text\/plain/);
  await response.text();

  const historyResponse = await fetch(`${APP_URL}/api/chat?id=${encodeURIComponent(id)}`);
  assert.equal(historyResponse.status, 200);

  const history = await historyResponse.json();
  assert.equal(history.id, id);
  assert.ok(history.messages.some((message) => message.role === "user"));
  assert.ok(history.messages.some((message) => message.role === "assistant"));
});
