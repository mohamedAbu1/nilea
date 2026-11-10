import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile — Stays & Hotels",
  description: "Find thoughtful stays and historic hotels along the Nile.",
};

export default function StaysHotelsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
