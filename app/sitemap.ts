import type { MetadataRoute } from "next";
import { getBazaarProduct, getBazaarSlugs } from "./market/catalog";
import { getTourDetail, getTourSlugs } from "./lib/tour-details";
import { getVehicle, vehicles } from "./travel-transport/vehicle-data";
import { absoluteUrl } from "./lib/seo";

const publicPages: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1, images: [absoluteUrl("/alpnile-social-cover.webp")] },
  { url: absoluteUrl("/destinations"), changeFrequency: "weekly", priority: 0.9 },
  { url: absoluteUrl("/tours-experiences"), changeFrequency: "weekly", priority: 0.9 },
  { url: absoluteUrl("/stays-hotels"), changeFrequency: "weekly", priority: 0.9 },
  { url: absoluteUrl("/travel-transport"), changeFrequency: "monthly", priority: 0.8 },
  { url: absoluteUrl("/market"), changeFrequency: "weekly", priority: 0.8 },
  { url: absoluteUrl("/trip-planner"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
  { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
  { url: absoluteUrl("/local-life"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/site-policy"), changeFrequency: "yearly", priority: 0.2 },
  { url: absoluteUrl("/financial-policy"), changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const tourPages = getTourSlugs().flatMap((slug) => {
    const tour = getTourDetail(slug);
    if (!tour) return [];
    return [{
      url: absoluteUrl(`/tours-experiences/${encodeURIComponent(slug)}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [absoluteUrl(tour.image)],
    }];
  });

  const productPages = getBazaarSlugs().flatMap((slug) => {
    const product = getBazaarProduct(slug);
    if (!product) return [];
    return [{
      url: absoluteUrl(`/market/${encodeURIComponent(slug)}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [absoluteUrl(product.image)],
    }];
  });

  const vehiclePages = vehicles.flatMap((vehicle) => {
    const currentVehicle = getVehicle(vehicle.id);
    if (!currentVehicle) return [];
    return [{
      url: absoluteUrl(`/travel-transport/${encodeURIComponent(vehicle.id)}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: currentVehicle.images.map((image) => absoluteUrl(image.src)),
    }];
  });

  return [...publicPages, ...tourPages, ...productPages, ...vehiclePages];
}
