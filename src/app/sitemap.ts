import type { MetadataRoute } from "next";
import { getCmsGlobalContent, getCmsRoutes } from "./cms/directus";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ tenant }, routes] = await Promise.all([getCmsGlobalContent(), getCmsRoutes()]);
  const now = new Date();
  return routes.map((route) => ({
    url: new URL(route.path, tenant.siteUrl).toString(),
    lastModified: now,
    changeFrequency: route.changeFrequency ?? "monthly",
    priority: route.priority,
  }));
}
