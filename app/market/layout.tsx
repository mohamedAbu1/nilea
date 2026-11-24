import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egyptian crafts, keepsakes and travel gifts",
  description: "Discover handmade Egyptian objects, textiles, scents and keepsakes from the AlpNile bazaar.",
  alternates: { canonical: "/market" },
};

export default function MarketLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
