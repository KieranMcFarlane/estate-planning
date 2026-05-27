import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const args = new Set(process.argv.slice(2));
const baseUrl = process.env.PATHWAY_QA_BASE_URL ?? "https://estate.nakanodigital.com";
const evidenceDir = process.env.PATHWAY_QA_EVIDENCE_DIR ?? path.join(process.cwd(), "screenshots", "agent-browser");
const submitHandoff = args.has("--submit-handoff");

process.env.AGENT_BROWSER_ARGS ||= "--no-sandbox";

const results = [];

function labelToFile(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function commandLine(commandArgs) {
  return `agent-browser ${commandArgs.map((arg) => JSON.stringify(arg)).join(" ")}`;
}

async function run(commandArgs, options = {}) {
  const { allowFailure = false, quiet = false } = options;
  const output = await new Promise((resolve, reject) => {
    const child = spawn("agent-browser", commandArgs, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const result = { code, stdout, stderr };
      if (code === 0 || allowFailure) {
        resolve(result);
        return;
      }
      const error = new Error(`${commandLine(commandArgs)} failed with code ${code}\n${stdout}\n${stderr}`);
      Object.assign(error, result);
      reject(error);
    });
  });

  if (!quiet && output.stdout.trim()) {
    process.stdout.write(output.stdout);
  }
  if (!quiet && output.stderr.trim()) {
    process.stderr.write(output.stderr);
  }
  return output;
}

async function evalJson(expression) {
  const { stdout } = await run(["eval", expression], { quiet: true });
  return JSON.parse(stdout);
}

async function captureEvidence(label) {
  await mkdir(evidenceDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const prefix = path.join(evidenceDir, `${stamp}-${labelToFile(label)}`);
  await run(["screenshot", `${prefix}.png`], { allowFailure: true, quiet: true });
  const errors = await run(["errors"], { allowFailure: true, quiet: true });
  const consoleOutput = await run(["console"], { allowFailure: true, quiet: true });
  const requests = await run(["network", "requests"], { allowFailure: true, quiet: true });
  console.error(`\nEvidence captured for ${label}: ${prefix}.png`);
  if (errors.stdout.trim()) console.error(`\nPage errors:\n${errors.stdout}`);
  if (consoleOutput.stdout.trim()) console.error(`\nConsole:\n${consoleOutput.stdout}`);
  if (requests.stdout.trim()) console.error(`\nNetwork requests:\n${requests.stdout.slice(0, 4000)}`);
}

async function step(label, fn) {
  const started = Date.now();
  try {
    await fn();
    const duration = ((Date.now() - started) / 1000).toFixed(1);
    results.push({ label, status: "pass", duration });
    console.log(`PASS ${label} (${duration}s)`);
  } catch (error) {
    const duration = ((Date.now() - started) / 1000).toFixed(1);
    results.push({ label, status: "fail", duration });
    console.error(`FAIL ${label} (${duration}s)`);
    console.error(error instanceof Error ? error.message : error);
    await captureEvidence(label);
    throw error;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function includes(value, expected, message) {
  assert(String(value).includes(expected), `${message}\nExpected ${JSON.stringify(value)} to include ${JSON.stringify(expected)}`);
}

function matches(value, pattern, message) {
  assert(pattern.test(String(value)), `${message}\nExpected ${JSON.stringify(value)} to match ${pattern}`);
}

async function browserState() {
  return evalJson(`(() => {
    const highlighted = document.querySelector('.semantic-target-highlight');
    const dialog = document.querySelector('[role="dialog"]');
    const assistant = document.querySelector('[aria-label="Pathway planning assistant"]');
    const handoffForm = Array.from(document.querySelectorAll('form')).find((candidate) => candidate.innerText.includes('Ask Pathway to contact you'));
    const handoffInputs = handoffForm ? Array.from(handoffForm.querySelectorAll('input')) : [];
    const bodyText = document.body.innerText;
    return {
      url: location.href,
      title: document.title,
      nav: Boolean(document.querySelector('nav')),
      footer: Boolean(document.querySelector('footer')),
      h1: document.querySelector('h1')?.innerText || '',
      assistantButton: Boolean(document.querySelector("button[aria-label='Open planning assistant']")),
      assistantOpen: Boolean(assistant),
      assistantText: assistant?.innerText || '',
      assistantHtml: assistant?.innerHTML || '',
      handoff: handoffForm ? {
        name: handoffInputs[0]?.value || '',
        email: handoffInputs[1]?.value || '',
        phone: handoffInputs[2]?.value || '',
        message: handoffForm.querySelector('textarea')?.value || ''
      } : null,
      bodyText,
      highlighted: highlighted ? {
        id: highlighted.id || '',
        tag: highlighted.tagName,
        text: highlighted.innerText || highlighted.textContent || ''
      } : null,
      spotlight: dialog ? {
        text: dialog.innerText || dialog.textContent || '',
        visible: Boolean(dialog.offsetParent || dialog.getClientRects().length)
      } : null,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      nextOverlay: Boolean(document.querySelector('[data-nextjs-dialog]'))
    };
  })()`);
}

async function clearBrowserLogs() {
  await run(["errors", "--clear"], { allowFailure: true, quiet: true });
  await run(["console", "--clear"], { allowFailure: true, quiet: true });
  await run(["network", "requests", "--clear"], { allowFailure: true, quiet: true });
}

async function assertNoBrowserErrors() {
  const errors = await run(["errors"], { allowFailure: true, quiet: true });
  assert(!errors.stdout.trim(), `Expected no page errors, got:\n${errors.stdout}`);
}

async function reset(pathname = "/", viewport = { width: 1440, height: 1200 }) {
  await run(["close", "--all"], { allowFailure: true, quiet: true });
  await run(["open", new URL(pathname, baseUrl).toString()], { quiet: true });
  await run(["set", "viewport", String(viewport.width), String(viewport.height)], { quiet: true });
  await run(["eval", "localStorage.clear(); sessionStorage.clear();"], { quiet: true });
  await run(["reload"], { quiet: true });
  await run(["wait", "--load", "networkidle"], { quiet: true });
  await clearBrowserLogs();
}

async function openAssistant() {
  await run(["click", "button[aria-label='Open planning assistant']"], { quiet: true });
  await run(["wait", "800"], { quiet: true });
}

async function askAssistant(prompt, waitMs = 12_000) {
  await run(["fill", "textarea[placeholder='Ask a general estate planning question...']", prompt], { quiet: true });
  await run(["click", "button[aria-label='Send message']"], { quiet: true });
  await run(["wait", String(waitMs)], { quiet: true });
}

async function dismissSpotlight() {
  await run(
    [
      "eval",
      "Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Got it')?.click();",
    ],
    { allowFailure: true, quiet: true },
  );
  await run(["wait", "500"], { quiet: true });
}

async function verifySmoke(viewportName, viewport) {
  await reset("/", viewport);
  const state = await browserState();
  includes(state.title, "Pathway Estate Planning", `${viewportName}: title should identify Pathway`);
  assert(state.nav, `${viewportName}: nav should be present`);
  assert(state.footer, `${viewportName}: footer should be present`);
  includes(state.h1, "Estate planning", `${viewportName}: hero h1 should be present`);
  assert(state.assistantButton, `${viewportName}: assistant launcher should be present`);
  assert(!state.horizontalOverflow, `${viewportName}: page should not horizontally overflow`);
  assert(!state.nextOverlay, `${viewportName}: Next error overlay should not be present`);
  await assertNoBrowserErrors();
}

async function verifyNavigation(prompt, expectations) {
  await reset("/");
  await openAssistant();
  await askAssistant(prompt, expectations.waitMs ?? 12_000);
  const state = await browserState();

  if (expectations.urlIncludes) includes(state.url, expectations.urlIncludes, `${prompt}: URL mismatch`);
  if (expectations.urlPattern) matches(state.url, expectations.urlPattern, `${prompt}: URL mismatch`);
  assert(state.highlighted, `${prompt}: expected a highlighted target`);
  assert(state.spotlight?.visible, `${prompt}: expected a visible spotlight`);
  if (expectations.highlightIncludes) includes(state.highlighted.text, expectations.highlightIncludes, `${prompt}: highlighted text mismatch`);
  if (expectations.spotlightIncludes) includes(state.spotlight.text, expectations.spotlightIncludes, `${prompt}: spotlight text mismatch`);
  assert(!state.horizontalOverflow, `${prompt}: navigation state should not horizontally overflow`);
  await dismissSpotlight();
  const dismissed = await browserState();
  assert(!dismissed.spotlight?.visible, `${prompt}: spotlight should dismiss`);
  await assertNoBrowserErrors();
}

async function verifyAnswerOnly(prompt, expectations = {}) {
  await reset("/");
  await openAssistant();
  await askAssistant(prompt, expectations.waitMs ?? 16_000);
  const state = await browserState();
  assert(state.url === `${baseUrl}/`, `${prompt}: should stay on the homepage, got ${state.url}`);
  assert(!state.spotlight?.visible, `${prompt}: should not show a spotlight`);
  assert(!state.highlighted, `${prompt}: should not highlight a target`);
  assert(state.assistantText.length > 220, `${prompt}: answer should contain substantial text`);
  if (expectations.answerIncludes) includes(state.assistantText, expectations.answerIncludes, `${prompt}: answer text mismatch`);
  assert(/Wills?|Trusts?|LPA|estate planning|Pathway/i.test(state.assistantText), `${prompt}: answer should stay on Pathway topic`);
  await assertNoBrowserErrors();
}

async function verifyContextRegression() {
  await reset("/");
  await openAssistant();
  await askAssistant("Where do you mention care costs?");
  let state = await browserState();
  includes(state.url, "care-costs", "context regression: first prompt should navigate to care-costs");
  includes(state.highlighted?.text ?? "", "Care costs", "context regression: first target should mention care costs");

  await dismissSpotlight();
  await openAssistant();
  await askAssistant("Take me to contact details");
  state = await browserState();
  includes(state.url, "/contact?highlight=contact-details#contact-details", "context regression: explicit contact request should override prior care context");
  includes(state.highlighted?.text ?? "", "Phone:", "context regression: contact details should be highlighted");
  await assertNoBrowserErrors();
}

async function verifyVagueFollowup() {
  await reset("/");
  await openAssistant();
  await askAssistant("Where do you talk about wills?");
  let state = await browserState();
  includes(state.url, "/wills", "vague follow-up: first prompt should navigate to wills");

  await dismissSpotlight();
  await openAssistant();
  await askAssistant("yes");
  state = await browserState();
  includes(state.url, "/wills", "vague follow-up: yes should keep/use wills context");
  assert(!state.spotlight || state.spotlight.visible, "vague follow-up: spotlight state should be stable if present");
  await assertNoBrowserErrors();
}

async function fillHandoffForm() {
  const timestamp = Date.now();
  await run(
    [
      "eval",
      `(() => {
        const form = Array.from(document.querySelectorAll('form')).find((candidate) => candidate.innerText.includes('Ask Pathway to contact you'));
        if (!form) throw new Error('Handoff form not found');
        const setValue = (element, value) => {
          const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;
          setter?.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const inputs = form.querySelectorAll('input');
        setValue(inputs[0], 'Agent Browser QA');
        setValue(inputs[1], 'agent-browser-qa+${timestamp}@example.com');
        setValue(inputs[2], '07902 000000');
        setValue(form.querySelector('textarea'), 'Automated agent-browser QA smoke test. Safe to delete.');
      })()`,
    ],
    { quiet: true },
  );
}

async function verifyHandoff() {
  await reset("/");
  await openAssistant();
  await askAssistant("Can someone contact me?", 12_000);
  let state = await browserState();
  includes(state.assistantText, "Ask Pathway to contact you", "handoff: form should appear");

  await fillHandoffForm();
  state = await browserState();
  assert(state.handoff, "handoff: expected form values to be available");
  assert(state.handoff.name === "Agent Browser QA", `handoff: name should be filled, got ${JSON.stringify(state.handoff.name)}`);
  assert(state.handoff.email.startsWith("agent-browser-qa+"), `handoff: email should be marked test data, got ${JSON.stringify(state.handoff.email)}`);
  assert(state.handoff.message.includes("Automated agent-browser QA"), "handoff: message should be filled with marked test data");

  if (!submitHandoff) {
    console.log("INFO handoff submit skipped; run with --submit-handoff to create marked test data.");
    return;
  }

  const leadsPath = process.env.ESTATE_LEADS_PATH ?? path.join(process.cwd(), "data", "leads", "estate-handoffs.jsonl");
  const before = await stat(leadsPath).catch(() => ({ size: 0 }));
  await run(
    [
      "eval",
      "Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Send to Pathway'))?.click();",
    ],
    { quiet: true },
  );
  await run(["wait", "5000"], { quiet: true });
  state = await browserState();
  assert(/sent those details|saved those details/i.test(state.assistantText), "handoff: expected success state after submit");
  const after = await stat(leadsPath).catch(() => ({ size: 0 }));
  assert(after.size > before.size, "handoff: expected local handoff persistence to grow");
}

async function main() {
  console.log(`Running agent-browser Pathway QA against ${baseUrl}`);
  console.log(`Handoff submit: ${submitHandoff ? "enabled" : "skipped"}`);

  await step("site smoke desktop", () => verifySmoke("desktop", { width: 1440, height: 1200 }));
  await step("site smoke mobile", () => verifySmoke("mobile", { width: 390, height: 844 }));
  await step("assistant navigation trusts", () =>
    verifyNavigation("Where do you explain trusts?", {
      urlPattern: /\/trusts\?highlight=/,
      spotlightIncludes: "Trusts",
    }),
  );
  await step("assistant navigation care costs exact block", () =>
    verifyNavigation("Where do you mention care costs?", {
      urlIncludes: "care-costs",
      highlightIncludes: "Care costs",
      spotlightIncludes: "Care costs",
    }),
  );
  await step("assistant navigation contact details", () =>
    verifyNavigation("Take me to contact details", {
      urlIncludes: "/contact?highlight=contact-details#contact-details",
      highlightIncludes: "Phone:",
      spotlightIncludes: "Contact details",
    }),
  );
  await step("assistant navigation glossary beneficiary", () =>
    verifyNavigation("Where do you define beneficiary?", {
      urlIncludes: "/glossary?highlight=glossary-of-terms-card-beneficiary#glossary-of-terms-card-beneficiary",
      highlightIncludes: "Beneficiary",
      spotlightIncludes: "Beneficiary",
    }),
  );
  await step("context regression explicit override", verifyContextRegression);
  await step("context regression vague follow-up", verifyVagueFollowup);
  await step("answer-only will vs trust", () => verifyAnswerOnly("What's the difference between a will and a trust?", { answerIncludes: "A Will" }));
  await step("answer-only LPAs", () => verifyAnswerOnly("How do LPAs work?", { answerIncludes: "Lasting Power" }));
  await step("answer-only starting point", () => verifyAnswerOnly("Where should I start?", { answerIncludes: "building blocks" }));
  await step("handoff form", verifyHandoff);

  await run(["close", "--all"], { allowFailure: true, quiet: true });

  console.log("\nAgent-browser QA summary:");
  for (const result of results) {
    console.log(`- ${result.status.toUpperCase()} ${result.label} (${result.duration}s)`);
  }
}

main().catch(async (error) => {
  await run(["close", "--all"], { allowFailure: true, quiet: true }).catch(() => {});
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
