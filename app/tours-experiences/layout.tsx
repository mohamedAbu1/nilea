import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile — Tours & Experiences",
  description: "Build a richer Egypt journey with local tours and memorable experiences.",
};

export default function ToursExperiencesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
