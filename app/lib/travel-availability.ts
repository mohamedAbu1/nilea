import { vehicles, type Vehicle } from "../travel-transport/vehicle-data";

export type SmartStayOption = {
  slug: string;
  title: string;
  destinationId: string;
  location: string;
  kind: string;
  maxGuests: number;
  price: number;
  available: boolean;
  image: string;
};

type VehicleRule = {
  maxGuests: number;
  luggage: number;
  accessible: boolean;
  routeTags: string[];
};

export type SmartVehicleMatch = {
  vehicle: Vehicle;
  maxGuests: number;
  luggage: number;
  accessible: boolean;
  matchReason: string;
};

export const destinationLabels: Record<string, string> = {
  giza: "Giza",
  cairo: "Cairo",
  luxor: "Luxor",
  aswan: "Aswan",
  hurghada: "Hurghada",
  "marsa-alam": "Marsa Alam",
  siwa: "Siwa",
  alexandria: "Alexandria",
  "abu-simbel": "Abu Simbel",
  fayoum: "Fayoum",
  safaga: "Safaga",
  "sharm-el-sheikh": "Sharm El Sheikh",
};

const destinationAliases: Record<string, string> = {
  hurgada: "hurghada",
  "sharm el sheikh": "sharm-el-sheikh",
  "marsa alam": "marsa-alam",
  abu_simbel: "abu-simbel",
};

export const smartStayOptions: SmartStayOption[] = [
  { slug: "habu-sunset-villa", title: "Habu Sunset Villa", destinationId: "luxor", location: "Habu, Luxor", kind: "Villa", maxGuests: 4, price: 180, available: true, image: "/images/habu-sunset-villa/responsive/villa-04-desktop.webp" },
  { slug: "nile-view-apartment", title: "Nile View Apartment", destinationId: "luxor", location: "Luxor, Egypt", kind: "Apartment", maxGuests: 3, price: 95, available: false, image: "/alpnile-hotel-nile-palace.webp" },
  { slug: "winter-palace-room", title: "Winter Palace Garden Room", destinationId: "luxor", location: "Luxor, Egypt", kind: "Hotel room", maxGuests: 2, price: 220, available: false, image: "/alpnile-hotel-winter-palace.webp" },
  { slug: "riverside-suite", title: "Riverside Residence Suite", destinationId: "luxor", location: "Luxor, Egypt", kind: "Hotel room", maxGuests: 3, price: 190, available: false, image: "/alpnile-hotel-luxor-riverside.webp" },
  { slug: "aswan-courtyard-home", title: "Aswan Courtyard Home", destinationId: "aswan", location: "Aswan, Egypt", kind: "Home", maxGuests: 5, price: 130, available: false, image: "/alpnile-villas-v2.webp" },
  { slug: "red-sea-garden-villa", title: "Red Sea Garden Villa", destinationId: "hurghada", location: "Hurghada, Egypt", kind: "Villa", maxGuests: 6, price: 165, available: false, image: "/alpnile-stays-hotels-hero.webp" },
];

const vehicleRules: Record<string, VehicleRule> = {
  "executive-sedan": { maxGuests: 3, luggage: 2, accessible: false, routeTags: ["city", "luxury", "airport"] },
  "mitsubishi-xpander": { maxGuests: 6, luggage: 4, accessible: false, routeTags: ["family", "city", "airport"] },
  "toyota-hiace": { maxGuests: 12, luggage: 8, accessible: false, routeTags: ["group", "family", "airport", "city"] },
  "desert-suv": { maxGuests: 4, luggage: 4, accessible: false, routeTags: ["desert", "nature", "adventure"] },
  "accessible-minibus": { maxGuests: 6, luggage: 4, accessible: true, routeTags: ["accessible", "family", "city", "airport"] },
};

export function normalizeDestinationId(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  const aliased = destinationAliases[normalized] ?? normalized;
  return destinationLabels[aliased] ? aliased : "";
}
export function getDestinationLabel(destinationId?: string | null) {
  return destinationLabels[normalizeDestinationId(destinationId)] ?? "Everywhere";
}

export function getMatchingStays(destinationId: string, travelers: number) {
  return smartStayOptions
    .filter((stay) => stay.destinationId === destinationId && stay.maxGuests >= travelers)
    .sort((left, right) => Number(right.available) - Number(left.available) || left.price - right.price);
}

export function getMatchingVehicles({
  travelers,
  destinationId,
  accessibilityNeeds = false,
  travelStyle = "",
}: {
  travelers: number;
  destinationId?: string;
  accessibilityNeeds?: boolean;
  travelStyle?: string;
}): SmartVehicleMatch[] {
  const normalizedDestination = normalizeDestinationId(destinationId);
  const routeNeed = ["siwa", "fayoum", "marsa-alam", "hurghada", "safaga", "sharm-el-sheikh"].includes(normalizedDestination) ? "nature" : "city";
  return vehicles
    .map((vehicle) => {
      const rule = vehicleRules[vehicle.id];
      if (!rule || rule.maxGuests < travelers || (accessibilityNeeds && !rule.accessible)) return null;
      const isGroupMatch = travelers > 6 && vehicle.id === "toyota-hiace";
      const isFamilyMatch = travelStyle === "Family" && vehicle.id === "mitsubishi-xpander";
      const isRouteMatch = rule.routeTags.includes(routeNeed) || rule.routeTags.includes(travelStyle.toLowerCase());
      const matchReason = accessibilityNeeds
        ? "Step-free boarding and extra room"
        : isGroupMatch
          ? "Best luggage room for your group"
          : isFamilyMatch
            ? "Comfortable family cabin"
            : isRouteMatch && routeNeed === "nature"
              ? "Prepared for longer open-road routes"
              : `Comfortable for up to ${rule.maxGuests} guests`;
      return { vehicle, maxGuests: rule.maxGuests, luggage: rule.luggage, accessible: rule.accessible, matchReason, score: Number(isGroupMatch) * 4 + Number(isFamilyMatch) * 3 + Number(isRouteMatch) * 2 - rule.maxGuests * 0.01 };
    })
    .filter((match): match is SmartVehicleMatch & { score: number } => Boolean(match))
    .sort((left, right) => right.score - left.score || left.vehicle.price - right.vehicle.price)
    .map(({ score: _score, ...match }) => match);
}

