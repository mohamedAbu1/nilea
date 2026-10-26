"use client";

import { useState } from "react";

type IconName = "search" | "menu" | "close" | "arrow" | "pin" | "calendar" | "sliders" | "utensils" | "coffee" | "store" | "ticket" | "vase" | "lotus" | "family" | "heart";

type Experience = {
  name: string;
  city: string;
  kind: string;
  rating: string;
  reviews: string;
  hours: string;
  tags: string[];
  description: string;
};

const categories: { label: string; icon: IconName }[] = [
  { label: "Restaurants", icon: "utensils" },
  { label: "Cafés", icon: "coffee" },
  { label: "Markets", icon: "store" },
  { label: "Cultural Events", icon: "ticket" },
  { label: "Artisans & Crafts", icon: "vase" },
  { label: "Wellness", icon: "lotus" },
  { label: "Family Friendly", icon: "family" },
];

const experiences: Experience[] = [
  {
    name: "Rooftop Restaurant",
    city: "Cairo",
    kind: "Dining experience",
    rating: "4.8",
    reviews: "1.2K",
    hours: "12:00 – 00:00",
    tags: ["Egyptian", "Mediterranean", "Rooftop"],
    description: "Golden-hour plates, lantern-lit tables and a front-row view of Cairo's river lights.",
  },
  {
    name: "Nubian Dinner",
    city: "Aswan",
    kind: "Local table",
    rating: "4.9",
    reviews: "856",
    hours: "18:00 – 23:00",
    tags: ["Nubian", "Local Recipes", "Cultural"],
    description: "A generous evening of Nubian recipes, color and storytelling beside the water.",
  },
  {
    name: "Crafts Market",
    city: "Luxor",
    kind: "Market walk",
    rating: "4.7",
    reviews: "923",
    hours: "09:00 – 22:00",
    tags: ["Handmade", "Textiles", "Souvenirs"],
    description: "Follow the warm glow of brass lamps through stalls filled with handmade Egyptian detail.",
  },
];

const nearby = [
  { name: "El Fishawi Café", city: "Historic Café · Cairo", rating: "4.6", reviews: "732", action: "Open Now", image: "/nilea-near-fishawi-cafe.png" },
  { name: "Khan el-Khalili Market", city: "Market · Cairo", rating: "4.5", reviews: "1.1K", action: "Open Now", image: "/nilea-near-khan-market.png" },
  { name: "Nile Sunset Cruise", city: "Experience · Cairo", rating: "4.8", reviews: "954", action: "Today 5 PM", image: "/nilea-near-nile-cruise.png" },
  { name: "Cultural Show", city: "Event · Cairo", rating: "4.7", reviews: "621", action: "Fri, Apr 25", image: "/nilea-near-cultural-show.png" },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6.7" /><path d="m16 16 4.3 4.3" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13" /><path d="m13 7 5 5-5 5" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.3" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="4" y="5.2" width="16" height="14.8" rx="2" /><path d="M8 3.8v3M16 3.8v3M4 9.5h16" /></svg>;
  if (name === "sliders") return <svg {...common}><path d="M4 7h16M4 17h16M9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM15 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>;
  if (name === "utensils") return <svg {...common}><path d="M7 3v8M4.5 3v4.2a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3v18M17 3c-2.2 2.2-2.7 5.2-1.2 7.1.5.6 1.2.9 2.2.9" /></svg>;
  if (name === "coffee") return <svg {...common}><path d="M5 8h12v6.2A4.8 4.8 0 0 1 12.2 19H9.8A4.8 4.8 0 0 1 5 14.2V8ZM17 10h1.2a2.8 2.8 0 1 1 0 5.6H17M7 4c0 1 1 1 1 2M11 4c0 1 1 1 1 2M5 21h12" /></svg>;
  if (name === "store") return <svg {...common}><path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10a2.7 2.7 0 0 0 5 0 2.7 2.7 0 0 0 5 0 2.7 2.7 0 0 0 5 0 2.7 2.7 0 0 0 3 0M8 20v-5h8v5" /></svg>;
  if (name === "ticket") return <svg {...common}><path d="M4 7.5a2 2 0 0 0 0 4v1a2 2 0 0 0 0 4h16v-9H4Z" /><path d="M13 7.5v9" /></svg>;
  if (name === "vase") return <svg {...common}><path d="M9 4h6M10 4v4l-4 10a2 2 0 0 0 1.9 2.7h8.2A2 2 0 0 0 18 18L14 8V4M8 11h8" /></svg>;
  if (name === "lotus") return <svg {...common}><path d="M12 20c-3.5-2-5.5-5.2-5.5-9.5C9.5 11.5 12 14 12 20ZM12 20c3.5-2 5.5-5.2 5.5-9.5C14.5 11.5 12 14 12 20ZM12 20C8 20 4.5 17.9 3 14.5c4.2-.4 7.5 1.6 9 5.5ZM12 20c4 0 7.5-2.1 9-5.5-4.2-.4-7.5 1.6-9 5.5ZM12 20c0-4.2-1.7-7.6-4-10.3C11.2 9.8 12 12.3 12 20ZM12 20c0-4.2 1.7-7.6 4-10.3C12.8 9.8 12 12.3 12 20Z" /></svg>;
  if (name === "family") return <svg {...common}><circle cx="8" cy="7" r="2.4" /><circle cx="16" cy="7" r="2.4" /><circle cx="12" cy="5" r="2" /><path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0M9 11.5a4 4 0 0 1 6 0" /></svg>;
  return <svg {...common}><path d="M20.8 8.7c0 5.3-8.8 10.4-8.8 10.4S3.2 14 3.2 8.7A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.2Z" /></svg>;
}

export default function LocalLifePage() {
  const [activeCategory, setActiveCategory] = useState("Restaurants");
  const [city, setCity] = useState("Cairo");
  const [date, setDate] = useState("Any Date");
  const [cuisine, setCuisine] = useState("All Cuisines");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const searchExperiences = () => document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="life-shell">
      <header className="life-header sticky top-0 z-40">
        <div className="mx-auto flex h-[74px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-7 lg:px-12">
          <a href="/" className="font-display text-[23px] tracking-[0.16em] text-[#f3ca82] transition hover:text-white">NILEA</a>
          <nav className="hidden items-center gap-5 text-[11px] text-[#d9d4ca] lg:flex" aria-label="Primary navigation">
            <a href="/" className="transition hover:text-[#f4ca80]">History</a>
            <a href="/local-life" className="relative py-3 text-[#f4c577] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[#e9b85e]">Local Life &amp; Dining</a>
            <a href="/stays-hotels" className="transition hover:text-[#f4ca80]">Stays &amp; Hotels</a>
            <a href="/travel-transport" className="transition hover:text-[#f4ca80]">Travel &amp; Transport</a>
            <a href="/tours-experiences" className="transition hover:text-[#f4ca80]">Tours &amp; Experiences</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#experiences" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] sm:flex" aria-label="Search experiences"><Icon name="search" size={16} /></a>
            <button onClick={() => setMenuOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] lg:hidden" aria-label="Open menu" aria-expanded={menuOpen}><Icon name={menuOpen ? "close" : "menu"} size={16} /></button>
            <a href="#experiences" className="hidden rounded-full bg-gradient-to-b from-[#f6d18d] to-[#d49643] px-5 py-2.5 text-[11px] font-semibold text-[#1e160c] shadow-[0_8px_22px_rgba(202,141,57,.22)] transition hover:brightness-110 sm:block">Plan Your Trip</a>
          </div>
          {menuOpen && <div className="menu-popover absolute right-4 top-[66px] w-60 rounded-2xl border border-[#e8b65e]/30 bg-[#09141f]/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden"><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="/#journey" onClick={() => setMenuOpen(false)}>Explore the eras</a><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="#experiences" onClick={() => setMenuOpen(false)}>Local experiences</a><a className="block rounded-xl px-4 py-3 text-sm text-[#f4c577] hover:bg-white/5" href="#guide" onClick={() => setMenuOpen(false)}>Smart guide</a></div>}
        </div>
      </header>

      <section className="life-hero">
        <div className="mx-auto grid min-h-[710px] w-full max-w-[1500px] grid-cols-1 gap-10 px-4 pb-16 pt-12 sm:px-7 sm:pt-16 lg:grid-cols-[1fr_276px] lg:gap-16 lg:px-12 lg:pt-20">
          <div className="life-hero-copy max-w-[650px] self-start">
            <p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-[#e5b767]">Nile archives · chapter two</p>
            <h1 className="font-display text-[53px] leading-[.92] tracking-[-.045em] text-[#f3c477] sm:text-[76px] lg:text-[82px]">Local Life &amp; Dining<br /><span className="text-[38px] sm:text-[52px] lg:text-[58px]">Find your Egypt</span></h1>
            <p className="mt-7 max-w-[390px] text-[14px] leading-6 text-[#eee9df]/90 sm:text-[15px]">Taste, meet, explore. From rooftop restaurants and local cafés to vibrant markets, cultural events and unique experiences — discover the real Egypt through its people, flavors and places.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/60"><span className="section-cap text-[#e7b96a]">Curated for you</span><span>7 categories</span><span>·</span><span>3 cities</span></div>
          </div>

          <aside className="life-category-rail self-start rounded-[18px] p-2 lg:mt-16" aria-label="Experience categories">
            {categories.map((category) => <button key={category.label} onClick={() => setActiveCategory(category.label)} className={`life-category-item w-full px-3 py-3 text-left text-[11px] ${activeCategory === category.label ? "active" : ""}`} aria-pressed={activeCategory === category.label}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#ecc37a]/40 text-[#f2c77c]"><Icon name={category.icon} size={15} /></span><span>{category.label}</span></button>)}
          </aside>
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-7 lg:px-12">
          <div className="life-filter-bar grid gap-2 rounded-[18px] p-2 sm:grid-cols-[1.05fr_1fr_1.05fr_.86fr] sm:gap-3 sm:p-3">
            <button onClick={() => setCity((value) => value === "Cairo" ? "Aswan" : value === "Aswan" ? "Luxor" : "Cairo")} className="life-filter-control flex items-center gap-3 rounded-full px-4 text-left"><span className="text-[#f2c577]"><Icon name="pin" size={18} /></span><span className="text-[12px] text-white/85">{city}</span><span className="ml-auto text-white/45">⌄</span></button>
            <button onClick={() => setDate((value) => value === "Any Date" ? "Tonight" : "Any Date")} className="life-filter-control flex items-center gap-3 rounded-full px-4 text-left"><span className="text-[#f2c577]"><Icon name="calendar" size={18} /></span><span className="text-[12px] text-white/85">{date}</span><span className="ml-auto text-white/45">⌄</span></button>
            <button onClick={() => setCuisine((value) => value === "All Cuisines" ? "Local Favorites" : "All Cuisines")} className="life-filter-control flex items-center gap-3 rounded-full px-4 text-left"><span className="text-[#f2c577]"><Icon name="utensils" size={18} /></span><span className="text-[12px] text-white/85">{cuisine}</span><span className="ml-auto text-white/45">⌄</span></button>
            <button onClick={searchExperiences} className="life-filter-button rounded-full px-5 text-[12px] font-semibold">Search <span className="ml-2">{activeCategory}</span></button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 sm:px-7 lg:px-12">
        <section id="experiences" className="life-section scroll-mt-28 pt-0">
          <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#e6b567]">The city is your table</p><h2 className="mt-2 font-display text-[36px] text-[#f2ca84] sm:text-[42px]">Featured Experiences</h2></div><button onClick={searchExperiences} className="hidden items-center gap-2 text-[11px] text-white/65 transition hover:text-[#f4c577] sm:flex">See all <Icon name="arrow" size={13} /></button></div>
          <div className="life-map-card life-map-feature-stage rounded-[20px] p-6 sm:p-8">
            <div className="relative z-10 max-w-[270px]"><p className="text-[10px] uppercase tracking-[0.28em] text-[#edbb6b]">Follow the river</p><h2 className="mt-3 font-display text-[34px] leading-none text-[#f3cd8d]">Three cities.<br />One appetite.</h2><p className="mt-4 text-[12px] leading-5 text-white/65">A living route through rooftops, riverside tables and the small places that make Egypt feel like home.</p></div>
            <div className="life-map-route" aria-hidden="true" /><div className="life-pin cairo"><Icon name="pin" size={13} /></div><div className="life-pin aswan"><Icon name="pin" size={13} /></div><div className="life-pin luxor"><Icon name="pin" size={13} /></div><span className="absolute bottom-6 left-[15%] z-10 font-display text-[13px] text-[#f2c778]">Cairo</span><span className="absolute left-[42%] top-[33%] z-10 font-display text-[13px] text-[#f2c778]">Aswan</span><span className="absolute bottom-8 right-[12%] z-10 font-display text-[13px] text-[#f2c778]">Luxor</span>
            <div className="life-map-features absolute bottom-6 left-6 right-6 z-10 grid gap-3 md:grid-cols-3">
              {experiences.map((experience, index) => <button key={experience.name} onClick={() => setSelectedExperience(experience)} className="life-feature-card group rounded-[18px] text-left" style={{ backgroundPosition: `${index * 50}% center` }}><div className="life-card-copy p-4"><div className="mb-2 flex items-center justify-between"><span className="life-card-pill rounded-full px-2.5 py-1 text-[8px] uppercase tracking-[0.16em] text-[#f5ca7d]">{experience.city}</span><span className="flex items-center gap-1 text-[10px] text-white/85"><span className="text-[#f5c55e]">★</span> {experience.rating} <span className="text-white/45">({experience.reviews})</span></span></div><h3 className="font-display text-[20px] text-white sm:text-[22px]">{experience.name}</h3><p className="mt-1 max-w-[270px] text-[10px] leading-4 text-white/70">{experience.description}</p><div className="mt-3 flex items-center justify-between"><span className="text-[9px] text-white/55">{experience.kind} · {experience.hours}</span><span className="grid h-7 w-7 place-items-center rounded-full border border-[#f4c578]/60 text-[#f4c578] transition group-hover:bg-[#f4c578] group-hover:text-[#1a120a]"><Icon name="arrow" size={12} /></span></div></div></button>)}
            </div>
          </div>
        </section>

        <section id="nearby" className="glass-panel mt-6 rounded-[20px] p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.28em] text-[#edbb6b]">Close to the moment</p><h2 className="mt-2 font-display text-[31px] text-[#f3cc89]">Near You</h2></div><button className="flex items-center gap-2 text-[10px] text-white/60 transition hover:text-[#f4c577]">See all <Icon name="arrow" size={12} /></button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{nearby.map((item, index) => <button key={item.name} onClick={() => setSelectedExperience({ ...experiences[index % experiences.length], name: item.name, city: "Cairo", kind: item.city })} className="life-near-card group rounded-[15px] text-left" style={{ backgroundImage: `linear-gradient(90deg, rgba(3, 10, 16, .82) 0%, rgba(3, 10, 16, .24) 70%, rgba(3, 10, 16, .58) 100%), url('${item.image}')` }}><div className="life-card-copy flex items-center justify-between gap-3 p-4"><div><h3 className="font-display text-[18px] text-white">{item.name}</h3><p className="mt-1 text-[10px] text-white/60">{item.city}</p><p className="mt-2 text-[10px] text-[#f4c577]"><span className="mr-1">★</span>{item.rating} <span className="text-white/45">({item.reviews})</span></p></div><span className="rounded-full border border-[#f3c477]/45 bg-[#07121b]/65 px-3 py-1 text-[9px] text-[#f4c577]">{item.action}</span></div></button>)}</div></section>

        <section id="guide" className="mt-8 flex flex-col items-start justify-between gap-4 px-2 pb-4 pt-1 text-[11px] text-white/50 sm:flex-row sm:items-center"><p>Small places, rich stories <span className="mx-2 text-[#dcae61]">·</span> {activeCategory} in {city}</p><p className="font-display tracking-[0.16em] text-[#c7914d]">NILEA / LOCAL LIFE 02</p></section>
      </div>

      {selectedExperience && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/78 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="experience-title"><div className="life-modal modal-depth relative w-full max-w-xl overflow-hidden rounded-[24px] p-7 sm:p-9"><button onClick={() => setSelectedExperience(null)} className="absolute right-5 top-5 z-10 text-white/65 transition hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><p className="text-[10px] uppercase tracking-[0.3em] text-[#e7b96a]">{selectedExperience.kind}</p><h2 id="experience-title" className="mt-4 font-display text-[38px] text-[#f4cf8d]">{selectedExperience.name}</h2><div className="mt-2 flex items-center gap-3 text-[11px] text-white/65"><span className="text-[#f5c55e]">★ {selectedExperience.rating}</span><span>({selectedExperience.reviews} reviews)</span><span>·</span><span>{selectedExperience.city}</span></div><p className="mt-6 max-w-lg text-[14px] leading-6 text-white/75">{selectedExperience.description} This is a curated starting point for a slower, more local Nile experience.</p><div className="mt-6 flex flex-wrap gap-2">{selectedExperience.tags.map((tag) => <span key={tag} className="life-card-pill rounded-full px-3 py-1.5 text-[10px] text-[#f4c577]">{tag}</span>)}</div><div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5"><span className="text-[11px] text-white/55">Today · {selectedExperience.hours}</span><button onClick={() => setSelectedExperience(null)} className="life-filter-button rounded-full px-5 py-3 text-[11px] font-semibold">Save this place <Icon name="heart" size={14} /></button></div></div></div>}
    </main>
  );
}
