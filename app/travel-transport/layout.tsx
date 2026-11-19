import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile Fleet — Private Cars & Drivers",
  description: "Choose a private car, van, 4×4 or accessible vehicle for your Egypt route with AlpNile.",
};

export default function TravelTransportLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
