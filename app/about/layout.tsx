import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About AlpNile and thoughtful Egypt travel",
  description: "The thinking, care and curiosity behind AlpNile's Egypt journeys.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
