import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan a personalized Egypt trip",
  description: "Shape a personalized Egypt itinerary around your time, pace and curiosity.",
  alternates: { canonical: "/trip-planner" },
};

export default function TripPlannerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
