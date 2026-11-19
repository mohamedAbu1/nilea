"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type IconName = "calendar" | "chevron" | "sun" | "culture" | "adventure" | "luxury" | "family" | "sparkle" | "bookmark" | "share" | "plus" | "arrow" | "route" | "compass" | "clock" | "car" | "guide" | "utensils" | "accessibility" | "paw" | "users" | "check" | "minus";
type TravelStyle = "Culture" | "Adventure" | "Luxury" | "Family";
type PlannerStep = 1 | 2 | 3;

type Landmark = { id: string; title: string; meta: string; description: string; image: string };
type Experience = { id: string; title: string; meta: string; description: string; duration: string; price: number; image: string };
type Destination = { id: string; name: string; region: string; summary: string; image: string; landmarks: Landmark[]; experiences: Experience[] };
type DayPlan = { destinationId: string; landmarkIds: string[]; landmarkTimes: Record<string, string>; experienceIds: string[]; experienceTimes: Record<string, string>; guideId: string; vehicleId: string };

const travelStyles: { label: TravelStyle; detail: string; icon: IconName }[] = [
  { label: "Culture", detail: "History, art & local stories", icon: "culture" },
  { label: "Adventure", detail: "Water, desert & open air", icon: "adventure" },
  { label: "Luxury", detail: "Private, polished & unhurried", icon: "luxury" },
  { label: "Family", detail: "Easy pace for every age", icon: "family" },
];

const guideOptions = [
  { id: "local", title: "Local host", meta: "Warm stories from someone who lives here", price: 35, icon: "guide" as IconName },
  { id: "expert", title: "Egyptologist", meta: "Deep context at every major site", price: 80, icon: "culture" as IconName },
  { id: "private", title: "Private concierge", meta: "A flexible guide who follows your rhythm", price: 120, icon: "sparkle" as IconName },
];

const vehicleOptions = [
  { id: "sedan", title: "Private sedan", meta: "Comfortable for 1–3 guests", price: 55, icon: "car" as IconName },
  { id: "van", title: "Executive van", meta: "Room for 4–7 guests and luggage", price: 90, icon: "users" as IconName },
  { id: "accessible", title: "Accessible van", meta: "Easy boarding and extra space", price: 110, icon: "accessibility" as IconName },
];

const destinations: Destination[] = [
  {
    id: "giza", name: "Giza", region: "Greater Cairo", summary: "Pyramids, ancient wonders and an unforgettable first morning.", image: "/alpnile-destination-cairo.webp",
    landmarks: [
      { id: "pyramids", title: "Pyramids of Giza", meta: "Signature · 2–3 hours", description: "Walk through the plateau with time for the best viewpoints and quiet corners.", image: "/alpnile-destination-cairo.webp" },
      { id: "sphinx", title: "The Sphinx", meta: "Ancient landmark · 1 hour", description: "A calm visit to the guardian of the plateau before the crowds arrive.", image: "/alpnile-destination-cairo.webp" },
      { id: "grand-museum", title: "Grand Egyptian Museum", meta: "Museum · 2–3 hours", description: "A spacious introduction to Egypt’s objects, dynasties and visual language.", image: "/trips/grand-museum-giza-from-marsa-alam.png" },
    ],
    experiences: [
      { id: "sunrise-pyramids", title: "Sunrise at the pyramids", meta: "Early start · Private entry planning", description: "Begin before the heat with a considered route around the plateau.", duration: "3h", price: 70, image: "/alpnile-destination-cairo.webp" },
      { id: "cairo-food", title: "Old Cairo food walk", meta: "Local life · Tastings included", description: "Small bites, family kitchens and stories from the old lanes.", duration: "3h", price: 55, image: "/trips/curated-cairo-food-walk.png" },
    ],
  },
  {
    id: "cairo", name: "Cairo", region: "The capital", summary: "Museums, old streets and the energy of modern Egypt.", image: "/alpnile-destination-cairo.webp",
    landmarks: [
      { id: "islamic-cairo", title: "Islamic Cairo", meta: "Heritage walk · 2 hours", description: "A hand-picked route through mosques, courtyards and historic craft streets.", image: "/trips/added/islamic-cairo-al-muizz-and-khan-el-khalili-evening.png" },
      { id: "khan-el-khalili", title: "Khan el-Khalili", meta: "Market · 1–2 hours", description: "Choose a slower market walk with time for coffee and small finds.", image: "/alpnile-near-khan-market.webp" },
      { id: "civilization-museum", title: "Civilization Museum", meta: "Museum · 2 hours", description: "A clear, atmospheric journey through Egypt’s long human story.", image: "/trips/added/coptic-cairo-national-civilization-museum.png" },
    ],
    experiences: [
      { id: "cairo-food", title: "Cairo food walk", meta: "Local life · Tastings included", description: "A relaxed tasting route with the places locals actually return to.", duration: "3h", price: 55, image: "/trips/curated-cairo-food-walk.png" },
      { id: "night-at-temple", title: "Night at the temple", meta: "Evening · Light and sound", description: "Keep the evening open for a cinematic after-dark visit.", duration: "2h", price: 48, image: "/trips/curated-night-at-the-temple.png" },
    ],
  },
  {
    id: "luxor", name: "Luxor", region: "The West & East Bank", summary: "Temples, tombs and the stories that made the Nile eternal.", image: "/alpnile-destination-luxor.webp",
    landmarks: [
      { id: "karnak", title: "Karnak Temple", meta: "Temple complex · 2 hours", description: "Use an expert route through the columns, sanctuary and sacred lake.", image: "/alpnile-destination-luxor.webp" },
      { id: "valley-kings", title: "Valley of the Kings", meta: "Royal tombs · 2–3 hours", description: "Select the right tombs for your pace rather than rushing through them all.", image: "/trips/valley-of-the-kings-and-hatshepsut-temple-with-felucca-experience-from-luxor.png" },
      { id: "medinat-habu", title: "Medinat Habu", meta: "Temple · 1 hour", description: "A quieter West Bank stop with vivid reliefs and generous space.", image: "/trips/tour-of-valley-of-the-nobles-medinat-habu-and-the-ramesseum-from-luxor.png" },
    ],
    experiences: [
      { id: "hot-air-balloon", title: "Hot-air balloon at sunrise", meta: "Signature · West Bank views", description: "See the river and temples wake up from above.", duration: "3h", price: 120, image: "/trips/hot-air-balloon-experience-from-luxor-hotels-and-nile-cruises.png" },
      { id: "felucca-sunset", title: "Sunset felucca sail", meta: "Nile time · Golden hour", description: "A quiet sail with tea, river light and no fixed agenda.", duration: "2h", price: 65, image: "/alpnile-tour-nile-sunset.webp" },
    ],
  },
  {
    id: "aswan", name: "Aswan", region: "Nubia & the Nile", summary: "Warm light, Nubian hospitality and the river at its most generous.", image: "/alpnile-destination-abu-simbel.webp",
    landmarks: [
      { id: "philae", title: "Philae Temple", meta: "Island temple · 2 hours", description: "Arrive by boat and let the island reveal itself at an easy pace.", image: "/trips/added/aswan-philae-high-dam-and-nubian-village.png" },
      { id: "nubian-village", title: "Nubian village", meta: "Local life · 2 hours", description: "A respectful, hosted visit with time for tea and conversation.", image: "/trips/added/aswan-philae-high-dam-and-nubian-village.png" },
      { id: "abu-simbel", title: "Abu Simbel", meta: "Day trip · 4–5 hours", description: "A well-paced private transfer to one of Egypt’s great southern monuments.", image: "/trips/abu-simbel-day-trip-from-aswan-round-trip-by-car.png" },
    ],
    experiences: [
      { id: "nubian-lunch", title: "Nubian lunch by the river", meta: "Food · Hosted table", description: "A generous meal with the color and welcome of southern Egypt.", duration: "2h", price: 45, image: "/trips/added/aswan-philae-high-dam-and-nubian-village.png" },
      { id: "felucca-sunset", title: "Sunset felucca sail", meta: "Nile time · Golden hour", description: "Float past the islands as the temperature softens.", duration: "2h", price: 65, image: "/alpnile-tour-nile-sunset.webp" },
    ],
  },
  {
    id: "hurghada", name: "Hurghada", region: "Red Sea coast", summary: "Clear water, soft sand and an easy day between city and sea.", image: "/alpnile-destination-hurghada-v2.webp",
    landmarks: [
      { id: "giftun", title: "Giftun Island", meta: "Sea day · Full day", description: "A flexible boat day for swimming, snorkeling and an unhurried lunch.", image: "/trips/added/hurghada-giftun-islands-snorkeling-day.png" },
      { id: "coral-garden", title: "Red Sea coral garden", meta: "Snorkeling · 3 hours", description: "A calm water experience with equipment and a local sea guide.", image: "/trips/curated-red-sea-coral-garden.png" },
      { id: "hurghada-city", title: "Hurghada city life", meta: "City walk · 2 hours", description: "A short route through local cafés, markets and waterfront light.", image: "/trips/hurghada-city-local-life.png" },
    ],
    experiences: [
      { id: "giftun-snorkel", title: "Giftun snorkeling cruise", meta: "Sea day · Lunch included", description: "A simple, bright day on the water with room to choose your pace.", duration: "6h", price: 95, image: "/trips/added/hurghada-giftun-islands-snorkeling-day.png" },
      { id: "desert-safari", title: "Desert safari & camel ride", meta: "Adventure · Sunset", description: "Trade the coast for open desert, a short ride and Bedouin tea.", duration: "5h", price: 80, image: "/trips/super-4x4-safari-with-sand-buggies-camel-ride-in-marsa-alam.png" },
    ],
  },
  {
    id: "marsa-alam", name: "Marsa Alam", region: "Wild Red Sea", summary: "Quiet coastlines, reef mornings and a little more space.", image: "/alpnile-destination-hurghada-v2.webp",
    landmarks: [
      { id: "wild-coast", title: "Wild Red Sea coast", meta: "Nature · Half day", description: "A low-key coastline route away from the busiest resorts.", image: "/trips/curated-marsa-alam-wild-coast.png" },
      { id: "coral-garden", title: "Coral garden", meta: "Snorkeling · 3 hours", description: "Clear water and a gentle reef route with a local sea guide.", image: "/trips/curated-marsa-alam-nature-trail.png" },
      { id: "wadi-el-gemal", title: "Wadi El Gemal", meta: "National park · Full day", description: "Desert, mangroves and coastline in one beautifully varied day.", image: "/trips/curated-marsa-alam-nature-trail.png" },
    ],
    experiences: [
      { id: "nature-trail", title: "Marsa Alam nature trail", meta: "Nature · Small group", description: "A slower land route for wildlife, desert textures and wide views.", duration: "5h", price: 75, image: "/trips/curated-marsa-alam-nature-trail.png" },
      { id: "quad-camel", title: "Quad bikes & camel ride", meta: "Adventure · Desert", description: "A more energetic desert chapter with a sunset finish.", duration: "5h", price: 88, image: "/trips/super-4x4-safari-with-sand-buggies-camel-ride-in-marsa-alam.png" },
    ],
  },
  {
    id: "siwa", name: "Siwa", region: "Western Desert", summary: "Salt lakes, palms and the kind of quiet you remember.", image: "/alpnile-destination-siwa.webp",
    landmarks: [
      { id: "salt-lakes", title: "Siwa salt lakes", meta: "Nature · 2 hours", description: "A restorative float and a wide-open desert horizon.", image: "/trips/added/siwa-oasis-salt-lakes-and-great-sand-sea.png" },
      { id: "shali", title: "Shali Fortress", meta: "Heritage · 1 hour", description: "Walk through the old mud-brick heart of the oasis.", image: "/trips/added/siwa-oasis-salt-lakes-and-great-sand-sea.png" },
      { id: "great-sand-sea", title: "Great Sand Sea", meta: "Desert · Sunset", description: "Dunes, tea and a final light show made by the landscape itself.", image: "/trips/added/siwa-oasis-salt-lakes-and-great-sand-sea.png" },
    ],
    experiences: [
      { id: "salt-lake-float", title: "Salt lake float", meta: "Wellness · Gentle pace", description: "A quiet reset in the mineral-rich lakes beyond the oasis.", duration: "3h", price: 52, image: "/trips/added/siwa-oasis-salt-lakes-and-great-sand-sea.png" },
      { id: "desert-safari", title: "Great Sand Sea safari", meta: "Adventure · Sunset", description: "A golden desert run with a simple camp-style dinner.", duration: "5h", price: 90, image: "/trips/added/siwa-oasis-salt-lakes-and-great-sand-sea.png" },
    ],
  },
  {
    id: "alexandria", name: "Alexandria", region: "Mediterranean coast", summary: "Sea air, layered history and an elegant change of rhythm.", image: "/alpnile-destination-alexandria.webp",
    landmarks: [
      { id: "bibliotheca", title: "Bibliotheca Alexandrina", meta: "Culture · 2 hours", description: "A clean, thoughtful museum and library stop by the sea.", image: "/alpnile-destination-alexandria.webp" },
      { id: "catacombs", title: "Catacombs of Kom El Shoqafa", meta: "Ancient · 1 hour", description: "A compact underground story where cultures meet.", image: "/alpnile-destination-alexandria.webp" },
      { id: "corniche", title: "Corniche & seafood", meta: "Local life · 2 hours", description: "Keep the afternoon open for the waterfront and a long lunch.", image: "/alpnile-destination-alexandria.webp" },
    ],
    experiences: [
      { id: "alexandria-food", title: "Mediterranean food route", meta: "Food · Local tables", description: "Fresh seafood, bakeries and small places with a sea view.", duration: "3h", price: 60, image: "/trips/one-day-alexandria-trip-from-cairo.png" },
      { id: "coastal-day", title: "Alexandria day escape", meta: "Culture · Private route", description: "A flexible day linking the city’s most atmospheric chapters.", duration: "6h", price: 95, image: "/trips/one-day-alexandria-trip-from-cairo.png" },
    ],
  },
  {
    id: "abu-simbel", name: "Abu Simbel", region: "Lake Nasser", summary: "Monumental temples, quiet roads and a powerful southern finale.", image: "/alpnile-destination-abu-simbel.webp",
    landmarks: [
      { id: "great-temple", title: "Great Temple of Ramses II", meta: "Signature · 2 hours", description: "Leave time to understand the scale, alignment and story of the temple.", image: "/alpnile-destination-abu-simbel.webp" },
      { id: "small-temple", title: "Temple of Nefertari", meta: "Temple · 1 hour", description: "The smaller temple carries some of the most intimate reliefs in Egypt.", image: "/alpnile-destination-abu-simbel.webp" },
      { id: "lake-nasser", title: "Lake Nasser outlook", meta: "Landscape · 1 hour", description: "A quiet pause beside the water before the return journey.", image: "/trips/added/abu-simbel-sunrise-and-lake-nasser.png" },
    ],
    experiences: [
      { id: "abu-simbel-sunrise", title: "Abu Simbel sunrise", meta: "Signature · Early entry", description: "Reach the temples in the softer light and leave space for the drive back.", duration: "7h", price: 135, image: "/trips/added/abu-simbel-sunrise-and-lake-nasser.png" },
      { id: "lake-nasser-cruise", title: "Lake Nasser by boat", meta: "Water · Slow travel", description: "A different view of the southern landscape from the water.", duration: "4h", price: 105, image: "/trips/lake-nasser-abu-simbel-cruise.png" },
    ],
  },
];

const defaultDestinationIds = ["giza", "luxor", "aswan", "cairo"];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className: `inline-ui-icon inline-ui-${name}` };
  switch (name) {
    case "calendar": return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></svg>;
    case "chevron": return <svg {...common}><path d="m7 9 5 5 5-5" /></svg>;
    case "culture": return <svg {...common}><path d="M4 20h16M5 20V9h14v11M3 9h18M6 6l6-3 6 3v3H6V6ZM8 13v4M12 13v4M16 13v4" /></svg>;
    case "adventure": return <svg {...common}><path d="m4 18 7-12 5 7 4-5" /><path d="M4 18h4M16 13h4" /></svg>;
    case "luxury": return <svg {...common}><path d="M5 8h14l-1 11H6L5 8Z" /><path d="M8 8a4 4 0 0 1 8 0M9 12h.01M15 12h.01" /></svg>;
    case "family": return <svg {...common}><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="8" r="2.5" /><path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0" /></svg>;
    case "sparkle": return <svg {...common}><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>;
    case "bookmark": return <svg {...common}><path d="M6 4h12v16l-6-3-6 3V4Z" /></svg>;
    case "share": return <svg {...common}><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></svg>;
    case "plus": return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "minus": return <svg {...common}><path d="M5 12h14" /></svg>;
    case "arrow": return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
    case "route": return <svg {...common}><circle cx="6" cy="17" r="2" /><circle cx="18" cy="7" r="2" /><path d="M8 17c5 0 2-8 8-10" /></svg>;
    case "compass": return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m14.5 9.5-2 4-4 2 2-4 4-2ZM12 4v2M12 18v2M4 12h2M18 12h2" /></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></svg>;
    case "car": return <svg {...common}><path d="m5 16 1.5-6h11L19 16M4 16h16v3H4zM7 19v2M17 19v2M7 14h.01M17 14h.01" /></svg>;
    case "guide": return <svg {...common}><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0M9 4.5c.7-1 1.7-1.5 3-1.5s2.3.5 3 1.5" /></svg>;
    case "utensils": return <svg {...common}><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c2 2 3 4 3 6h-3" /></svg>;
    case "accessibility": return <svg {...common}><circle cx="12" cy="4" r="2" /><path d="M5 8h14M12 8v6M8 21l4-7 4 7M8 12l-3 5M16 12l3 5" /></svg>;
    case "paw": return <svg {...common}><circle cx="7" cy="8" r="2" /><circle cx="17" cy="8" r="2" /><circle cx="5" cy="13" r="1.7" /><circle cx="19" cy="13" r="1.7" /><path d="M8 16c1.5-2 6.5-2 8 0 1.5 2-.5 5-4 5s-5.5-3-4-5Z" /></svg>;
    case "users": return <svg {...common}><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="8" r="2.5" /><path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0" /></svg>;
    case "check": return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    default: return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

function createDayPlan(destinationId: string): DayPlan {
  const destination = destinations.find((item) => item.id === destinationId) ?? destinations[0];
  return { destinationId: destination.id, landmarkIds: [destination.landmarks[0].id], landmarkTimes: { [destination.landmarks[0].id]: "09:00" }, experienceIds: [], experienceTimes: {}, guideId: "local", vehicleId: "sedan" };
}

function formatDate(value: string) {
  if (!value) return "Choose a start date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export default function TripPlannerPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<PlannerStep>(1);
  const [duration, setDuration] = useState(4);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle>("Culture");
  const [budget, setBudget] = useState(1500);
  const [travelers, setTravelers] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [food, setFood] = useState("local");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);
  const [pets, setPets] = useState(false);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(() => defaultDestinationIds.map(createDayPlan));
  const [journeyBuilt, setJourneyBuilt] = useState(false);
  const [notice, setNotice] = useState("");

  const currentPlan = dayPlans[selectedDay - 1] ?? createDayPlan("giza");
  const currentDestination = destinations.find((item) => item.id === currentPlan.destinationId) ?? destinations[0];
  const plannedDays = dayPlans.slice(0, duration);
  const selectedLandmarks = currentDestination.landmarks.filter((item) => currentPlan.landmarkIds.includes(item.id));
  const selectedExperiences = currentDestination.experiences.filter((item) => currentPlan.experienceIds.includes(item.id));
  const itineraryCount = plannedDays.reduce((total, plan) => total + plan.landmarkIds.length + plan.experienceIds.length, 0);

  const estimatedTotal = useMemo(() => {
    const guideTotal = plannedDays.reduce((total, plan) => total + (guideOptions.find((option) => option.id === plan.guideId)?.price ?? 0), 0);
    const vehicleTotal = plannedDays.reduce((total, plan) => total + (vehicleOptions.find((option) => option.id === plan.vehicleId)?.price ?? 0), 0);
    const experiencesTotal = plannedDays.reduce((total, plan) => {
      const destination = destinations.find((item) => item.id === plan.destinationId) ?? destinations[0];
      return total + plan.experienceIds.reduce((sum, id) => sum + (destination.experiences.find((experience) => experience.id === id)?.price ?? 0), 0);
    }, 0);
    return Math.round((guideTotal + vehicleTotal + experiencesTotal + (food === "private" ? duration * 32 : food === "vegetarian" ? duration * 8 : 0)) * Math.max(1, travelers / 2));
  }, [duration, food, plannedDays, travelers]);

  const updateCurrentPlan = (updater: (plan: DayPlan) => DayPlan) => {
    setDayPlans((plans) => plans.map((plan, index) => index === selectedDay - 1 ? updater(plan) : plan));
    setJourneyBuilt(false);
  };

  const flashNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  useEffect(() => {
    const requestedDestination = searchParams.get("destination");
    if (!requestedDestination) return;
    const destinationId = destinations.some((item) => item.id === requestedDestination) ? requestedDestination : destinations.find((item) => item.name.toLowerCase() === requestedDestination.toLowerCase())?.id;
    if (destinationId) setDayPlans((plans) => plans.map((plan, index) => index === 0 ? createDayPlan(destinationId) : plan));
  }, [searchParams]);

  const changeDuration = (value: number) => {
    setDuration(value);
    setDayPlans((plans) => value <= plans.length ? plans.slice(0, value) : [...plans, ...Array.from({ length: value - plans.length }, (_, index) => createDayPlan(destinations[(plans.length + index) % destinations.length].id))]);
    setSelectedDay((day) => Math.min(day, value));
    setJourneyBuilt(false);
  };

  const chooseDestination = (destinationId: string) => {
    updateCurrentPlan(() => createDayPlan(destinationId));
    flashNotice(`${destinations.find((item) => item.id === destinationId)?.name} is ready for Day ${selectedDay}.`);
  };

  const toggleLandmark = (id: string) => updateCurrentPlan((plan) => {
    const selected = plan.landmarkIds.includes(id);
    const landmarkIds = selected ? plan.landmarkIds.filter((item) => item !== id) : [...plan.landmarkIds, id];
    const landmarkTimes = selected ? Object.fromEntries(Object.entries(plan.landmarkTimes).filter(([key]) => key !== id)) : { ...plan.landmarkTimes, [id]: "09:00" };
    return { ...plan, landmarkIds, landmarkTimes };
  });

  const toggleExperience = (id: string) => updateCurrentPlan((plan) => {
    const selected = plan.experienceIds.includes(id);
    const experienceIds = selected ? plan.experienceIds.filter((item) => item !== id) : [...plan.experienceIds, id];
    const experienceTimes = selected ? Object.fromEntries(Object.entries(plan.experienceTimes).filter(([key]) => key !== id)) : { ...plan.experienceTimes, [id]: "14:00" };
    return { ...plan, experienceIds, experienceTimes };
  });

  const setTime = (kind: "landmarkTimes" | "experienceTimes", id: string, time: string) => updateCurrentPlan((plan) => ({ ...plan, [kind]: { ...plan[kind], [id]: time } }));

  const saveItinerary = () => {
    window.localStorage.setItem("alpnile-smart-itinerary", JSON.stringify({ duration, selectedStyle, budget, travelers, startDate, food, accessibilityNeeds, pets, dayPlans: plannedDays }));
    flashNotice("Your plan is saved on this device.");
  };

  const shareTrip = async () => {
    const shareUrl = `${window.location.origin}/trip-planner?days=${duration}&destination=${plannedDays[0]?.destinationId ?? "giza"}`;
    try {
      if (typeof navigator.share === "function") await navigator.share({ title: "My AlpNile itinerary", text: `${duration}-day Egypt journey`, url: shareUrl });
      else await navigator.clipboard.writeText(shareUrl);
      flashNotice("Your itinerary link is ready to share.");
    } catch {
      flashNotice("Sharing was cancelled.");
    }
  };

  const buildJourney = () => {
    saveItinerary();
    setJourneyBuilt(true);
    flashNotice("Your personalized journey is ready.");
  };

  return (
    <main className="smart-planner-shell">
      <div className="smart-planner-page">
        <section className="smart-planner-hero">
          <div className="smart-planner-hero-copy"><p className="smart-planner-eyebrow"><Icon name="compass" size={14} /> Smart Guide · Your route, your rhythm</p><h1>Build Egypt<br /><em>your way.</em></h1><p>Choose the days, places and little details that matter to you. We will shape them into one clear, beautiful route.</p></div>
          <div className="smart-planner-hero-art" aria-hidden="true"><span className="smart-planner-sun" /><span className="smart-planner-river" /><span className="smart-planner-palm palm-one" /><span className="smart-planner-palm palm-two" /><span className="smart-planner-hero-stamp">ALPNILE<br /><small>CURATED ROUTES</small></span></div>
        </section>

        <section className="smart-planner-progress" aria-label="Trip planning steps">{[{ id: 1 as PlannerStep, label: "Trip basics", detail: "How long and what mood" }, { id: 2 as PlannerStep, label: "Shape each day", detail: "Places, times and people" }, { id: 3 as PlannerStep, label: "Your preferences", detail: "Food, access and final review" }].map((item) => <button key={item.id} type="button" className={step === item.id ? "active" : step > item.id ? "complete" : ""} onClick={() => setStep(item.id)}><span>{step > item.id ? <Icon name="check" size={15} /> : `0${item.id}`}</span><strong>{item.label}</strong><small>{item.detail}</small></button>)}</section>

        {step === 1 && <section className="smart-planner-step smart-basics-step" aria-labelledby="basics-title"><div className="smart-step-heading"><div><p className="smart-planner-eyebrow">01 · Start with the shape</p><h2 id="basics-title">How should your journey feel?</h2><p>Start broad. We will turn your answers into a route you can refine day by day.</p></div><span className="smart-step-counter">{duration} days · {travelers} travelers</span></div><div className="smart-basics-grid"><div className="smart-basics-main"><div className="smart-field-block"><div className="smart-field-heading"><span>Trip length</span><small>Select the number of days</small></div><div className="duration-picker">{Array.from({ length: 9 }, (_, index) => index + 2).map((value) => <button key={value} type="button" className={duration === value ? "active" : ""} onClick={() => changeDuration(value)} aria-pressed={duration === value}><strong>{value}</strong><small>days</small></button>)}</div></div><div className="smart-field-block"><div className="smart-field-heading"><span>Travel mood</span><small>We use this to tune the suggestions</small></div><div className="mood-grid">{travelStyles.map((style) => <button key={style.label} type="button" className={selectedStyle === style.label ? "active" : ""} onClick={() => { setSelectedStyle(style.label); setJourneyBuilt(false); }}><span className="smart-option-icon"><Icon name={style.icon} size={20} /></span><strong>{style.label}</strong><small>{style.detail}</small>{selectedStyle === style.label && <span className="smart-selected-dot"><Icon name="check" size={12} /></span>}</button>)}</div></div></div><aside className="smart-basics-side"><div className="smart-side-card"><span className="smart-side-icon"><Icon name="calendar" size={20} /></span><div><label htmlFor="trip-start-date">When do you want to start?</label><input id="trip-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /><small>{formatDate(startDate)}</small></div></div><div className="smart-side-card"><span className="smart-side-icon"><Icon name="users" size={20} /></span><div><span className="smart-side-label">Travelers</span><div className="number-stepper"><button type="button" onClick={() => setTravelers((value) => Math.max(1, value - 1))} aria-label="Remove traveler"><Icon name="minus" size={15} /></button><strong>{travelers} {travelers === 1 ? "guest" : "guests"}</strong><button type="button" onClick={() => setTravelers((value) => Math.min(12, value + 1))} aria-label="Add traveler"><Icon name="plus" size={15} /></button></div></div></div><div className="smart-side-card budget-card"><div className="smart-budget-top"><span>Comfort budget</span><strong>${budget.toLocaleString()} <small>per person</small></strong></div><input aria-label="Comfort budget per person" type="range" min="600" max="5000" step="100" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /><div><small>$600</small><small>$5,000+</small></div></div></aside></div><div className="smart-step-actions"><span><Icon name="sparkle" size={15} /> You can change everything later</span><button className="smart-primary-button" type="button" onClick={() => setStep(2)}>Choose your first day <Icon name="arrow" size={16} /></button></div></section>}

        {step === 2 && <section className="smart-planner-step smart-days-step" aria-labelledby="days-title"><div className="smart-step-heading"><div><p className="smart-planner-eyebrow">02 · Make it yours</p><h2 id="days-title">Shape every day, one beautiful choice at a time.</h2><p>Pick a destination, then select the landmarks and experiences that deserve a place in your day.</p></div><div className="smart-progress-note"><span>{itineraryCount} selections</span><small>across {duration} days</small></div></div><div className="smart-day-builder"><nav className="smart-days-rail" aria-label="Days in your itinerary"><div className="smart-rail-heading"><span>Your itinerary</span><small>{duration} days</small></div>{plannedDays.map((plan, index) => { const destination = destinations.find((item) => item.id === plan.destinationId) ?? destinations[0]; const active = selectedDay === index + 1; const count = plan.landmarkIds.length + plan.experienceIds.length; return <button type="button" key={`day-${index + 1}`} className={active ? "active" : ""} onClick={() => setSelectedDay(index + 1)}><span className="smart-day-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{destination.name}</strong><small>{count ? `${count} picks` : "Not planned yet"}</small></span><Icon name="chevron" size={15} /></button>; })}<div className="smart-rail-footer"><span><Icon name="route" size={16} /> {plannedDays.map((plan) => destinations.find((item) => item.id === plan.destinationId)?.name).join(" · ")}</span></div></nav><div className="smart-day-editor"><div className="smart-day-editor-heading"><div><p>DAY {String(selectedDay).padStart(2, "0")}</p><h3>{currentDestination.name}<span> · {currentDestination.region}</span></h3><small>{currentDestination.summary}</small></div><img src={currentDestination.image} alt="" /></div><div className="smart-editor-section"><div className="smart-editor-section-title"><div><span>Where will you go?</span><small>Choose the base for this day</small></div><Icon name="compass" size={18} /></div><div className="destination-chip-grid">{destinations.map((destination) => <button key={destination.id} type="button" className={currentDestination.id === destination.id ? "active" : ""} onClick={() => chooseDestination(destination.id)}><img src={destination.image} alt="" /><span><strong>{destination.name}</strong><small>{destination.region}</small></span>{currentDestination.id === destination.id && <Icon name="check" size={14} />}</button>)}</div></div><div className="smart-editor-section"><div className="smart-editor-section-title"><div><span>What should you see?</span><small>Select the landmarks that belong in your day</small></div><span className="smart-count-pill">{selectedLandmarks.length} selected</span></div><div className="landmark-grid">{currentDestination.landmarks.map((landmark) => { const selected = currentPlan.landmarkIds.includes(landmark.id); return <button key={landmark.id} type="button" className={selected ? "active" : ""} onClick={() => toggleLandmark(landmark.id)}><span className="landmark-media"><img src={landmark.image} alt="" /><span>{selected ? <Icon name="check" size={13} /> : <Icon name="plus" size={14} />}</span></span><span className="landmark-copy"><strong>{landmark.title}</strong><small>{landmark.meta}</small><em>{landmark.description}</em></span></button>; })}</div>{selectedLandmarks.length > 0 && <div className="time-plan-list"><div className="time-plan-heading"><span><Icon name="clock" size={15} /> Set the rhythm</span><small>What time would you like to arrive?</small></div>{selectedLandmarks.map((landmark) => <label key={landmark.id}><span>{landmark.title}</span><select value={currentPlan.landmarkTimes[landmark.id] ?? "09:00"} onChange={(event) => setTime("landmarkTimes", landmark.id, event.target.value)}><option>07:00</option><option>08:00</option><option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option><option>14:00</option><option>16:00</option></select></label>)}</div>}</div><div className="smart-editor-section"><div className="smart-editor-section-title"><div><span>Add a local experience</span><small>Optional extras for {currentDestination.name}</small></div><span className="smart-count-pill">{selectedExperiences.length} added</span></div><div className="experience-grid">{currentDestination.experiences.map((experience) => { const selected = currentPlan.experienceIds.includes(experience.id); return <button key={experience.id} type="button" className={selected ? "active" : ""} onClick={() => toggleExperience(experience.id)}><span className="experience-media"><img src={experience.image} alt="" /><span>{selected ? <Icon name="check" size={13} /> : <Icon name="plus" size={14} />}</span></span><span className="experience-copy"><strong>{experience.title}</strong><small>{experience.meta} · {experience.duration}</small><em>{experience.description}</em><b>from ${experience.price}</b></span></button>; })}</div>{selectedExperiences.length > 0 && <div className="time-plan-list experience-times"><div className="time-plan-heading"><span><Icon name="clock" size={15} /> Place them in the day</span><small>Keep enough breathing room between stops</small></div>{selectedExperiences.map((experience) => <label key={experience.id}><span>{experience.title}</span><select value={currentPlan.experienceTimes[experience.id] ?? "14:00"} onChange={(event) => setTime("experienceTimes", experience.id, event.target.value)}><option>12:00</option><option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option><option>18:00</option><option>19:00</option></select></label>)}</div>}</div><div className="smart-two-column-sections"><div className="smart-editor-section compact"><div className="smart-editor-section-title"><div><span>Who is with you?</span><small>Your guide for the day</small></div><Icon name="guide" size={18} /></div><div className="mini-option-grid">{guideOptions.map((option) => <button key={option.id} type="button" className={currentPlan.guideId === option.id ? "active" : ""} onClick={() => updateCurrentPlan((plan) => ({ ...plan, guideId: option.id }))}><Icon name={option.icon} size={17} /><span><strong>{option.title}</strong><small>{option.meta}</small></span><b>+${option.price}</b></button>)}</div></div><div className="smart-editor-section compact"><div className="smart-editor-section-title"><div><span>How will you move?</span><small>Comfort between each stop</small></div><Icon name="car" size={18} /></div><div className="mini-option-grid">{vehicleOptions.map((option) => <button key={option.id} type="button" className={currentPlan.vehicleId === option.id ? "active" : ""} onClick={() => updateCurrentPlan((plan) => ({ ...plan, vehicleId: option.id }))}><Icon name={option.icon} size={17} /><span><strong>{option.title}</strong><small>{option.meta}</small></span><b>+${option.price}</b></button>)}</div></div></div><div className="smart-day-actions"><button type="button" className="smart-ghost-button" onClick={() => setSelectedDay((day) => Math.max(1, day - 1))} disabled={selectedDay === 1}>Previous day</button><button type="button" className="smart-primary-button" onClick={() => selectedDay < duration ? setSelectedDay((day) => day + 1) : setStep(3)}>{selectedDay < duration ? `Continue to Day ${selectedDay + 1}` : "Finish the daily plan"} <Icon name="arrow" size={16} /></button></div></div></div></section>}

        {step === 3 && <section className="smart-planner-step smart-review-step" aria-labelledby="review-title"><div className="smart-step-heading"><div><p className="smart-planner-eyebrow">03 · The details that make it yours</p><h2 id="review-title">A few thoughtful preferences.</h2><p>These small details help us make the route comfortable, generous and genuinely yours.</p></div><span className="smart-step-counter">Almost there</span></div><div className="smart-review-grid"><div className="smart-preferences-card"><div className="smart-preference-block"><div className="smart-editor-section-title"><div><span>What would you like to eat?</span><small>We can tune the stops and table suggestions</small></div><Icon name="utensils" size={19} /></div><div className="preference-choice-grid">{[{ id: "local", title: "Local & curious", detail: "Egyptian tables and small tastings" }, { id: "vegetarian", title: "Vegetarian friendly", detail: "Plenty of plant-forward choices" }, { id: "private", title: "Private dining", detail: "A slower meal with extra care" }].map((option) => <button key={option.id} type="button" className={food === option.id ? "active" : ""} onClick={() => setFood(option.id)}><span>{food === option.id ? <Icon name="check" size={14} /> : <Icon name="utensils" size={14} />}</span><strong>{option.title}</strong><small>{option.detail}</small></button>)}</div></div><div className="smart-preference-block"><div className="smart-editor-section-title"><div><span>Who needs a little extra care?</span><small>We will adapt the pace, access and vehicle choice</small></div><Icon name="accessibility" size={19} /></div><div className="toggle-preference"><button type="button" className={accessibilityNeeds ? "active" : ""} onClick={() => setAccessibilityNeeds((value) => !value)} aria-pressed={accessibilityNeeds}><span className="toggle-track"><span /></span><span><strong>Someone with reduced mobility</strong><small>Step-free access, closer drop-offs and more time</small></span></button><button type="button" className={pets ? "active" : ""} onClick={() => setPets((value) => !value)} aria-pressed={pets}><span className="toggle-track"><span /></span><span><strong>We are bringing a pet</strong><small>We will suggest pet-friendly stays and stops</small></span><Icon name="paw" size={19} /></button></div></div></div><aside className="smart-itinerary-summary"><div className="summary-heading"><span className="smart-option-icon"><Icon name="route" size={18} /></span><div><p>Your route at a glance</p><h3>{duration} days in Egypt</h3></div></div><div className="summary-route">{plannedDays.map((plan, index) => { const destination = destinations.find((item) => item.id === plan.destinationId) ?? destinations[0]; return <div key={`summary-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{destination.name}</strong><small>{plan.landmarkIds.length} landmarks · {plan.experienceIds.length} experiences</small></div>; })}</div><div className="summary-totals"><div><span>Start date</span><strong>{formatDate(startDate)}</strong></div><div><span>Travel style</span><strong>{selectedStyle}</strong></div><div><span>Estimated route services</span><strong>${estimatedTotal.toLocaleString()}</strong></div></div><button className="smart-primary-button full" type="button" onClick={buildJourney}>{journeyBuilt ? "Journey saved" : "Build my journey"} <Icon name="sparkle" size={16} /></button><p className="summary-note"><Icon name="check" size={13} /> Nothing is charged here. We will confirm availability with you.</p></aside></div><div className="smart-final-actions"><button type="button" className="smart-ghost-button" onClick={() => setStep(2)}>Back to daily plan</button><div><button type="button" className="smart-outline-button" onClick={saveItinerary}><Icon name="bookmark" size={16} /> Save itinerary</button><button type="button" className="smart-outline-button" onClick={() => void shareTrip()}><Icon name="share" size={16} /> Share route</button></div></div></section>}

        <section className="smart-planner-footer-note"><span><Icon name="sparkle" size={14} /> AlpNile concierge</span><p>We turn your choices into a route that leaves room for the unexpected.</p><span>{journeyBuilt ? "Your plan is ready" : "Designed for real days, not checklists"}</span></section>
      </div>
      {notice && <div className="smart-planner-notice" role="status">{notice}</div>}
    </main>
  );
}
