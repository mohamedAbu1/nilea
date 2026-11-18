import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTourDetail, getTourSlugs } from "../../lib/tour-details";
import TourDetailClient from "./tour-detail-client";

export async function generateStaticParams() {
  return getTourSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTourDetail(slug);
  return {
    title: tour ? `${tour.name} — AlpNile` : "Journey details — AlpNile",
    description: tour?.description ?? "Explore a considered Egypt journey with AlpNile.",
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = getTourDetail(slug);
  if (!tour) notFound();
  return <TourDetailClient tour={tour} />;
}
