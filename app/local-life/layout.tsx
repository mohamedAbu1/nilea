import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egyptian local life and objects to carry home",
  description: "Discover handmade Egyptian objects, textiles, scents and keepsakes from the AlpNile bazaar.",
  alternates: { canonical: "/local-life" },
};

export default function LocalLifeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
