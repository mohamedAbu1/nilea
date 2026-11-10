"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDialogA11y } from "../components/dialog";

type DestinationId = "safaga" | "marsa-alam" | "luxor" | "aswan" | "cairo" | "hurghada";
type IconName = "search" | "menu" | "close" | "chevron" | "pin" | "layers" | "list" | "heart" | "book" | "route" | "ticket" | "bed" | "arrow";

type Destination = {
  id: DestinationId;
  name: string;
  description: string;
  region: string;
  era: string;
  experience: string;
  image: string;
  position: { left: string; top: string };
};

type Attraction = { name: string; type: string; image: string };

const attractionsByDestination: Record<DestinationId, Attraction[]> = {
  safaga: [
    { name: "Safaga Reef", type: "Red Sea Diving", image: "/alpnile-hero-beach-3d-v2.webp" },
    { name: "Utopia Island", type: "Island Escape", image: "/alpnile-destination-hurghada-v2.webp" },
    { name: "Mineral Shore", type: "Quiet Coast", image: "/alpnile-hero-beach-3d-v2.webp" },
  ],
  "marsa-alam": [
    { name: "Marsa Mubarak", type: "Marine Life", image: "/alpnile-destination-sharm-v2.webp" },
    { name: "Wadi El Gemal", type: "Desert Coast", image: "/alpnile-hero-beach-3d-v2.webp" },
    { name: "Abu Dabbab Bay", type: "Coral Garden", image: "/alpnile-destination-hurghada-v2.webp" },
  ],
  cairo: [
    { name: "Giza Pyramids", type: "Ancient Wonder", image: "/alpnile-destination-cairo.webp" },
    { name: "Khan El Khalili", type: "Historic Market", image: "/alpnile-tour-food-walk.webp" },
    { name: "Nile at First Light", type: "River Moment", image: "/alpnile-city-cairo-v2.webp" },
  ],
  luxor: [
    { name: "Karnak Temple", type: "Temple Complex", image: "/alpnile-destination-luxor.webp" },
    { name: "Luxor Temple", type: "Ancient Temple", image: "/alpnile-tour-temple-night.webp" },
    { name: "Valley of the Kings", type: "Royal Tombs", image: "/alpnile-destination-abu-simbel.webp" },
  ],
  aswan: [
    { name: "Felucca at First Light", type: "River Moment", image: "/alpnile-tour-nile-sunset.webp" },
    { name: "Nubian Village", type: "Living Culture", image: "/alpnile-local-life-v2.webp" },
    { name: "Philae Temple", type: "Island Heritage", image: "/alpnile-destination-luxor.webp" },
  ],
  hurghada: [
    { name: "Giftun Islands", type: "Red Sea Escape", image: "/alpnile-destination-hurghada-v2.webp" },
    { name: "Coral Garden Dive", type: "Underwater Life", image: "/alpnile-hero-beach-3d-v2.webp" },
    { name: "Marina by Night", type: "Waterfront Evening", image: "/alpnile-destination-hurghada-v2.webp" },
  ],
};

const destinations: Destination[] = [
  {
    id: "safaga",
    name: "Safaga",
    description: "Clear reefs, mineral-rich shores and a quieter Red Sea rhythm.",
    region: "Red Sea",
    era: "Modern Egypt",
    experience: "Diving",
    image: "/alpnile-hero-beach-3d-v2.webp",
    position: { left: "78%", top: "46%" },
  },
  {
    id: "marsa-alam",
    name: "Marsa Alam",
    description: "Wild coastlines, coral gardens and open horizons beyond the resort road.",
    region: "Red Sea",
    era: "Modern Egypt",
    experience: "Nature",
    image: "/alpnile-destination-sharm-v2.webp",
    position: { left: "82%", top: "62%" },
  },
  {
    id: "luxor",
    name: "Luxor",
    description: "The world's greatest open-air museum.",
    region: "Upper Egypt",
    era: "Ancient Egypt",
    experience: "Heritage",
    image: "/alpnile-destination-luxor.webp",
    position: { left: "63%", top: "61%" },
  },
  {
    id: "aswan",
    name: "Aswan",
    description: "Feluccas, Nubian colour and the river at its most generous.",
    region: "Upper Egypt",
    era: "Nubian Egypt",
    experience: "Nile",
    image: "/alpnile-tour-nile-sunset.webp",
    position: { left: "54%", top: "80%" },
  },
  {
    id: "cairo",
    name: "Cairo",
    description: "Pyramids, museums and a vibrant modern capital.",
    region: "Lower Egypt",
    era: "Modern Egypt",
    experience: "Culture",
    image: "/alpnile-destination-cairo.webp",
    position: { left: "58%", top: "34%" },
  },
  {
    id: "hurghada",
    name: "Hurghada",
    description: "A Red Sea escape of coral gardens and open water.",
    region: "Red Sea",
    era: "Modern Egypt",
    experience: "Water",
    image: "/alpnile-destination-hurghada-v2.webp",
    position: { left: "76%", top: "49%" },
  },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className: `inline-ui-icon inline-ui-${name}` };
  switch (name) {
    case "search": return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></svg>;
    case "menu": return <svg {...common}><path d="M5 8h14M5 12h14M5 16h14" /></svg>;
    case "close": return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "chevron": return <svg {...common}><path d="m7 9 5 5 5-5" /></svg>;
    case "pin": return <svg {...common}><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>;
    case "layers": return <svg {...common}><path d="m12 4 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4M4 16l8 4 8-4" /></svg>;
    case "list": return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></svg>;
    case "heart": return <svg {...common}><path d="M20.8 8.6c0 5.3-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.6A4.4 4.4 0 0 1 12 6.5a4.4 4.4 0 0 1 8.8 2.1Z" /></svg>;
    case "book": return <svg {...common}><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z" /><path d="M5 5.5v15M8 7h7" /></svg>;
    case "route": return <svg {...common}><circle cx="6" cy="17" r="2" /><circle cx="18" cy="7" r="2" /><path d="M8 17c5 0 2-8 8-10" /></svg>;
    case "ticket": return <svg {...common}><path d="M4 7h16v4a2 2 0 0 0 0 4v2H4v-2a2 2 0 0 0 0-4V7Z" /><path d="M12 7v10" strokeDasharray="2 2" /></svg>;
    case "bed": return <svg {...common}><path d="M4 18v-7M4 15h16v3M7 11V8h4a3 3 0 0 1 3 3M4 18h16" /></svg>;
    case "arrow": return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
  }
}

export default function DestinationsPage() {
  const searchParams = useSearchParams();
  const requestedDestination = searchParams.get("destination");
  const initialDestination = destinations.some((destination) => destination.id === requestedDestination) ? requestedDestination as DestinationId : "luxor";
  const [activeDestination, setActiveDestination] = useState<DestinationId>(initialDestination);
  const [mapMode, setMapMode] = useState<"3D Map" | "List View">("3D Map");
  const [planning, setPlanning] = useState(false);
  const [savedDestinations, setSavedDestinations] = useState<DestinationId[]>([]);
  const [savedDestinationsLoaded, setSavedDestinationsLoaded] = useState(false);
  const planningDialogRef = useRef<HTMLDivElement>(null);
  const active = useMemo(() => destinations.find((destination) => destination.id === activeDestination) ?? destinations[1], [activeDestination]);
  const isSaved = savedDestinations.includes(active.id);
  useDialogA11y(planning, () => setPlanning(false), planningDialogRef);

  useEffect(() => {
    const saved = window.localStorage.getItem("alpnile-saved-destinations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        setSavedDestinations(parsed.filter((id): id is DestinationId => destinations.some((destination) => destination.id === id)));
      } catch {
        window.localStorage.removeItem("alpnile-saved-destinations");
      }
    }
    setSavedDestinationsLoaded(true);
  }, []);

  useEffect(() => {
    if (savedDestinationsLoaded) window.localStorage.setItem("alpnile-saved-destinations", JSON.stringify(savedDestinations));
  }, [savedDestinations, savedDestinationsLoaded]);

  useEffect(() => {
    if (requestedDestination && destinations.some((destination) => destination.id === requestedDestination)) setActiveDestination(requestedDestination as DestinationId);
  }, [requestedDestination]);

  return (
    <main className="destinations-shell">
      <div className="destinations-glow destinations-glow-one" aria-hidden="true" />
      <div className="destinations-glow destinations-glow-two" aria-hidden="true" />
      <div className="destinations-page">
        <section className="destinations-hero" aria-label="Explore destinations">
          <div className="destination-map-card">
            {mapMode === "3D Map" ? (
              <div className="destination-map-art">
                <img src="/alpnile-destinations-map.webp" alt="Illustrated map of Egypt and the Nile" />
                <div className="destination-map-shade" aria-hidden="true" />
                {destinations.map((destination) => (
                  <button key={destination.id} type="button" className={`destination-marker ${activeDestination === destination.id ? "active" : ""}`} style={{ left: destination.position.left, top: destination.position.top }} onClick={() => setActiveDestination(destination.id)} aria-label={`Show ${destination.name}`}>
                    <span className="destination-marker-orbit"><span /></span>
                    <span className="destination-marker-label">{destination.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="destination-list-view" aria-label="Destination list">
                <div className="destination-list-heading">
                  <p className="destination-kicker">EXPLORE BY PLACE</p>
                  <h2>Choose your next chapter</h2>
                </div>
                {destinations.map((destination, index) => (
                  <button key={destination.id} type="button" className={`destination-list-item ${activeDestination === destination.id ? "active" : ""}`} onClick={() => setActiveDestination(destination.id)}>
                    <span className="destination-list-index">0{index + 1}</span>
                    <span className="destination-list-copy"><strong>{destination.name}</strong><small>{destination.region} · {destination.experience}</small><em>{destination.description}</em></span>
                    <Icon name="arrow" size={15} />
                  </button>
                ))}
              </div>
            )}
            <div className="destination-map-controls">
              <button className={mapMode === "3D Map" ? "active" : ""} type="button" onClick={() => setMapMode("3D Map")}><Icon name="layers" size={16} /> 3D Map</button>
              <button className={mapMode === "List View" ? "active" : ""} type="button" onClick={() => setMapMode("List View")}><Icon name="list" size={16} /> List View</button>
            </div>
          </div>

          <aside className="destination-feature-panel" aria-label="Selected destination">
            <div className="destination-feature-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 11, 18, .04), rgba(4, 11, 18, .62)), url('${active.image}')` }}>
              <button className={`destination-favorite ${isSaved ? "saved" : ""}`} type="button" aria-label={`${isSaved ? "Remove" : "Save"} ${active.name}`} aria-pressed={isSaved} onClick={() => setSavedDestinations((items) => isSaved ? items.filter((item) => item !== active.id) : [...items, active.id])}><Icon name="heart" size={18} /></button>
            </div>
            <div className="destination-feature-copy">
              <p className="destination-feature-kicker">FEATURED DESTINATION</p>
              <h2>{active.name.toUpperCase()}</h2>
              <p className="destination-feature-subtitle">{active.id === "luxor" ? "The World's Greatest Open-Air Museum" : active.description}</p>
               <p className="destination-feature-description">Move through a living landscape of history, water, desert and timeless stories, shaped around the rhythm of each place.</p>
               <div className="destination-tags"><span>{active.experience}</span><span>{active.era.replace(" Egypt", "")}</span><span>{active.id === "hurghada" || active.id === "safaga" || active.id === "marsa-alam" ? "Sea Views" : "Nile Views"}</span></div>
              <div className="destination-feature-actions">
                {[{ icon: "book" as IconName, label: "View Story", href: "/#trips" }, { icon: "route" as IconName, label: "Plan Route", href: `/trip-planner?destination=${active.id}` }, { icon: "ticket" as IconName, label: "Book Tickets", href: `/tours-experiences?destination=${active.id}` }, { icon: "bed" as IconName, label: "Find a Stay", href: `/stays-hotels?destination=${active.id}` }].map((action) => <a key={action.label} href={action.href}><span><Icon name={action.icon} size={22} /></span>{action.label}</a>)}
              </div>
              <div className="destination-attractions-heading"><strong>Top Attractions in {active.name}</strong><a href={`/tours-experiences?destination=${active.id}`}>See all <Icon name="arrow" size={12} /></a></div>
              <div className="destination-attractions">
                {attractionsByDestination[active.id].map((attraction) => <a key={attraction.name} href={`/tours-experiences?destination=${active.id}&attraction=${encodeURIComponent(attraction.name)}`}><span className="destination-attraction-image"><img src={attraction.image} alt={attraction.name} loading="lazy" /></span><span className="destination-attraction-copy"><strong>{attraction.name}</strong><small>{attraction.type}</small></span></a>)}
              </div>
            </div>
          </aside>
        </section>

        <section className="destinations-featured-section" aria-labelledby="featured-destinations-title">
          <div className="destinations-section-heading"><div><p className="destination-kicker">A CURATED ROUTE · 06 CITIES</p><h2 id="featured-destinations-title">Featured Destinations</h2></div><span>Explore six distinct chapters, from the Nile and ancient heritage to the Red Sea.</span></div>
          <div className="destinations-grid">
            {destinations.map((destination, index) => <button key={destination.id} type="button" className={`destination-card ${activeDestination === destination.id ? "active" : ""}`} onClick={() => setActiveDestination(destination.id)}><span className="destination-card-image"><img src={destination.image} alt={`${destination.name} destination`} loading="lazy" /></span><span className="destination-card-shade" /><span className="destination-card-index">0{index + 1}</span><span className="destination-card-copy"><small>{destination.region} · {destination.experience}</small><strong>{destination.name}</strong><span>{destination.description}</span><em><Icon name="arrow" size={14} /></em></span></button>)}
          </div>
        </section>

      </div>

      {planning && <div className="destination-modal-backdrop" role="presentation" onMouseDown={() => setPlanning(false)}><div ref={planningDialogRef} className="destination-planning-modal" role="dialog" aria-modal="true" aria-labelledby="planning-title" onMouseDown={(event) => event.stopPropagation()}><button data-dialog-close className="destination-modal-close" type="button" onClick={() => setPlanning(false)} aria-label="Close"><Icon name="close" size={18} /></button><p className="destination-kicker">YOUR NEXT CHAPTER</p><h2 id="planning-title">Plan a route through Egypt.</h2><p>Choose a destination from the map and let AlpNile shape the journey around your time, pace and curiosity.</p><a href={`/trip-planner?destination=${active.id}`} className="destination-modal-start" onClick={() => setPlanning(false)}>Start planning <Icon name="arrow" size={15} /></a></div></div>}
    </main>
  );
}
