import { siteRoutes as fallbackRoutes, SITE_DESCRIPTION, SITE_NAME, SITE_URL, PHONE, EMAIL, LOCATION } from "../seo";
import type { CmsGlobalContent, CmsNavigationItem, CmsPage, CmsRoute, CmsTenant } from "./types";

const defaultHero = "/generated/clear-path-hero.jpg";
const defaultHeroAlt = "Warm garden path leading to a welcoming front door";
const homeHero = "/generated/service-wills.png";
const homeHeroAlt = "Will writing documents on a desk";

export const fallbackTenant: CmsTenant = {
  id: "estate-planning",
  slug: "estate-planning",
  name: SITE_NAME,
  siteUrl: SITE_URL,
  description: SITE_DESCRIPTION,
  phone: PHONE,
  email: EMAIL,
  location: LOCATION,
  logo: {
    src: "/pathway-logo_1.png",
    alt: "Pathway Estate Planning Specialists",
  },
  footerLogo: {
    src: "/pathway-logo_1.png",
    alt: "Pathway Estate Planning Specialists",
  },
  footerTagline: "Clear, practical estate planning for individuals and families across Warwickshire. Handled with care.",
};

export const fallbackNavigation: CmsNavigationItem[] = [
  { menu: "primary", href: "/", label: "Home", sort: 10 },
  { menu: "primary", href: "/how-it-works", label: "How It Works", sort: 20 },
  { menu: "primary", href: "/about", label: "About", sort: 30 },
  { menu: "primary", href: "/contact", label: "Contact", sort: 40 },
  { menu: "services", href: "/wills", label: "Wills", body: "Clear wishes, properly recorded.", sort: 10 },
  { menu: "services", href: "/trusts", label: "Trusts", body: "Protect assets for the right people.", sort: 20 },
  { menu: "services", href: "/lpa", label: "Lasting Powers of Attorney", body: "Choose who can act for you.", sort: 30 },
  { menu: "services", href: "/inheritance-tax-planning", label: "Inheritance Tax Planning", body: "Support with mitigating tax.", sort: 40 },
  { menu: "services", href: "/care-planning", label: "Care Planning", body: "Plan ahead for later-life decisions.", sort: 50 },
  { menu: "services", href: "/business-protection", label: "Business Protection", body: "Keep your business protected.", sort: 60 },
  { menu: "services", href: "/agricultural-land", label: "Agricultural Land", body: "Planning for farms and land.", sort: 70 },
  { menu: "resources", href: "/estate-planning", label: "All Services", body: "A full overview of estate planning.", sort: 10 },
  { menu: "resources", href: "/extended-services", label: "Extended Services", body: "Probate, advice and related support.", sort: 20 },
  { menu: "resources", href: "/helpful-info", label: "Helpful Information", body: "A practical planning checklist.", sort: 30 },
  { menu: "resources", href: "/downloads/glossary-of-terms.pdf", label: "Glossary of Terms", body: "Downloadable plain-English legal explanations.", sort: 40 },
  { menu: "resources", href: "/faq", label: "FAQ", body: "Answers to common questions.", sort: 50 },
  { menu: "footer_estate", href: "/wills", label: "Wills", sort: 10 },
  { menu: "footer_estate", href: "/trusts", label: "Trusts", sort: 20 },
  { menu: "footer_estate", href: "/lpa", label: "Lasting Powers of Attorney", sort: 30 },
  { menu: "footer_estate", href: "/inheritance-tax-planning", label: "Inheritance Tax Planning", sort: 40 },
  { menu: "footer_specialist", href: "/asset-protection", label: "Asset Protection", sort: 10 },
  { menu: "footer_specialist", href: "/business-protection", label: "Business Protection", sort: 20 },
  { menu: "footer_specialist", href: "/care-planning", label: "Care Planning", sort: 30 },
  { menu: "footer_specialist", href: "/agricultural-land", label: "Agricultural Land", sort: 40 },
  { menu: "footer_information", href: "/estate-planning", label: "All Services", sort: 10 },
  { menu: "footer_information", href: "/extended-services", label: "Extended Services", sort: 20 },
  { menu: "footer_information", href: "/faq", label: "FAQ", sort: 30 },
  { menu: "footer_information", href: "/downloads/glossary-of-terms.pdf", label: "Glossary of Terms", sort: 40 },
  { menu: "footer_information", href: "/helpful-info", label: "Helpful Information", sort: 50 },
  { menu: "footer_company", href: "/about", label: "About Us", sort: 10 },
  { menu: "footer_company", href: "/how-it-works", label: "How It Works", sort: 20 },
  { menu: "footer_company", href: "/contact", label: "Contact", sort: 30 },
  { menu: "legal", href: "/privacy", label: "Privacy Policy", sort: 10 },
  { menu: "legal", href: "/terms", label: "Terms of Service", sort: 20 },
  { menu: "legal", href: "/cookies", label: "Cookies", sort: 30 },
  { menu: "legal", href: "/complaints", label: "Complaints", sort: 40 },
];

export const fallbackGlobalContent: CmsGlobalContent = {
  tenant: fallbackTenant,
  navigation: fallbackNavigation,
};

export const fallbackCmsRoutes: CmsRoute[] = fallbackRoutes;

export function fallbackPageFromRoute(path: string): CmsPage | null {
  const route = fallbackRoutes.find((item) => item.path === path);
  if (!route) return null;

  return {
    path,
    pageType: path === "/" ? "home" : path === "/contact" ? "contact" : "subpage",
    status: "published",
    eyebrow: route.serviceType ? "Estate planning services" : SITE_NAME,
    title: path === "/" ? SITE_NAME : route.title.replace(/\s\|\sPathway.*$/, ""),
    subtitle: route.description,
    description: route.description,
    heroImage: path === "/" ? homeHero : defaultHero,
    heroAlt: path === "/" ? homeHeroAlt : defaultHeroAlt,
    intro: [],
    blocks: [],
    canonicalPath: path,
    seoTitle: route.title,
    priority: route.priority,
    changeFrequency: route.changeFrequency,
    serviceType: route.serviceType,
    aiSummary: route.aiSummary
      ? {
          answer: route.aiSummary,
          questions: [],
        }
      : undefined,
  };
}
