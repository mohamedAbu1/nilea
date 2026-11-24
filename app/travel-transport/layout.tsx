import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private cars and drivers in Egypt",
  description: "Choose a private car, van, 4×4 or accessible vehicle for your Egypt route with AlpNile.",
  alternates: { canonical: "/travel-transport" },
};

export default function TravelTransportLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
