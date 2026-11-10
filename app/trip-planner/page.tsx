"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SharedHomeHero } from "../components/shared-home-hero";

type IconName = "search" | "menu" | "close" | "calendar" | "chevron" | "sun" | "culture" | "adventure" | "luxury" | "family" | "sparkle" | "bookmark" | "share" | "plus" | "arrow" | "route" | "compass" | "heart" | "expand";
type TravelStyle = "Culture" | "Adventure" | "Luxury" | "Family";

const travelStyles: { label: TravelStyle; icon: IconName }[] = [
  { label: "Culture", icon: "culture" },
  { label: "Adventure", icon: "adventure" },
  { label: "Luxury", icon: "luxury" },
  { label: "Family", icon: "family" },
];

const dayCards = [
  { day: "Day 1", city: "Giza", subtitle: "Pyramids & Ancient Wonders", experiences: "2 Experiences", image: "/alpnile-destination-cairo.webp" },
  { day: "Day 2", city: "Luxor", subtitle: "Temples & the Valley of Kings", experiences: "3 Experiences", image: "/alpnile-destination-luxor.webp" },
  { day: "Day 3", city: "Aswan", subtitle: "Nile & Nubian Culture", experiences: "2 Experiences", image: "/alpnile-tour-nile-sunset.webp" },
  { day: "Day 4", city: "Cairo", subtitle: "History & Modern Life", experiences: "3 Experiences", image: "/alpnile-destination-alexandria.webp" },
];

const recommendations = [
  { title: "Sunrise at the Pyramids", meta: "Highly recommended", image: "/alpnile-destination-cairo.webp", icon: "sparkle" as IconName },
  { title: "Nile Felucca Experience", meta: "Best value", image: "/alpnile-tour-nile-sunset.webp", icon: "heart" as IconName },
  { title: "Abu Simbel Day Trip", meta: "Unique experience", image: "/alpnile-destination-abu-simbel.webp", icon: "sparkle" as IconName },
];

const routeCoordinates: Record<string, { top: number; left: number }> = {
  Giza: { top: 22, left: 32 },
  Cairo: { top: 30, left: 39 },
  Luxor: { top: 52, left: 47 },
  Aswan: { top: 76, left: 57 },
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className: `inline-ui-icon inline-ui-${name}` };
  switch (name) {
    case "search": return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></svg>;
    case "menu": return <svg {...common}><path d="M5 8h14M5 12h14M5 16h14" /></svg>;
    case "close": return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "calendar": return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></svg>;
    case "chevron": return <svg {...common}><path d="m7 9 5 5 5-5" /></svg>;
    case "sun": return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
    case "culture": return <svg {...common}><path d="M4 20h16M5 20V9h14v11M3 9h18M6 6l6-3 6 3v3H6V6ZM8 13v4M12 13v4M16 13v4" /></svg>;
    case "adventure": return <svg {...common}><path d="m4 18 7-12 5 7 4-5" /><path d="M4 18h4M16 13h4" /></svg>;
    case "luxury": return <svg {...common}><path d="M5 8h14l-1 11H6L5 8Z" /><path d="M8 8a4 4 0 0 1 8 0M9 12h.01M15 12h.01" /></svg>;
    case "family": return <svg {...common}><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="8" r="2.5" /><path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0" /></svg>;
    case "sparkle": return <svg {...common}><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>;
    case "bookmark": return <svg {...common}><path d="M6 4h12v16l-6-3-6 3V4Z" /></svg>;
    case "share": return <svg {...common}><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></svg>;
    case "plus": return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "arrow": return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
    case "route": return <svg {...common}><circle cx="6" cy="17" r="2" /><circle cx="18" cy="7" r="2" /><path d="M8 17c5 0 2-8 8-10" /></svg>;
    case "compass": return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m14.5 9.5-2 4-4 2 2-4 4-2ZM12 4v2M12 18v2M4 12h2M18 12h2" /></svg>;
    case "heart": return <svg {...common}><path d="M20.8 8.6c0 5.3-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.6A4.4 4.4 0 0 1 12 6.5a4.4 4.4 0 0 1 8.8 2.1Z" /></svg>;
    case "expand": return <svg {...common}><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4" /></svg>;
  }
}

export default function TripPlannerPage() {
  const searchParams = useSearchParams();
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle>("Culture");
  const [budget, setBudget] = useState(1500);
  const [dateSet, setDateSet] = useState(0);
  const [notice, setNotice] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(dayCards.map((day) => day.day));
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [journeyBuilt, setJourneyBuilt] = useState(false);
  const [routeExpanded, setRouteExpanded] = useState(false);
  const noticeTimerRef = useRef<number | null>(null);
  const dateOptions = ["Nov 10, 2026  →  Nov 17, 2026", "Dec 04, 2026  →  Dec 11, 2026", "Jan 12, 2027  →  Jan 19, 2027"];

  const recommendationsForRoute = useMemo(() => recommendations.map((recommendation, index) => ({
    ...recommendation,
    meta: selectedStyle === "Luxury" ? ["Private guide match", "Best value", "Signature experience"][index] : selectedStyle === "Family" ? ["Easy first day", "Gentle pace", "Big memory"] [index] : selectedStyle === "Adventure" ? ["Early start", "River energy", "Rare perspective"][index] : ["Highly recommended", "Best value", "Unique experience"][index],
  })), [selectedStyle]);
  const selectedRoute = useMemo(() => selectedDays.map((day) => dayCards.find((item) => item.day === day)).filter((day): day is (typeof dayCards)[number] => Boolean(day)), [selectedDays]);
  const routeLabel = selectedRoute.length ? selectedRoute.map((day) => day.city).join(" → ") : "Select days to shape your route";
  const routePoints = selectedRoute.map((day) => {
    const coordinate = routeCoordinates[day.city] ?? routeCoordinates.Cairo;
    return `${coordinate.left},${coordinate.top}`;
  }).join(" ");

  useEffect(() => {
    const requestedStyle = searchParams.get("style") as TravelStyle | null;
    if (requestedStyle && travelStyles.some((style) => style.label === requestedStyle)) setSelectedStyle(requestedStyle);
    const destination = searchParams.get("destination");
    if (destination) flashNotice(`Starting your route around ${destination.replace(/-/g, " ")}.`);
  }, [searchParams]);

  useEffect(() => () => {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
  }, []);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(""), 2600);
  };

  const toggleDay = (day: string, city: string) => {
    setSelectedDays((items) => items.includes(day) ? items.filter((item) => item !== day) : [...items, day]);
    setJourneyBuilt(false);
    flashNotice(`${day}: ${city} ${selectedDays.includes(day) ? "removed from" : "added to"} your journey.`);
  };

  const buildJourney = () => {
    setJourneyBuilt(true);
    flashNotice(`${selectedDays.length} days arranged around your ${selectedStyle.toLowerCase()} style and $${budget.toLocaleString()} budget.`);
  };

  const saveItinerary = () => {
    window.localStorage.setItem("alpnile-itinerary", JSON.stringify({ selectedStyle, budget, date: dateOptions[dateSet], selectedDays, selectedRecommendations }));
    flashNotice("Itinerary saved on this device.");
  };

  const shareTrip = async () => {
    const message = `AlpNile itinerary · ${selectedStyle} · ${selectedDays.length} days`;
    const shareUrl = `${window.location.origin}/trip-planner?style=${encodeURIComponent(selectedStyle)}&days=${encodeURIComponent(selectedDays.join(","))}`;
    const canShare = typeof navigator.share === "function";
    try {
      if (canShare) await navigator.share({ title: "AlpNile itinerary", text: message, url: shareUrl });
      else if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl);
      else {
        flashNotice("Sharing is not available in this browser. Copy the page URL manually.");
        return;
      }
      flashNotice(canShare ? "Share sheet opened." : "Trip link copied to your clipboard.");
    } catch {
      flashNotice("Sharing was cancelled.");
    }
  };

  const addExperience = () => {
    const next = recommendationsForRoute.find((recommendation) => !selectedRecommendations.includes(recommendation.title)) ?? recommendationsForRoute[0];
    setSelectedRecommendations((items) => items.includes(next.title) ? items : [...items, next.title]);
    flashNotice(`${next.title} added to your journey.`);
  };

  return (
    <main className="trip-planner-shell">
      <SharedHomeHero
        sectionId="planner-hero"
        eyebrow="SMART GUIDE · YOUR ROUTE, CONSIDERED"
        title="Shape the"
        emphasis="journey around you."
        lede="Bring your time, pace and curiosity. We will turn them into a thoughtful Egypt route."
        image="/alpnile-hero-giza-3d-v2.webp"
        primaryHref="#trip-planner-content"
        primaryLabel="Build your route"
        secondaryHref="#trip-planner-content"
        secondaryLabel="Open the planner"
        note="Time / taste / tempo"
        chapter="04"
      />
      <div className="trip-planner-page" id="trip-planner-content">
        <section className="trip-planner-hero" aria-labelledby="trip-planner-title">
          <div className="trip-planner-hero-copy"><p className="trip-planner-kicker">ALPNILE / SMART PLANNER</p><h1 id="trip-planner-title">Smart Trip Planner</h1><h2>Your journey, intelligently arranged</h2><p>Create a personalized itinerary with AI-powered recommendations,<br className="desktop-only" /> iconic destinations and unforgettable experiences.</p></div>
          <aside className="trip-weather-card"><span><Icon name="sun" size={31} /></span><div><small>Cairo</small><strong>28°C</strong><em>Sunny</em><p>Perfect weather<br />for exploring</p></div></aside>
        </section>

        <section className="trip-controls" aria-label="Trip preferences">
          <button className="trip-date-control" type="button" onClick={() => setDateSet((value) => (value + 1) % dateOptions.length)}><span className="trip-control-icon"><Icon name="calendar" size={21} /></span><span><small>Travel Dates</small><strong>{dateOptions[dateSet]}</strong></span><Icon name="chevron" size={15} /></button>
          <div className="trip-style-control"><div className="trip-control-heading"><small>Travel Style</small><span>Choose your pace</span></div><div>{travelStyles.map((style) => <button key={style.label} type="button" className={selectedStyle === style.label ? "active" : ""} onClick={() => { setSelectedStyle(style.label); setJourneyBuilt(false); flashNotice(`${style.label} style selected.`); }} aria-pressed={selectedStyle === style.label}><Icon name={style.icon} size={19} /><span>{style.label}</span></button>)}</div></div>
          <div className="trip-budget-control"><div><small>Budget <em>(per person)</em></small><strong>${budget.toLocaleString()}</strong></div><input aria-label="Budget per person" type="range" min="500" max="3000" step="100" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /><div className="trip-budget-labels"><span>$500</span><span>${budget.toLocaleString()}</span><span>$3,000+</span></div></div>
        </section>

        <section className="trip-days-section" aria-labelledby="trip-days-title"><div className="sr-only" id="trip-days-title">Suggested itinerary</div><div className="trip-days-grid">{dayCards.map((day) => <button key={day.day} type="button" className={`trip-day-card ${selectedDays.includes(day.day) ? "selected" : ""}`} onClick={() => toggleDay(day.day, day.city)} aria-pressed={selectedDays.includes(day.day)}><span className="trip-day-image"><img src={day.image} alt={`${day.city}: ${day.subtitle}`} loading="lazy" /></span><span className="trip-day-shade" /><span className="trip-day-label">{day.day}</span><span className="trip-day-copy"><strong>{day.city}</strong><small>{day.subtitle}</small><em><span><Icon name="culture" size={15} /></span>{day.experiences}</em></span><span className="trip-day-orbit"><span>{selectedDays.includes(day.day) ? "✓" : "+"}</span></span></button>)}</div></section>

        <section className="trip-lower-grid">
          <div className="trip-route-panel"><div className="trip-panel-heading"><div><h2>Nile Route</h2><p>{routeLabel}</p></div><button type="button" aria-label="Expand route" aria-expanded={routeExpanded} onClick={() => setRouteExpanded((value) => !value)}><Icon name="expand" size={16} /></button></div><div className={`trip-route-map ${routeExpanded ? "expanded" : ""}`} aria-label={`Selected route: ${routeLabel}`} role="img"><svg className="trip-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={routePoints} /></svg>{selectedRoute.map((day, index) => { const coordinate = routeCoordinates[day.city] ?? routeCoordinates.Cairo; return <div key={`${day.day}-${day.city}`} className="trip-route-node" style={{ top: `${coordinate.top}%`, left: `${coordinate.left}%` }}><span>{day.city}</span><small>{index + 1}</small></div>; })}<span className="trip-route-compass"><Icon name="compass" size={28} /></span><span className="trip-route-boat">⌁</span>{!selectedRoute.length && <span className="trip-route-empty">Choose a day above to draw your route</span>}</div></div>
          <div className="trip-recommendation-panel"><div className="trip-panel-heading"><div><h2><Icon name="sparkle" size={20} /> Recommendations for your route</h2><p>Updated for {selectedStyle} · ${budget.toLocaleString()} per person</p></div><button type="button" onClick={() => flashNotice("These recommendations are tailored to your selected style and budget.")}>Why these? <Icon name="arrow" size={12} /></button></div><div className="trip-recommendation-grid">{recommendationsForRoute.map((recommendation, index) => { const selected = selectedRecommendations.includes(recommendation.title); return <button key={recommendation.title} type="button" className={`trip-recommendation-card ${selected ? "selected" : ""}`} onClick={() => { setSelectedRecommendations((items) => selected ? items.filter((item) => item !== recommendation.title) : [...items, recommendation.title]); flashNotice(`${recommendation.title} ${selected ? "removed from" : "added to"} your journey.`); }} aria-pressed={selected}><span className="trip-recommendation-media"><img src={recommendation.image} alt={recommendation.title} loading="lazy" /><span className="trip-recommendation-index">0{index + 1}</span><span className="trip-recommendation-icon"><Icon name={recommendation.icon} size={15} /></span></span><span className="trip-recommendation-body"><strong>{recommendation.title}</strong><small><Icon name={recommendation.icon} size={12} /> {recommendation.meta}</small></span><span className="trip-recommendation-check" aria-hidden="true">{selected ? "✓" : "+"}</span></button>; })}</div></div>
        </section>

        <section className="trip-actions-row"><button className="trip-primary-action" type="button" onClick={buildJourney}><Icon name="sparkle" size={18} /> {journeyBuilt ? "Journey Built" : "Build My Journey"} <Icon name="arrow" size={15} /></button><button type="button" onClick={saveItinerary}><Icon name="bookmark" size={16} /> Save Itinerary</button><button type="button" onClick={() => void shareTrip()}><Icon name="share" size={16} /> Share Trip</button><button type="button" onClick={addExperience}><Icon name="plus" size={17} /> Add Experience</button></section>
      </div>
      {notice && <div className="trip-notice" role="status">{notice}</div>}
    </main>
  );
}
