"use client";

import { useMemo, useState, type FormEvent } from "react";

type FleetCategory = "Executive" | "Family" | "Desert" | "Accessible";
type Vehicle = {
  id: string;
  name: string;
  category: FleetCategory;
  label: string;
  description: string;
  seats: string;
  luggage: string;
  price: number;
  bestFor: string;
  fuel: string;
  images: string[];
  features: string[];
};

const galleryLabels = ["Front three-quarter", "Rear three-quarter", "Full side profile", "Passenger cabin", "Luggage space"];

const vehicles: Vehicle[] = [
  {
    id: "executive-sedan",
    name: "Nile Executive Sedan",
    category: "Executive",
    label: "Quiet luxury for the city",
    description: "A polished private sedan for airport arrivals, hotel transfers and unhurried city days with a little more room to breathe.",
    seats: "Up to 3 guests",
    luggage: "2 large bags",
    price: 55,
    bestFor: "Airport arrivals, couples and city routes",
    fuel: "Comfort-tuned petrol",
    images: ["front", "rear", "side", "interior", "luggage"].map((view) => `/vehicles/executive-sedan-${view}.webp`),
    features: ["Air conditioning", "Bottled water", "Phone charging", "Professional driver", "Door-to-door pickup"],
  },
  {
    id: "executive-van",
    name: "Nile Executive Van",
    category: "Executive",
    label: "A calm cabin for small groups",
    description: "Keep your group together in a spacious high-roof van with easy boarding, generous luggage room and a relaxed rhythm between destinations.",
    seats: "Up to 7 guests",
    luggage: "6 large bags",
    price: 85,
    bestFor: "Small groups, guides and multi-stop days",
    fuel: "Long-range diesel",
    images: ["front", "rear", "side", "interior", "luggage"].map((view) => `/vehicles/executive-van-${view}.webp`),
    features: ["Captain seats", "USB charging", "Climate control", "Large luggage bay", "Flexible route timing"],
  },
  {
    id: "desert-suv",
    name: "Desert Trail 4×4",
    category: "Desert",
    label: "Ready for the road beyond the road",
    description: "A capable 4×4 for desert tracks, oases and open landscapes, with the comfort and local support needed for a full day out.",
    seats: "Up to 4 guests",
    luggage: "4 large bags",
    price: 95,
    bestFor: "Desert safaris, oases and remote viewpoints",
    fuel: "All-terrain diesel",
    images: ["front", "rear", "side", "interior", "luggage"].map((view) => `/vehicles/desert-suv-${view}.webp`),
    features: ["High-clearance drive", "Cooler box", "Desert-ready tires", "Sun protection", "Experienced local driver"],
  },
  {
    id: "family-minivan",
    name: "Family Nile Minivan",
    category: "Family",
    label: "Space for everyone and everything",
    description: "A practical seven-seat choice for families who want simple loading, comfortable stops and enough room for the day’s discoveries.",
    seats: "Up to 7 guests",
    luggage: "5 large bags",
    price: 72,
    bestFor: "Families, longer routes and child-friendly days",
    fuel: "Efficient petrol",
    images: ["front", "rear", "side", "interior", "luggage"].map((view) => `/vehicles/family-minivan-${view}.webp`),
    features: ["Seven comfortable seats", "Child-seat request", "Wide rear doors", "Air conditioning", "Flexible stops"],
  },
  {
    id: "accessible-minibus",
    name: "Accessible Nile Shuttle",
    category: "Accessible",
    label: "Thoughtful access, without compromise",
    description: "A spacious accessible vehicle with a discreet ramp, clear boarding space and a team ready to shape the route around your needs.",
    seats: "Up to 6 guests + 1 wheelchair",
    luggage: "4 large bags",
    price: 90,
    bestFor: "Accessible routes, families and assisted travel",
    fuel: "Smooth diesel",
    images: ["front", "rear", "side", "interior", "luggage"].map((view) => `/vehicles/accessible-minibus-${view}.webp`),
    features: ["Side wheelchair ramp", "Low-step boarding", "Wide aisle", "Trained support team", "Route accessibility review"],
  },
];

const categories: (FleetCategory | "All")[] = ["All", "Executive", "Family", "Desert", "Accessible"];

function FleetMark({ type }: { type: "seat" | "bag" | "route" | "check" }) {
  if (type === "seat") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v8a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9" /><path d="M6 16v3M18 16v3M9 5a2 2 0 1 1 4 0v6H9V5ZM4 19h16" /></svg>;
  if (type === "bag") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5a3 3 0 0 1 6 0v2M8 12h.01M16 12h.01" /></svg>;
  if (type === "route") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18c6 0 2-10 8-12" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function TravelTransportPage() {
  const [category, setCategory] = useState<FleetCategory | "All">("All");
  const [selectedId, setSelectedId] = useState("executive-sedan");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [requestSent, setRequestSent] = useState(false);

  const filteredVehicles = useMemo(() => category === "All" ? vehicles : vehicles.filter((vehicle) => vehicle.category === category), [category]);
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === selectedId) ?? vehicles[0];

  const selectVehicle = (id: string) => {
    setSelectedId(id);
    setActiveImageIndex(0);
    setRequestSent(false);
    window.setTimeout(() => document.getElementById("fleet-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestSent(true);
  };

  return (
    <main className="fleet-page">
      <section className="fleet-hero" aria-labelledby="fleet-title">
        <div className="fleet-hero-copy">
          <p className="fleet-eyebrow"><span aria-hidden="true">✦</span> AlpNile private fleet</p>
          <h1 id="fleet-title">The right vehicle<br /><em>for the way you travel.</em></h1>
          <p className="fleet-hero-description">From quiet city transfers to long desert days, choose a vehicle that makes the route feel easy. Every request includes a professional driver and a considered pickup plan.</p>
          <div className="fleet-hero-actions"><a className="fleet-primary-action" href="#fleet-catalog">Explore the fleet</a><a className="fleet-secondary-action" href="#fleet-request">Request a vehicle</a></div>
        </div>
        <div className="fleet-hero-art" aria-hidden="true"><div className="fleet-hero-orbit fleet-hero-orbit-one" /><div className="fleet-hero-orbit fleet-hero-orbit-two" /><div className="fleet-hero-stamp"><span>05</span><small>vehicles<br />ready to move</small></div></div>
        <div className="fleet-hero-note"><FleetMark type="route" /><span>Egypt-wide routes · Local support · Flexible timing</span></div>
      </section>

      <section className="fleet-catalog" id="fleet-catalog" aria-labelledby="fleet-catalog-title">
        <div className="fleet-section-heading"><div><p className="fleet-eyebrow">Choose your rhythm</p><h2 id="fleet-catalog-title">A small fleet, thoughtfully matched.</h2></div><p>Each vehicle is prepared for the route you choose, with room for the details that make a travel day feel personal.</p></div>
        <div className="fleet-filter-bar" role="group" aria-label="Filter vehicles by category">{categories.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === "All" ? "All vehicles" : item}</button>)}</div>
        <div className="fleet-grid">{filteredVehicles.map((vehicle, index) => <article className={`fleet-card ${vehicle.id === selectedId ? "active" : ""}`} key={vehicle.id}>
          <button type="button" className="fleet-card-image-button" onClick={() => selectVehicle(vehicle.id)} aria-label={`View ${vehicle.name}`}><span className="fleet-card-image"><img src={vehicle.images[0]} alt={`${vehicle.name} front view`} /><span className="fleet-card-image-count">5 views</span></span></button>
          <div className="fleet-card-content"><div className="fleet-card-topline"><span>0{index + 1}</span><small>{vehicle.category}</small></div><p className="fleet-card-label">{vehicle.label}</p><h3>{vehicle.name}</h3><p>{vehicle.description}</p><div className="fleet-card-specs"><span><FleetMark type="seat" />{vehicle.seats}</span><span><FleetMark type="bag" />{vehicle.luggage}</span></div><div className="fleet-card-footer"><strong>From ${vehicle.price}<small> / route</small></strong><button type="button" onClick={() => selectVehicle(vehicle.id)}>View details</button></div></div>
        </article>)}</div>
      </section>

      <section className="fleet-detail" id="fleet-detail" aria-labelledby="fleet-detail-title">
        <div className="fleet-detail-gallery"><div className="fleet-detail-main-image"><img src={activeVehicle.images[activeImageIndex]} alt={`${activeVehicle.name} — ${galleryLabels[activeImageIndex]}`} /><span>{galleryLabels[activeImageIndex]}</span></div><div className="fleet-gallery-thumbs">{activeVehicle.images.map((image, index) => <button key={image} type="button" className={activeImageIndex === index ? "active" : ""} onClick={() => setActiveImageIndex(index)} aria-label={`Show ${galleryLabels[index]} of ${activeVehicle.name}`}><img src={image} alt="" /></button>)}</div></div>
        <div className="fleet-detail-copy"><div className="fleet-detail-heading"><div><p className="fleet-eyebrow">Selected vehicle · {activeVehicle.category}</p><h2 id="fleet-detail-title">{activeVehicle.name}</h2></div><strong className="fleet-detail-price">${activeVehicle.price}<small>from / route</small></strong></div><p className="fleet-detail-description">{activeVehicle.description}</p><div className="fleet-detail-facts"><div><span>Best for</span><strong>{activeVehicle.bestFor}</strong></div><div><span>Powertrain</span><strong>{activeVehicle.fuel}</strong></div></div><div className="fleet-feature-list">{activeVehicle.features.map((feature) => <span key={feature}><FleetMark type="check" />{feature}</span>)}</div><a className="fleet-detail-link" href="#fleet-request">Request {activeVehicle.name}</a></div>
      </section>

      <section className="fleet-request" id="fleet-request" aria-labelledby="fleet-request-title"><div className="fleet-request-copy"><p className="fleet-eyebrow">A good next step</p><h2 id="fleet-request-title">Tell us where the road begins.</h2><p>Share the essentials and our team will confirm availability, driver details and the best vehicle for your route.</p><div className="fleet-request-promise"><FleetMark type="check" /><span>We reply with a clear quote and pickup plan.</span></div></div><form className="fleet-request-form" onSubmit={submitRequest}><label>Vehicle<select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setActiveImageIndex(0); }}>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}</select></label><label>Travel date<input type="date" required /></label><label>Pickup area<input type="text" required placeholder="Luxor, Cairo, Hurghada…" /></label><label>Passengers<select defaultValue="2"><option>1 passenger</option><option>2 passengers</option><option>3 passengers</option><option>4+ passengers</option></select></label><label className="fleet-request-wide">Route notes<textarea rows={3} placeholder="Airport transfer, hotel pickup, desert route…" /></label><button className="fleet-submit" type="submit">{requestSent ? "Request received" : "Send vehicle request"}</button>{requestSent && <p className="fleet-success" role="status">Thank you — the AlpNile team will confirm the route shortly.</p>}</form></section>
    </main>
  );
}
