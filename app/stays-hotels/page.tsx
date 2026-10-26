"use client";

import { useState } from "react";

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
    image: "/nilea-hotel-winter-palace.png",
    description: "A grand riverside palace wrapped in palms, history and the warm glow of old Luxor.",
  },
  {
    name: "Steigenberger Nile Palace",
    city: "Luxor, Egypt",
    rating: "4.6",
    reviews: "754",
    price: "$240",
    image: "/nilea-hotel-nile-palace.png",
    description: "A calm Nile-facing stay with long horizons, quiet terraces and evening river lights.",
  },
  {
    name: "Al Moudira Hotel",
    city: "Luxor, Egypt",
    rating: "4.7",
    reviews: "618",
    price: "$310",
    image: "/nilea-hotel-al-moudira.png",
    description: "An intimate oasis of carved stone, lantern-lit courtyards and private pool moments.",
  },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
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
  const [dates, setDates] = useState("Jun 12, 2025 – Jun 16, 2025");
  const [guests, setGuests] = useState("2 Guests");
  const [sort, setSort] = useState("Recommended");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const searchStays = () => document.getElementById("stays")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const cycleDestination = () => setDestination((value) => value === "Luxor" ? "Cairo" : value === "Cairo" ? "Aswan" : "Luxor");
  const cycleDates = () => setDates((value) => value === "Jun 12, 2025 – Jun 16, 2025" ? "Tonight – Jun 16, 2025" : "Jun 12, 2025 – Jun 16, 2025");
  const cycleGuests = () => setGuests((value) => value === "2 Guests" ? "3 Guests" : value === "3 Guests" ? "1 Guest" : "2 Guests");
  const toggleSaved = (name: string) => setSaved((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);

  return (
    <main className="hotel-shell">
      <header className="hotel-header sticky top-0 z-40">
        <div className="mx-auto flex h-[74px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-7 lg:px-12">
          <a href="/" className="font-display text-[23px] tracking-[0.16em] text-[#f3ca82] transition hover:text-white">NILEA</a>
          <nav className="hidden items-center gap-5 text-[11px] text-[#d9d4ca] lg:flex" aria-label="Primary navigation">
            <a href="/" className="transition hover:text-[#f4ca80]">History</a>
            <a href="/local-life" className="transition hover:text-[#f4ca80]">Local Life &amp; Dining</a>
            <a href="/stays-hotels" className="relative py-3 text-[#f4c577] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[#e9b85e]">Stays &amp; Hotels</a>
            <a href="/travel-transport" className="transition hover:text-[#f4ca80]">Travel &amp; Transport</a>
            <a href="/tours-experiences" className="transition hover:text-[#f4ca80]">Tours &amp; Experiences</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#stays" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] sm:flex" aria-label="Search stays"><Icon name="search" size={16} /></a>
            <button onClick={() => setMenuOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] lg:hidden" aria-label="Open menu" aria-expanded={menuOpen}><Icon name={menuOpen ? "close" : "menu"} size={16} /></button>
            <button onClick={searchStays} className="hidden rounded-full bg-gradient-to-b from-[#f6d18d] to-[#d49643] px-5 py-2.5 text-[11px] font-semibold text-[#1e160c] shadow-[0_8px_22px_rgba(202,141,57,.22)] transition hover:brightness-110 sm:block">Plan Your Trip</button>
          </div>
          {menuOpen && <div className="menu-popover absolute right-4 top-[66px] w-60 rounded-2xl border border-[#e8b65e]/30 bg-[#09141f]/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden"><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="/local-life" onClick={() => setMenuOpen(false)}>Local life &amp; dining</a><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="#stays" onClick={() => setMenuOpen(false)}>Find a stay</a><a className="block rounded-xl px-4 py-3 text-sm text-[#f4c577] hover:bg-white/5" href="#guide" onClick={() => setMenuOpen(false)}>Smart guide</a></div>}
        </div>
      </header>

      <section className="hotel-hero">
        <div className="mx-auto min-h-[630px] w-full max-w-[1500px] px-4 pb-20 pt-12 sm:px-7 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="hotel-hero-copy max-w-[640px]">
            <p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-[#e5b767]">Nile archives · chapter three</p>
            <h1 className="font-display text-[59px] leading-[.9] tracking-[-.045em] text-[#f3c477] sm:text-[82px]">Stays &amp; Hotels<br /><span className="text-[40px] sm:text-[55px]">Find your perfect stay</span></h1>
            <p className="mt-7 max-w-[390px] text-[14px] leading-6 text-[#eee9df]/90 sm:text-[15px]">Wake beside the river, sleep beneath ancient columns and find a slower way to experience Egypt.</p>
          </div>
          <div className="hotel-map-label luxor-label"><span className="hotel-map-dot" /> Luxor Riverside Residence <Icon name="arrow" size={13} /></div>
          <div className="hotel-map-label cairo-label"><span className="hotel-map-dot" /> Riverfront stays</div>
          <div className="hotel-map-label aswan-label"><span className="hotel-map-dot" /> Aswan escapes</div>
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-7 lg:px-12">
          <div className="hotel-search-panel grid gap-2 rounded-[18px] p-2 sm:grid-cols-[1.05fr_1.35fr_1fr_.75fr] sm:gap-3 sm:p-3">
            <button onClick={cycleDestination} className="hotel-search-control flex items-center gap-3 rounded-xl px-4 text-left"><span className="text-[#f2c577]"><Icon name="pin" size={18} /></span><span><small>Destination</small><strong>{destination}</strong></span><span className="ml-auto text-white/45">⌄</span></button>
            <button onClick={cycleDates} className="hotel-search-control flex items-center gap-3 rounded-xl px-4 text-left"><span className="text-[#f2c577]"><Icon name="calendar" size={18} /></span><span><small>Dates</small><strong>{dates}</strong></span><span className="ml-auto text-white/45">⌄</span></button>
            <button onClick={cycleGuests} className="hotel-search-control flex items-center gap-3 rounded-xl px-4 text-left"><span className="text-[#f2c577]"><Icon name="users" size={18} /></span><span><small>Guests</small><strong>{guests}</strong></span><span className="ml-auto text-white/45">⌄</span></button>
            <button onClick={searchStays} className="hotel-search-button rounded-xl px-5 text-[12px] font-semibold"><Icon name="search" size={16} /> Search</button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 sm:px-7 lg:px-12">
        <section id="stays" className="hotel-results scroll-mt-28 pt-0">
          <div className="hotel-filter-row flex flex-wrap items-center gap-2 rounded-[18px] p-2 sm:p-3">
            <button onClick={() => setSort("Filters selected")} className="hotel-filter-control active"><Icon name="sliders" size={15} /> Filters</button>
            <button onClick={() => setSort("Price: low to high")} className="hotel-filter-control">Price <span>⌄</span></button>
            <button onClick={() => setSort("Top rated")} className="hotel-filter-control">Rating <span>⌄</span></button>
            <button onClick={() => setSort("Amenities")} className="hotel-filter-control">Amenities <span>⌄</span></button>
            <span className="ml-auto hidden text-[11px] text-white/55 sm:block">24 stays</span>
            <button onClick={() => setSort(sort === "Recommended" ? "Price: low to high" : "Recommended")} className="hotel-sort-control">{sort} <span>⌄</span></button>
          </div>

          <div className="mb-6 mt-7 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#e6b567]">A room with a river view</p><h2 className="mt-2 font-display text-[36px] text-[#f2ca84] sm:text-[42px]">Featured stay</h2></div><p className="hidden text-[11px] text-white/55 sm:block">Showing stays in {destination}</p></div>

          <article className="hotel-featured-card rounded-[20px]">
            <div className="hotel-featured-media" style={{ backgroundImage: "linear-gradient(180deg, rgba(5, 12, 18, .04), rgba(3, 9, 15, .08)), url('/nilea-hotel-luxor-riverside.png')" }}><span className="hotel-featured-badge">♛ &nbsp; Featured</span></div>
            <div className="hotel-featured-content">
              <div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-[28px] leading-tight text-[#f4d08e] sm:text-[31px]">Luxor Riverside Residence</h3><p className="mt-2 flex items-center gap-2 text-[11px] text-white/65"><Icon name="pin" size={14} /> Luxor, Egypt</p></div><div className="text-right"><p className="font-display text-[31px] text-[#f4cf8b]">$320</p><p className="text-[10px] text-white/60">per night</p></div></div>
              <div className="mt-3 flex items-center gap-2 text-[12px]"><span className="tracking-[0.16em] text-[#f9c34f]">★★★★★</span><span className="text-white/75">4.9</span><span className="text-white/45">(1,236 reviews)</span></div>
              <p className="mt-4 max-w-[520px] text-[13px] leading-6 text-white/65">A private riverfront residence with a warm pool, quiet palms and an uninterrupted view of Luxor&apos;s lights. Designed for the in-between moments.</p>
              <div className="hotel-amenities mt-5 grid grid-cols-5 gap-2 border-t border-white/10 pt-4">{amenities.map(([label, icon]) => <div key={label} className="hotel-amenity"><span><Icon name={icon} size={19} /></span><small>{label}</small></div>)}</div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2"><button onClick={() => setSelectedHotel({ name: "Luxor Riverside Residence", city: "Luxor, Egypt", rating: "4.9", reviews: "1,236", price: "$320", image: "/nilea-hotel-luxor-riverside.png", description: "A private riverfront residence with a warm pool, quiet palms and an uninterrupted view of Luxor's lights." })} className="hotel-secondary-button rounded-full px-5 py-3 text-[11px] font-semibold"><Icon name="view" size={14} /> View Rooms</button><button onClick={() => setSelectedHotel({ name: "Luxor Riverside Residence", city: "Luxor, Egypt", rating: "4.9", reviews: "1,236", price: "$320", image: "/nilea-hotel-luxor-riverside.png", description: "A private riverfront residence with a warm pool, quiet palms and an uninterrupted view of Luxor's lights." })} className="hotel-primary-button rounded-full px-5 py-3 text-[11px] font-semibold">Reserve Now <Icon name="arrow" size={14} /></button></div>
            </div>
          </article>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {hotels.map((hotel) => <article key={hotel.name} className="hotel-card rounded-[18px]"><div className="hotel-card-media" style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 10, 16, .06), rgba(3, 9, 15, .22)), url('${hotel.image}')` }}><button onClick={() => toggleSaved(hotel.name)} className={`hotel-heart ${saved.includes(hotel.name) ? "saved" : ""}`} aria-label={`Save ${hotel.name}`}><Icon name="heart" size={16} /></button></div><div className="hotel-card-content"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-[19px] text-[#f2d19a]">{hotel.name}</h3><p className="mt-1 text-[10px] text-white/55">{hotel.city}</p></div><div className="text-right"><p className="font-display text-[20px] text-[#f3cf8c]">{hotel.price}</p><p className="text-[9px] text-white/50">per night</p></div></div><div className="mt-2 flex items-center gap-2 text-[10px]"><span className="tracking-[0.08em] text-[#f9c34f]">★★★★★</span><span className="text-white/65">{hotel.rating}</span><span className="text-white/40">({hotel.reviews})</span></div><button onClick={() => setSelectedHotel(hotel)} className="hotel-card-action mt-4 w-full rounded-full px-4 py-2 text-[10px] font-semibold">View rooms <Icon name="arrow" size={12} /></button></div></article>)}
          </div>
        </section>

        <section id="guide" className="mt-8 flex flex-col items-start justify-between gap-4 px-2 pb-4 pt-1 text-[11px] text-white/50 sm:flex-row sm:items-center"><p>Quiet mornings, river light <span className="mx-2 text-[#dcae61]">·</span> {sort}</p><p className="font-display tracking-[0.16em] text-[#c7914d]">NILEA / STAYS 03</p></section>
      </div>

      {selectedHotel && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="hotel-title"><div className="hotel-modal modal-depth relative w-full max-w-xl overflow-hidden rounded-[24px]"><button onClick={() => setSelectedHotel(null)} className="absolute right-5 top-5 z-10 text-white/65 transition hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><div className="hotel-modal-image" style={{ backgroundImage: `url('${selectedHotel.image}')` }} /><div className="p-7 sm:p-9"><p className="text-[10px] uppercase tracking-[0.3em] text-[#e7b96a]">Selected stay · {selectedHotel.city}</p><h2 id="hotel-title" className="mt-3 font-display text-[35px] text-[#f4cf8d]">{selectedHotel.name}</h2><div className="mt-2 flex items-center gap-3 text-[11px] text-white/65"><span className="text-[#f5c55e]">★ {selectedHotel.rating}</span><span>({selectedHotel.reviews} reviews)</span><span>·</span><span>{selectedHotel.price} per night</span></div><p className="mt-5 text-[14px] leading-6 text-white/72">{selectedHotel.description}</p><button onClick={() => setSelectedHotel(null)} className="hotel-primary-button mt-7 w-full rounded-full px-5 py-3 text-[11px] font-semibold">Continue to reserve <Icon name="arrow" size={14} /></button></div></div></div>}
    </main>
  );
}
