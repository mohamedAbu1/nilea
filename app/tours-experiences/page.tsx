"use client";

import { useMemo, useState } from "react";

type IconName = "search" | "menu" | "close" | "arrow" | "pin" | "calendar" | "users" | "heart" | "clock" | "heritage" | "desert" | "nile" | "food" | "family" | "all";
type Category = "All" | "Heritage" | "Desert" | "Nile" | "Food" | "Family";

type Experience = {
  name: string;
  city: string;
  category: Exclude<Category, "All">;
  rating: string;
  reviews: string;
  duration: string;
  price: string;
  image: string;
  description: string;
};

const categories: { label: Category; icon: IconName }[] = [
  { label: "All", icon: "all" },
  { label: "Heritage", icon: "heritage" },
  { label: "Desert", icon: "desert" },
  { label: "Nile", icon: "nile" },
  { label: "Food", icon: "food" },
  { label: "Family", icon: "family" },
];

const experiences: Experience[] = [
  { name: "A Night at the Temple", city: "Luxor", category: "Heritage", rating: "4.9", reviews: "320", duration: "3 hrs", price: "$89 USD", image: "/nilea-tour-temple-night.png", description: "Explore ancient wonders after dark with exclusive access and expert guides." },
  { name: "Nile Sunset Cruise", city: "Aswan", category: "Nile", rating: "4.8", reviews: "412", duration: "2.5 hrs", price: "$65 USD", image: "/nilea-tour-nile-sunset.png", description: "Sail the timeless Nile at golden hour with live music, light bites and unforgettable views." },
  { name: "Desert Stargazing", city: "Siwa", category: "Desert", rating: "4.9", reviews: "287", duration: "6 hrs", price: "$120 USD", image: "/nilea-tour-desert-stargazing.png", description: "Venture into the desert for a night under a spectacular sky with astronomy guides." },
  { name: "Cairo Food Walk", city: "Cairo", category: "Food", rating: "4.7", reviews: "365", duration: "4 hrs", price: "$75 USD", image: "/nilea-tour-food-walk.png", description: "Taste Egypt's vibrant street food with a local guide through historic Cairo." },
];

const recommendations = [
  { name: "Abu Simbel Day Trip", city: "Aswan", rating: "4.8", reviews: "211", price: "From $120", image: "/nilea-tour-temple-night.png" },
  { name: "Luxor Highlights", city: "Luxor", rating: "4.9", reviews: "498", price: "From $95", image: "/nilea-tour-temple-night.png" },
  { name: "Red Sea Snorkeling", city: "Hurghada", rating: "4.7", reviews: "302", price: "From $110", image: "/nilea-tour-nile-sunset.png" },
  { name: "Siwa Oasis Escape", city: "Siwa", rating: "4.8", reviews: "189", price: "From $140", image: "/nilea-tour-desert-stargazing.png" },
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
  if (name === "heart") return <svg {...common}><path d="M20.8 8.7c0 5.3-8.8 10.4-8.8 10.4S3.2 14 3.2 8.7A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.2Z" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "heritage") return <svg {...common}><path d="M3 20h18M5 20V10h14v10M3 10l9-6 9 6M8 14h.01M12 14h.01M16 14h.01" /></svg>;
  if (name === "desert") return <svg {...common}><path d="M3 18c3-4 6-4 9 0 3-4 6-4 9 0M4 21h16M12 5v5M9.5 7.5 12 5l2.5 2.5" /></svg>;
  if (name === "nile") return <svg {...common}><path d="M4 7c3 0 3 3 6 3s3-3 6-3 3 3 4 3M4 14c3 0 3 3 6 3s3-3 6-3 3 3 4 3" /></svg>;
  if (name === "food") return <svg {...common}><path d="M7 3v8M4.5 3v4.2a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3v18M17 3c-2.2 2.2-2.7 5.2-1.2 7.1.5.6 1.2.9 2.2.9" /></svg>;
  if (name === "family") return <svg {...common}><circle cx="8" cy="7" r="2.4" /><circle cx="16" cy="7" r="2.4" /><circle cx="12" cy="5" r="2" /><path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0M9 11.5a4 4 0 0 1 6 0" /></svg>;
  return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
}

export default function ToursExperiencesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [destination, setDestination] = useState("All Egypt");
  const [date, setDate] = useState("Any date");
  const [guests, setGuests] = useState("2 adults");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const visibleExperiences = useMemo(() => activeCategory === "All" ? experiences : experiences.filter((experience) => experience.category === activeCategory), [activeCategory]);
  const cycleDestination = () => setDestination((value) => value === "All Egypt" ? "Luxor" : value === "Luxor" ? "Aswan" : "All Egypt");
  const cycleDate = () => setDate((value) => value === "Any date" ? "This weekend" : "Any date");
  const cycleGuests = () => setGuests((value) => value === "2 adults" ? "3 adults" : value === "3 adults" ? "1 adult" : "2 adults");
  const toggleFavorite = (name: string) => setFavorites((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);

  return (
    <main className="tour-shell">
      <header className="tour-header sticky top-0 z-40">
        <div className="mx-auto flex h-[74px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-7 lg:px-12">
          <a href="/" className="font-display text-[23px] tracking-[0.16em] text-[#f3ca82] transition hover:text-white">NILEA</a>
          <nav className="hidden items-center gap-5 text-[11px] text-[#d9d4ca] lg:flex" aria-label="Primary navigation">
            <a href="/" className="transition hover:text-[#f4ca80]">History</a>
            <a href="/local-life" className="transition hover:text-[#f4ca80]">Local Life &amp; Dining</a>
            <a href="/stays-hotels" className="transition hover:text-[#f4ca80]">Stays &amp; Hotels</a>
            <a href="/travel-transport" className="transition hover:text-[#f4ca80]">Travel &amp; Transport</a>
            <a href="/tours-experiences" className="relative py-3 text-[#f4c577] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[#e9b85e]">Tours &amp; Experiences</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#featured" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] sm:flex" aria-label="Search experiences"><Icon name="search" size={16} /></a>
            <button onClick={() => setMenuOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] lg:hidden" aria-label="Open menu" aria-expanded={menuOpen}><Icon name={menuOpen ? "close" : "menu"} size={16} /></button>
            <button onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })} className="hidden rounded-full bg-gradient-to-b from-[#f6d18d] to-[#d49643] px-5 py-2.5 text-[11px] font-semibold text-[#1e160c] shadow-[0_8px_22px_rgba(202,141,57,.22)] transition hover:brightness-110 sm:block">Plan Your Trip</button>
          </div>
          {menuOpen && <div className="menu-popover absolute right-4 top-[66px] w-64 rounded-2xl border border-[#e8b65e]/30 bg-[#09141f]/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden"><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="/local-life" onClick={() => setMenuOpen(false)}>Local life &amp; dining</a><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="/stays-hotels" onClick={() => setMenuOpen(false)}>Stays &amp; hotels</a><a className="block rounded-xl px-4 py-3 text-sm text-[#f4c577] hover:bg-white/5" href="#featured" onClick={() => setMenuOpen(false)}>Explore experiences</a></div>}
        </div>
      </header>

      <section className="tour-hero">
        <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 pt-12 sm:px-7 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="tour-hero-copy max-w-[660px]"><p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-[#e5b767]">Nile archives · chapter five</p><h1 className="font-display text-[55px] leading-[.9] tracking-[-.045em] text-[#f3c477] sm:text-[82px]">Tours &amp;<br />Experiences</h1><p className="mt-5 font-display text-[27px] leading-none text-[#f3cf8d] sm:text-[35px]">Make the moment memorable</p><p className="mt-4 max-w-[485px] text-[14px] leading-5 text-[#eee9df]/90">Extraordinary journeys, handpicked by local experts. Explore Egypt through people, places and authentic experiences.</p></div>

          <div className="tour-search-panel mt-8 rounded-[18px] p-2 sm:mt-10 sm:p-3"><div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_170px] sm:gap-0"><button onClick={cycleDestination} className="tour-search-control rounded-xl px-4 text-left"><small>Destination</small><strong><Icon name="pin" size={17} />{destination}<span>⌄</span></strong></button><button onClick={cycleDate} className="tour-search-control rounded-xl px-4 text-left"><small>Date</small><strong><Icon name="calendar" size={17} />{date}<span>⌄</span></strong></button><button onClick={cycleGuests} className="tour-search-control rounded-xl px-4 text-left"><small>Guests</small><strong><Icon name="users" size={17} />{guests}<span>⌄</span></strong></button><button onClick={() => { setSearched(true); document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="tour-search-button rounded-xl px-4 text-[12px] font-semibold">Search Experiences <Icon name="search" size={15} /></button></div></div>

          <div className="tour-category-tabs no-scrollbar">{categories.map((category) => <button key={category.label} onClick={() => { setActiveCategory(category.label); setSearched(false); }} className={`tour-category-tab ${activeCategory === category.label ? "active" : ""}`}><span className="tour-category-icon"><Icon name={category.icon} size={19} /></span><span>{category.label}</span></button>)}</div>

          <section id="featured" className="tour-featured-section scroll-mt-28"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#e6b567]">Curated for your journey</p><h2 className="mt-2 font-display text-[34px] text-[#f2ca84] sm:text-[42px]">Featured Experiences</h2></div><button onClick={() => setActiveCategory("All")} className="hidden items-center gap-2 text-[11px] text-white/65 transition hover:text-[#f4c577] sm:flex">View all experiences <Icon name="arrow" size={13} /></button></div>
            <div className="tour-featured-grid">{visibleExperiences.map((experience) => <article key={experience.name} className="tour-card"><div className="tour-card-media" style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 10, 16, .04) 28%, rgba(3, 9, 15, .94) 100%), url('${experience.image}')` }}><button onClick={() => toggleFavorite(experience.name)} className={`tour-heart ${favorites.includes(experience.name) ? "saved" : ""}`} aria-label={`Save ${experience.name}`}><Icon name="heart" size={17} /></button></div><div className="tour-card-content"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-[21px] leading-tight text-[#f3d08e]">{experience.name}</h3><p className="mt-1 text-[10px] text-white/55">{experience.city}</p></div><span className="tour-card-category">{experience.category}</span></div><p className="mt-3 min-h-[48px] text-[11px] leading-5 text-white/65">{experience.description}</p><div className="mt-3 flex items-center gap-4 text-[10px] text-white/70"><span className="text-[#f9c34f]">★ {experience.rating}</span><span>({experience.reviews})</span><span className="flex items-center gap-1"><Icon name="clock" size={13} /> {experience.duration}</span></div><p className="mt-3 font-display text-[17px] text-[#f4cf8d]">{experience.price}</p><button onClick={() => setSelectedExperience(experience)} className="tour-book-button mt-3 w-full rounded-full px-4 py-2.5 text-[11px] font-semibold">Book Experience <Icon name="arrow" size={14} /></button></div></article>)}</div>
            {searched && <div className="tour-notice mt-4 rounded-full px-4 py-2 text-[11px] text-[#f4cf8d]">Showing {activeCategory === "All" ? "all experiences" : activeCategory.toLowerCase()} in {destination} · {guests}</div>}
          </section>

          <section className="tour-recommendations"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#e6b567]">A thoughtful next chapter</p><h2 className="mt-2 font-display text-[28px] text-[#f2ca84] sm:text-[33px]">Recommended for You</h2></div><span className="hidden text-[10px] text-white/50 sm:block">Based on your route</span></div><div className="tour-recommendation-grid">{recommendations.map((recommendation) => <button key={recommendation.name} onClick={() => setSelectedExperience({ ...experiences[0], name: recommendation.name, city: recommendation.city, rating: recommendation.rating, reviews: recommendation.reviews, price: recommendation.price, image: recommendation.image })} className="tour-recommendation-card text-left"><span className="tour-recommendation-image" style={{ backgroundImage: `url('${recommendation.image}')` }} /><span><strong>{recommendation.name}</strong><small>{recommendation.city}</small><em><b>★</b> {recommendation.rating} ({recommendation.reviews})</em><small className="tour-recommendation-price">{recommendation.price}</small></span><Icon name="heart" size={14} /></button>)}</div></section>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 pb-5 pt-1 text-[11px] text-white/50 sm:px-7 lg:px-12"><p>Small moments, lasting memories <span className="mx-2 text-[#dcae61]">·</span> {activeCategory}</p><p className="font-display tracking-[0.16em] text-[#c7914d]">NILEA / TOURS 05</p></section>

      {selectedExperience && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="tour-title"><div className="tour-modal modal-depth relative w-full max-w-xl overflow-hidden rounded-[24px]"><button onClick={() => setSelectedExperience(null)} className="absolute right-5 top-5 z-10 text-white/70 transition hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><div className="tour-modal-image" style={{ backgroundImage: `url('${selectedExperience.image}')` }} /><div className="p-7 sm:p-9"><p className="text-[10px] uppercase tracking-[0.3em] text-[#e7b96a]">Selected experience · {selectedExperience.city}</p><h2 id="tour-title" className="mt-3 font-display text-[34px] text-[#f4cf8d]">{selectedExperience.name}</h2><div className="mt-2 flex items-center gap-3 text-[11px] text-white/65"><span className="text-[#f5c55e]">★ {selectedExperience.rating}</span><span>({selectedExperience.reviews} reviews)</span><span>·</span><span>{selectedExperience.duration}</span></div><p className="mt-5 text-[14px] leading-6 text-white/72">{selectedExperience.description} Your local host will shape the details around your pace, curiosity and time in Egypt.</p><button onClick={() => setSelectedExperience(null)} className="tour-book-button mt-7 w-full rounded-full px-5 py-3 text-[11px] font-semibold">Continue to book <Icon name="arrow" size={14} /></button></div></div></div>}
    </main>
  );
}
