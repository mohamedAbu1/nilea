import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile — About",
  description: "The thinking, care and curiosity behind AlpNile's Egypt journeys.",
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
