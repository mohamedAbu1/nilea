import { legacyCatalog } from "./legacy-catalog";
import { addedTours } from "./added-tours";
import { catalogTripFixes, cleanCatalogText, normalizeCatalogCity } from "./tour-fixes";

export type TourItineraryDay = {
  dayNumber: number;
  activities: readonly { time: string; title: string }[];
};

export type TourReview = {
  name: string;
  comment: string;
  rating: number;
};

export type TourDetail = {
  id?: string;
  slug: string;
  name: string;
  city: string;
  category: string;
  categories: readonly string[];
  rating: string;
  reviews: string;
  duration: string;
  durationDays: number;
  priceFrom: number;
  soloPrice?: number;
  groupPrice?: number;
  currency: string;
  priceLevel?: string;
  discountPercent?: number;
  image: string;
  description: string;
  includes: readonly string[];
  itinerary: readonly TourItineraryDay[];
  reviewDetails: readonly TourReview[];
  source: "curated" | "catalog";
};

export type TourGalleryImage = {
  src: string;
  label: string;
};

export const catalogTripImages: Record<string, string> = {
  "day-tour-to-edfu-temple-and-kom-ombo-temple-from-aswan": "/trips/day-tour-edfu-kom-ombo.png",
  "discover-the-grand-museum-and-giza-pyramids-by-plane-from-marsa-alam": "/trips/grand-museum-giza-from-marsa-alam.png",
  "day-tour-to-dendera-and-abydos-temples-from-hurghada": "/trips/dendera-abydos-from-hurghada.png",
  "luxor-guided-tour-to-valley-of-the-kings-hatshepsut-temple-habu-temple-colossi-o": "/trips/luxor-west-bank-heritage.png",
  "hurghada-city-tour-with-shopping-stop": "/trips/hurghada-city-local-life.png",
  "tour-of-the-banana-island-with-a-felucca-experience-from-luxor": "/trips/banana-island-felucca-luxor.png",
  "6-days-to-el-fayoum-oasis-white-desert-and-bahariya-oasis": "/trips/fayoum-magic-lake-desert.png",
  "4-day-all-inclusive-lake-nasser-cruise-abu-simbel-to-aswan": "/trips/lake-nasser-abu-simbel-cruise.png",
  "luxor-deluxe-guided-tour-from-hurghada": "/trips/luxor-deluxe-temples.png",
  "from-cairo-desert-safari-camel-ride-magic-lake-lunch": "/trips/from-cairo-desert-safari-camel-ride-magic-lake-lunch.png",
  "explore-the-nubian-village-by-traditional-felucca-plus-authentic-lunch": "/trips/explore-the-nubian-village-by-traditional-felucca-plus-authentic-lunch.png",
  "4-days-3-nights-nile-cruise-from-aswan-to-luxor": "/trips/4-days-3-nights-nile-cruise-from-aswan-to-luxor.png",
  "experience-the-sound-and-light-show-of-philae-temple": "/trips/experience-the-sound-and-light-show-of-philae-temple.png",
  "discover-magawish-island-with-snorkeling-cruise-and-lunch-in-hurghada": "/trips/discover-magawish-island-with-snorkeling-cruise-and-lunch-in-hurghada.png",
  "luxor-day-tour-by-flight-from-sharm-el-sheikh": "/trips/luxor-day-tour-by-flight-from-sharm-el-sheikh.png",
  "super-4x4-safari-with-sand-buggies-camel-ride-in-marsa-alam": "/trips/super-4x4-safari-with-sand-buggies-camel-ride-in-marsa-alam.png",
  "tour-of-karnak-and-luxor-temples-with-the-sphinx-alley-from-luxor": "/trips/tour-of-karnak-and-luxor-temples-with-the-sphinx-alley-from-luxor.png",
  "tour-of-civilization-museum-and-salah-el-din-citadel-with-el-khan-bazaar-from-ca": "/trips/tour-of-civilization-museum-and-salah-el-din-citadel-with-el-khan-bazaar-from-ca.png",
  "hot-air-balloon-experience-from-luxor-hotels-and-nile-cruises": "/trips/hot-air-balloon-experience-from-luxor-hotels-and-nile-cruises.png",
  "tour-of-the-grand-museum-and-giza-pyramids-with-lunch-from-cairo": "/trips/tour-of-the-grand-museum-and-giza-pyramids-with-lunch-from-cairo.png",
  "5-days-4-nights-nile-cruise-from-luxor-to-aswan": "/trips/5-days-4-nights-nile-cruise-from-luxor-to-aswan.png",
  "valley-of-the-kings-and-hatshepsut-temple-with-felucca-experience-from-luxor": "/trips/valley-of-the-kings-and-hatshepsut-temple-with-felucca-experience-from-luxor.png",
  "full-day-tour-of-luxor-highlights-from-luxor-hotels-and-nile-cruises": "/trips/full-day-tour-of-luxor-highlights-from-luxor-hotels-and-nile-cruises.png",
  "discover-luxor-from-marsa-alam": "/trips/discover-luxor-from-marsa-alam.png",
  "one-day-alexandria-trip-from-cairo": "/trips/one-day-alexandria-trip-from-cairo.png",
  "tour-of-the-high-dam-unfinished-obelisk-and-philae-temple-with-felucca-cruise": "/trips/tour-of-the-high-dam-unfinished-obelisk-and-philae-temple-with-felucca-cruise.png",
  "experience-the-sound-and-light-show-of-the-karnak-temple-from-luxor": "/trips/experience-the-sound-and-light-show-of-the-karnak-temple-from-luxor.png",
  "ultimate-desert-experience-quad-biking-camel-ride-bedouin-dinner-and-show": "/trips/ultimate-desert-experience-quad-biking-camel-ride-bedouin-dinner-and-show.png",
  "tour-of-valley-of-the-nobles-medinat-habu-and-the-ramesseum-from-luxor": "/trips/tour-of-valley-of-the-nobles-medinat-habu-and-the-ramesseum-from-luxor.png",
  "discover-the-grand-museum-and-giza-pyramids-by-plane-from-sharm-el-sheikh": "/trips/discover-the-grand-museum-and-giza-pyramids-by-plane-from-sharm-el-sheikh.png",
  "abu-simbel-day-trip-from-aswan-round-trip-by-car": "/trips/abu-simbel-day-trip-from-aswan-round-trip-by-car.png",
};

const curatedTours: TourDetail[] = [
  { slug: "a-night-at-the-temple", name: "A Night at the Temple", city: "Luxor", category: "Heritage", categories: ["Heritage"], rating: "4.9", reviews: "320", duration: "3 hrs", durationDays: 1, priceFrom: 89, currency: "USD", priceLevel: "Signature", image: "/trips/curated-night-at-the-temple.png", description: "Explore ancient wonders after dark with exclusive access and expert guides.", includes: ["Local Egyptologist guide", "Private hotel transfers", "Temple access after sunset"], itinerary: [{ dayNumber: 1, activities: [{ time: "18:00", title: "Hotel pickup and arrival at the temple" }, { time: "19:00", title: "Private after-dark heritage walk" }, { time: "21:00", title: "Return transfer to Luxor" }] }], reviewDetails: [], source: "curated" },
  { slug: "nile-sunset-cruise", name: "Nile Sunset Cruise", city: "Aswan", category: "Nile", categories: ["Nile"], rating: "4.8", reviews: "412", duration: "2.5 hrs", durationDays: 1, priceFrom: 65, currency: "USD", priceLevel: "Signature", image: "/trips/curated-nile-sunset-cruise.png", description: "Sail the timeless Nile at golden hour with live music, light bites and unforgettable views.", includes: ["Traditional felucca cruise", "Light bites and soft drinks", "Local host"], itinerary: [{ dayNumber: 1, activities: [{ time: "16:30", title: "Meet your host beside the Nile" }, { time: "17:00", title: "Set sail for the golden-hour route" }, { time: "19:30", title: "Return to the riverside" }] }], reviewDetails: [], source: "curated" },
  { slug: "marsa-alam-wild-coast", name: "Marsa Alam Wild Coast", city: "Marsa Alam", category: "Desert", categories: ["Desert"], rating: "4.9", reviews: "287", duration: "6 hrs", durationDays: 1, priceFrom: 120, currency: "USD", priceLevel: "Signature", image: "/trips/curated-marsa-alam-wild-coast.png", description: "Pair coral shallows with desert light on a day shaped for sea, nature and stillness.", includes: ["Coastal transfers", "Reef access", "Fresh lunch and water"], itinerary: [{ dayNumber: 1, activities: [{ time: "08:00", title: "Depart for the wild coast" }, { time: "10:00", title: "Reef and shoreline experience" }, { time: "14:00", title: "Return through the Eastern Desert" }] }], reviewDetails: [], source: "curated" },
  { slug: "cairo-food-walk", name: "Cairo Food Walk", city: "Cairo", category: "Food", categories: ["Food"], rating: "4.7", reviews: "365", duration: "4 hrs", durationDays: 1, priceFrom: 75, currency: "USD", priceLevel: "Local favorite", image: "/trips/curated-cairo-food-walk.png", description: "Taste Egypt's vibrant street food with a local guide through historic Cairo.", includes: ["Local food tastings", "Neighborhood guide", "Tea and dessert stop"], itinerary: [{ dayNumber: 1, activities: [{ time: "17:00", title: "Meet in historic Cairo" }, { time: "18:00", title: "Market tastings and family recipes" }, { time: "21:00", title: "Finish with tea and dessert" }] }], reviewDetails: [], source: "curated" },
  { slug: "safaga-reef-morning", name: "Safaga Reef Morning", city: "Safaga", category: "Family", categories: ["Family"], rating: "4.8", reviews: "198", duration: "4 hrs", durationDays: 1, priceFrom: 82, currency: "USD", priceLevel: "Easy pace", image: "/trips/curated-safaga-reef-morning.png", description: "Spend a clear-water morning above reefs, warm shallows and the open Red Sea.", includes: ["Boat transfer", "Snorkeling equipment", "Safety briefing"], itinerary: [{ dayNumber: 1, activities: [{ time: "08:30", title: "Transfer to the marina" }, { time: "09:30", title: "Guided reef time in clear shallows" }, { time: "12:30", title: "Return to Safaga" }] }], reviewDetails: [], source: "curated" },
  { slug: "red-sea-coral-garden", name: "Red Sea Coral Garden", city: "Hurghada", category: "Family", categories: ["Family"], rating: "4.8", reviews: "306", duration: "5 hrs", durationDays: 1, priceFrom: 110, currency: "USD", priceLevel: "Easy pace", image: "/trips/curated-red-sea-coral-garden.png", description: "Spend an unhurried day above clear water, coral gardens and the quiet blue of the Red Sea.", includes: ["Hotel pickup", "Snorkeling equipment", "Lunch on board"], itinerary: [{ dayNumber: 1, activities: [{ time: "08:00", title: "Hotel pickup and marina arrival" }, { time: "10:00", title: "Two guided coral-garden stops" }, { time: "13:00", title: "Lunch on board before returning" }] }], reviewDetails: [], source: "curated" },
  { slug: "marsa-alam-nature-trail", name: "Marsa Alam Nature Trail", city: "Marsa Alam", category: "Family", categories: ["Family"], rating: "4.9", reviews: "274", duration: "6 hrs", durationDays: 1, priceFrom: 128, currency: "USD", priceLevel: "Easy pace", image: "/trips/curated-marsa-alam-nature-trail.png", description: "Follow the coast beyond the resort road through mangroves, reef water and open horizons.", includes: ["Nature guide", "Coastal transfers", "Picnic lunch"], itinerary: [{ dayNumber: 1, activities: [{ time: "08:00", title: "Meet your nature guide" }, { time: "10:00", title: "Mangrove and shoreline walk" }, { time: "14:00", title: "Return to Marsa Alam" }] }], reviewDetails: [], source: "curated" },
];

const galleryLabels = ["Route overview", "Signature place", "Local moment", "Experience in motion", "Along the way", "Golden hour"] as const;
const curatedGalleryFallbacks: Record<string, string[]> = {
  "a-night-at-the-temple": ["/trips/curated-night-at-the-temple.png", "/trips/luxor-west-bank-heritage.png", "/trips/tour-of-karnak-and-luxor-temples-with-the-sphinx-alley-from-luxor.png", "/trips/experience-the-sound-and-light-show-of-the-karnak-temple-from-luxor.png", "/trips/valley-of-the-kings-and-hatshepsut-temple-with-felucca-experience-from-luxor.png", "/trips/curated-night-at-the-temple.png"],
  "nile-sunset-cruise": ["/trips/curated-nile-sunset-cruise.png", "/trips/banana-island-felucca-luxor.png", "/trips/4-days-3-nights-nile-cruise-from-aswan-to-luxor.png", "/trips/explore-the-nubian-village-by-traditional-felucca-plus-authentic-lunch.png", "/trips/curated-nile-sunset-cruise.png", "/trips/curated-nile-sunset-cruise.png"],
  "marsa-alam-wild-coast": ["/trips/curated-marsa-alam-wild-coast.png", "/trips/curated-red-sea-coral-garden.png", "/trips/curated-safaga-reef-morning.png", "/trips/discover-magawish-island-with-snorkeling-cruise-and-lunch-in-hurghada.png", "/trips/curated-marsa-alam-nature-trail.png", "/trips/curated-marsa-alam-wild-coast.png"],
  "cairo-food-walk": ["/trips/curated-cairo-food-walk.png", "/trips/hurghada-city-local-life.png", "/trips/curated-cairo-food-walk.png", "/trips/curated-cairo-food-walk.png", "/trips/curated-cairo-food-walk.png", "/trips/curated-cairo-food-walk.png"],
  "safaga-reef-morning": ["/trips/curated-safaga-reef-morning.png", "/trips/curated-red-sea-coral-garden.png", "/trips/curated-marsa-alam-wild-coast.png", "/trips/discover-magawish-island-with-snorkeling-cruise-and-lunch-in-hurghada.png", "/trips/curated-safaga-reef-morning.png", "/trips/curated-safaga-reef-morning.png"],
  "red-sea-coral-garden": ["/trips/curated-red-sea-coral-garden.png", "/trips/curated-safaga-reef-morning.png", "/trips/curated-marsa-alam-wild-coast.png", "/trips/discover-magawish-island-with-snorkeling-cruise-and-lunch-in-hurghada.png", "/trips/curated-red-sea-coral-garden.png", "/trips/curated-red-sea-coral-garden.png"],
  "marsa-alam-nature-trail": ["/trips/curated-marsa-alam-nature-trail.png", "/trips/curated-marsa-alam-wild-coast.png", "/trips/curated-red-sea-coral-garden.png", "/trips/curated-safaga-reef-morning.png", "/trips/curated-marsa-alam-nature-trail.png", "/trips/curated-marsa-alam-nature-trail.png"],
};

const addedGalleryPools = {
  cairo: [
    "/trips/tour-of-the-grand-museum-and-giza-pyramids-with-lunch-from-cairo.png",
    "/trips/tour-of-civilization-museum-and-salah-el-din-citadel-with-el-khan-bazaar-from-ca.png",
    "/trips/one-day-alexandria-trip-from-cairo.png",
    "/trips/from-cairo-desert-safari-camel-ride-magic-lake-lunch.png",
    "/trips/fayoum-magic-lake-desert.png",
  ],
  luxor: [
    "/trips/luxor-west-bank-heritage.png",
    "/trips/tour-of-karnak-and-luxor-temples-with-the-sphinx-alley-from-luxor.png",
    "/trips/hot-air-balloon-experience-from-luxor-hotels-and-nile-cruises.png",
    "/trips/valley-of-the-kings-and-hatshepsut-temple-with-felucca-experience-from-luxor.png",
    "/trips/banana-island-felucca-luxor.png",
  ],
  aswan: [
    "/trips/lake-nasser-abu-simbel-cruise.png",
    "/trips/tour-of-the-high-dam-unfinished-obelisk-and-philae-temple-with-felucca-cruise.png",
    "/trips/experience-the-sound-and-light-show-of-philae-temple.png",
    "/trips/explore-the-nubian-village-by-traditional-felucca-plus-authentic-lunch.png",
    "/trips/4-days-3-nights-nile-cruise-from-aswan-to-luxor.png",
  ],
  coast: [
    "/trips/curated-red-sea-coral-garden.png",
    "/trips/curated-safaga-reef-morning.png",
    "/trips/discover-magawish-island-with-snorkeling-cruise-and-lunch-in-hurghada.png",
    "/trips/curated-marsa-alam-wild-coast.png",
    "/trips/curated-marsa-alam-nature-trail.png",
  ],
  desert: [
    "/trips/fayoum-magic-lake-desert.png",
    "/trips/from-cairo-desert-safari-camel-ride-magic-lake-lunch.png",
    "/trips/super-4x4-safari-with-sand-buggies-camel-ride-in-marsa-alam.png",
    "/trips/ultimate-desert-experience-quad-biking-camel-ride-bedouin-dinner-and-show.png",
    "/trips/lake-nasser-abu-simbel-cruise.png",
  ],
} as const;

function getAddedTourGallery(tour: TourDetail) {
  return galleryLabels.map((_, index) => `/trips/galleries/${tour.slug}/${String(index + 1).padStart(2, "0")}.png`);
}

export function slugifyTourName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getTourDetail(slug: string): TourDetail | null {
  const curated = [...curatedTours, ...addedTours].find((tour) => tour.slug === slug);
  if (curated) return curated;

  const trip = legacyCatalog.trips.find((candidate) => candidate.slug === slug);
  if (!trip) return null;

  const fix = catalogTripFixes[trip.slug];
  const cities = fix?.city?.split(" · ") ?? trip.cities.map((city) => normalizeCatalogCity(city.name));
  const categories = fix?.categories ?? trip.categories.map((category) => category.name);
  const duration = fix?.duration ?? trip.duration;
  const durationUnit = fix?.durationUnit ?? trip.durationUnit;
  const rating = trip.reviews.length ? (trip.reviews.reduce((sum, review) => sum + review.rating, 0) / trip.reviews.length).toFixed(1) : "New";
  const durationLabel = durationUnit === "days" ? (duration === 1 ? "day" : "days") : durationUnit;
  return {
    id: trip.id,
    slug: trip.slug,
    name: fix?.title ?? trip.title,
    city: cities.join(" · "),
    category: categories[0] ?? "Egypt",
    categories,
    rating,
    reviews: trip.reviews.length ? String(trip.reviews.length) : "New",
    duration: `${duration} ${durationLabel}`,
    durationDays: durationUnit === "days" ? duration : 1,
    priceFrom: Number(trip.groupPrice),
    soloPrice: Number(trip.soloPrice),
    groupPrice: Number(trip.groupPrice),
    currency: trip.currency,
    priceLevel: trip.priceLevel,
    discountPercent: trip.discountPercent,
    image: catalogTripImages[trip.slug] ?? trip.image,
    description: cleanCatalogText(trip.description.replace(/\s+/g, " ").trim()),
    includes: trip.includes,
    itinerary: trip.days,
    reviewDetails: trip.reviews,
    source: "catalog",
  };
}

export function getTourSlugs() {
  return [...curatedTours.map((tour) => tour.slug), ...addedTours.map((tour) => tour.slug), ...legacyCatalog.trips.map((trip) => trip.slug)];
}

function splitTourCities(value: string) {
  return value.split(" · ").map((city) => city.trim().toLowerCase()).filter(Boolean);
}

export function getSimilarTours(tour: TourDetail, limit = 4) {
  const targetCategories = new Set(tour.categories.map((category) => category.trim().toLowerCase()));
  const targetCities = new Set(splitTourCities(tour.city));

  return getTourSlugs()
    .map((slug) => getTourDetail(slug))
    .filter((candidate): candidate is TourDetail => candidate !== null && candidate.slug !== tour.slug)
    .map((candidate) => {
      const categoryMatches = candidate.categories.filter((category) => targetCategories.has(category.trim().toLowerCase())).length;
      const cityMatches = splitTourCities(candidate.city).filter((city) => targetCities.has(city)).length;
      const score = categoryMatches > 0 && cityMatches > 0 ? 100 + categoryMatches + cityMatches : 0;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function getOptionalExcursions(tour: TourDetail, limit = 6) {
  const targetCities = new Set(splitTourCities(tour.city));
  return getTourSlugs()
    .map((slug) => getTourDetail(slug))
    .filter((candidate): candidate is TourDetail => candidate !== null && candidate.slug !== tour.slug && candidate.durationDays <= 2)
    .map((candidate) => {
      const cityMatches = splitTourCities(candidate.city).filter((city) => targetCities.has(city)).length;
      const shortRouteBonus = candidate.durationDays === 1 ? 2 : 0;
      return { candidate, score: cityMatches * 10 + shortRouteBonus };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function getTourGallery(tour: TourDetail): TourGalleryImage[] {
  const sources = tour.source === "catalog"
    ? galleryLabels.map((_, index) => `/trips/galleries/${tour.slug}/${String(index + 1).padStart(2, "0")}.webp`)
    : curatedGalleryFallbacks[tour.slug] ?? (addedTours.some((candidate) => candidate.slug === tour.slug) ? getAddedTourGallery(tour) : Array.from({ length: 6 }, () => tour.image));
  return sources.map((src, index) => ({ src, label: galleryLabels[index] }));
}
