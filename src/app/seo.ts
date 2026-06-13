import type { Metadata, MetadataRoute } from "next";

export const SITE_URL = "https://estate.nakanodigital.com";
export const SITE_NAME = "Pathway Estate Planning";
export const SITE_DESCRIPTION =
  "Approachable estate planning in Royal Leamington Spa and Warwickshire: wills, trusts, LPAs, care planning and inheritance tax planning.";
export const PHONE = "07902 863999";
export const EMAIL = "info@pathwayestateplanning.co.uk";
export const LOCATION = "Royal Leamington Spa, Warwickshire";
export const OFFICE_ADDRESS = {
  streetAddress: "83 Warwick Street",
  addressLocality: "Royal Leamington Spa",
  addressRegion: "Warwickshire",
  postalCode: "CV32 4RR",
  addressCountry: "GB",
};

export type SiteRoute = {
  path: string;
  title: string;
  description: string;
  priority: number;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  serviceType?: string;
  aiSummary?: string;
};

export const siteRoutes: SiteRoute[] = [
  {
    path: "/",
    title: "Pathway Estate Planning | Wills, Trusts & LPAs",
    description: SITE_DESCRIPTION,
    priority: 1,
    changeFrequency: "weekly",
  },
  {
    path: "/wills",
    title: "Wills in Royal Leamington Spa | Pathway Estate Planning",
    description: "Plain-English Will writing support for families, homeowners, parents, unmarried partners and blended families.",
    priority: 0.95,
    changeFrequency: "monthly",
    serviceType: "Will writing",
    aiSummary: "Pathway Estate Planning helps people prepare clear Wills so wishes, executors, guardians and beneficiaries are recorded properly.",
  },
  {
    path: "/trusts",
    title: "Trust Planning | Pathway Estate Planning",
    description: "Trust planning explained clearly for inheritance protection, vulnerable beneficiaries, blended families and future generations.",
    priority: 0.94,
    changeFrequency: "monthly",
    serviceType: "Trust planning",
    aiSummary: "Pathway Estate Planning explains whether a Trust may help add structure and protection for family assets or complex inheritance wishes.",
  },
  {
    path: "/lpa",
    title: "Lasting Powers of Attorney | Pathway Estate Planning",
    description: "Support with Property and Financial Affairs LPAs and Health and Welfare LPAs in Royal Leamington Spa and Warwickshire.",
    priority: 0.93,
    changeFrequency: "monthly",
    serviceType: "Lasting Powers of Attorney",
    aiSummary: "Pathway Estate Planning helps people put LPAs in place so trusted attorneys can support decisions if capacity is lost.",
  },
  {
    path: "/inheritance-tax-planning",
    title: "Inheritance Tax Planning | Pathway Estate Planning",
    description: "General inheritance tax planning guidance and estate planning support for families in Warwickshire.",
    priority: 0.9,
    changeFrequency: "monthly",
    serviceType: "Inheritance tax planning",
    aiSummary: "Pathway Estate Planning helps families understand inheritance tax exposure and appropriate planning options as part of a wider estate plan.",
  },
  {
    path: "/care-planning",
    title: "Care Planning | Pathway Estate Planning",
    description: "Later-life care planning guidance for family decisions, LPAs, care preferences and practical estate planning.",
    priority: 0.86,
    changeFrequency: "monthly",
    serviceType: "Care planning",
    aiSummary: "Pathway Estate Planning helps families discuss care planning calmly, including LPAs, care preferences, family roles and funding considerations.",
  },
  {
    path: "/business-protection",
    title: "Business Protection Estate Planning | Pathway Estate Planning",
    description: "Estate planning for business owners who want to protect continuity, ownership and family interests.",
    priority: 0.82,
    changeFrequency: "monthly",
    serviceType: "Business protection",
    aiSummary: "Pathway Estate Planning helps business owners align estate planning, business continuity and family protection.",
  },
  {
    path: "/agricultural-land",
    title: "Agricultural Land Estate Planning | Pathway Estate Planning",
    description: "Specialist estate planning support for farms, agricultural land, rural assets and generational planning.",
    priority: 0.8,
    changeFrequency: "monthly",
    serviceType: "Agricultural estate planning",
    aiSummary: "Pathway supports planning for agricultural land, farms, rural estates and generational family wishes.",
  },
  { path: "/asset-protection", title: "Asset Protection | Pathway Estate Planning", description: "Estate planning support for protecting family assets and property.", priority: 0.78, changeFrequency: "monthly" },
  { path: "/estate-planning", title: "Estate Planning Services | Pathway Estate Planning", description: "A full overview of Pathway's estate planning services.", priority: 0.78, changeFrequency: "monthly" },
  { path: "/extended-services", title: "Extended Services | Pathway Estate Planning", description: "Probate, financial advice, conveyancing and related estate planning support.", priority: 0.72, changeFrequency: "monthly" },
  { path: "/helpful-info", title: "Helpful Estate Planning Information | Pathway", description: "A practical estate planning checklist and guidance before you start.", priority: 0.68, changeFrequency: "monthly" },
  { path: "/glossary", title: "Estate Planning Glossary | Pathway", description: "Plain-English definitions for common estate planning words.", priority: 0.68, changeFrequency: "monthly" },
  { path: "/faq", title: "Estate Planning FAQs | Pathway", description: "Answers to common questions about Wills, Trusts, LPAs, Probate and tax planning.", priority: 0.7, changeFrequency: "monthly" },
  { path: "/how-it-works", title: "How Estate Planning Works | Pathway", description: "A clear, calm process for putting estate planning documents in place.", priority: 0.72, changeFrequency: "monthly" },
  { path: "/about", title: "About Pathway Estate Planning", description: "Local, plain-English estate planning support for families across Royal Leamington Spa and Warwickshire.", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", title: "Contact Pathway Estate Planning", description: "Contact Pathway Estate Planning for a calm initial conversation.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/privacy", title: "Privacy Policy | Pathway Estate Planning", description: "How Pathway Estate Planning handles privacy.", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", title: "Terms of Service | Pathway Estate Planning", description: "Pathway Estate Planning terms of service.", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", title: "Cookies | Pathway Estate Planning", description: "Cookie information for Pathway Estate Planning.", priority: 0.3, changeFrequency: "yearly" },
  { path: "/complaints", title: "Complaints | Pathway Estate Planning", description: "How to raise a concern with Pathway Estate Planning.", priority: 0.3, changeFrequency: "yearly" },
];

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function routeByPath(path: string) {
  return siteRoutes.find((route) => route.path === path);
}

export function metadataForRoute(path: string): Metadata {
  const route = routeByPath(path);
  const title = route?.title ?? SITE_NAME;
  const description = route?.description ?? SITE_DESCRIPTION;
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: absoluteUrl(path),
      title,
      description,
      images: [
        {
          url: "/generated/clear-path-hero.jpg",
          width: 1200,
          height: 630,
          alt: "Warm garden path leading to a welcoming front door",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/generated/clear-path-hero.jpg"],
    },
  };
}

export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LegalService", "LocalBusiness"],
    "@id": `${SITE_URL}/#pathway-estate-planning`,
    name: SITE_NAME,
    url: SITE_URL,
    telephone: PHONE,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      ...OFFICE_ADDRESS,
    },
    areaServed: [
      { "@type": "City", name: "Royal Leamington Spa" },
      { "@type": "AdministrativeArea", name: "Warwickshire" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    description: SITE_DESCRIPTION,
    knowsAbout: ["Wills", "Trusts", "Lasting Powers of Attorney", "Inheritance Tax Planning", "Care Planning", "Estate Planning"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#pathway-estate-planning` },
    inLanguage: "en-GB",
  };
}

export function serviceJsonLd(route: SiteRoute) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(route.path)}#service`,
    name: route.serviceType ?? route.title,
    serviceType: route.serviceType ?? route.title,
    provider: { "@id": `${SITE_URL}/#pathway-estate-planning` },
    areaServed: LOCATION,
    url: absoluteUrl(route.path),
    description: route.aiSummary ?? route.description,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
