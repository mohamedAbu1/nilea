import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egypt destinations, from Cairo to the Nile",
  description: "Explore seven unforgettable Egyptian destinations, from Cairo and the Nile to the Mediterranean and Red Sea.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
