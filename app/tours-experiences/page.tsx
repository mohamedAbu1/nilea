"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDialogA11y } from "../components/dialog";
import { StyledSelect } from "../components/styled-select";
import { addedTours } from "../lib/added-tours";
import { legacyCatalog } from "../lib/legacy-catalog";
import { insertInquiry } from "../lib/submissions";
import { slugifyTourName } from "../lib/tour-details";
import { catalogTripFixes, cleanCatalogText, normalizeCatalogCity } from "../lib/tour-fixes";
import { useCurrency } from "../components/currency";

type IconName = "search" | "menu" | "close" | "arrow" | "pin" | "calendar" | "users" | "heart" | "clock" | "heritage" | "desert" | "nile" | "food" | "family" | "all";
type CuratedCategory = "Heritage" | "Desert" | "Nile" | "Food" | "Family";
type FilterCategory = "All" | string;

function ExperiencePrice({ value }: { value: string }) {
  const { format } = useCurrency();
  const match = value.match(/\$([\d,.]+)/);
  if (!match) return <>{value}</>;
  return <>{value.replace(`$${match[1]}`, format(Number(match[1].replaceAll(",", ""))))}</>;
}

type Experience = {
  slug?: string;
  name: string;
  city: string;
  sourceCities?: string[];
  category: CuratedCategory;
  sourceCategories?: readonly string[];
  rating: string;
  reviews: string;
  duration: string;
  price: string;
  image: string;
  description: string;
  availableOn?: ("This weekend" | "Next 30 days")[];
  maxGuests?: number;
  source?: "curated" | "catalog";
  soloPrice?: string;
  groupPrice?: string;
  discountPercent?: number;
  priceLevel?: string;
  includes?: readonly string[];
  itinerary?: readonly { dayNumber: number; activities: readonly { time: string; title: string }[] }[];
  reviewDetails?: readonly { name: string; comment: string; rating: number }[];
};

const curatedExperiences: Experience[] = [
  { name: "A Night at the Temple", city: "Luxor", category: "Heritage", rating: "4.9", reviews: "320", duration: "3 hrs", price: "$89 USD", image: "/trips/curated-night-at-the-temple.png", description: "Explore ancient wonders after dark with exclusive access and expert guides.", availableOn: ["This weekend", "Next 30 days"], maxGuests: 8 },
  { name: "Nile Sunset Cruise", city: "Aswan", category: "Nile", rating: "4.8", reviews: "412", duration: "2.5 hrs", price: "$65 USD", image: "/trips/curated-nile-sunset-cruise.png", description: "Sail the timeless Nile at golden hour with live music, light bites and unforgettable views.", availableOn: ["Next 30 days"], maxGuests: 6 },
  { name: "Marsa Alam Wild Coast", city: "Marsa Alam", category: "Desert", rating: "4.9", reviews: "287", duration: "6 hrs", price: "$120 USD", image: "/trips/curated-marsa-alam-wild-coast.png", description: "Pair coral shallows with desert light on a day shaped for sea, nature and stillness.", availableOn: ["This weekend"], maxGuests: 6 },
  { name: "Cairo Food Walk", city: "Cairo", category: "Food", rating: "4.7", reviews: "365", duration: "4 hrs", price: "$75 USD", image: "/trips/curated-cairo-food-walk.png", description: "Taste Egypt's vibrant street food with a local guide through historic Cairo.", availableOn: ["This weekend", "Next 30 days"], maxGuests: 8 },
  { name: "Safaga Reef Morning", city: "Safaga", category: "Family", rating: "4.8", reviews: "198", duration: "4 hrs", price: "$82 USD", image: "/trips/curated-safaga-reef-morning.png", description: "Spend a clear-water morning above reefs, warm shallows and the open Red Sea.", availableOn: ["Next 30 days"], maxGuests: 4 },
  { name: "Red Sea Coral Garden", city: "Hurghada", category: "Family", rating: "4.8", reviews: "306", duration: "5 hrs", price: "$110 USD", image: "/trips/curated-red-sea-coral-garden.png", description: "Spend an unhurried day above clear water, coral gardens and the quiet blue of the Red Sea.", availableOn: ["This weekend", "Next 30 days"], maxGuests: 6 },
  { name: "Marsa Alam Nature Trail", city: "Marsa Alam", category: "Family", rating: "4.9", reviews: "274", duration: "6 hrs", price: "$128 USD", image: "/trips/curated-marsa-alam-nature-trail.png", description: "Follow the coast beyond the resort road through mangroves, reef water and open horizons.", availableOn: ["Next 30 days"], maxGuests: 6 },
];

const catalogTripImages: Record<string, string> = {
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

function catalogCategory(trip: (typeof legacyCatalog.trips)[number], categories: ReadonlyArray<string> = trip.categories.map((category) => category.name)): CuratedCategory {
  const title = trip.title.toLowerCase();
  const categoryNames = categories.map((category) => category.toLowerCase());
  if (categoryNames.includes("nile cruises")) return "Nile";
  if (title.includes("desert") || title.includes("safari") || title.includes("camel") || title.includes("quad") || title.includes("fayoum") || title.includes("siwa")) return "Desert";
  if (categoryNames.includes("historical") || categoryNames.includes("spiritual")) return "Heritage";
  if (categoryNames.includes("family friendly")) return "Family";
  return "Heritage";
}

const catalogExperiences: Experience[] = legacyCatalog.trips.map((trip) => {
  const fix = catalogTripFixes[trip.slug];
  const sourceCities = fix?.city?.split(" · ") ?? trip.cities.map((city) => normalizeCatalogCity(city.name));
  const sourceCategories = fix?.categories ?? trip.categories.map((category) => category.name);
  const duration = fix?.duration ?? trip.duration;
  const durationUnit = fix?.durationUnit ?? trip.durationUnit;
  const averageRating = trip.reviews.length ? (trip.reviews.reduce((sum, review) => sum + review.rating, 0) / trip.reviews.length).toFixed(1) : "New";
  const durationLabel = durationUnit === "days" ? (duration === 1 ? "day" : "days") : durationUnit;
  return {
    slug: trip.slug,
    name: fix?.title ?? trip.title,
    city: sourceCities.join(" · "),
    sourceCities,
    category: catalogCategory(trip, sourceCategories),
    sourceCategories,
    rating: averageRating,
    reviews: trip.reviews.length ? String(trip.reviews.length) : "New",
    duration: `${duration} ${durationLabel}`,
    price: `From $${trip.groupPrice} ${trip.currency}`,
    image: catalogTripImages[trip.slug] ?? trip.image,
    description: cleanCatalogText(trip.description.replace(/\s+/g, " ").trim()),
    source: "catalog",
    soloPrice: `$${trip.soloPrice} ${trip.currency}`,
    groupPrice: `$${trip.groupPrice} ${trip.currency}`,
    discountPercent: trip.discountPercent,
    priceLevel: trip.priceLevel,
    includes: trip.includes,
    itinerary: trip.days,
    reviewDetails: trip.reviews,
  };
});

function addedCategory(tour: (typeof addedTours)[number]): CuratedCategory {
  if (tour.categories.includes("Nile Cruises")) return "Nile";
  if (tour.category === "Desert" || tour.categories.includes("Adventure Trips") && !tour.categories.includes("Historical")) return "Desert";
  if (tour.categories.includes("Family Friendly")) return "Family";
  return "Heritage";
}

const addedExperiences: Experience[] = addedTours.map((tour) => ({
  slug: tour.slug,
  name: tour.name,
  city: tour.city,
  sourceCities: tour.city.split(" · "),
  category: addedCategory(tour),
  sourceCategories: [...tour.categories],
  rating: tour.rating,
  reviews: tour.reviews,
  duration: tour.duration,
  price: `From $${tour.priceFrom} ${tour.currency}`,
  image: tour.image,
  description: tour.description,
  source: "curated",
  priceLevel: tour.priceLevel,
  includes: tour.includes,
  itinerary: tour.itinerary,
  reviewDetails: tour.reviewDetails,
}));

// The public catalog is the 31 imported SQL trips plus the 19 new AlpNile routes.
// The seven editorial experiences remain available on their direct pages and
// on the home page, but do not inflate the catalog's 50-route count.
const experiences: Experience[] = [...catalogExperiences, ...addedExperiences];
const allExperiences: Experience[] = [...curatedExperiences, ...experiences];

const categoryIcons: Record<string, IconName> = {
  "Nile Cruises": "nile",
  Spiritual: "heritage",
  "Luxury Tours": "heart",
  "Night Tours": "calendar",
  "Family Friendly": "family",
  "Adventure Trips": "desert",
  Historical: "heritage",
  "Wellness & Medical": "heart",
  "One Day Trips": "calendar",
  Heritage: "heritage",
  Desert: "desert",
  Nile: "nile",
  Food: "food",
  Family: "family",
};
const categories: { label: FilterCategory; icon: IconName }[] = [
  { label: "All", icon: "all" },
  ...legacyCatalog.categories.map((category) => ({ label: category.name as FilterCategory, icon: categoryIcons[category.name] ?? "heritage" })),
  { label: "Heritage", icon: "heritage" },
  { label: "Desert", icon: "desert" },
  { label: "Nile", icon: "nile" },
  { label: "Food", icon: "food" },
  { label: "Family", icon: "family" },
];

const destinationOptions = ["All Egypt", "Safaga", ...Array.from(new Set([...legacyCatalog.cities.map((city) => normalizeCatalogCity(city.name)), ...addedTours.flatMap((tour) => tour.city.split(" · ")), "Hurghada"]))];
const destinationQueryMap: Record<string, string> = { safaga: "Safaga", "marsa-alam": "Marsa Alam", fayoum: "Fayoum", luxor: "Luxor", aswan: "Aswan", cairo: "Cairo", hurghada: "Hurghada", hurgada: "Hurghada", alexandria: "Alexandria", "sharm-el-sheikh": "Sharm El Sheikh", siwa: "Siwa" };
const experienceQueryMap: Record<string, string> = { "temples-after-dark": "A Night at the Temple", "food-walk": "Cairo Food Walk", "nile-sunset": "Nile Sunset Cruise" };
const whatsAppNumber = "41765082885";
const PAGE_SIZE = 9;

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: `inline-ui-icon inline-ui-${name}` };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6.7" /><path d="m16 16 4.3 4.3" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13" /><path d="m13 7 5 5-5 5" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.3" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="4" y="5.2" width="16" height="14.8" rx="2" /><path d="M8 3.8v3M16 3.8v3M4 9.5h16" /></svg>;
  if (name === "users") return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0-1.7-5.5M16 14.5a5.5 5.5 0 0 1 4.5 5.5" /></svg>;
  if (name === "heart") return <svg {...common}><path d="M20.8 8.7c0 5.3-8.8 10.4-8.8 10.4S3.2 14 3.2 8.7A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.2Z" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "heritage") return <svg {...common}><path d="M3 20h18M5 20V10h14v10M3 10l9-6 9 6M8 14h.01M12 14h.01M16 14h.01" /></svg>;
  if (name === "desert") return <svg {...common}><path d="M3 18c3-4 6-4 9 0 3-4 6-4 9 0M4 21h16M12 5v5M9.5 7.5 12 5l2.5 2.5" /></svg>;
  if (name === "nile") return <svg {...common}><path d="M4 7c3 0 3 3 6 3s3-3 6-3 3 3 4 3M4 14c3 0 3 3 6 3s3-3 6-3 3 3 4 3" /></svg>;
  if (name === "food") return <svg {...common}><path d="M7 3v8M4.5 3v4.2a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3v18M17 3c-2.2 2.2-2.7 5.2-1.2 7.1.5.6 1.2.9 2.2.9" /></svg>;
  if (name === "family") return <svg {...common}><circle cx="8" cy="7" r="2.4" /><circle cx="16" cy="7" r="2.4" /><circle cx="12" cy="5" r="2" /><path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0M9 11.5a4 4 0 0 1 6 0" /></svg>;
  return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
}

export default function ToursExperiencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [destination, setDestination] = useState("All Egypt");
  const [date, setDate] = useState("Any date");
  const [guests, setGuests] = useState("2 adults");
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [page, setPage] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const requestedDestination = searchParams.get("destination");
    const nextDestination = requestedDestination ? destinationQueryMap[requestedDestination] ?? "All Egypt" : "All Egypt";
    setDestination(nextDestination);

    const requestedCategory = searchParams.get("category");
    const catalogCategoryMatch = requestedCategory ? legacyCatalog.categories.find((category) => category.slug === requestedCategory) : undefined;
    setActiveCategory(catalogCategoryMatch?.name as FilterCategory ?? "All");
    setSearched(Boolean(catalogCategoryMatch));
    setPage(1);

    const requestedExperience = searchParams.get("experience");
    const experienceName = requestedExperience ? experienceQueryMap[requestedExperience] : undefined;
    const requestedTrip = searchParams.get("trip");
    const matchingExperience = experienceName
      ? allExperiences.find((experience) => experience.name === experienceName)
      : requestedTrip ? allExperiences.find((experience) => experience.slug === requestedTrip) : undefined;
    if (matchingExperience) {
      setActiveCategory("All");
      setDestination(matchingExperience.city);
      setSelectedExperience(matchingExperience);
    }
  }, [searchParams]);

  useEffect(() => {
    const stored = window.localStorage.getItem("alpnile-tour-favorites");
    if (!stored) return;
    try { setFavorites(JSON.parse(stored) as string[]); } catch { window.localStorage.removeItem("alpnile-tour-favorites"); }
  }, []);
  useEffect(() => {
    window.localStorage.setItem("alpnile-tour-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const visibleExperiences = useMemo(() => {
    const guestCount = guests.startsWith("4") ? 4 : Number.parseInt(guests, 10) || 1;
    return experiences.filter((experience) =>
      (activeCategory === "All" || experience.sourceCategories?.includes(activeCategory) || experience.category === activeCategory) &&
      (destination === "All Egypt" || (experience.sourceCities ?? [experience.city]).includes(destination)) &&
      (date === "Any date" || !experience.availableOn || experience.availableOn.includes(date as "This weekend" | "Next 30 days")) &&
      (experience.maxGuests === undefined || experience.maxGuests >= guestCount),
    );
  }, [activeCategory, date, destination, guests]);
  const totalPages = Math.max(1, Math.ceil(visibleExperiences.length / PAGE_SIZE));
  const pagedExperiences = useMemo(() => visibleExperiences.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page, visibleExperiences]);
  const recommendedExperiences = useMemo(() => {
    const currentPageKeys = new Set(pagedExperiences.map((experience) => experience.slug ?? experience.name));
    const candidatePool = visibleExperiences.length ? visibleExperiences : experiences;
    const alternatePool = candidatePool.filter((experience) => !currentPageKeys.has(experience.slug ?? experience.name));
    const pool = alternatePool.length >= 5 ? alternatePool : candidatePool;
    return [...pool]
      .sort((left, right) => {
        const leftRating = left.rating === "New" ? 0 : Number.parseFloat(left.rating);
        const rightRating = right.rating === "New" ? 0 : Number.parseFloat(right.rating);
        const leftReviews = left.reviews === "New" ? 0 : Number.parseInt(left.reviews, 10);
        const rightReviews = right.reviews === "New" ? 0 : Number.parseInt(right.reviews, 10);
        return rightRating - leftRating || rightReviews - leftReviews;
      })
      .slice(0, 5);
  }, [pagedExperiences, visibleExperiences]);
  const recommendationSubtitle = activeCategory === "All" && destination === "All Egypt" ? "Popular next stops" : "Matched to your current filters";
  useEffect(() => { setPage(1); }, [activeCategory, date, destination, guests]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const toggleFavorite = (name: string) => setFavorites((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  const submitExperienceRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedExperience) return;
    setBookingError("");
    setBookingSubmitting(true);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setBookingSubmitting(false); return; }
    const fullName = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const dateValue = String(form.get("date") ?? "").trim();
    const guestsValue = String(form.get("guests") ?? "2");
    const message = `Experience request: ${selectedExperience.name} · ${selectedExperience.city} · ${dateValue} · ${guestsValue} guests. ${String(form.get("notes") ?? "").trim()}`;
    const result = await insertInquiry({ request_type: "trip", full_name: fullName, email, phone, message, details: { experience: selectedExperience.name, city: selectedExperience.city, date: dateValue, guests: guestsValue }, source: "tours-page" });
    if (result.error) {
      setBookingError("We could not save this request. Please try again.");
      setBookingSubmitting(false);
      return;
    }
    setBookingConfirmed(true);
    setBookingSubmitting(false);
    window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(`Hello AlpNile, I would like to request ${selectedExperience.name}.\nName: ${fullName}\nDate: ${dateValue}\nGuests: ${guestsValue}\nPhone: ${phone}`)}`, "_blank", "noopener,noreferrer");
  };
  useDialogA11y(Boolean(selectedExperience), () => { setSelectedExperience(null); setBookingConfirmed(false); }, dialogRef);

  return (
    <main className="tour-shell">
      <section className="tour-content-section">
        <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 pt-12 sm:px-7 sm:pt-14 lg:px-12 lg:pt-6">
          <div className="tour-search-panel mt-6 rounded-[18px] p-2 sm:mt-5 sm:p-2"><div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_170px] sm:gap-0"><label className="tour-search-control rounded-xl px-4 text-left"><small>Destination</small><span className="tour-search-select-wrap"><Icon name="pin" size={17} /><StyledSelect value={destination} onChange={(nextValue) => { setDestination(nextValue); setSearched(false); }} ariaLabel="Destination">{destinationOptions.map((option) => <option key={option}>{option}</option>)}</StyledSelect></span></label><label className="tour-search-control rounded-xl px-4 text-left"><small>Date</small><span className="tour-search-select-wrap"><Icon name="calendar" size={17} /><StyledSelect value={date} onChange={setDate} ariaLabel="Date"><option>Any date</option><option>This weekend</option><option>Next 30 days</option></StyledSelect></span></label><label className="tour-search-control rounded-xl px-4 text-left"><small>Guests</small><span className="tour-search-select-wrap"><Icon name="users" size={17} /><StyledSelect value={guests} onChange={setGuests} ariaLabel="Guests"><option>1 adult</option><option>2 adults</option><option>3 adults</option><option>4+ adults</option></StyledSelect></span></label><button type="button" onClick={() => { setSearched(true); document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="tour-search-button rounded-xl px-4 text-[12px] font-semibold">Search Experiences <Icon name="search" size={15} /></button></div></div>

          <div className="tour-category-tabs no-scrollbar">{categories.map((category, index) => <button key={`${category.label}-${index}`} onClick={() => { setActiveCategory(category.label); setSearched(false); }} className={`tour-category-tab ${activeCategory === category.label ? "active" : ""}`} aria-pressed={activeCategory === category.label}><span className="tour-category-icon"><Icon name={category.icon} size={19} /></span><span>{category.label}</span></button>)}</div>

          <section id="featured" className="tour-featured-section scroll-mt-28"><div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="font-display text-[34px] text-[#f2ca84] sm:text-[42px]">Curated for your route</h2><p className="tour-results-count">{visibleExperiences.length} experiences match your current filters</p></div><button type="button" onClick={() => { setActiveCategory("All"); setDestination("All Egypt"); setSearched(true); }} className="hidden items-center gap-2 text-[11px] text-white/65 transition hover:text-[#f4c577] sm:flex">View all experiences <Icon name="arrow" size={13} /></button></div>
            <div className="tour-featured-grid">{visibleExperiences.length ? pagedExperiences.map((experience) => <article key={experience.slug ?? experience.name} className="tour-card"><div className="tour-card-media" style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 10, 16, .02) 24%, rgba(3, 9, 15, .74) 100%), url('${experience.image}')` }}><button onClick={() => toggleFavorite(experience.name)} className={`tour-heart ${favorites.includes(experience.name) ? "saved" : ""}`} aria-label={`${favorites.includes(experience.name) ? "Remove" : "Save"} ${experience.name}`} aria-pressed={favorites.includes(experience.name)}><Icon name="heart" size={17} /></button></div><div className="tour-card-content"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="tour-card-title font-display text-[21px] leading-tight text-[#f3d08e]">{experience.name}</h3><p className="mt-1 truncate text-[10px] text-white/55">{experience.city}</p></div><span className="tour-card-category shrink-0">{experience.sourceCategories?.[0] ?? experience.category}</span></div><div className="mt-3 flex items-center gap-4 text-[10px] text-white/70"><span className={experience.rating === "New" ? "text-white/60" : "text-[#f9c34f]"}>{experience.rating === "New" ? "New" : `★ ${experience.rating}`}</span><span>{experience.reviews === "New" ? "No reviews yet" : `(${experience.reviews})`}</span><span className="flex items-center gap-1"><Icon name="clock" size={13} /> {experience.duration}</span></div><p className="mt-3 font-display text-[17px] text-[#f4cf8d]"><ExperiencePrice value={experience.price} /></p><button onClick={() => router.push(`/tours-experiences/${experience.slug ?? slugifyTourName(experience.name)}`)} className="tour-book-button mt-3 w-full rounded-full px-4 py-2.5 text-[11px] font-semibold">View & request <Icon name="arrow" size={14} /></button></div></article>) : <div className="tour-empty-state"><strong>No experiences found</strong><span>Try another destination or category.</span></div>}</div>
            {visibleExperiences.length > PAGE_SIZE && <nav className="tour-pagination" aria-label="Experience pages"><button type="button" className="tour-pagination-arrow" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page">‹</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} type="button" className={pageNumber === page ? "active" : ""} onClick={() => { setPage(pageNumber); document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-current={pageNumber === page ? "page" : undefined}>{pageNumber}</button>)}<button type="button" className="tour-pagination-arrow" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} aria-label="Next page">›</button></nav>}
            {searched && <div className="tour-notice mt-4 rounded-full px-4 py-2 text-[11px] text-[#f4cf8d]" role="status">Showing {activeCategory === "All" ? "all experiences" : activeCategory.toLowerCase()} in {destination} · {guests}</div>}
          </section>

          <section className="tour-recommendations"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#e6b567]">A thoughtful next chapter</p><h2 className="mt-2 font-display text-[28px] text-[#f2ca84] sm:text-[33px]">Recommended for You</h2></div><span className="hidden text-[10px] text-white/50 sm:block">{recommendationSubtitle}</span></div><div className="tour-recommendation-grid">{recommendedExperiences.map((recommendation) => <button key={recommendation.slug ?? recommendation.name} type="button" aria-label={`View ${recommendation.name}`} onClick={() => router.push(`/tours-experiences/${recommendation.slug ?? slugifyTourName(recommendation.name)}`)} className="tour-recommendation-card text-left"><span className="tour-recommendation-image" style={{ backgroundImage: `url('${recommendation.image}')` }} /><span><strong>{recommendation.name}</strong><small>{recommendation.city}</small><em><b>★</b> {recommendation.rating === "New" ? "New" : `${recommendation.rating} (${recommendation.reviews})`}</em><small className="tour-recommendation-price"><ExperiencePrice value={recommendation.price} /></small></span><Icon name="arrow" size={14} /></button>)}</div></section>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 pb-5 pt-1 text-[11px] text-white/50 sm:px-7 lg:px-12"><p>Small moments, lasting memories <span className="mx-2 text-[#dcae61]">·</span> {activeCategory}</p><p className="font-display tracking-[0.16em] text-[#c7914d]">ALPNILE / TOURS 05</p></section>

      {selectedExperience && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => { setSelectedExperience(null); setBookingConfirmed(false); setBookingError(""); }}><div ref={dialogRef} className="tour-modal modal-depth relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[24px]" role="dialog" aria-modal="true" aria-labelledby="tour-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" data-dialog-close onClick={() => { setSelectedExperience(null); setBookingConfirmed(false); }} className="absolute right-5 top-5 z-10 text-white/70 transition hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><div className="tour-modal-image" style={{ backgroundImage: `url('${selectedExperience.image}')` }} /><div className="p-7 sm:p-9"><p className="text-[10px] uppercase tracking-[0.3em] text-[#e7b96a]">Selected experience · {selectedExperience.city}</p><h2 id="tour-title" className="mt-3 font-display text-[34px] text-[#f4cf8d]">{selectedExperience.name}</h2><div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/65"><span className={selectedExperience.rating === "New" ? "text-white/60" : "text-[#f5c55e]"}>{selectedExperience.rating === "New" ? "New listing" : `★ ${selectedExperience.rating}`}</span><span>{selectedExperience.reviews === "New" ? "No reviews yet" : `(${selectedExperience.reviews} reviews)`}</span><span>·</span><span>{selectedExperience.duration}</span>{selectedExperience.priceLevel && <span>· {selectedExperience.priceLevel}</span>}</div><p className="mt-5 text-[14px] leading-6 text-white/72">{selectedExperience.description} Your local host will shape the details around your pace, curiosity and time in Egypt.</p>{selectedExperience.sourceCategories?.length ? <div className="mt-4 flex flex-wrap gap-2">{selectedExperience.sourceCategories.map((category) => <span key={category} className="rounded-full border border-[#d9a95f]/25 px-3 py-1 text-[10px] text-[#f2ca84]/80">{category}</span>)}</div> : null}{selectedExperience.source === "catalog" && <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-[11px]"><div><span className="block text-white/45">Solo</span><strong className="text-[#f4cf8d]">{selectedExperience.soloPrice}</strong></div><div><span className="block text-white/45">Small group</span><strong className="text-[#f4cf8d]">{selectedExperience.groupPrice}</strong></div>{selectedExperience.discountPercent ? <div className="col-span-2 text-[#9fd4a9]">{selectedExperience.discountPercent}% seasonal discount in the imported catalog</div> : null}</div>}{selectedExperience.itinerary?.length ? <section className="mt-6"><h3 className="font-display text-[22px] text-[#f2ca84]">Day-by-day route</h3><div className="mt-3 space-y-3">{selectedExperience.itinerary.map((day) => <div key={day.dayNumber} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><strong className="text-[11px] uppercase tracking-[0.16em] text-[#e7b96a]">Day {day.dayNumber}</strong><ul className="mt-2 space-y-2 text-[11px] leading-5 text-white/70">{day.activities.map((activity) => <li key={`${day.dayNumber}-${activity.time}-${activity.title}`}><span className="mr-2 text-[#f4cf8d]">{activity.time}</span>{activity.title}</li>)}</ul></div>)}</div></section> : null}{selectedExperience.includes?.length ? <section className="mt-6"><h3 className="font-display text-[22px] text-[#f2ca84]">Included in your route</h3><ul className="mt-3 grid gap-2 text-[11px] text-white/70 sm:grid-cols-2">{selectedExperience.includes.map((item) => <li key={item} className="rounded-xl border border-white/10 px-3 py-2">✓ {item}</li>)}</ul></section> : null}{selectedExperience.reviewDetails?.length ? <section className="mt-6"><h3 className="font-display text-[22px] text-[#f2ca84]">Guest notes</h3><div className="mt-3 space-y-2">{selectedExperience.reviewDetails.map((review) => <blockquote key={`${review.name}-${review.comment}`} className="rounded-xl border border-white/10 px-3 py-2 text-[11px] leading-5 text-white/70"><span className="mr-2 text-[#f5c55e]">★ {review.rating}</span>{review.comment}</blockquote>)}</div></section> : null}{bookingConfirmed ? <div className="tour-confirmation mt-6"><strong>Booking request saved</strong><span>We opened WhatsApp with your details so the AlpNile team can confirm the next step.</span></div> : <form className="tour-request-form mt-6" onSubmit={submitExperienceRequest}><input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" /><div className="tour-request-grid"><input name="name" required placeholder="Full name" /><input name="email" type="email" required placeholder="Email address" /><input name="phone" required placeholder="WhatsApp number" /><input name="date" type="date" required min={new Date().toISOString().slice(0, 10)} /><StyledSelect name="guests" defaultValue="2" ariaLabel="Guests"><option value="1">1 adult</option><option value="2">2 adults</option><option value="3">3 adults</option><option value="4">4+ adults</option></StyledSelect></div><textarea name="notes" rows={3} placeholder="Notes or preferences (optional)" /><button type="submit" disabled={bookingSubmitting} className="tour-book-button mt-3 w-full rounded-full px-5 py-3 text-[11px] font-semibold">{bookingSubmitting ? "Saving request…" : "Continue to request"} <Icon name="arrow" size={14} /></button>{bookingError && <p className="home-form-error" role="alert">{bookingError}</p>}</form>}</div></div></div>}
    </main>
  );
}
