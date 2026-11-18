export type CatalogTripFix = {
  title?: string;
  city?: string;
  categories?: readonly string[];
  duration?: number;
  durationUnit?: string;
};

/**
 * Small, explicit corrections for source rows that contain a known display
 * issue. The imported SQL stays intact; the public catalog receives a clean
 * presentation layer instead.
 */
export const catalogTripFixes: Record<string, CatalogTripFix> = {
  "6-days-to-el-fayoum-oasis-white-desert-and-bahariya-oasis": {
    city: "Cairo · Luxor · Fayoum · Bahariya",
  },
  "4-days-3-nights-nile-cruise-from-aswan-to-luxor": {
    duration: 4,
  },
  "discover-the-grand-museum-and-giza-pyramids-by-plane-from-sharm-el-sheikh": {
    categories: ["Historical", "Luxury Tours", "Family Friendly", "One Day Trips"],
  },
  "luxor-deluxe-guided-tour-from-hurghada": {
    title: "Luxor Deluxe Guided Tour from Hurghada",
  },
  "tour-of-the-banana-island-with-a-felucca-experience-from-luxor": {
    title: "Tour of Banana Island with a Felucca Experience from Luxor",
  },
};

export function normalizeCatalogCity(name: string) {
  return name.trim().toLowerCase() === "hurgada" ? "Hurghada" : name;
}

export function cleanCatalogText(text: string) {
  return text
    .replace(/\bruise\b/gi, "cruise")
    .replace(/Karnal Temple/g, "Karnak Temple")
    .replace(/Kabash path/g, "Kebash path")
    .replace(/heat to the Nile dock/g, "head to the Nile dock")
    .replace(/Up a complimentary pick up/g, "After a complimentary pickup")
    .replace(/Unforgeable unique experience!/g, "Unforgettable experience!")
    .replace(/civilization1\./g, "civilization.");
}
