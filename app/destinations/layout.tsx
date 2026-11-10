import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile — Destinations",
  description: "Explore seven unforgettable Egyptian destinations, from Cairo and the Nile to the Mediterranean and Red Sea.",
};

export default function DestinationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
