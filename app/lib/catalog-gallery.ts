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
  const gallery = (value as Record<string, unknown>).galleryImages;
  if (!Array.isArray(gallery)) return [];
  return gallery
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function catalogGalleryLabel(index: number, fallback = "Internal image") {
  return catalogGalleryLabels[index] ?? `${fallback} ${String(index + 1).padStart(2, "0")}`;
}
