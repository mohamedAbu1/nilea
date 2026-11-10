import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile — Contact",
  description: "Talk with the AlpNile team about your next Egypt journey.",
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
