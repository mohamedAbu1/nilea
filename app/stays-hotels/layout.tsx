import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egypt stays, villas, apartments and hotel rooms",
  description: "Explore private homes, hotel rooms, apartments and villas across Egypt with AlpNile.",
  alternates: { canonical: "/stays-hotels" },
};

export default function StaysHotelsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
