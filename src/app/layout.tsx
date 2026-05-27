import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, Source_Serif_4 } from "next/font/google";
import EstateAssistant from "./components/EstateAssistant";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import SemanticNavigationSpotlight from "./components/SemanticNavigationSpotlight";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-4",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pathway Estate Planning | Wills, Trusts & LPAs",
  description: "Approachable estate planning in Leamington Spa and Warwickshire: wills, trusts, LPAs, care planning and inheritance tax planning.",
  keywords: [
    "estate planning Leamington Spa",
    "wills Leamington Spa",
    "trusts Warwickshire",
    "lasting power of attorney Warwickshire",
    "inheritance tax planning",
    "mitigating tax",
    "care planning Warwickshire",
    "Pathway Estate Planning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${instrumentSerif.variable} ${sourceSerif.variable}`}>
      <body>
        <Navbar />
        {children}
        <Footer />
        <SemanticNavigationSpotlight />
        <EstateAssistant />
      </body>
    </html>
  );
}
