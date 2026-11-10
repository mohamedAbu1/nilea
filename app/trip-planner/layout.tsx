import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile — Smart Trip Planner",
  description: "Shape a personalized Egypt itinerary around your time, pace and curiosity.",
};

export default function TripPlannerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
