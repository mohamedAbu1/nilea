import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/language";
import { HomeWelcomeGate } from "./components/home-welcome-gate";
import { BackToTop, SiteFooter, SiteHeader } from "./components/site-chrome";

export const metadata: Metadata = {
  title: "AlpNile — A Thousand Stories",
  description: "A cinematic journey through Egypt's extraordinary story.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: "AlpNile",
  keywords: ["Egypt travel", "Nile experiences", "Egypt villas", "tourist cars", "AlpNile"],
  openGraph: {
    title: "AlpNile — A Thousand Stories",
    description: "Curated journeys, stays, experiences and private routes through Egypt.",
    type: "website",
    locale: "en_US",
    siteName: "AlpNile",
    images: [{ url: "/alpnile-social-cover.webp", width: 1200, height: 630, alt: "AlpNile — a considered way to discover Egypt" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlpNile — A Thousand Stories",
    description: "Curated journeys, stays, experiences and private routes through Egypt.",
    images: ["/alpnile-social-cover.webp"],
  },
  icons: { icon: "/alpnile-logo.webp" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <HomeWelcomeGate />
          <SiteHeader />
          {children}
          <SiteFooter />
          <BackToTop />
        </LanguageProvider>
      </body>
    </html>
  );
}
