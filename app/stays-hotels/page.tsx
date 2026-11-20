"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getSubmissionErrorMessage, insertInquiry } from "../lib/submissions";
import { getDestinationLabel, normalizeDestinationId } from "../lib/travel-availability";
import { LocalizedPrice, useCurrency } from "../components/currency";

type IconName = "arrow" | "balloon" | "bath" | "bed" | "boat" | "calendar" | "check" | "close" | "heart" | "horse" | "kitchen" | "lock" | "map" | "pin" | "pool" | "search" | "share" | "star" | "sun" | "users" | "wifi";

type GalleryImage = {
  index: number;
  label: string;
  alt: string;
  source?: string;
};

type StayActivity = {
  id: string;
  icon: IconName;
  title: string;
  detail: string;
  duration: string;
  price: number;
};

type ExternalListing = {
  platform: "Airbnb" | "Booking.com";
  href: string;
};

type StayCard = {
  slug: string;
  title: string;
  kind: "Home" | "Hotel room" | "Apartment" | "Villa";
  location: string;
  rating: string;
  reviews: number;
  price: number;
  guests: number;
  bedrooms: number;
  baths: number;
  image: string;
  description: string;
  available: boolean;
  coordinates: { lat: number; lng: number };
  mapLabel: string;
  mapsUrl: string;
  activities: StayActivity[];
  blockedDates?: string[];
  gallery?: GalleryImage[];
};

const galleryImages: GalleryImage[] = [
  { index: 1, label: "Kitchen", alt: "Compact kitchen with countertop appliances and sink" },
  { index: 2, label: "Master bedroom", alt: "Double bedroom with balcony doors" },
  { index: 3, label: "Bedroom", alt: "Bright bedroom with balcony access and ensuite doorway" },
  { index: 4, label: "Villa exterior", alt: "Habu Sunset Villa exterior facade" },
  { index: 5, label: "Bedroom detail", alt: "Double bed with crisp white linens and warm wall lights" },
  { index: 6, label: "Bedroom seating", alt: "Bedroom with bed, armchair and television" },
  { index: 7, label: "Open-plan living", alt: "Open-plan living area and kitchen with pendant lights" },
  { index: 8, label: "Living room", alt: "Living room with sofas, rugs and kitchen" },
  { index: 9, label: "Twin bedroom", alt: "Twin beds beside a bright balcony" },
  { index: 10, label: "Family bedroom", alt: "Bedroom with double and single beds" },
  { index: 11, label: "Twin room", alt: "Twin room with wardrobes and curtains" },
  { index: 12, label: "Pool terrace", alt: "Private pool terrace with sun loungers" },
  { index: 13, label: "Living and kitchen", alt: "Open-plan sitting room and kitchen" },
  { index: 14, label: "Kitchen and bath", alt: "Kitchen beside a marble bathroom vanity" },
  { index: 15, label: "Bedroom and bath", alt: "Bedroom view through the bathroom doorway" },
  { index: 16, label: "Kitchen detail", alt: "Kitchen appliances beside the bathroom" },
  { index: 17, label: "Kitchen view", alt: "Bedroom, bathroom and kitchenette from one angle" },
  { index: 18, label: "Pool close-up", alt: "Blue swimming pool with loungers and umbrella" },
  { index: 19, label: "Balcony view", alt: "Private balcony with two chairs overlooking the neighborhood" },
  { index: 20, label: "Pool terrace wide", alt: "Wide pool terrace with loungers" },
  { index: 21, label: "Balcony seating", alt: "Balcony seating with a view over the neighborhood" },
  { index: 22, label: "Pool and villa", alt: "Villa facade beside the private pool" },
  { index: 23, label: "Bathroom", alt: "Marble bathroom with walk-in shower and vanity" },
  { index: 24, label: "Pool shade", alt: "Pool terrace with large umbrella and loungers" },
  { index: 25, label: "Pool from above", alt: "Pool and balcony viewed from above" },
];

const catalogStays: StayCard[] = [
  {
    slug: "habu-sunset-villa",
    title: "Habu Sunset Villa",
    kind: "Villa",
    location: "Habu, Luxor",
    rating: "4.9",
    reviews: 18,
    price: 180,
    guests: 4,
    bedrooms: 2,
    baths: 2,
    image: "/images/habu-sunset-villa/responsive/villa-04-desktop.webp",
    description: "A private pool home with bright rooms, a quiet terrace and an easy base for Luxor's West Bank.",
    available: true,
    coordinates: { lat: 25.7188, lng: 32.6017 },
    mapLabel: "Medinet Habu, Luxor",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=25.7188%2C32.6017",
    activities: [
      { id: "habu-horse", icon: "horse", title: "Horseback at sunset", detail: "A quiet ride through the West Bank", duration: "2 hours", price: 35 },
      { id: "habu-balloon", icon: "balloon", title: "Hot-air balloon sunrise", detail: "See the Nile and temples from above", duration: "3 hours", price: 75 },
      { id: "habu-banana", icon: "boat", title: "Banana Island escape", detail: "Slow boat ride and an island lunch", duration: "Half day", price: 45 },
      { id: "habu-temple", icon: "map", title: "Medinet Habu walk", detail: "A private route around the ancient temple", duration: "2 hours", price: 25 },
    ],
    blockedDates: ["2026-12-08", "2026-12-09", "2026-12-10", "2026-12-22", "2026-12-23"],
    gallery: galleryImages,
  },
  {
    slug: "nile-view-apartment",
    title: "Nile View Apartment",
    kind: "Apartment",
    location: "Luxor, Egypt",
    rating: "4.8",
    reviews: 42,
    price: 95,
    guests: 3,
    bedrooms: 1,
    baths: 1,
    image: "/alpnile-hotel-nile-palace.webp",
    description: "A calm apartment for river mornings, walkable evenings and an unhurried city stay.",
    available: false,
    coordinates: { lat: 25.6872, lng: 32.6396 },
    mapLabel: "Luxor Corniche",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=25.6872%2C32.6396",
    activities: [
      { id: "luxor-felucca", icon: "boat", title: "Felucca on the Nile", detail: "A slow river sail at golden hour", duration: "2 hours", price: 30 },
      { id: "luxor-balloon", icon: "balloon", title: "Sunrise balloon flight", detail: "A clear view across both banks", duration: "3 hours", price: 75 },
      { id: "luxor-banana", icon: "sun", title: "Banana Island lunch", detail: "Local food and a relaxed island stop", duration: "Half day", price: 45 },
      { id: "luxor-temples", icon: "map", title: "Karnak and Luxor temples", detail: "A local guide for the two landmark sites", duration: "4 hours", price: 40 },
    ],
    blockedDates: ["2026-12-12", "2026-12-13", "2026-12-14"],
    gallery: [
      { index: 101, label: "Living room", alt: "Nile view apartment living room", source: "/alpnile-hotel-nile-palace.webp" },
      { index: 102, label: "River light", alt: "Nile view apartment at golden hour", source: "/alpnile-hotel-luxor-riverside.webp" },
      { index: 103, label: "Bedroom", alt: "Quiet apartment bedroom", source: "/alpnile-hotel-winter-palace.webp" },
    ],
  },
  {
    slug: "winter-palace-room",
    title: "Winter Palace Garden Room",
    kind: "Hotel room",
    location: "Luxor, Egypt",
    rating: "4.7",
    reviews: 31,
    price: 220,
    guests: 2,
    bedrooms: 1,
    baths: 1,
    image: "/alpnile-hotel-winter-palace.webp",
    description: "A polished hotel room with historic character, garden calm and a classic Luxor address.",
    available: false,
    coordinates: { lat: 25.6875, lng: 32.6398 },
    mapLabel: "Winter Palace, Luxor",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=25.6875%2C32.6398",
    activities: [
      { id: "palace-carriage", icon: "horse", title: "Horse-drawn city ride", detail: "A classic route along Luxor's riverfront", duration: "90 minutes", price: 28 },
      { id: "palace-felucca", icon: "boat", title: "Private felucca sail", detail: "Nile air with tea and sunset light", duration: "2 hours", price: 30 },
      { id: "palace-balloon", icon: "balloon", title: "West Bank balloon flight", detail: "A sunrise view over the monuments", duration: "3 hours", price: 75 },
      { id: "palace-karnak", icon: "map", title: "Karnak with a guide", detail: "A focused visit with local context", duration: "3 hours", price: 35 },
    ],
    blockedDates: ["2026-12-05", "2026-12-06", "2026-12-18"],
    gallery: [
      { index: 111, label: "Garden room", alt: "Winter Palace garden room", source: "/alpnile-hotel-winter-palace.webp" },
      { index: 112, label: "Nile palace", alt: "Historic hotel exterior", source: "/alpnile-hotel-nile-palace.webp" },
      { index: 113, label: "Courtyard", alt: "Hotel courtyard atmosphere", source: "/alpnile-hotel-al-moudira.webp" },
    ],
  },
  {
    slug: "aswan-courtyard-home",
    title: "Aswan Courtyard Home",
    kind: "Home",
    location: "Aswan, Egypt",
    rating: "4.9",
    reviews: 16,
    price: 130,
    guests: 5,
    bedrooms: 2,
    baths: 2,
    image: "/alpnile-villas-v2.webp",
    description: "A warm home with indoor-outdoor rhythm, designed for longer stays and shared meals.",
    available: false,
    coordinates: { lat: 24.0889, lng: 32.8998 },
    mapLabel: "Aswan, Egypt",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=24.0889%2C32.8998",
    activities: [
      { id: "aswan-felucca", icon: "boat", title: "Felucca around the islands", detail: "A calm sail between Aswan's river islands", duration: "3 hours", price: 35 },
      { id: "aswan-philae", icon: "map", title: "Philae Temple by boat", detail: "Temple visit with a local guide", duration: "Half day", price: 45 },
      { id: "aswan-nubian", icon: "sun", title: "Nubian village visit", detail: "Color, stories and tea by the Nile", duration: "Half day", price: 38 },
      { id: "aswan-camel", icon: "horse", title: "Desert camel ride", detail: "A gentle ride with a river view", duration: "2 hours", price: 32 },
    ],
    blockedDates: ["2026-12-11", "2026-12-12", "2026-12-28"],
    gallery: [
      { index: 121, label: "Courtyard home", alt: "Aswan courtyard home", source: "/alpnile-villas-v2.webp" },
      { index: 122, label: "Local light", alt: "Aswan home exterior", source: "/alpnile-destination-luxor.webp" },
      { index: 123, label: "Living space", alt: "Home living space", source: "/alpnile-home-hero-3d-v1.webp" },
    ],
  },
  {
    slug: "red-sea-garden-villa",
    title: "Red Sea Garden Villa",
    kind: "Villa",
    location: "Hurghada, Egypt",
    rating: "4.8",
    reviews: 24,
    price: 165,
    guests: 6,
    bedrooms: 3,
    baths: 2,
    image: "/alpnile-stays-hotels-hero.webp",
    description: "An open villa stay for sun, space and a slower route to the Red Sea.",
    available: false,
    coordinates: { lat: 27.2579, lng: 33.8116 },
    mapLabel: "Hurghada, Red Sea",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=27.2579%2C33.8116",
    activities: [
      { id: "hurghada-snorkel", icon: "boat", title: "Red Sea snorkelling", detail: "Clear water, coral and a local boat crew", duration: "Half day", price: 55 },
      { id: "hurghada-diving", icon: "pool", title: "Intro scuba dive", detail: "A guided first dive for beginners", duration: "Half day", price: 85 },
      { id: "hurghada-safari", icon: "horse", title: "Desert safari", detail: "Quad bikes, tea and a Bedouin sunset", duration: "5 hours", price: 48 },
      { id: "hurghada-sunset", icon: "sun", title: "Sunset sailing", detail: "A soft evening on the Red Sea", duration: "2 hours", price: 42 },
    ],
    blockedDates: ["2026-12-07", "2026-12-08", "2026-12-09", "2026-12-20", "2026-12-21", "2026-12-22"],
    gallery: [
      { index: 131, label: "Villa exterior", alt: "Red Sea garden villa", source: "/alpnile-stays-hotels-hero.webp" },
      { index: 132, label: "Pool day", alt: "Red Sea pool day", source: "/alpnile-hero-beach-3d-v2.webp" },
      { index: 133, label: "Sunset", alt: "Red Sea sunset", source: "/alpnile-hero-nile-sunset-3d-v2.webp" },
    ],
  },
  {
    slug: "riverside-suite",
    title: "Riverside Residence Suite",
    kind: "Hotel room",
    location: "Luxor, Egypt",
    rating: "4.8",
    reviews: 27,
    price: 190,
    guests: 3,
    bedrooms: 1,
    baths: 1,
    image: "/alpnile-hotel-luxor-riverside.webp",
    description: "A spacious river-facing suite for travelers who want a soft landing between ancient sites.",
    available: false,
    coordinates: { lat: 25.6872, lng: 32.6396 },
    mapLabel: "Luxor Corniche",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=25.6872%2C32.6396",
    activities: [
      { id: "riverside-felucca", icon: "boat", title: "Felucca at sunset", detail: "A private sail from the riverfront", duration: "2 hours", price: 30 },
      { id: "riverside-balloon", icon: "balloon", title: "Balloon over Luxor", detail: "A sunrise flight across the West Bank", duration: "3 hours", price: 75 },
      { id: "riverside-banana", icon: "sun", title: "Banana Island lunch", detail: "An easy island day with local food", duration: "Half day", price: 45 },
      { id: "riverside-temples", icon: "map", title: "Temple route", detail: "Karnak, Luxor and the stories between them", duration: "4 hours", price: 40 },
    ],
    blockedDates: ["2026-12-16", "2026-12-17", "2026-12-24"],
    gallery: [
      { index: 141, label: "Riverside suite", alt: "Luxor riverside suite", source: "/alpnile-hotel-luxor-riverside.webp" },
      { index: 142, label: "Evening river", alt: "Nile river evening", source: "/alpnile-tour-nile-sunset.webp" },
      { index: 143, label: "Historic stay", alt: "Luxor hotel detail", source: "/alpnile-hotel-al-moudira.webp" },
    ],
  },
];

const amenities = [
  { icon: "pool" as const, title: "Private pool", detail: "Entirely yours" },
  { icon: "wifi" as const, title: "Fast Wi-Fi", detail: "Work or stream" },
  { icon: "kitchen" as const, title: "Full kitchen", detail: "Cook and dine in" },
  { icon: "bed" as const, title: "2 bedrooms", detail: "Fresh linens" },
  { icon: "bath" as const, title: "2 bathrooms", detail: "Walk-in shower" },
  { icon: "lock" as const, title: "Private entrance", detail: "Self check-in ready" },
];

const extras = [
  { id: "transfer", label: "Airport transfer", detail: "Private arrival pickup", price: 35 },
  { id: "breakfast", label: "Breakfast basket", detail: "Local bread, fruit and coffee", price: 18 },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "arrow") return <svg {...common}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>;
  if (name === "balloon") return <svg {...common}><ellipse cx="12" cy="8.5" rx="6" ry="6.5" /><path d="M9.5 14.2 11 18h2l1.5-3.8M12 18v3M9 21h6" /></svg>;
  if (name === "bath") return <svg {...common}><path d="M4 11h16v4.5a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 15.5V11Z" /><path d="M6 11V6a2 2 0 0 1 3.7-1.1L11 7" /><path d="M5 20.5 4 22M19 20.5l1 1.5" /></svg>;
  if (name === "bed") return <svg {...common}><path d="M3 18v-8M3 17h18v4M21 18v-6.5a2.5 2.5 0 0 0-2.5-2.5H11v8" /><path d="M3 14h18M7 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>;
  if (name === "boat") return <svg {...common}><path d="M3 16h18l-2.5 4h-13L3 16Z" /><path d="M12 16V4M12 5h5l-5 5M5 21c2 .9 4 .9 6 0 2 .9 4 .9 6 0 1-.4 2-.5 3-.2" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" /></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12.5 4.2 4.2L19 7" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "heart") return <svg {...common}><path d="M20.5 8.8c0 5-8.5 10.2-8.5 10.2S3.5 13.8 3.5 8.8A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.5 2.3Z" /></svg>;
  if (name === "horse") return <svg {...common}><path d="M5 19v-5.5c0-2.3 1.8-4 4.2-4H14l2-3 3 2-1.4 3.1V19M8 19v2M16 19v2M5 13l-2 3h4M14 9l-1.5-3 2.3-2.5 2.2 2" /></svg>;
  if (name === "kitchen") return <svg {...common}><path d="M4 21V4h9v17M13 8h7v13M7 8h3M7 12h3M7 16h3M16 12h2M16 16h2" /></svg>;
  if (name === "lock") return <svg {...common}><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>;
  if (name === "map") return <svg {...common}><path d="m3.5 6 5.5-2 6 2 5.5-2v14l-5.5 2-6-2-5.5 2V6Z" /><path d="M9 4v14M15 6v14" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.4" /></svg>;
  if (name === "pool") return <svg {...common}><path d="M3.5 16c2.4 0 2.4 2 4.8 2s2.4-2 4.8-2 2.4 2 4.8 2 2.4-2 4.8-2M4 11h16M7 11V6h5v5M14 8h4" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.7" cy="10.7" r="6.5" /><path d="m16 16 4.2 4.2" /></svg>;
  if (name === "share") return <svg {...common}><circle cx="18" cy="5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="19" r="2.2" /><path d="m8 11 7.7-4.6M8 13l7.7 4.6" /></svg>;
  if (name === "star") return <svg {...common} fill="currentColor" stroke="none"><path d="m12 3 2.8 5.8 6.2.9-4.5 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.7l6.2-.9L12 3Z" /></svg>;
  if (name === "sun") return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (name === "users") return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0-1.7-5.5M16 14.5a5.5 5.5 0 0 1 4.5 5.5" /></svg>;
  return <svg {...common}><path d="M3 9a14 14 0 0 1 18 0M6 13a9.5 9.5 0 0 1 12 0M9.5 17a4.5 4.5 0 0 1 5 0M12 21h.01" /></svg>;
}

function ListingMark({ platform }: { platform: ExternalListing["platform"] }) {
  return <span className={`villa-listing-mark ${platform === "Airbnb" ? "airbnb" : "booking"}`} aria-hidden="true">{platform === "Airbnb" ? "A" : "B"}</span>;
}

function externalListingLinks(stay: StayCard): ExternalListing[] {
  const query = encodeURIComponent(`${stay.title}, ${stay.location}`);
  return [
    { platform: "Airbnb", href: `https://www.airbnb.com/s/${query}/homes` },
    { platform: "Booking.com", href: `https://www.booking.com/searchresults.html?ss=${query}` },
  ];
}

function dateInput(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthStart(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function calendarCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  return Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - mondayOffset + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? new Date(year, monthIndex, dayNumber) : null;
  });
}

function formatDate(value: string) {
  if (!value) return "Choose a date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T12:00:00`).getTime();
  const end = new Date(`${checkOut}T12:00:00`).getTime();
  return Math.max(0, Math.round((end - start) / 86400000));
}

function imagePath(image: GalleryImage, size: "desktop" | "tablet" | "mobile") {
  if (image.source) return image.source;
  return `/images/habu-sunset-villa/responsive/villa-${String(image.index).padStart(2, "0")}-${size}.webp`;
}

function ResponsiveImage({ image, priority = false }: { image: GalleryImage; priority?: boolean }) {
  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={imagePath(image, "mobile")} />
      <source media="(max-width: 1024px)" srcSet={imagePath(image, "tablet")} />
      <img src={imagePath(image, "desktop")} alt={image.alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} />
    </picture>
  );
}

function StayListingPage() {
  const searchParams = useSearchParams();
  const requestedDestination = normalizeDestinationId(searchParams.get("destination"));
  const requestedDestinationLabel = getDestinationLabel(requestedDestination);
  const requestedGuests = searchParams.get("guests");
  const [category, setCategory] = useState("All stays");
  const [destination, setDestination] = useState(requestedDestinationLabel);
  const [guests, setGuests] = useState(requestedGuests ? String(Math.max(1, Number.parseInt(requestedGuests, 10) || 1)) : "Any group size");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Recommended");

  useEffect(() => {
    if (requestedDestination) setDestination(requestedDestinationLabel);
    if (requestedGuests) setGuests(String(Math.max(1, Number.parseInt(requestedGuests, 10) || 1)));
  }, [requestedDestination, requestedDestinationLabel, requestedGuests]);

  const categories = ["All stays", "Homes", "Hotel rooms", "Apartments", "Villas"];
  const destinationOptions = ["Everywhere", "Giza", "Cairo", "Luxor", "Aswan", "Hurghada", "Marsa Alam", "Siwa", "Alexandria", "Fayoum", "Safaga", "Sharm El Sheikh"];
  const filteredStays = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const guestLimit = guests === "Any group size" ? 0 : Number(guests);
    const visible = catalogStays.filter((stay) => {
      const matchesCategory = category === "All stays" || stay.kind === category.slice(0, -1) || (category === "Homes" && stay.kind === "Home") || (category === "Hotel rooms" && stay.kind === "Hotel room");
      const matchesDestination = destination === "Everywhere" || stay.location.toLowerCase().includes(destination.toLowerCase());
      const matchesGuests = !guestLimit || stay.guests >= guestLimit;
      const matchesQuery = !normalizedQuery || `${stay.title} ${stay.kind} ${stay.location}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesDestination && matchesGuests && matchesQuery;
    });
    return [...visible].sort((a, b) => sort === "Price low to high" ? a.price - b.price : sort === "Top rated" ? Number(b.rating) - Number(a.rating) : Number(b.rating) - Number(a.rating) || b.reviews - a.reviews);
  }, [category, destination, guests, query, sort]);

  return (
    <main className="stays-catalog-page">
      <section className="stays-catalog-hero">
        <div className="stays-catalog-wrap">
          <div className="stays-catalog-hero-copy"><p className="stays-catalog-kicker">AlpNile / Stays</p><h1>Places to stay,<br /><em>chosen well.</em></h1><p>Private homes, thoughtful apartments and hotel rooms for the way you want to move through Egypt.</p></div>
          <div className="stays-catalog-hero-note"><span>01</span><p>Search one collection.<br />Arrive somewhere real.</p></div>
        </div>
        <div className="stays-catalog-wrap"><div className="stays-catalog-search"><label><span>Where</span><div><Icon name="pin" size={17} /><select value={destination} onChange={(event) => setDestination(event.target.value)}>{destinationOptions.map((option) => <option key={option}>{option}</option>)}</select></div></label><label><span>Guests</span><div><Icon name="users" size={17} /><select value={guests} onChange={(event) => setGuests(event.target.value)}><option>Any group size</option>{Array.from({ length: 12 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></div></label><label className="stays-catalog-search-field"><span>Search</span><div><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Villa, room or city" /></div></label><button type="button" onClick={() => document.getElementById("stays-catalog-results")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Explore stays <Icon name="arrow" size={16} /></button></div></div>
      </section>

      <div className="stays-catalog-wrap stays-catalog-body" id="stays-catalog-results">
        <div className="stays-catalog-toolbar"><div><p className="stays-catalog-kicker">A considered collection</p><h2>Find your place</h2></div><label className="stays-catalog-sort"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommended</option><option>Top rated</option><option>Price low to high</option></select></label></div>
        <div className="stays-catalog-categories" role="tablist" aria-label="Stay types">{categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {destination !== "Everywhere" && <div className="stays-route-context" role="status"><span>Route context</span><strong>{destination}</strong><small>Showing only stays connected to this destination and group size.</small><Link href={`/trip-planner?destination=${normalizeDestinationId(destination)}&travelers=${guests === "Any group size" ? 2 : guests}`}>Adjust the complete route <Icon name="arrow" size={13} /></Link></div>}
        <div className="stays-catalog-results-meta"><span>{filteredStays.length} stays found</span><span>Verified spaces · clear details · direct support</span></div>
        <section className="stays-catalog-grid" aria-label="Available stays">{filteredStays.map((stay, index) => <article className={`stay-catalog-card ${index === 0 ? "featured" : ""}`} key={stay.slug}><Link href={`/stays-hotels?stay=${stay.slug}`} className="stay-catalog-card-link"><div className="stays-catalog-media"><img src={stay.image} alt={stay.title} loading={index < 3 ? "eager" : "lazy"} /><span className="stay-catalog-type">{stay.kind}</span><span className={`stay-catalog-availability ${stay.available ? "live" : "soon"}`}>{stay.available ? "Live listing" : "Preview"}</span><span className="stay-catalog-card-arrow"><Icon name="arrow" size={17} /></span></div><div className="stay-catalog-card-content"><div className="stay-catalog-card-heading"><div><h3>{stay.title}</h3><p><Icon name="pin" size={13} /> {stay.location}</p></div><span className="stay-catalog-rating"><Icon name="star" size={12} /> {stay.rating}</span></div><p className="stay-catalog-description">{stay.description}</p><div className="stay-catalog-card-meta"><span>{stay.guests} guests</span><span>{stay.bedrooms} bedrooms</span><span>{stay.baths} baths</span></div><div className="stay-catalog-card-footer"><span><strong><LocalizedPrice amount={stay.price} /></strong> / night</span><span>View details <Icon name="arrow" size={13} /></span></div></div></Link></article>)}</section>
        {!filteredStays.length && <div className="stays-catalog-empty"><strong>No connected stay is live for this route yet.</strong><span>{destination !== "Everywhere" ? `We have not connected a live property in ${destination} for this group size. Our concierge can source one while keeping your route intact.` : "Try another city or broaden the group size."}</span>{destination !== "Everywhere" ? <Link href={`/trip-planner?destination=${normalizeDestinationId(destination)}&travelers=${guests === "Any group size" ? 2 : guests}`}>Ask the concierge to complete this route <Icon name="arrow" size={14} /></Link> : <button type="button" onClick={() => { setCategory("All stays"); setDestination("Everywhere"); setGuests("Any group size"); setQuery(""); }}>Clear filters</button>}</div>}
        <section className="stays-catalog-promise"><div><p className="stays-catalog-kicker">Why AlpNile</p><h2>Stay somewhere with a story.</h2></div><div className="stays-catalog-promise-grid"><div><span>01</span><strong>Real spaces</strong><p>Every listing is built around a real route, a real host or a real place we know.</p></div><div><span>02</span><strong>Clear before you arrive</strong><p>See the home, the room, the neighborhood and the next step before you request.</p></div><div><span>03</span><strong>Local support</strong><p>One team for the details that matter once your journey is underway.</p></div></div></section>
      </div>
    </main>
  );
}

function VillaDetailPage({ slug }: { slug: string }) {
  const activeStay = catalogStays.find((stay) => stay.slug === slug) ?? catalogStays[0];
  const { format } = useCurrency();
  const stayGallery = activeStay.gallery ?? galleryImages;
  const initialCheckIn = dateInput(14);
  const initialCheckOut = dateInput(17);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [calendarMonth, setCalendarMonth] = useState(() => monthStart(initialCheckIn));
  const [guests, setGuests] = useState(2);
  const [activeImage, setActiveImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [bookingReference, setBookingReference] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingSavedLocally, setBookingSavedLocally] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bookingExtras = [...extras, ...activeStay.activities.map((activity) => ({ id: activity.id, label: activity.title, detail: `${activity.duration} · ${activity.detail}`, price: activity.price }))];
  const externalListings = externalListingLinks(activeStay);
  const blockedDates = activeStay.blockedDates ?? [];

  useEffect(() => {
    const nextCheckIn = dateInput(14);
    setCheckIn(nextCheckIn);
    setCheckOut(dateInput(17));
    setCalendarMonth(monthStart(nextCheckIn));
    setSaved(window.localStorage.getItem(`alpnile-stay-saved-${activeStay.slug}`) === "true");
    setSavedLoaded(true);
  }, [activeStay.slug]);

  useEffect(() => {
    if (!savedLoaded) return;
    window.localStorage.setItem(`alpnile-stay-saved-${activeStay.slug}`, String(saved));
  }, [activeStay.slug, saved, savedLoaded]);

  useEffect(() => {
    if (!galleryOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGalleryOpen(false);
      if (event.key === "ArrowRight") setActiveImage((current) => (current + 1) % stayGallery.length);
      if (event.key === "ArrowLeft") setActiveImage((current) => (current - 1 + stayGallery.length) % stayGallery.length);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [galleryOpen, stayGallery.length]);

  const nights = nightsBetween(checkIn, checkOut);
  const nightlyRate = activeStay.price;
  const cleaningFee = 42;
  const serviceFee = Math.round((nightlyRate * Math.max(nights, 1)) * 0.08);
  const extrasTotal = selectedExtras.reduce((total, id) => total + (bookingExtras.find((extra) => extra.id === id)?.price ?? 0), 0);
  const total = nightlyRate * Math.max(nights, 1) + cleaningFee + serviceFee + extrasTotal;
  const invalidDates = Boolean(checkIn && checkOut && nights < 1);
  const activeGalleryImage = stayGallery[activeImage] ?? stayGallery[0];
  const visibleGallery = stayGallery.slice(0, 5);
  const todayKey = dateInput(0);
  const cells = calendarCells(calendarMonth);

  const selectCalendarDate = (value: string) => {
    if (value < todayKey || blockedDates.includes(value)) return;
    setBookingError("");
    if (!checkIn || checkOut) {
      setCheckIn(value);
      setCheckOut("");
      return;
    }
    if (value <= checkIn) {
      setCheckIn(value);
      setCheckOut("");
      return;
    }
    setCheckOut(value);
  };

  const moveCalendar = (offset: number) => {
    const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
    if (next < monthStart(todayKey)) return;
    setCalendarMonth(next);
  };

  const scrollToBooking = () => document.getElementById("villa-booking-card")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const continueToDetails = () => {
    setBookingError("");
    if (!checkIn || !checkOut) {
      setBookingError("Choose your check-in and check-out dates first.");
      return;
    }
    if (invalidDates) {
      setBookingError("Check-out must be after check-in.");
      return;
    }
    if (blockedDates.some((value) => value >= checkIn && value <= checkOut)) {
      setBookingError("One or more selected dates are already booked. Choose another range.");
      return;
    }
    setBookingStep(2);
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingError("");
    setBookingSavedLocally(false);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!name || !email || !phone) {
      setBookingError("Please complete your name, email and WhatsApp number.");
      setSubmitting(false);
      return;
    }
    const reference = `HABU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const result = await insertInquiry({ request_type: "stay", full_name: name, email, phone, message: `Booking request for ${activeStay.title} from ${checkIn} to ${checkOut}.`, details: { property: activeStay.title, checkIn, checkOut, guests, nights, extras: selectedExtras, total, reference }, source: activeStay.slug });
    try {
      window.localStorage.setItem(`alpnile-${activeStay.slug}-last-booking`, JSON.stringify({ reference, checkIn, checkOut, guests, total, name }));
    } catch {
      // The confirmation still explains the status when browser storage is unavailable.
    }
    setBookingReference(reference);
    setBookingSavedLocally(Boolean(result.error));
    setBookingMessage(result.error
      ? getSubmissionErrorMessage(result.error, "We couldn’t send this request. It is saved on this device as a draft, not confirmed with the AlpNile stays team.")
      : "Your request has been sent to the AlpNile stays team. We will confirm availability shortly.");
    setSubmitting(false);
  };

  return (
    <main className="villa-booking-page">
      <div className="villa-booking-topline"><div className="villa-booking-wrap villa-booking-topline-inner"><span><span className="villa-status-dot" /> {activeStay.title} · {activeStay.available ? "Live availability" : "Preview listing"}</span><span className="villa-topline-note"><Icon name="lock" size={12} /> Secure request · No payment required</span></div></div>
      <div className="villa-booking-wrap villa-booking-main">
        <nav className="villa-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/stays-hotels">Stays</Link><span>/</span><strong>{activeStay.title}</strong></nav>
        <section className="villa-heading-row"><div><p className="villa-eyebrow">{activeStay.kind} · {activeStay.location}</p><h1>{activeStay.title}</h1><div className="villa-heading-meta"><span className="villa-rating"><Icon name="star" size={14} /> {activeStay.rating}</span><span>Exceptional · {activeStay.reviews} reviews</span><span>·</span><span><Icon name="pin" size={14} /> {activeStay.location}</span></div></div><div className="villa-heading-actions"><button type="button" onClick={() => setSaved((value) => !value)} className={saved ? "is-saved" : ""}><Icon name="heart" size={17} /> {saved ? "Saved" : "Save"}</button><button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Icon name="share" size={17} /> Share</button></div></section>
        <section className="villa-gallery" aria-label={`${activeStay.title} photos`}><button type="button" className="villa-gallery-lead" onClick={() => { setActiveImage(0); setGalleryOpen(true); }} aria-label="Open photo gallery"><ResponsiveImage image={stayGallery[0]} priority /><span className="villa-gallery-label">{stayGallery[0].label}</span></button><div className="villa-gallery-grid">{visibleGallery.slice(1, 5).map((image) => <button type="button" key={image.index} onClick={() => { setActiveImage(stayGallery.findIndex((item) => item.index === image.index)); setGalleryOpen(true); }} aria-label={`Open ${image.label} photo`}><ResponsiveImage image={image} /><span>{image.label}</span></button>)}<button type="button" className="villa-gallery-all" onClick={() => { setActiveImage(0); setGalleryOpen(true); }}><ResponsiveImage image={visibleGallery[visibleGallery.length > 5 ? 5 : visibleGallery.length - 1]} /><span><Icon name="search" size={16} /> View all {stayGallery.length} photos</span></button></div></section>
        <div className="villa-content-grid"><div className="villa-detail-column">
          <section className="villa-intro-card"><div><p className="villa-eyebrow">{activeStay.kind} · Hosted by AlpNile</p><h2>{activeStay.description}</h2><p>See the space, choose your dates and send a direct request. The AlpNile team will confirm the home, the final total and the arrival details with you.</p><div className="villa-external-listings"><span className="villa-external-label">Find this stay on</span><div>{externalListings.map((listing) => <a key={listing.platform} href={listing.href} target="_blank" rel="noreferrer" aria-label={`Search ${activeStay.title} on ${listing.platform}`}><ListingMark platform={listing.platform} /><span>{listing.platform}</span><b aria-hidden="true">↗</b></a>)}</div><small>Search links open the matching property or area on the platform.</small></div></div><div className="villa-intro-facts"><div><strong>{activeStay.guests}</strong><span>guests</span></div><div><strong>{activeStay.bedrooms}</strong><span>bedrooms</span></div><div><strong>{activeStay.baths}</strong><span>baths</span></div></div></section>
          <section className="villa-section villa-amenities-section"><div className="villa-section-heading"><div><p className="villa-eyebrow">Everything you need</p><h2>Included with your stay</h2></div><span className="villa-section-count">6 comforts</span></div><div className="villa-amenities-grid">{amenities.map((amenity) => <div className="villa-amenity" key={amenity.title}><span className="villa-amenity-icon"><Icon name={amenity.icon} size={19} /></span><div><strong>{amenity.title}</strong><small>{amenity.detail}</small></div></div>)}</div></section>
          <section className="villa-section"><div className="villa-section-heading"><div><p className="villa-eyebrow">Sleep well</p><h2>Rooms & sleeping arrangements</h2></div></div><div className="villa-room-list"><article><div className="villa-room-media"><ResponsiveImage image={stayGallery[Math.min(1, stayGallery.length - 1)]} /></div><div><span className="villa-room-kicker">Room 01</span><h3>{activeStay.bedrooms > 1 ? "Light-filled bedroom" : "Quiet sleeping space"}</h3><p>Comfortable bedding, thoughtful storage and the details you need for an easy night.</p><div className="villa-room-tags"><span>{activeStay.bedrooms > 1 ? "Sleeping room" : "One bedroom"}</span><span>Fresh linens</span><span>Air conditioning</span></div></div></article><article><div className="villa-room-media"><ResponsiveImage image={stayGallery[Math.min(2, stayGallery.length - 1)]} /></div><div><span className="villa-room-kicker">Shared spaces</span><h3>Settle into the home</h3><p>A practical living area, local atmosphere and room to slow down between plans.</p><div className="villa-room-tags"><span>Living area</span><span>Kitchen access</span><span>Local support</span></div></div></article></div></section>
          <section className="villa-section villa-host-section"><div className="villa-host-avatar">A</div><div><p className="villa-eyebrow">Your stay, considered</p><h2>Hosted by the AlpNile team</h2><p>From first message to checkout, our local team helps with arrival planning, recommendations and the small details that make a private home feel effortless.</p><div className="villa-host-points"><span><Icon name="check" size={14} /> Fast replies</span><span><Icon name="check" size={14} /> Local support</span><span><Icon name="check" size={14} /> Flexible arrival help</span></div></div></section>
          <section className="villa-section villa-review-section"><div className="villa-section-heading"><div><p className="villa-eyebrow">Guest perspective</p><h2>What guests notice first</h2></div><div className="villa-review-score"><strong>{activeStay.rating}</strong><span><Icon name="star" size={13} /> Exceptional</span></div></div><div className="villa-review-grid"><blockquote><div className="villa-stars">★★★★★</div><p>“The space was clear, calm and easy to settle into. The AlpNile team made every arrival detail feel wonderfully simple.”</p><cite>— Sarah · United Kingdom</cite></blockquote><blockquote><div className="villa-stars">★★★★★</div><p>“Bright, thoughtful and exactly the kind of base we wanted between exploring and resting.”</p><cite>— Karim · France</cite></blockquote></div></section>
          <section className="villa-section villa-location-section"><div><p className="villa-eyebrow">The neighborhood</p><h2>Stay close to {activeStay.location.split(",")[0]}</h2><p>{activeStay.description} Use this stay as a calm base for local cafés, landmark walks and the next route along the Nile.</p><div className="villa-location-points"><span><Icon name="map" size={16} /> Local landmarks nearby</span><span><Icon name="pin" size={16} /> Map area · {activeStay.coordinates.lat.toFixed(4)}, {activeStay.coordinates.lng.toFixed(4)}</span></div></div><a className="villa-map-card" href={activeStay.mapsUrl} target="_blank" rel="noreferrer" aria-label={`Open ${activeStay.mapLabel} in Google Maps`}><div className="villa-map-grid" /><span><Icon name="pin" size={15} /> {activeStay.mapLabel}</span><strong>Open in Google Maps <span aria-hidden="true">↗</span></strong></a></section>
          <section className="villa-section villa-activities-section"><div className="villa-section-heading"><div><p className="villa-eyebrow">Local experiences · {activeStay.location}</p><h2>Make the stay yours</h2></div><span className="villa-section-count">{activeStay.activities.length} options</span></div><div className="villa-activities-grid">{activeStay.activities.map((activity) => <article className="villa-activity-card" key={activity.id}><span className="villa-activity-icon"><Icon name={activity.icon} size={19} /></span><div><span className="villa-activity-duration">{activity.duration}</span><h3>{activity.title}</h3><p>{activity.detail}</p></div><strong>From <LocalizedPrice amount={activity.price} /></strong></article>)}</div><p className="villa-activities-note">Add any experience to your request and the local AlpNile team will confirm availability with your stay.</p></section>
          <section className="villa-section villa-policy-section"><div><p className="villa-eyebrow">Good to know</p><h2>Before you book</h2></div><div className="villa-policies"><div><strong>Check-in</strong><span>From 15:00 · self check-in support available</span></div><div><strong>Check-out</strong><span>Before 11:00</span></div><div><strong>House rules</strong><span>No parties · no smoking indoors · quiet hours after 22:00</span></div><div><strong>Cancellation</strong><span>Flexible request review before confirmation</span></div></div></section>
        </div>
        <aside className="villa-booking-rail" id="villa-booking-card"><div className="villa-booking-card"><div className="villa-booking-card-head"><div><p className="villa-eyebrow">Book direct with AlpNile</p><h2>Make it yours</h2></div><div className="villa-price"><strong><LocalizedPrice amount={nightlyRate} /></strong><span>starting rate · per night</span></div></div><div className="villa-booking-steps"><span className={bookingStep === 1 ? "active" : "done"}><b>{bookingStep === 1 ? "1" : "✓"}</b> Dates</span><i /><span className={bookingStep === 2 ? "active" : ""}><b>2</b> Details</span></div>{bookingReference ? <div className="villa-booking-success"><span className="villa-success-icon"><Icon name={bookingSavedLocally ? "lock" : "check"} size={23} /></span><p className="villa-eyebrow">{bookingSavedLocally ? "Saved locally · not sent" : "Request received"}</p><h3>{bookingSavedLocally ? "Your request is ready to send." : "We&apos;re on it."}</h3><p>{bookingMessage}</p><div className="villa-reference"><span>Reference</span><strong>{bookingReference}</strong></div><div className="villa-success-summary"><span>{formatDate(checkIn)} → {formatDate(checkOut)}</span><span>{guests} guests · {nights} nights</span><strong><LocalizedPrice amount={total} /></strong></div><button type="button" className="villa-outline-button" onClick={() => { setBookingReference(""); setBookingStep(1); }}>Start another request</button></div> : <form onSubmit={submitBooking} className="villa-booking-form"><div className="villa-calendar-shell"><div className="villa-calendar-header"><button type="button" onClick={() => moveCalendar(-1)} disabled={calendarMonth <= monthStart(todayKey)} aria-label="Previous month">‹</button><strong>{calendarMonth.toLocaleDateString("en", { month: "long", year: "numeric" })}</strong><button type="button" onClick={() => moveCalendar(1)} aria-label="Next month">›</button></div><div className="villa-calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div><div className="villa-calendar-grid">{cells.map((day, index) => { if (!day) return <span className="villa-calendar-empty" key={`empty-${index}`} />; const value = dateKey(day); const isPast = value < todayKey; const isBlocked = blockedDates.includes(value); const isUnavailable = isPast || isBlocked; const isStart = value === checkIn; const isEnd = value === checkOut; const isRange = Boolean(checkIn && checkOut && value > checkIn && value < checkOut); return <button type="button" key={value} disabled={isUnavailable} className={[isStart ? "selected start" : "", isEnd ? "selected end" : "", isRange ? "in-range" : "", isPast ? "past" : "", isBlocked ? "blocked" : ""].filter(Boolean).join(" ")} onClick={() => selectCalendarDate(value)} aria-label={isBlocked ? `${formatDate(value)} · booked` : formatDate(value)} aria-pressed={isStart || isEnd}>{day.getDate()}</button>; })}</div><div className="villa-calendar-selection"><span><small>Check-in</small><strong>{formatDate(checkIn)}</strong></span><span><small>Check-out</small><strong>{formatDate(checkOut)}</strong></span></div><div className="villa-calendar-legend"><span><i className="available" /> Available</span><span><i className="booked" /> Booked</span></div></div><label className="villa-field"><span>Guests</span><div><Icon name="users" size={16} /><select value={guests} onChange={(event) => setGuests(Number(event.target.value))}><option value={1}>1 guest</option><option value={2}>2 guests</option><option value={3}>3 guests</option><option value={4}>4 guests</option></select></div></label>{bookingStep === 2 && <div className="villa-contact-fields"><label className="villa-field"><span>Full name</span><input name="name" placeholder="Your name" required /></label><label className="villa-field"><span>Email address</span><input name="email" type="email" placeholder="you@example.com" required /></label><label className="villa-field"><span>WhatsApp number</span><input name="phone" placeholder="+20 ..." required /></label></div>}<div className="villa-extras"><div className="villa-form-label">Optional add-ons &amp; local experiences</div>{bookingExtras.map((extra) => <label className={`villa-extra ${selectedExtras.includes(extra.id) ? "selected" : ""}`} key={extra.id}><input type="checkbox" checked={selectedExtras.includes(extra.id)} onChange={() => setSelectedExtras((items) => items.includes(extra.id) ? items.filter((item) => item !== extra.id) : [...items, extra.id])} /><span><strong>{extra.label}</strong><small>{extra.detail}</small></span><b>+<LocalizedPrice amount={extra.price} /></b></label>)}</div>{bookingError && <p className="villa-booking-error" role="alert">{bookingError}</p>}{bookingStep === 1 ? <button type="button" className="villa-primary-button" onClick={continueToDetails}>Continue with dates <Icon name="arrow" size={16} /></button> : <button type="submit" className="villa-primary-button" disabled={submitting}>{submitting ? "Sending request…" : "Request to book"} <Icon name="arrow" size={16} /></button>}<p className="villa-booking-note"><Icon name="lock" size={13} /> You won&apos;t be charged. We confirm the home and final total with you.</p><div className="villa-total-box"><div><span>{format(nightlyRate)} × {Math.max(nights, 1)} nights</span><strong><LocalizedPrice amount={nightlyRate * Math.max(nights, 1)} /></strong></div><div><span>Cleaning fee</span><strong><LocalizedPrice amount={cleaningFee} /></strong></div><div><span>Service fee</span><strong><LocalizedPrice amount={serviceFee} /></strong></div>{extrasTotal > 0 && <div><span>Add-ons</span><strong><LocalizedPrice amount={extrasTotal} /></strong></div>}<div className="total"><span>Total before confirmation</span><strong><LocalizedPrice amount={total} /></strong></div></div></form>}<div className="villa-booking-trust"><span><Icon name="check" size={15} /></span><p><strong>Direct support</strong><small>One local team for your arrival, stay and questions.</small></p></div></div></aside>
        </div>
      </div>
      <div className="villa-mobile-cta"><div><strong><LocalizedPrice amount={nightlyRate} /></strong><span>per night</span></div><button type="button" onClick={scrollToBooking}>Check availability <Icon name="arrow" size={15} /></button></div>
      {galleryOpen && <div className="villa-lightbox" role="dialog" aria-modal="true" aria-label={`${activeStay.title} photo gallery`} onMouseDown={() => setGalleryOpen(false)}><div className="villa-lightbox-inner" onMouseDown={(event) => event.stopPropagation()}><div className="villa-lightbox-head"><div><span className="villa-eyebrow">{activeStay.title}</span><strong>{activeImage + 1} <em>/</em> {stayGallery.length}</strong></div><button type="button" onClick={() => setGalleryOpen(false)} aria-label="Close photo gallery"><Icon name="close" size={20} /></button></div><div className="villa-lightbox-stage"><button type="button" className="villa-lightbox-arrow previous" onClick={() => setActiveImage((current) => (current - 1 + stayGallery.length) % stayGallery.length)} aria-label="Previous photo">‹</button><ResponsiveImage image={activeGalleryImage} priority /><button type="button" className="villa-lightbox-arrow next" onClick={() => setActiveImage((current) => (current + 1) % stayGallery.length)} aria-label="Next photo">›</button></div><div className="villa-lightbox-caption"><span>{activeGalleryImage.label}</span><span>Use ← → to browse</span></div><div className="villa-lightbox-thumbs">{stayGallery.map((image, index) => <button type="button" key={image.index} className={index === activeImage ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`Show ${image.label}`}><ResponsiveImage image={image} /></button>)}</div></div></div>}
    </main>
  );
}

export default function StaysHotelsPage() {
  const searchParams = useSearchParams();
  const staySlug = searchParams.get("stay");
  return staySlug ? <VillaDetailPage slug={staySlug} /> : <StayListingPage />;
}
