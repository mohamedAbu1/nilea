import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile Market — Objects carried home",
  description: "Discover handmade Egyptian objects, textiles, scents and keepsakes from the AlpNile bazaar.",
};

export default function LocalLifeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
