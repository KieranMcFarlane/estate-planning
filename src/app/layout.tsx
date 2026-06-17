import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import JsonLd from "./components/JsonLd";
import EstateAssistant from "./components/EstateAssistant";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import SemanticNavigationSpotlight from "./components/SemanticNavigationSpotlight";
import { getCmsGlobalContent } from "./cms/directus";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, businessJsonLd, websiteJsonLd } from "./seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-4",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pathway Estate Planning | Wills, Trusts & LPAs",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "estate planning Royal Leamington Spa",
    "wills Royal Leamington Spa",
    "trusts Warwickshire",
    "lasting power of attorney Warwickshire",
    "inheritance tax planning",
    "mitigating tax",
    "care planning Warwickshire",
    "Pathway Estate Planning",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Pathway Estate Planning | Wills, Trusts & LPAs",
    description: SITE_DESCRIPTION,
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
    title: "Pathway Estate Planning | Wills, Trusts & LPAs",
    description: SITE_DESCRIPTION,
    images: ["/generated/clear-path-hero.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cms = await getCmsGlobalContent();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        <Navbar cms={cms} />
        {children}
        <Footer cms={cms} />
        <SemanticNavigationSpotlight />
        <EstateAssistant />
        <JsonLd data={[businessJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
