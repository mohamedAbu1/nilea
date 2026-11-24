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
    title: tour?.name ?? "Journey details",
    description: tour?.description ?? "Explore a considered Egypt journey with AlpNile.",
    alternates: { canonical: `/tours-experiences/${encodeURIComponent(slug)}` },
    openGraph: tour ? { type: "article", title: tour.name, description: tour.description, url: `/tours-experiences/${encodeURIComponent(slug)}`, images: [{ url: tour.image, alt: tour.name }] } : undefined,
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = getTourDetail(slug);
  if (!tour) notFound();
  return <TourDetailClient tour={tour} />;
}
