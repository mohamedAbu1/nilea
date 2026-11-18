import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBazaarProduct, getBazaarSlugs, getProductGallery } from "../catalog";
import ProductDetailClient from "./product-detail-client";

export async function generateStaticParams() {
  return getBazaarSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getBazaarProduct(slug);
  return {
    title: product ? `${product.name} — AlpNile Bazaar` : "Product details — AlpNile Bazaar",
    description: product?.description ?? "Explore a handmade object from the AlpNile bazaar.",
  };
}

export default async function BazaarProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getBazaarProduct(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} gallery={getProductGallery(product.slug)} />;
}
