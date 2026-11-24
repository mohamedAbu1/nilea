import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VehicleDetailClient from "./vehicle-detail-client";
import { getVehicle, vehicles } from "../vehicle-data";

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ id: vehicle.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vehicle = getVehicle(id);
  if (!vehicle) return { title: "Vehicle not found" };
  return {
    title: vehicle.name,
    description: `${vehicle.description} Request this vehicle for your Egypt route with AlpNile.`,
    alternates: { canonical: `/travel-transport/${encodeURIComponent(id)}` },
    openGraph: { type: "website", title: vehicle.name, description: `${vehicle.description} Request this vehicle for your Egypt route with AlpNile.`, url: `/travel-transport/${encodeURIComponent(id)}`, images: vehicle.images[0] ? [{ url: vehicle.images[0].src, alt: vehicle.name }] : undefined },
  };
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = getVehicle(id);
  if (!vehicle) notFound();
  return <VehicleDetailClient vehicle={vehicle} />;
}
