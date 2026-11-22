export const catalogGalleryLabels = [
  "Route overview",
  "Signature place",
  "Local moment",
  "Experience in motion",
  "Along the way",
  "Golden hour",
] as const;

export function parseCatalogMetadata(metadata: unknown): Record<string, unknown> {
  let value = metadata;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function readCatalogGallery(metadata: unknown): string[] {
  const value = parseCatalogMetadata(metadata);
  const override = readCatalogGalleryOverride(value);
  if (override) return override;

  const legacyGallery = value.gallery;
  if (Array.isArray(legacyGallery)) {
    const sources = legacyGallery.map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const record = item as Record<string, unknown>;
      return typeof record.source === "string" ? record.source : typeof record.src === "string" ? record.src : typeof record.url === "string" ? record.url : "";
    });
    const normalized = normalizeGallerySources(sources);
    if (normalized.length) return normalized;
  }

  const legacyImages = value.images;
  if (Array.isArray(legacyImages)) {
    return normalizeGallerySources(legacyImages.map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const record = item as Record<string, unknown>;
      return typeof record.src === "string" ? record.src : typeof record.source === "string" ? record.source : typeof record.url === "string" ? record.url : "";
    }));
  }

  return [];
}

export function readCatalogGalleryOverride(metadata: unknown): string[] | null {
  const value = parseCatalogMetadata(metadata);
  const gallery = value.galleryImages;
  if (!Array.isArray(gallery)) return null;
  return normalizeGallerySources(gallery.filter((item): item is string => typeof item === "string"));
}

export function readCatalogGalleryState(metadata: unknown) {
  const override = readCatalogGalleryOverride(metadata);
  if (override) return { configured: true, images: override };
  const images = readCatalogGallery(metadata);
  return { configured: images.length > 0, images };
}

export function getStayGalleryDefaults(slug: string): string[] {
  if (slug === "habu-sunset-villa") {
    return Array.from({ length: 25 }, (_, index) => `/images/habu-sunset-villa/responsive/villa-${String(index + 1).padStart(2, "0")}-desktop.webp`);
  }
  const defaults: Record<string, string[]> = {
    "nile-view-apartment": ["/alpnile-hotel-nile-palace.webp", "/alpnile-hotel-luxor-riverside.webp", "/alpnile-hotel-winter-palace.webp"],
    "winter-palace-room": ["/alpnile-hotel-winter-palace.webp", "/alpnile-hotel-nile-palace.webp", "/alpnile-hotel-al-moudira.webp"],
    "aswan-courtyard-home": ["/alpnile-villas-v2.webp", "/alpnile-destination-luxor.webp", "/alpnile-home-hero-3d-v1.webp"],
    "red-sea-garden-villa": ["/alpnile-stays-hotels-hero.webp", "/alpnile-hero-beach-3d-v2.webp", "/alpnile-hero-nile-sunset-3d-v2.webp"],
    "riverside-suite": ["/alpnile-hotel-luxor-riverside.webp", "/alpnile-tour-nile-sunset.webp", "/alpnile-hotel-al-moudira.webp"],
  };
  return defaults[slug] ?? [];
}

function normalizeGallerySources(sources: unknown[]): string[] {
  return sources
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function catalogGalleryLabel(index: number, fallback = "Internal image") {
  return catalogGalleryLabels[index] ?? `${fallback} ${String(index + 1).padStart(2, "0")}`;
}
