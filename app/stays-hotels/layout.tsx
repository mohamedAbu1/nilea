import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile Stays — Homes, Rooms & Villas",
  description: "Explore private homes, hotel rooms, apartments and villas across Egypt with AlpNile.",
};

export default function StaysHotelsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
