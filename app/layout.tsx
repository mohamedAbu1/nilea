import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/language";
import { CurrencyProvider } from "./components/currency";
import { HomeWelcomeGate } from "./components/home-welcome-gate";
import { BackToTop, SiteFooter, SiteHeader } from "./components/site-chrome";
import DeferredChatWidget from "./components/deferred-chat-widget";
import { SITE_CONTACT } from "./lib/site-config";
import { absoluteUrl, serializeJsonLd, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_SOCIAL_IMAGE, SITE_SOCIAL_LINKS, SITE_URL } from "./lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AlpNile | Thoughtful Egypt travel, stays and experiences",
    template: "%s | AlpNile",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: "AlpNile" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "AlpNile | Thoughtful Egypt travel, stays and experiences",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_EG",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: SITE_SOCIAL_IMAGE, width: 1200, height: 630, alt: "AlpNile — a considered way to discover Egypt" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlpNile | Thoughtful Egypt travel, stays and experiences",
    description: SITE_DESCRIPTION,
    images: [SITE_SOCIAL_IMAGE],
  },
  icons: { icon: "/alpnile-logo-optimized.webp" },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071923",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/alpnile-logo.webp"),
        image: absoluteUrl(SITE_SOCIAL_IMAGE),
        description: SITE_DESCRIPTION,
        email: `mailto:${SITE_CONTACT.email}`,
        telephone: SITE_CONTACT.phoneTel,
        areaServed: { "@type": "Country", name: "Egypt" },
        sameAs: SITE_SOCIAL_LINKS,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
        <LanguageProvider>
          <CurrencyProvider>
            <HomeWelcomeGate />
            <SiteHeader />
            {children}
            <SiteFooter />
            <BackToTop />
            <DeferredChatWidget />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
