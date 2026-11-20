"use client";

import { useState } from "react";
import Link from "next/link";
import type { Vehicle } from "../vehicle-data";
import { LocalizedPrice } from "../../components/currency";

function DetailMark({ type }: { type: "seat" | "bag" | "route" | "check" }) {
  if (type === "seat") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v8a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9" /><path d="M6 16v3M18 16v3M9 5a2 2 0 1 1 4 0v6H9V5ZM4 19h16" /></svg>;
  if (type === "bag") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>;
  if (type === "route") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18c6 0 2-10 8-12" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = vehicle.images[activeImageIndex];

  return (
    <main className="vehicle-detail-page">
      <section className="vehicle-detail-hero" aria-labelledby="vehicle-detail-title">
        <div className="vehicle-detail-hero-copy">
          <Link className="vehicle-detail-back" href="/travel-transport#fleet-catalog">Back to the fleet</Link>
          <p className="fleet-eyebrow">AlpNile private fleet · {vehicle.category}</p>
          <h1 id="vehicle-detail-title">{vehicle.name}<em>{vehicle.label}</em></h1>
          <p className="vehicle-detail-hero-description">{vehicle.description}</p>
          <div className="vehicle-detail-hero-facts"><span><DetailMark type="seat" />{vehicle.seats}</span><span><DetailMark type="bag" />{vehicle.luggage}</span><span><DetailMark type="route" />Egypt-wide routes</span></div>
          <div className="vehicle-detail-price"><strong><LocalizedPrice amount={vehicle.price} /></strong><span>from / route</span></div>
        </div>
        <div className="vehicle-detail-hero-image"><img src={vehicle.images[0].src} alt={`${vehicle.name} front three-quarter view`} /><span className="vehicle-detail-hero-badge">Ready for your route</span></div>
      </section>

      <section className="vehicle-detail-showcase" aria-label={`${vehicle.name} gallery`}>
        <div className="vehicle-detail-gallery-panel">
          <div className="vehicle-detail-main-image"><img src={activeImage.src} alt={`${vehicle.name} — ${activeImage.label}`} /><span>{activeImage.label}</span></div>
          <div className="vehicle-detail-thumbs">
            {vehicle.images.map((image, index) => <button key={image.src} type="button" className={index === activeImageIndex ? "active" : ""} onClick={() => setActiveImageIndex(index)} aria-label={`Show ${image.label}`}><img src={image.src} alt="" /></button>)}
          </div>
        </div>
        <div className="vehicle-detail-information">
          <p className="fleet-eyebrow">The details that make the day easier</p>
          <h2>Made for the way<br /><em>you want to move.</em></h2>
          <div className="vehicle-detail-arabic" lang="ar" dir="rtl"><span>معلومات السيارة</span><h3>{vehicle.arabicName}</h3><p>{vehicle.arabicDescription}</p><div><strong>أنسب استخدام</strong><b>{vehicle.arabicBestFor}</b></div><div><strong>نوع المحرك</strong><b>{vehicle.arabicFuel}</b></div></div>
          <div className="vehicle-detail-facts-grid"><div><span>Best for</span><strong>{vehicle.bestFor}</strong></div><div><span>Powertrain</span><strong>{vehicle.fuel}</strong></div></div>
          <ul className="vehicle-detail-features">{vehicle.features.map((feature) => <li key={feature}><DetailMark type="check" />{feature}</li>)}</ul>
          <Link className="vehicle-detail-primary" href="/travel-transport#fleet-request">Request this vehicle</Link>
        </div>
      </section>

      <section className="vehicle-detail-route-note"><div><p className="fleet-eyebrow">A considered transfer</p><h2>Comfort is part<br /><em>of the route.</em></h2></div><p>Tell us where you are going, how many people are travelling and what would make the day feel effortless. We will confirm availability and match the timing to your plans.</p><Link className="vehicle-detail-secondary" href="/travel-transport#fleet-request">Plan with AlpNile</Link></section>
    </main>
  );
}
