import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Egypt tours and local experiences",
  description: "Build a richer Egypt journey with local tours and memorable experiences.",
  alternates: { canonical: "/tours-experiences" },
};

export default function ToursExperiencesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
