import type { Metadata } from "next";
import { getCmsGlobalContent, getCmsPage } from "./directus";
import { metadataForRoute } from "../seo";

export async function metadataForCmsRoute(path: string): Promise<Metadata> {
  const fallback = metadataForRoute(path);
  const [page, { tenant }] = await Promise.all([getCmsPage(path), getCmsGlobalContent()]);
  if (!page) return fallback;

  const fallbackTitle = typeof fallback.title === "string" ? fallback.title : tenant.name;
  const fallbackDescription = typeof fallback.description === "string" ? fallback.description : tenant.description;
  const title = page.seoTitle || page.title || fallbackTitle;
  const description = page.description || fallbackDescription;
  return {
    ...fallback,
    metadataBase: new URL(tenant.siteUrl),
    title,
    description,
    alternates: {
      canonical: page.canonicalPath || path,
    },
    openGraph: {
      ...fallback.openGraph,
      siteName: tenant.name,
      url: new URL(page.canonicalPath || path, tenant.siteUrl).toString(),
      title,
      description,
      images: [
        {
          url: page.heroImage,
          width: 1200,
          height: 630,
          alt: page.heroAlt,
        },
      ],
    },
    twitter: {
      ...fallback.twitter,
      title,
      description,
      images: [page.heroImage],
    },
  };
}
