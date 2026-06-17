import "server-only";

import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { cache } from "react";
import { fallbackCmsRoutes, fallbackGlobalContent, fallbackPageFromRoute } from "./fallback";
import type { CmsContentBlock, CmsGlobalContent, CmsNavigationItem, CmsPage, CmsRoute, CmsTenant } from "./types";

type DirectusSchema = {
  tenants: DirectusTenant[];
  site_pages: DirectusPage[];
  page_sections: DirectusSection[];
  navigation_items: DirectusNavigationItem[];
  blog_posts: DirectusBlogPost[];
};

type DirectusFileRef = string | { id?: string; filename_disk?: string; title?: string; description?: string } | null | undefined;

type DirectusTenant = {
  id: string | number;
  slug?: string | null;
  name?: string | null;
  status?: string | null;
  site_url?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  logo?: DirectusFileRef;
  footer_logo?: DirectusFileRef;
  footer_tagline?: string | null;
};

type DirectusPage = {
  id: string | number;
  tenant?: string | DirectusTenant | null;
  path?: string | null;
  status?: string | null;
  page_type?: CmsPage["pageType"] | null;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  hero_image?: DirectusFileRef;
  hero_alt?: string | null;
  intro?: string[] | string | null;
  ai_summary?: CmsPage["aiSummary"] | string | null;
  cta?: CmsPage["cta"] | string | null;
  show_hero_actions?: boolean | null;
  canonical_path?: string | null;
  seo_title?: string | null;
  priority?: number | string | null;
  change_frequency?: CmsRoute["changeFrequency"] | null;
  service_type?: string | null;
  sort?: number | string | null;
};

type DirectusSection = {
  id: string | number;
  tenant?: string | DirectusTenant | null;
  page?: string | number | DirectusPage | null;
  sort?: number | string | null;
  section_type?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  body?: string | null;
  paragraphs?: string[] | string | null;
  items?: string[] | string | null;
  cards?: CmsContentBlock["cards"] | string | null;
  payload?: Partial<CmsContentBlock> | string | null;
  variant?: CmsContentBlock["variant"] | null;
};

type DirectusNavigationItem = {
  id: string | number;
  tenant?: string | DirectusTenant | null;
  menu?: CmsNavigationItem["menu"] | null;
  href?: string | null;
  label?: string | null;
  body?: string | null;
  sort?: number | string | null;
};

type DirectusBlogPost = {
  id: string | number;
  tenant?: string | DirectusTenant | null;
  status?: string | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  body?: string | null;
  author?: string | null;
  tags?: string[] | string | null;
  published_at?: string | null;
  source?: string | null;
};

export type CmsBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  tags: string[];
  publishedAt: string;
  source: string;
};

const tenantId = process.env.DIRECTUS_TENANT_ID?.trim() || "estate-planning";
const directusUrl = (process.env.DIRECTUS_URL?.trim() || process.env.ESTATE_DIRECTUS_URL?.trim() || "").replace(/\/+$/, "");
const directusToken = process.env.DIRECTUS_TOKEN?.trim() || process.env.ESTATE_DIRECTUS_ADMIN_TOKEN?.trim() || "";
const cacheSeconds = Number(process.env.DIRECTUS_CACHE_SECONDS ?? "300");

function hasDirectusConfig() {
  return Boolean(directusUrl && directusToken);
}

function directus() {
  return createDirectus<DirectusSchema>(directusUrl).with(staticToken(directusToken)).with(rest());
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOr(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function arrayFrom(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    return trimmed.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function objectFrom<T>(value: unknown): T | undefined {
  if (!value) return undefined;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function assetUrl(file: DirectusFileRef) {
  if (!file || !directusUrl) return "";
  const id = typeof file === "string" ? file : clean(file.id);
  return id ? `${directusUrl}/assets/${id}` : "";
}

function fileAlt(file: DirectusFileRef, fallback: string) {
  if (!file || typeof file === "string") return fallback;
  return clean(file.description) || clean(file.title) || fallback;
}

function tenantIdFilter() {
  return {
    tenant: { _eq: tenantId },
  };
}

function mapTenant(row?: DirectusTenant | null): CmsTenant {
  if (!row) return fallbackGlobalContent.tenant;
  const logo = assetUrl(row.logo);
  const footerLogo = assetUrl(row.footer_logo);
  return {
    id: clean(String(row.id)) || tenantId,
    slug: clean(row.slug) || tenantId,
    name: clean(row.name) || fallbackGlobalContent.tenant.name,
    siteUrl: clean(row.site_url) || fallbackGlobalContent.tenant.siteUrl,
    description: clean(row.description) || fallbackGlobalContent.tenant.description,
    phone: clean(row.phone) || fallbackGlobalContent.tenant.phone,
    email: clean(row.email) || fallbackGlobalContent.tenant.email,
    location: clean(row.location) || fallbackGlobalContent.tenant.location,
    logo: logo ? { src: logo, alt: fileAlt(row.logo, clean(row.name) || fallbackGlobalContent.tenant.name) } : fallbackGlobalContent.tenant.logo,
    footerLogo: footerLogo ? { src: footerLogo, alt: fileAlt(row.footer_logo, clean(row.name) || fallbackGlobalContent.tenant.name) } : fallbackGlobalContent.tenant.footerLogo,
    footerTagline: clean(row.footer_tagline) || fallbackGlobalContent.tenant.footerTagline,
  };
}

function mapRoute(row: DirectusPage, fallback?: CmsPage | null): CmsRoute {
  const path = clean(row.path) || fallback?.path || "/";
  const title = clean(row.seo_title) || clean(row.title) || fallback?.seoTitle || fallback?.title || path;
  const description = clean(row.description) || fallback?.description || "";
  return {
    path,
    title,
    description,
    priority: numberOr(row.priority, fallback?.priority ?? 0.5),
    changeFrequency: row.change_frequency ?? fallback?.changeFrequency ?? "monthly",
    serviceType: clean(row.service_type) || fallback?.serviceType,
    aiSummary: clean(objectFrom<{ answer?: string }>(row.ai_summary)?.answer) || fallback?.aiSummary?.answer,
  };
}

function mapSection(row: DirectusSection): CmsContentBlock {
  const payload = objectFrom<Partial<CmsContentBlock>>(row.payload) ?? {};
  const paragraphs = arrayFrom(row.paragraphs);
  const items = arrayFrom(row.items);
  const cards = objectFrom<CmsContentBlock["cards"]>(row.cards);
  return {
    ...payload,
    key: clean(payload.key) || clean(row.section_type) || undefined,
    eyebrow: clean(row.eyebrow) || payload.eyebrow,
    heading: clean(row.heading) || payload.heading,
    paragraphs: paragraphs.length ? paragraphs : clean(row.body) ? [clean(row.body)] : payload.paragraphs,
    items: items.length ? items : payload.items,
    cards: cards ?? payload.cards,
    variant: row.variant ?? payload.variant ?? "plain",
  };
}

function mapPage(row: DirectusPage, sections: DirectusSection[], fallback?: CmsPage | null): CmsPage {
  const path = clean(row.path) || fallback?.path || "/";
  const directusHeroImage = assetUrl(row.hero_image);
  const heroImage = directusHeroImage || fallback?.heroImage || "/generated/clear-path-hero.jpg";
  const title = clean(row.title) || fallback?.title || path;
  const aiSummary = objectFrom<CmsPage["aiSummary"]>(row.ai_summary) ?? fallback?.aiSummary;
  const cta = objectFrom<CmsPage["cta"]>(row.cta) ?? fallback?.cta;

  return {
    path,
    pageType: row.page_type ?? fallback?.pageType ?? "subpage",
    status: row.status === "draft" || row.status === "archived" ? row.status : "published",
    eyebrow: clean(row.eyebrow) || fallback?.eyebrow || "",
    title,
    subtitle: clean(row.subtitle) || fallback?.subtitle || "",
    description: clean(row.description) || fallback?.description || "",
    heroImage,
    heroAlt: directusHeroImage ? clean(row.hero_alt) || fileAlt(row.hero_image, fallback?.heroAlt || title) : fallback?.heroAlt || clean(row.hero_alt) || title,
    intro: arrayFrom(row.intro).length ? arrayFrom(row.intro) : fallback?.intro ?? [],
    aiSummary,
    blocks: sections.length ? sections.sort((a, b) => numberOr(a.sort, 0) - numberOr(b.sort, 0)).map(mapSection) : fallback?.blocks ?? [],
    cta,
    showHeroActions: row.show_hero_actions ?? fallback?.showHeroActions ?? true,
    canonicalPath: clean(row.canonical_path) || fallback?.canonicalPath || path,
    seoTitle: clean(row.seo_title) || fallback?.seoTitle || title,
    priority: numberOr(row.priority, fallback?.priority ?? 0.5),
    changeFrequency: row.change_frequency ?? fallback?.changeFrequency ?? "monthly",
    serviceType: clean(row.service_type) || fallback?.serviceType,
  };
}

function mapNavigation(row: DirectusNavigationItem): CmsNavigationItem | null {
  const menu = row.menu;
  const href = clean(row.href);
  const label = clean(row.label);
  if (!menu || !href || !label) return null;
  return {
    menu,
    href,
    label,
    body: clean(row.body) || undefined,
    sort: numberOr(row.sort, 0),
  };
}

function mapBlogPost(row: DirectusBlogPost): CmsBlogPost | null {
  const slug = clean(row.slug);
  const title = clean(row.title);
  if (!slug || !title) return null;
  return {
    id: String(row.id),
    slug,
    title,
    excerpt: clean(row.excerpt),
    body: clean(row.body),
    author: clean(row.author) || "Pathway Estate Planning",
    tags: arrayFrom(row.tags),
    publishedAt: clean(row.published_at),
    source: clean(row.source),
  };
}

async function readDirectusTenant() {
  const rows = await directus().request(
    readItems("tenants", {
      filter: {
        _or: [{ id: { _eq: tenantId } }, { slug: { _eq: tenantId } }],
        status: {
          _neq: "archived",
        },
      },
      limit: 1,
      fields: ["*"],
    }),
  );
  return rows[0] ?? null;
}

export const getCmsGlobalContent = cache(async (): Promise<CmsGlobalContent> => {
  if (!hasDirectusConfig()) return fallbackGlobalContent;
  try {
    const [tenant, navigation] = await Promise.all([
      readDirectusTenant(),
      directus().request(
        readItems("navigation_items", {
          filter: tenantIdFilter(),
          sort: ["sort"],
          fields: ["*"],
          limit: -1,
        }),
      ),
    ]);
    const mappedNavigation = navigation.map(mapNavigation).filter((item): item is CmsNavigationItem => Boolean(item));
    return {
      tenant: mapTenant(tenant),
      navigation: mappedNavigation.length ? mappedNavigation : fallbackGlobalContent.navigation,
    };
  } catch {
    return fallbackGlobalContent;
  }
});

export const getCmsRoutes = cache(async (): Promise<CmsRoute[]> => {
  if (!hasDirectusConfig()) return fallbackCmsRoutes;
  try {
    const pages = await directus().request(
      readItems("site_pages", {
        filter: {
          ...tenantIdFilter(),
          status: {
            _eq: "published",
          },
        },
        sort: ["sort", "path"],
        fields: ["*"],
        limit: -1,
      }),
    );
    const routes = pages.map((page) => mapRoute(page, fallbackPageFromRoute(clean(page.path))));
    return routes.length ? routes : fallbackCmsRoutes;
  } catch {
    return fallbackCmsRoutes;
  }
});

export const getCmsPage = cache(async (path: string, fallbackOverride?: CmsPage | null): Promise<CmsPage | null> => {
  const fallback = fallbackOverride ?? fallbackPageFromRoute(path);
  if (!hasDirectusConfig()) return fallback;
  try {
    const pages = await directus().request(
      readItems("site_pages", {
        filter: {
          ...tenantIdFilter(),
          path: {
            _eq: path,
          },
          status: {
            _eq: "published",
          },
        },
        fields: ["*"],
        limit: 1,
      }),
    );
    const page = pages[0];
    if (!page) return fallback;
    const sections = await directus().request(
      readItems("page_sections", {
        filter: {
          ...tenantIdFilter(),
          page: {
            _eq: page.id,
          },
        },
        sort: ["sort"],
        fields: ["*"],
        limit: -1,
      }),
    );
    return mapPage(page, sections, fallback);
  } catch {
    return fallback;
  }
});

export const getCmsBlogPosts = cache(async (): Promise<CmsBlogPost[]> => {
  if (!hasDirectusConfig()) return [];
  try {
    const posts = await directus().request(
      readItems("blog_posts", {
        filter: {
          ...tenantIdFilter(),
          status: {
            _eq: "published",
          },
        },
        sort: ["-published_at"],
        fields: ["*"],
        limit: -1,
      }),
    );
    return posts.map(mapBlogPost).filter((post): post is CmsBlogPost => Boolean(post));
  } catch {
    return [];
  }
});

export const getCmsBlogPost = cache(async (slug: string): Promise<CmsBlogPost | null> => {
  if (!hasDirectusConfig()) return null;
  try {
    const posts = await directus().request(
      readItems("blog_posts", {
        filter: {
          ...tenantIdFilter(),
          slug: {
            _eq: slug,
          },
          status: {
            _eq: "published",
          },
        },
        fields: ["*"],
        limit: 1,
      }),
    );
    return mapBlogPost(posts[0]);
  } catch {
    return null;
  }
});

export function cmsCacheSeconds() {
  return Number.isFinite(cacheSeconds) && cacheSeconds > 0 ? cacheSeconds : 300;
}
