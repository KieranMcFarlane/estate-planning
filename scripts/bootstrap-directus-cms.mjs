import { pageContent } from "./directus-page-content.mjs";
import { existsSync, readFileSync } from "node:fs";

function loadDotEnv(path = ".env") {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] ??= value;
  }
}

loadDotEnv();

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/+$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const TENANT_ID = process.env.DIRECTUS_TENANT_ID || "estate-planning";

const tenant = {
  slug: TENANT_ID,
  status: "published",
  name: "Pathway Estate Planning",
  site_url: process.env.SITE_URL || "https://estate.nakanodigital.com",
  description:
    "Approachable estate planning in Royal Leamington Spa and Warwickshire: wills, trusts, LPAs, care planning and inheritance tax planning.",
  phone: "07902 863999",
  email: "info@pathwayestateplanning.co.uk",
  location: "Royal Leamington Spa, Warwickshire",
  footer_tagline: "Clear, practical estate planning for individuals and families across Warwickshire. Handled with care.",
};

const pages = [
  ["/", "home", "Pathway Estate Planning | Wills, Trusts & LPAs", tenant.description, 1, "weekly", ""],
  ["/wills", "subpage", "Wills in Royal Leamington Spa | Pathway Estate Planning", "Plain-English Will writing support for families, homeowners, parents, unmarried partners and blended families.", 0.95, "monthly", "Will writing"],
  ["/trusts", "subpage", "Trust Planning | Pathway Estate Planning", "Trust planning explained clearly for inheritance protection, vulnerable beneficiaries, blended families and future generations.", 0.94, "monthly", "Trust planning"],
  ["/lpa", "subpage", "Lasting Powers of Attorney | Pathway Estate Planning", "Support with Property and Financial Affairs LPAs and Health and Welfare LPAs in Royal Leamington Spa and Warwickshire.", 0.93, "monthly", "Lasting Powers of Attorney"],
  ["/inheritance-tax-planning", "subpage", "Inheritance Tax Planning | Pathway Estate Planning", "General inheritance tax planning guidance and estate planning support for families in Warwickshire.", 0.9, "monthly", "Inheritance tax planning"],
  ["/care-planning", "subpage", "Care Planning | Pathway Estate Planning", "Later-life care planning guidance for family decisions, LPAs, care preferences and practical estate planning.", 0.86, "monthly", "Care planning"],
  ["/business-protection", "subpage", "Business Protection Estate Planning | Pathway Estate Planning", "Estate planning for business owners who want to protect continuity, ownership and family interests.", 0.82, "monthly", "Business protection"],
  ["/agricultural-land", "subpage", "Agricultural Land Estate Planning | Pathway Estate Planning", "Specialist estate planning support for farms, agricultural land, rural assets and generational planning.", 0.8, "monthly", "Agricultural estate planning"],
  ["/asset-protection", "subpage", "Asset Protection | Pathway Estate Planning", "Estate planning support for protecting family assets and property.", 0.78, "monthly", ""],
  ["/estate-planning", "subpage", "Estate Planning Services | Pathway Estate Planning", "A full overview of Pathway's estate planning services.", 0.78, "monthly", ""],
  ["/extended-services", "subpage", "Extended Services | Pathway Estate Planning", "Probate, financial advice, conveyancing and related estate planning support.", 0.72, "monthly", ""],
  ["/helpful-info", "subpage", "Helpful Estate Planning Information | Pathway", "A practical estate planning checklist and guidance before you start.", 0.68, "monthly", ""],
  ["/glossary", "subpage", "Estate Planning Glossary | Pathway", "Plain-English definitions for common estate planning words.", 0.68, "monthly", ""],
  ["/faq", "subpage", "Estate Planning FAQs | Pathway", "Answers to common questions about Wills, Trusts, LPAs, Probate and tax planning.", 0.7, "monthly", ""],
  ["/how-it-works", "subpage", "How Estate Planning Works | Pathway", "A clear, calm process for putting estate planning documents in place.", 0.72, "monthly", ""],
  ["/about", "subpage", "About Pathway Estate Planning", "Local, plain-English estate planning support for families across Royal Leamington Spa and Warwickshire.", 0.7, "monthly", ""],
  ["/contact", "contact", "Contact Pathway Estate Planning", "Contact Pathway Estate Planning for a calm initial conversation.", 0.9, "monthly", ""],
  ["/privacy", "subpage", "Privacy Policy | Pathway Estate Planning", "How Pathway Estate Planning handles privacy.", 0.3, "yearly", ""],
  ["/terms", "subpage", "Terms of Service | Pathway Estate Planning", "Pathway Estate Planning terms of service.", 0.3, "yearly", ""],
  ["/cookies", "subpage", "Cookies | Pathway Estate Planning", "Cookie information for Pathway Estate Planning.", 0.3, "yearly", ""],
  ["/complaints", "subpage", "Complaints | Pathway Estate Planning", "How to raise a concern with Pathway Estate Planning.", 0.3, "yearly", ""],
];

const navigation = [
  ["primary", "/", "Home", "", 10],
  ["primary", "/how-it-works", "How It Works", "", 20],
  ["primary", "/about", "About", "", 30],
  ["primary", "/contact", "Contact", "", 40],
  ["services", "/wills", "Wills", "Clear wishes, properly recorded.", 10],
  ["services", "/trusts", "Trusts", "Protect assets for the right people.", 20],
  ["services", "/lpa", "Lasting Powers of Attorney", "Choose who can act for you.", 30],
  ["services", "/inheritance-tax-planning", "Inheritance Tax Planning", "Support with mitigating tax.", 40],
  ["services", "/care-planning", "Care Planning", "Plan ahead for later-life decisions.", 50],
  ["services", "/business-protection", "Business Protection", "Keep your business protected.", 60],
  ["services", "/agricultural-land", "Agricultural Land", "Planning for farms and land.", 70],
  ["resources", "/estate-planning", "All Services", "A full overview of estate planning.", 10],
  ["resources", "/extended-services", "Extended Services", "Probate, advice and related support.", 20],
  ["resources", "/helpful-info", "Helpful Information", "A practical planning checklist.", 30],
  ["resources", "/glossary", "Glossary of Terms", "Plain-English legal explanations.", 40],
  ["resources", "/faq", "FAQ", "Answers to common questions.", 50],
  ["footer_estate", "/wills", "Wills", "", 10],
  ["footer_estate", "/trusts", "Trusts", "", 20],
  ["footer_estate", "/lpa", "Lasting Powers of Attorney", "", 30],
  ["footer_estate", "/inheritance-tax-planning", "Inheritance Tax Planning", "", 40],
  ["footer_specialist", "/asset-protection", "Asset Protection", "", 10],
  ["footer_specialist", "/business-protection", "Business Protection", "", 20],
  ["footer_specialist", "/care-planning", "Care Planning", "", 30],
  ["footer_specialist", "/agricultural-land", "Agricultural Land", "", 40],
  ["footer_information", "/estate-planning", "All Services", "", 10],
  ["footer_information", "/extended-services", "Extended Services", "", 20],
  ["footer_information", "/faq", "FAQ", "", 30],
  ["footer_information", "/glossary", "Glossary", "", 40],
  ["footer_information", "/helpful-info", "Helpful Information", "", 50],
  ["footer_company", "/about", "About Us", "", 10],
  ["footer_company", "/how-it-works", "How It Works", "", 20],
  ["footer_company", "/contact", "Contact", "", 30],
  ["legal", "/privacy", "Privacy Policy", "", 10],
  ["legal", "/terms", "Terms of Service", "", 20],
  ["legal", "/cookies", "Cookies", "", 30],
  ["legal", "/complaints", "Complaints", "", 40],
];

const collections = [
  {
    collection: "tenants",
    meta: { icon: "business", note: "Single tenant website settings" },
    schema: { name: "tenants" },
  },
  {
    collection: "site_pages",
    meta: { icon: "article", note: "Website pages and SEO metadata" },
    schema: { name: "site_pages" },
  },
  {
    collection: "page_sections",
    meta: { icon: "view_agenda", note: "Ordered page content blocks" },
    schema: { name: "page_sections" },
  },
  {
    collection: "navigation_items",
    meta: { icon: "menu", note: "Navigation and footer links" },
    schema: { name: "navigation_items" },
  },
];

const fields = {
  tenants: [
    field("slug", "string", { required: true }),
    field("status", "string"),
    field("name", "string", { required: true }),
    field("site_url", "string"),
    field("description", "text"),
    field("phone", "string"),
    field("email", "string"),
    field("location", "string"),
    field("logo", "uuid", { special: ["file"] }),
    field("footer_logo", "uuid", { special: ["file"] }),
    field("footer_tagline", "text"),
  ],
  site_pages: [
    field("id", "integer", { primary: true }),
    field("tenant", "string", { required: true }),
    field("path", "string", { required: true }),
    field("status", "string"),
    field("page_type", "string"),
    field("eyebrow", "string"),
    field("title", "string", { required: true }),
    field("subtitle", "text"),
    field("description", "text"),
    field("hero_image", "uuid", { special: ["file"] }),
    field("hero_alt", "string"),
    field("intro", "json"),
    field("ai_summary", "json"),
    field("cta", "json"),
    field("show_hero_actions", "boolean"),
    field("canonical_path", "string"),
    field("seo_title", "string"),
    field("priority", "decimal"),
    field("change_frequency", "string"),
    field("service_type", "string"),
    field("sort", "integer"),
  ],
  page_sections: [
    field("id", "uuid", { primary: true }),
    field("tenant", "string", { required: true }),
    field("page", "integer", { required: true }),
    field("sort", "integer"),
    field("section_type", "string"),
    field("eyebrow", "string"),
    field("heading", "string"),
    field("body", "text"),
    field("paragraphs", "json"),
    field("items", "json"),
    field("cards", "json"),
    field("payload", "json"),
    field("variant", "string"),
  ],
  navigation_items: [
    field("id", "uuid", { primary: true }),
    field("tenant", "string", { required: true }),
    field("menu", "string", { required: true }),
    field("href", "string", { required: true }),
    field("label", "string", { required: true }),
    field("body", "text"),
    field("sort", "integer"),
  ],
};

function field(name, type, options = {}) {
  return {
    field: name,
    type,
    meta: {
      interface: interfaceFor(type, options),
      required: Boolean(options.required),
      special: options.special,
    },
    schema: {
      name,
      is_nullable: !options.required && !options.primary,
      is_primary_key: Boolean(options.primary),
      has_auto_increment: Boolean(options.primary && type === "integer"),
      max_length: type === "string" ? 255 : undefined,
    },
  };
}

function interfaceFor(type, options) {
  if (options.special?.includes("file")) return "file-image";
  if (type === "text") return "input-multiline";
  if (type === "json") return "input-code";
  if (type === "boolean") return "boolean";
  if (type === "decimal" || type === "integer") return "input";
  return "input";
}

async function request(path, options = {}) {
  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    throw new Error("DIRECTUS_URL and DIRECTUS_TOKEN are required.");
  }

  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = body?.errors?.[0]?.message || body?.message || response.statusText;
    throw new Error(`${options.method || "GET"} ${path} failed: ${message}`);
  }
  return body;
}

async function exists(path) {
  try {
    await request(path);
    return true;
  } catch (error) {
    if (String(error.message).includes("Forbidden")) throw error;
    return false;
  }
}

async function ensureCollection(definition) {
  if (await exists(`/collections/${definition.collection}`)) return;
  await request("/collections", {
    method: "POST",
    body: JSON.stringify(definition),
  });
  console.log(`created collection ${definition.collection}`);
}

async function collectionCount(collection) {
  const result = await request(`/items/${collection}?aggregate[count]=*`);
  return Number(result?.data?.[0]?.count ?? 0);
}

async function fieldType(collection, fieldName) {
  try {
    const result = await request(`/fields/${collection}/${fieldName}`);
    return result?.data?.type || null;
  } catch {
    return null;
  }
}

async function resetEmptyPageSectionsIfNeeded() {
  if (!(await exists("/collections/page_sections"))) return;
  const count = await collectionCount("page_sections");
  const pageType = await fieldType("page_sections", "page");
  if (count === 0 && pageType && pageType !== "integer") {
    await request("/collections/page_sections", { method: "DELETE" });
    console.log("recreated empty page_sections collection with integer page references");
  }
}

async function ensureField(collection, definition) {
  if (await exists(`/fields/${collection}/${definition.field}`)) return;
  await request(`/fields/${collection}`, {
    method: "POST",
    body: JSON.stringify(definition),
  });
  console.log(`created field ${collection}.${definition.field}`);
}

async function itemByFilter(collection, filter) {
  const params = new URLSearchParams({ limit: "1", filter: JSON.stringify(filter) });
  const result = await request(`/items/${collection}?${params}`);
  return result?.data?.[0] || null;
}

async function upsertByFilter(collection, filter, payload) {
  const existing = await itemByFilter(collection, filter);
  if (existing?.id) {
    await request(`/items/${collection}/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return existing.id;
  }
  const created = await request(`/items/${collection}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return created?.data?.id;
}

async function main() {
  await resetEmptyPageSectionsIfNeeded();

  for (const collection of collections) await ensureCollection(collection);
  for (const [collection, definitions] of Object.entries(fields)) {
    for (const definition of definitions) await ensureField(collection, definition);
  }

  await upsertByFilter("tenants", { slug: { _eq: TENANT_ID } }, tenant);

  const pageIds = new Map();

  for (const [index, [path, page_type, seo_title, description, priority, change_frequency, service_type]] of pages.entries()) {
    const seed = pageContent[path] || {};
    const pageId = await upsertByFilter(
      "site_pages",
      { tenant: { _eq: TENANT_ID }, path: { _eq: path } },
      {
        tenant: TENANT_ID,
        path,
        status: "published",
        page_type,
        eyebrow: seed.eyebrow ?? (service_type ? "Estate planning services" : tenant.name),
        title: seed.title ?? (path === "/" ? tenant.name : seo_title.replace(/\s\|\sPathway.*$/, "")),
        subtitle: seed.subtitle ?? description,
        description,
        hero_alt: "Warm garden path leading to a welcoming front door",
        canonical_path: path,
        seo_title,
        priority,
        change_frequency,
        service_type: service_type || null,
        sort: (index + 1) * 10,
        show_hero_actions: seed.showHeroActions ?? true,
        intro: seed.intro ?? [],
        ai_summary: seed.aiSummary ?? null,
        cta: seed.cta ?? null,
      },
    );
    pageIds.set(path, pageId);
  }

  for (const [menu, href, label, body, sort] of navigation) {
    await upsertByFilter(
      "navigation_items",
      { tenant: { _eq: TENANT_ID }, menu: { _eq: menu }, href: { _eq: href } },
      { tenant: TENANT_ID, menu, href, label, body, sort },
    );
  }

  for (const [path, seed] of Object.entries(pageContent)) {
    const pageId = pageIds.get(path);
    if (!pageId || !Array.isArray(seed.blocks)) continue;
    for (const [index, section] of seed.blocks.entries()) {
      const { columns, ...rest } = section;
      const sort = (index + 1) * 10;
      await upsertByFilter(
        "page_sections",
        { tenant: { _eq: TENANT_ID }, page: { _eq: pageId }, sort: { _eq: sort } },
        {
          tenant: TENANT_ID,
          page: pageId,
          sort,
          section_type: rest.variant || "plain",
          eyebrow: rest.eyebrow ?? null,
          heading: rest.heading ?? null,
          body: null,
          paragraphs: rest.paragraphs ?? [],
          items: rest.items ?? [],
          cards: rest.cards ?? null,
          payload: columns ? { columns } : null,
          variant: rest.variant ?? "plain",
        },
      );
    }
  }

  console.log(`Directus CMS bootstrap complete for tenant ${TENANT_ID}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
