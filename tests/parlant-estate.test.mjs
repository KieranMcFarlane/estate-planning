import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const SERVICE_URL = process.env.PARLANT_TEST_URL ?? "http://127.0.0.1:8800";
const KNOWLEDGE_PATH = new URL("../data/estate-knowledge.json", import.meta.url);
const LEADS_PATH = new URL("../data/leads/estate-handoffs.jsonl", import.meta.url);

async function chat(content, id = `test-${Date.now()}`) {
  const response = await fetch(`${SERVICE_URL}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      messages: [{ role: "user", content }],
      metadata: { pageUrl: "https://estate.nakanodigital.com/test", disableModel: true },
    }),
  });

  assert.equal(response.status, 200);
  return response.json();
}

async function chatMessages(messages, id = `test-${Date.now()}`) {
  const response = await fetch(`${SERVICE_URL}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      messages,
      metadata: { pageUrl: "https://estate.nakanodigital.com/test", disableModel: true },
    }),
  });

  assert.equal(response.status, 200);
  return response.json();
}

async function liveChat(content, id = `live-${Date.now()}`) {
  const response = await fetch(`${SERVICE_URL}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      messages: [{ role: "user", content }],
      metadata: { pageUrl: "https://estate.nakanodigital.com/test" },
    }),
  });

  assert.equal(response.status, 200);
  return response.json();
}

test("knowledgebase includes public routes and key glossary terms", async () => {
  const knowledge = JSON.parse(await readFile(KNOWLEDGE_PATH, "utf8"));
  const routes = new Set(knowledge.pages.map((page) => page.route));
  const graphUrls = new Set(knowledge.siteGraph.map((node) => node.url));
  const terms = new Set(knowledge.glossary.map((entry) => entry.term));

  for (const route of ["/", "/wills", "/trusts", "/lpa", "/care-planning", "/estate-planning", "/faq", "/glossary", "/contact"]) {
    assert.ok(routes.has(route), `missing route ${route}`);
  }

  for (const url of ["/wills", "/trusts", "/lpa", "/#where-we-work", "/#services", "/#reviews", "/contact"]) {
    assert.ok(graphUrls.has(url), `missing site graph target ${url}`);
  }

  for (const url of ["/glossary#glossary-of-terms-card-probate", "/glossary#glossary-of-terms-card-beneficiary", "/contact#contact-details", "/#faq-what-s-the-difference-between-a-will-and-a-trust"]) {
    assert.ok(graphUrls.has(url), `missing semantic block target ${url}`);
  }

  assert.ok(knowledge.siteGraph.some((node) => node.kind === "semantic-block"), "missing semantic block graph nodes");

  for (const term of ["Will", "Trust", "Trustee", "Executor", "Beneficiary", "Lasting Power of Attorney", "Probate", "Inheritance Tax", "Rules of Intestacy", "Care Planning", "Mitigating Tax"]) {
    assert.ok(terms.has(term), `missing glossary term ${term}`);
  }
});

test("guardrails avoid definitive legal, fee, timeframe, and tax guarantees", async () => {
  const legal = await chat("Should I definitely put my house into a trust?");
  assert.match(legal.text, /general chat answer would not be enough|speak directly/i);

  const fees = await chat("How much does a will cost and how long does it take?");
  assert.match(fees.text, /cannot confirm|fixed costs|fees or timeframes/i);
  assert.doesNotMatch(fees.text, /£\d|\d+\s*(?:days|weeks)/i);

  const tax = await chat("Can you guarantee I avoid all tax?");
  assert.match(tax.text, /general chat answer would not be enough|speak directly/i);
});

test("unknown questions receive a safe fallback", async () => {
  const answer = await chat("Can Pathway repair my boiler?");
  assert.match(answer.text, /do not have enough information|speak with Pathway/i);
});

test("greetings and capability prompts do not trigger fallback", async () => {
  const greeting = await chat("Hi", "greeting-test");
  assert.match(greeting.text, /Wills|Trusts|LPAs|estate planning/i);
  assert.doesNotMatch(greeting.text, /do not have enough information/i);

  const capability = await chat("what can you do?", "capability-test");
  assert.match(capability.text, /explain the basics|find the right page/i);
  assert.doesNotMatch(capability.text, /do not have enough information/i);
});

test("live routing keeps simple turns fast and reserves Parlant for governed turns", async () => {
  const greeting = await liveChat("Hi", "routing-greeting-test");
  assert.equal(greeting.model.provider, "openai");
  assert.equal(greeting.model.route, "fast");
  assert.equal(greeting.model.nativeFallback.skipped, true);

  const advice = await liveChat("Do I need a trust for my house?", "routing-trust-advice-test");
  assert.equal(advice.model.provider, "parlant");
  assert.equal(advice.model.used, true);
  assert.equal(advice.model.route, "parlant");
  assert.equal(advice.model.routeReason, "sensitive_intent");

  const booking = await liveChat("Book me a consultation", "routing-booking-test");
  assert.equal(booking.model.provider, "parlant");
  assert.equal(booking.model.used, true);
  assert.equal(booking.model.routeReason, "handoff");
});

test("booking intent writes a local handoff record", async () => {
  const before = await stat(LEADS_PATH).catch(() => ({ size: 0 }));
  const answer = await chat("Please contact me. My name is Test User and my email is test@example.com", "handoff-test");

  assert.equal(answer.handoff.intent, "human_handoff");
  assert.equal(answer.handoff.contact.email, "test@example.com");
  assert.ok((await stat(LEADS_PATH)).size > before.size);
});

test("semantic navigation infers site destinations from meaning", async () => {
  const trusts = await chat("Show me where you explain protecting assets for children", "nav-trusts-test");
  assert.equal(trusts.navigation.auto, true);
  assert.match(trusts.navigation.targets[0].url, /^\/trusts(?:#.+)?$/);

  const secondMarriage = await chat("Where do you talk about second marriage and protecting the house?", "nav-second-marriage-trusts-test");
  assert.equal(secondMarriage.navigation.auto, true);
  assert.match(secondMarriage.navigation.targets[0].url, /^\/trusts(?:#.+)?$/);

  const coverTrusts = await chat("Do you cover trusts for blended families?", "nav-cover-trusts-test");
  assert.equal(coverTrusts.navigation.auto, true);
  assert.match(coverTrusts.navigation.targets[0].url, /^\/trusts(?:#.+)?$/);

  const readMoreCareFees = await chat("Can I read more about care fees?", "nav-read-more-care-fees-test");
  assert.equal(readMoreCareFees.navigation.auto, true);
  assert.match(readMoreCareFees.navigation.targets[0].url, /care-costs|care-planning/);

  const trustMeaning = await chat("how does a trust work", "nav-trust-work-test");
  assert.match(trustMeaning.navigation.targets[0].url, /^\/trusts(?:#.+)?$/);

  const willTrust = await chat("do you talk about setting up a trust in a will", "nav-will-trust-test");
  assert.match(willTrust.navigation.targets[0].url, /^\/trusts(?:#.+)?$/);

  const wills = await chat("where on the site do you talk about wills", "nav-where-site-wills-test");
  assert.equal(wills.navigation.auto, true);
  assert.equal(wills.navigation.targets[0].url, "/wills");

  const followup = await chatMessages(
    [
      { role: "user", content: "where on the site do you talk about wills" },
      { role: "assistant", content: "Pathway talks about Wills on the Wills page.\n\nWills: /wills\nEstate planning overview: /estate-planning" },
      { role: "user", content: "yes" },
    ],
    "nav-yes-wills-test",
  );
  assert.equal(followup.navigation.auto, true);
  assert.equal(followup.navigation.targets[0].url, "/wills");

  const contextualShowSite = await chatMessages(
    [
      { role: "user", content: "tell me about wills" },
      { role: "assistant", content: "A Will records what you want to happen to your estate and who should deal with things when the time comes.\n\nUseful pages:\n- Wills: /wills\n- Estate planning overview: /estate-planning" },
      { role: "user", content: "show me on the site" },
    ],
    "nav-show-me-on-site-wills-test",
  );
  assert.equal(contextualShowSite.navigation.auto, true);
  assert.equal(contextualShowSite.navigation.targets[0].url, "/wills");

  const contextualBusinessShow = await chatMessages(
    [
      { role: "user", content: "what can you tell me about business protection" },
      {
        role: "assistant",
        content:
          "Pathway's Business Protection service is about planning to protect your business and the people who rely on it.\n\nUseful pages:\n- How business protection can help: /business-protection#business-protection-section-how-business-protection-can-help\n- Business Protection: /business-protection",
      },
      { role: "user", content: "show me" },
    ],
    "nav-show-me-business-protection-test",
  );
  assert.equal(contextualBusinessShow.navigation.auto, true);
  assert.match(contextualBusinessShow.navigation.targets[0].url, /^\/business-protection(?:#.+)?$/);
  assert.match(contextualBusinessShow.text, /business protection/i);
  assert.doesNotMatch(contextualBusinessShow.text, /A Trust is a way/i);

  const explicitNavigationOverridesContext = await chatMessages(
    [
      { role: "user", content: "Where do you mention care costs?" },
      { role: "assistant", content: "Care planning and asset protection are useful places to read about care costs." },
      { role: "user", content: "Take me to contact details" },
    ],
    "nav-explicit-contact-overrides-context-test",
  );
  assert.equal(explicitNavigationOverridesContext.navigation.auto, true);
  assert.equal(explicitNavigationOverridesContext.navigation.targets[0].url, "/contact#contact-details");

  const local = await chat("Where do you mention Leamington and home visits?", "nav-local-test");
  assert.equal(local.navigation.auto, true);
  assert.equal(local.navigation.targets[0].url, "/#where-we-work");

  const lpa = await chat("more info on LPAs", "nav-lpa-more-info-test");
  assert.equal(lpa.navigation.auto, true);
  assert.match(lpa.navigation.targets[0].url, /^\/lpa(?:#.+)?$/);

  const anythingLpa = await chat("Is there anything on the site about LPAs for mum?", "nav-anything-lpa-test");
  assert.equal(anythingLpa.navigation.auto, true);
  assert.match(anythingLpa.navigation.targets[0].url, /^\/lpa(?:#.+)?$/);

  const lpaMemory = await chat("Can I arrange LPA if mum has memory problems?", "nav-lpa-memory-test");
  assert.match(lpaMemory.navigation.targets[0].url, /^\/lpa(?:#.+)?$|^\/care-planning(?:#.+)?$/);
  assert.match(lpaMemory.text, /general information|personal advice|speaking with Pathway|speak directly/i);

  const tax = await chat("where do you talk about tax?", "nav-tax-ambiguous-test");
  assert.ok(tax.navigation.targets.length >= 1);
  assert.match(tax.navigation.targets[0].url, /inheritance-tax-planning|estate-planning|trusts/);

  const executor = await chat("what does executor mean?", "nav-executor-meaning-test");
  assert.match(executor.navigation.targets[0].url, /\/glossary(?:#glossary-of-terms-card-executor)?/);

  const beneficiary = await chat("define beneficiary", "nav-beneficiary-definition-test");
  assert.equal(beneficiary.navigation.targets[0].url, "/glossary#glossary-of-terms-card-beneficiary");

  const beneficiaryMeaning = await chat("what does beneficiary mean?", "nav-beneficiary-meaning-test");
  assert.equal(beneficiaryMeaning.navigation.auto, true);
  assert.equal(beneficiaryMeaning.navigation.targets[0].url, "/glossary#glossary-of-terms-card-beneficiary");

  const probateMeaning = await chat("what is probate?", "nav-probate-meaning-test");
  assert.match(probateMeaning.navigation.targets[0].url, /\/glossary#glossary-of-terms-card-probate|extended-services/);

  const contactDetails = await chat("where do you list the phone number?", "nav-phone-details-test");
  assert.equal(contactDetails.navigation.auto, true);
  assert.equal(contactDetails.navigation.targets[0].url, "/contact#contact-details");

  const lookingForEmail = await chat("I'm looking for your email address", "nav-looking-for-email-test");
  assert.equal(lookingForEmail.navigation.auto, true);
  assert.equal(lookingForEmail.navigation.targets[0].url, "/contact#contact-details");

  const willVsTrust = await chat("where do you explain the difference between a will and a trust?", "nav-will-vs-trust-test");
  assert.match(willVsTrust.navigation.targets[0].url, /\/#faq-what-s-the-difference-between-a-will-and-a-trust|\/trusts|\/wills/);

  const careCosts = await chat("where do you mention care costs eroding what I have built?", "nav-care-costs-block-test");
  assert.equal(careCosts.navigation.auto, true);
  assert.equal(careCosts.navigation.targets[0].url, "/#problem-care-costs-that-quietly-erode-everything-you-ve-built");

  const careCostsShort = await chat("where do you mention care costs?", "nav-care-costs-short-test");
  assert.equal(careCostsShort.navigation.auto, true);
  assert.match(careCostsShort.navigation.targets[0].url, /care-costs|care-planning/);

  const careFees = await chat("Where do you mention care fees?", "nav-care-fees-test");
  assert.equal(careFees.navigation.auto, true);
  assert.match(careFees.navigation.targets[0].url, /care-costs|care-planning/);

  const tellMoreWills = await chat("Can you tell me more about wills?", "nav-tell-more-wills-test");
  assert.equal(tellMoreWills.navigation.auto, true);
  assert.equal(tellMoreWills.navigation.targets[0].url, "/wills");

  const services = await chat("what services do you offer?", "nav-services-test");
  assert.equal(services.navigation.targets[0].url, "/#services");

  const reviews = await chat("where are reviews?", "nav-reviews-test");
  assert.equal(reviews.navigation.auto, true);
  assert.equal(reviews.navigation.targets[0].url, "/#reviews");

  const newsletter = await chat("newsletter celebrity fun facts", "nav-newsletter-test");
  assert.equal(newsletter.navigation.targets[0].url, "/#newsletter");

  const appointment = await chat("book an appointment", "nav-appointment-test");
  assert.equal(appointment.navigation.targets[0].url, "/contact");

  const farm = await chat("can you help with farms?", "nav-farm-test");
  assert.equal(farm.navigation.targets[0].url, "/agricultural-land");
});

test("common topic answers are curated rather than scraped page fragments", async () => {
  const start = await chat("where should I start", "copy-start-test");
  assert.match(start.text, /Most people begin with three building blocks/i);
  assert.doesNotMatch(start.text, /Contact Start with a calm conversation/i);

  const wills = await chat("show your info on wills", "copy-wills-test");
  assert.match(wills.text, /A Will records what you want to happen/i);
  assert.doesNotMatch(wills.text, /Estate planning services Wills/i);
  assert.doesNotMatch(wills.text, /Agricultural Land/i);
  assert.equal(wills.navigation.targets[0].url, "/wills");
});

test("contextual clarification answers prior phrasing without jumping to contact", async () => {
  const answer = await chatMessages(
    [
      { role: "user", content: "what if I have bitcoin?" },
      {
        role: "assistant",
        content:
          "Delays before family can access money or property can be upsetting. Pathway focuses on clear steps to help things run more smoothly, with practical planning to reduce friction for loved ones.",
      },
      { role: "user", content: "what can be upsetting" },
    ],
    "clarification-upsetting-test",
  );

  assert.match(answer.text, /delay itself|delays|uncertainty/i);
  assert.doesNotMatch(answer.text, /Here are Pathway's contact details/i);
  assert.equal(answer.navigation, null);
});
