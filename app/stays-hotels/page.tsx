"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDialogA11y } from "../components/dialog";
import { StyledSelect } from "../components/styled-select";
import { insertInquiry } from "../lib/submissions";

type IconName = "search" | "menu" | "close" | "arrow" | "pin" | "calendar" | "users" | "sliders" | "wifi" | "pool" | "spa" | "dining" | "view" | "heart";

type Hotel = {
  name: string;
  city: string;
  rating: string;
  reviews: string;
  price: string;
  image: string;
  description: string;
};

const hotels: Hotel[] = [
  {
    name: "Sofitel Winter Palace",
    city: "Luxor, Egypt",
    rating: "4.8",
    reviews: "982",
    price: "$280",
    image: "/alpnile-hotel-winter-palace.webp",
    description: "A grand riverside palace wrapped in palms, history and the warm glow of old Luxor.",
  },
  {
    name: "Steigenberger Nile Palace",
    city: "Luxor, Egypt",
    rating: "4.6",
    reviews: "754",
    price: "$240",
    image: "/alpnile-hotel-nile-palace.webp",
    description: "A calm Nile-facing stay with long horizons, quiet terraces and evening river lights.",
  },
  {
    name: "Al Moudira Hotel",
    city: "Luxor, Egypt",
    rating: "4.7",
    reviews: "618",
    price: "$310",
    image: "/alpnile-hotel-al-moudira.webp",
    description: "An intimate oasis of carved stone, lantern-lit courtyards and private pool moments.",
  },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: `inline-ui-icon inline-ui-${name}` };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6.7" /><path d="m16 16 4.3 4.3" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13" /><path d="m13 7 5 5-5 5" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.3" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="4" y="5.2" width="16" height="14.8" rx="2" /><path d="M8 3.8v3M16 3.8v3M4 9.5h16" /></svg>;
  if (name === "users") return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0-1.7-5.5M16 14.5a5.5 5.5 0 0 1 4.5 5.5" /></svg>;
  if (name === "sliders") return <svg {...common}><path d="M4 7h16M4 17h16M9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM15 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>;
  if (name === "wifi") return <svg {...common}><path d="M3 9a14 14 0 0 1 18 0M6 13a9.5 9.5 0 0 1 12 0M9.5 17a4.5 4.5 0 0 1 5 0M12 21h.01" /></svg>;
  if (name === "pool") return <svg {...common}><path d="M4 16c2.4 0 2.4 2 4.8 2s2.4-2 4.8-2 2.4 2 4.8 2 2.4-2 4.8-2M4 11h16M7 11V6h5v5M14 8h4" /></svg>;
  if (name === "spa") return <svg {...common}><path d="M12 21c0-7 3-11 8-14-1 7-4 11-8 14ZM12 21C12 14 9 10 4 7c1 7 4 11 8 14ZM12 21V4" /></svg>;
  if (name === "dining") return <svg {...common}><path d="M7 3v8M4.5 3v4.2a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3v18M17 3c-2.2 2.2-2.7 5.2-1.2 7.1.5.6 1.2.9 2.2.9" /></svg>;
  if (name === "view") return <svg {...common}><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
  return <svg {...common}><path d="M20.8 8.7c0 5.3-8.8 10.4-8.8 10.4S3.2 14 3.2 8.7A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.2Z" /></svg>;
}

const amenities = [
  ["Wifi", "wifi"],
  ["Pool", "pool"],
  ["Spa", "spa"],
  ["Dining", "dining"],
  ["Nile View", "view"],
] as const;

export default function StaysHotelsPage() {
  const [destination, setDestination] = useState("Luxor");
  const [dates, setDates] = useState("Nov 12, 2026 – Nov 16, 2026");
  const [guests, setGuests] = useState("2 Guests");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [reservationStarted, setReservationStarted] = useState(false);
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("alpnile-stay-favorites");
    if (!stored) return;
    try { setSaved(JSON.parse(stored) as string[]); } catch { window.localStorage.removeItem("alpnile-stay-favorites"); }
  }, []);
  useEffect(() => {
    window.localStorage.setItem("alpnile-stay-favorites", JSON.stringify(saved));
  }, [saved]);

  const searchStays = () => {
    setSearchSubmitted(true);
    document.getElementById("stays")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const toggleSaved = (name: string) => setSaved((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  const displayHotels = hotels.filter((hotel) => destination === "All Egypt" || hotel.city.startsWith(destination));
  const submitReservationRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedHotel) return;
    setReservationError("");
    setReservationSubmitting(true);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setReservationSubmitting(false); return; }
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const checkIn = String(form.get("checkIn") ?? "").trim();
    const checkOut = String(form.get("checkOut") ?? "").trim();
    if (checkOut <= checkIn) {
      setReservationError("Check-out must be after check-in.");
      setReservationSubmitting(false);
      return;
    }
    const result = await insertInquiry({ request_type: "stay", full_name: name, email, phone, message: `Stay request: ${selectedHotel.name} · ${checkIn} to ${checkOut} · ${form.get("guests")} guests.`, details: { stay: selectedHotel.name, checkIn, checkOut, guests: form.get("guests") }, source: "stays-page" });
    if (result.error) {
      setReservationError("We could not save this reservation request. Please try again.");
      setReservationSubmitting(false);
      return;
    }
    setReservationStarted(true);
    setReservationSubmitting(false);
  };
  useDialogA11y(Boolean(selectedHotel), () => { setSelectedHotel(null); setReservationStarted(false); }, dialogRef);

  return (
    <main className="hotel-shell">
      <section className="hotel-controls" aria-label="Stay search">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 lg:px-12">
          <div className="hotel-search-panel grid gap-2 rounded-[18px] p-2 sm:grid-cols-[1.05fr_1.35fr_1fr_.75fr] sm:gap-3 sm:p-3">
            <label className="hotel-search-control flex items-center gap-3 rounded-xl px-4 text-left"><span className="text-[#f2c577]"><Icon name="pin" size={18} /></span><span><small>Destination</small><StyledSelect value={destination} onChange={setDestination} ariaLabel="Destination"><option>All Egypt</option><option>Safaga</option><option>Marsa Alam</option><option>Luxor</option><option>Aswan</option><option>Cairo</option><option>Hurghada</option></StyledSelect></span></label>
            <label className="hotel-search-control flex items-center gap-3 rounded-xl px-4 text-left"><span className="text-[#f2c577]"><Icon name="calendar" size={18} /></span><span><small>Dates</small><StyledSelect value={dates} onChange={setDates} ariaLabel="Dates"><option>Any dates</option><option>Nov 12, 2026 – Nov 16, 2026</option><option>Tonight – Nov 16, 2026</option></StyledSelect></span></label>
            <label className="hotel-search-control flex items-center gap-3 rounded-xl px-4 text-left"><span className="text-[#f2c577]"><Icon name="users" size={18} /></span><span><small>Guests</small><StyledSelect value={guests} onChange={setGuests} ariaLabel="Guests"><option>1 Guest</option><option>2 Guests</option><option>3 Guests</option><option>4+ Guests</option></StyledSelect></span></label>
            <button type="button" onClick={searchStays} className="hotel-search-button rounded-xl px-5 text-[12px] font-semibold"><Icon name="search" size={16} /> Search</button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 sm:px-7 lg:px-12">
        <section id="stays" className="hotel-results scroll-mt-28 pt-0">
          <div className="mb-6 mt-7 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#e6b567]">A room with a river view</p><h2 className="mt-2 font-display text-[36px] text-[#f2ca84] sm:text-[42px]">Featured stay</h2></div><p className="hidden text-[11px] text-white/55 sm:block">{searchSubmitted ? "Showing" : "Explore"} {displayHotels.length} stays in {destination}</p></div>

          <article className="hotel-featured-card rounded-[20px]">
            <div className="hotel-featured-media" style={{ backgroundImage: "linear-gradient(180deg, rgba(5, 12, 18, .04), rgba(3, 9, 15, .08)), url('/alpnile-hotel-luxor-riverside.webp')" }}><span className="hotel-featured-badge">♛ &nbsp; Featured</span></div>
            <div className="hotel-featured-content">
              <div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-[28px] leading-tight text-[#f4d08e] sm:text-[31px]">Luxor Riverside Residence</h3><p className="mt-2 flex items-center gap-2 text-[11px] text-white/65"><Icon name="pin" size={14} /> Luxor, Egypt</p></div><div className="text-right"><p className="font-display text-[31px] text-[#f4cf8b]">$320</p><p className="text-[10px] text-white/60">per night</p></div></div>
              <div className="mt-3 flex items-center gap-2 text-[12px]"><span className="tracking-[0.16em] text-[#f9c34f]">★★★★★</span><span className="text-white/75">4.9</span><span className="text-white/45">(1,236 reviews)</span></div>
              <p className="mt-4 max-w-[520px] text-[13px] leading-6 text-white/65">A private riverfront residence with a warm pool, quiet palms and an uninterrupted view of Luxor&apos;s lights. Designed for the in-between moments.</p>
              <div className="hotel-amenities mt-5 grid grid-cols-5 gap-2 border-t border-white/10 pt-4">{amenities.map(([label, icon]) => <div key={label} className="hotel-amenity"><span><Icon name={icon} size={19} /></span><small>{label}</small></div>)}</div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2"><button onClick={() => { setReservationStarted(false); setSelectedHotel({ name: "Luxor Riverside Residence", city: "Luxor, Egypt", rating: "4.9", reviews: "1,236", price: "$320", image: "/alpnile-hotel-luxor-riverside.webp", description: "A private riverfront residence with a warm pool, quiet palms and an uninterrupted view of Luxor's lights." }); }} className="hotel-secondary-button rounded-full px-5 py-3 text-[11px] font-semibold"><Icon name="view" size={14} /> View Rooms</button><button onClick={() => { setReservationStarted(false); setSelectedHotel({ name: "Luxor Riverside Residence", city: "Luxor, Egypt", rating: "4.9", reviews: "1,236", price: "$320", image: "/alpnile-hotel-luxor-riverside.webp", description: "A private riverfront residence with a warm pool, quiet palms and an uninterrupted view of Luxor's lights." }); }} className="hotel-primary-button rounded-full px-5 py-3 text-[11px] font-semibold">Reserve Now <Icon name="arrow" size={14} /></button></div>
            </div>
          </article>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {displayHotels.length ? displayHotels.map((hotel) => <article key={hotel.name} className="hotel-card rounded-[18px]"><div className="hotel-card-media" style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 10, 16, .06), rgba(3, 9, 15, .22)), url('${hotel.image}')` }}><button onClick={() => toggleSaved(hotel.name)} className={`hotel-heart ${saved.includes(hotel.name) ? "saved" : ""}`} aria-label={`${saved.includes(hotel.name) ? "Remove" : "Save"} ${hotel.name}`} aria-pressed={saved.includes(hotel.name)}><Icon name="heart" size={16} /></button></div><div className="hotel-card-content"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-[19px] text-[#f2d19a]">{hotel.name}</h3><p className="mt-1 text-[10px] text-white/55">{hotel.city}</p></div><div className="text-right"><p className="font-display text-[20px] text-[#f3cf8c]">{hotel.price}</p><p className="text-[9px] text-white/50">per night</p></div></div><div className="mt-2 flex items-center gap-2 text-[10px]"><span className="tracking-[0.08em] text-[#f9c34f]">★★★★★</span><span className="text-white/65">{hotel.rating}</span><span className="text-white/40">({hotel.reviews})</span></div><button onClick={() => { setSelectedHotel(hotel); setReservationStarted(false); }} className="hotel-card-action mt-4 w-full rounded-full px-4 py-2 text-[10px] font-semibold">View rooms <Icon name="arrow" size={12} /></button></div></article>) : <div className="hotel-empty-state"><strong>No stays found</strong><span>Try removing the filters.</span></div>}
          </div>
        </section>

        <section id="guide" className="mt-8 flex flex-col items-start justify-between gap-4 px-2 pb-4 pt-1 text-[11px] text-white/50 sm:flex-row sm:items-center"><p>Quiet mornings, river light <span className="mx-2 text-[#dcae61]">·</span> {destination}</p><p className="font-display tracking-[0.16em] text-[#c7914d]">ALPNILE / STAYS 03</p></section>
      </div>

      {selectedHotel && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => { setSelectedHotel(null); setReservationStarted(false); setReservationError(""); }}><div ref={dialogRef} className="hotel-modal modal-depth relative w-full max-w-xl overflow-hidden rounded-[24px]" role="dialog" aria-modal="true" aria-labelledby="hotel-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" data-dialog-close onClick={() => { setSelectedHotel(null); setReservationStarted(false); }} className="absolute right-5 top-5 z-10 text-white/65 transition hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><div className="hotel-modal-image" style={{ backgroundImage: `url('${selectedHotel.image}')` }} /><div className="p-7 sm:p-9"><p className="text-[10px] uppercase tracking-[0.3em] text-[#e7b96a]">Selected stay · {selectedHotel.city}</p><h2 id="hotel-title" className="mt-3 font-display text-[35px] text-[#f4cf8d]">{selectedHotel.name}</h2><div className="mt-2 flex items-center gap-3 text-[11px] text-white/65"><span className="text-[#f5c55e]">★ {selectedHotel.rating}</span><span>({selectedHotel.reviews} reviews)</span><span>·</span><span>{selectedHotel.price} per night</span></div><p className="mt-5 text-[14px] leading-6 text-white/72">{selectedHotel.description}</p>{reservationStarted ? <div className="hotel-confirmation mt-6"><strong>Reservation request saved</strong><span>Your request is saved and ready for the AlpNile team to confirm.</span></div> : <form className="hotel-request-form mt-6" onSubmit={submitReservationRequest}><input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" /><div className="hotel-request-grid"><input name="name" required placeholder="Full name" /><input name="email" type="email" required placeholder="Email address" /><input name="phone" required placeholder="WhatsApp number" /><StyledSelect name="guests" defaultValue="2" ariaLabel="Guests"><option value="1">1 Guest</option><option value="2">2 Guests</option><option value="3">3 Guests</option><option value="4">4+ Guests</option></StyledSelect><input name="checkIn" type="date" required min={new Date().toISOString().slice(0, 10)} /><input name="checkOut" type="date" required min={new Date().toISOString().slice(0, 10)} /></div><button type="submit" disabled={reservationSubmitting} className="hotel-primary-button mt-5 w-full rounded-full px-5 py-3 text-[11px] font-semibold">{reservationSubmitting ? "Saving request…" : "Continue to request"} <Icon name="arrow" size={14} /></button>{reservationError && <p className="home-form-error" role="alert">{reservationError}</p>}</form>}</div></div></div>}
    </main>
  );
}
