import type { MetadataRoute } from "next";

export type CmsImage = {
  src: string;
  alt: string;
};

export type CmsAiSummary = {
  answer: string;
  questions: string[];
  handoffPrompt?: string;
};

export type CmsContentCard = {
  title: string;
  body: string;
  items?: string[];
};

export type CmsContentBlock = {
  key?: string;
  heading?: string;
  eyebrow?: string;
  paragraphs?: string[];
  items?: string[];
  cards?: CmsContentCard[];
  columns?: 2 | 3 | 4;
  variant?: "plain" | "cream" | "grid";
};

export type CmsCta = {
  eyebrow?: string;
  title: string;
  body: string;
  linkText?: string;
};

export type CmsPage = {
  path: string;
  pageType: "subpage" | "home" | "contact" | "custom";
  status: "published" | "draft" | "archived";
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  intro: string[];
  aiSummary?: CmsAiSummary;
  blocks: CmsContentBlock[];
  cta?: CmsCta;
  showHeroActions?: boolean;
  canonicalPath: string;
  seoTitle: string;
  priority: number;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  serviceType?: string;
};

export type CmsRoute = {
  path: string;
  title: string;
  description: string;
  priority: number;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  serviceType?: string;
  aiSummary?: string;
};

export type CmsTenant = {
  id: string;
  slug: string;
  name: string;
  siteUrl: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  logo?: CmsImage;
  footerLogo?: CmsImage;
  footerTagline: string;
};

export type CmsNavigationItem = {
  menu: "primary" | "services" | "resources" | "footer_estate" | "footer_specialist" | "footer_information" | "footer_company" | "legal";
  href: string;
  label: string;
  body?: string;
  sort: number;
};

export type CmsGlobalContent = {
  tenant: CmsTenant;
  navigation: CmsNavigationItem[];
};
