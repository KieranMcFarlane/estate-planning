import type { MetadataRoute } from "next";
import { getCmsGlobalContent } from "./cms/directus";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { tenant } = await getCmsGlobalContent();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/operator"],
      },
    ],
    sitemap: `${tenant.siteUrl}/sitemap.xml`,
    host: tenant.siteUrl,
  };
}
