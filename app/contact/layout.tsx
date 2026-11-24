import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact AlpNile travel support",
  description: "Talk with the AlpNile team about your next Egypt journey.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
