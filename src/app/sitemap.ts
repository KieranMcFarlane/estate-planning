import type { MetadataRoute } from "next";
import { absoluteUrl, siteRoutes } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return siteRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency ?? "monthly",
    priority: route.priority,
  }));
}
