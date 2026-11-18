import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile Bazaar — Objects carried home",
  description: "Discover handmade Egyptian objects, textiles, scents and keepsakes from the AlpNile bazaar.",
};

export default function MarketLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
