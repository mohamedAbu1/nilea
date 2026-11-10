"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useDialogA11y } from "../components/dialog";
import { StyledSelect } from "../components/styled-select";
import { insertInquiry } from "../lib/submissions";

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
  { name: "A Night at the Temple", city: "Luxor", category: "Heritage", rating: "4.9", reviews: "320", duration: "3 hrs", price: "$89 USD", image: "/alpnile-tour-temple-night.webp", description: "Explore ancient wonders after dark with exclusive access and expert guides." },
  { name: "Nile Sunset Cruise", city: "Aswan", category: "Nile", rating: "4.8", reviews: "412", duration: "2.5 hrs", price: "$65 USD", image: "/alpnile-tour-nile-sunset.webp", description: "Sail the timeless Nile at golden hour with live music, light bites and unforgettable views." },
  { name: "Marsa Alam Wild Coast", city: "Marsa Alam", category: "Desert", rating: "4.9", reviews: "287", duration: "6 hrs", price: "$120 USD", image: "/alpnile-destination-sharm-v2.webp", description: "Pair coral shallows with desert light on a day shaped for sea, nature and stillness." },
  { name: "Cairo Food Walk", city: "Cairo", category: "Food", rating: "4.7", reviews: "365", duration: "4 hrs", price: "$75 USD", image: "/alpnile-tour-food-walk.webp", description: "Taste Egypt's vibrant street food with a local guide through historic Cairo." },
  { name: "Safaga Reef Morning", city: "Safaga", category: "Family", rating: "4.8", reviews: "198", duration: "4 hrs", price: "$82 USD", image: "/alpnile-hero-beach-3d-v2.webp", description: "Spend a clear-water morning above reefs, warm shallows and the open Red Sea." },
  { name: "Red Sea Coral Garden", city: "Hurghada", category: "Family", rating: "4.8", reviews: "306", duration: "5 hrs", price: "$110 USD", image: "/alpnile-destination-hurghada-v2.webp", description: "Spend an unhurried day above clear water, coral gardens and the quiet blue of the Red Sea." },
  { name: "Marsa Alam Nature Trail", city: "Marsa Alam", category: "Family", rating: "4.9", reviews: "274", duration: "6 hrs", price: "$128 USD", image: "/alpnile-hero-beach-3d-v2.webp", description: "Follow the coast beyond the resort road through mangroves, reef water and open horizons." },
];

const recommendations = [
  { name: "Safaga Reef Day", city: "Safaga", rating: "4.8", reviews: "211", price: "From $120", image: "/alpnile-hero-beach-3d-v2.webp" },
  { name: "Luxor Highlights", city: "Luxor", rating: "4.9", reviews: "498", price: "From $95", image: "/alpnile-tour-temple-night.webp" },
  { name: "Red Sea Snorkeling", city: "Hurghada", rating: "4.7", reviews: "302", price: "From $110", image: "/alpnile-destination-hurghada-v2.webp" },
  { name: "Marsa Alam Coast", city: "Marsa Alam", rating: "4.8", reviews: "189", price: "From $140", image: "/alpnile-destination-sharm-v2.webp" },
  { name: "Hurghada Coral Day", city: "Hurghada", rating: "4.8", reviews: "226", price: "From $128", image: "/alpnile-destination-hurghada-v2.webp" },
];

const destinationOptions = ["All Egypt", "Safaga", "Marsa Alam", "Luxor", "Aswan", "Cairo", "Hurghada"];
const destinationQueryMap: Record<string, string> = { safaga: "Safaga", "marsa-alam": "Marsa Alam", luxor: "Luxor", aswan: "Aswan", cairo: "Cairo", hurghada: "Hurghada" };
const whatsAppNumber = "41765082885";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: `inline-ui-icon inline-ui-${name}` };
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
  const searchParams = useSearchParams();
  const requestedDestination = searchParams.get("destination");
  const initialDestination = requestedDestination ? destinationQueryMap[requestedDestination] ?? "All Egypt" : "All Egypt";
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState("Any date");
  const [guests, setGuests] = useState("2 adults");
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("alpnile-tour-favorites");
    if (!stored) return;
    try { setFavorites(JSON.parse(stored) as string[]); } catch { window.localStorage.removeItem("alpnile-tour-favorites"); }
  }, []);
  useEffect(() => {
    window.localStorage.setItem("alpnile-tour-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const visibleExperiences = useMemo(() => {
    return experiences.filter((experience) => (activeCategory === "All" || experience.category === activeCategory) && (destination === "All Egypt" || experience.city === destination));
  }, [activeCategory, destination]);
  const toggleFavorite = (name: string) => setFavorites((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  const submitExperienceRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedExperience) return;
    setBookingError("");
    setBookingSubmitting(true);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setBookingSubmitting(false); return; }
    const fullName = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const dateValue = String(form.get("date") ?? "").trim();
    const guestsValue = String(form.get("guests") ?? "2");
    const message = `Experience request: ${selectedExperience.name} · ${selectedExperience.city} · ${dateValue} · ${guestsValue} guests. ${String(form.get("notes") ?? "").trim()}`;
    const result = await insertInquiry({ request_type: "trip", full_name: fullName, email, phone, message, details: { experience: selectedExperience.name, city: selectedExperience.city, date: dateValue, guests: guestsValue }, source: "tours-page" });
    if (result.error) {
      setBookingError("We could not save this request. Please try again.");
      setBookingSubmitting(false);
      return;
    }
    setBookingConfirmed(true);
    setBookingSubmitting(false);
    window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(`Hello AlpNile, I would like to request ${selectedExperience.name}.\nName: ${fullName}\nDate: ${dateValue}\nGuests: ${guestsValue}\nPhone: ${phone}`)}`, "_blank", "noopener,noreferrer");
  };
  useDialogA11y(Boolean(selectedExperience), () => { setSelectedExperience(null); setBookingConfirmed(false); }, dialogRef);

  return (
    <main className="tour-shell">
      <section className="tour-hero">
        <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 pt-12 sm:px-7 sm:pt-14 lg:px-12 lg:pt-6">
          <div className="tour-hero-copy max-w-[760px]"><h1 className="font-display text-[52px] leading-[.92] tracking-[-.045em] text-[#f3c477] sm:text-[64px]">Tours &amp; Experiences</h1><p className="mt-3 font-display text-[27px] leading-none text-[#f3cf8d] sm:text-[34px]">Make the moment memorable</p><p className="mt-3 max-w-[485px] text-[14px] leading-5 text-[#eee9df]/90">Extraordinary journeys, handpicked by local experts. Explore Egypt through people, places and authentic experiences.</p></div>

          <div className="tour-search-panel mt-6 rounded-[18px] p-2 sm:mt-5 sm:p-2"><div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_170px] sm:gap-0"><label className="tour-search-control rounded-xl px-4 text-left"><small>Destination</small><span className="tour-search-select-wrap"><Icon name="pin" size={17} /><StyledSelect value={destination} onChange={(nextValue) => { setDestination(nextValue); setSearched(false); }} ariaLabel="Destination">{destinationOptions.map((option) => <option key={option}>{option}</option>)}</StyledSelect></span></label><label className="tour-search-control rounded-xl px-4 text-left"><small>Date</small><span className="tour-search-select-wrap"><Icon name="calendar" size={17} /><StyledSelect value={date} onChange={setDate} ariaLabel="Date"><option>Any date</option><option>This weekend</option><option>Next 30 days</option></StyledSelect></span></label><label className="tour-search-control rounded-xl px-4 text-left"><small>Guests</small><span className="tour-search-select-wrap"><Icon name="users" size={17} /><StyledSelect value={guests} onChange={setGuests} ariaLabel="Guests"><option>1 adult</option><option>2 adults</option><option>3 adults</option><option>4+ adults</option></StyledSelect></span></label><button type="button" onClick={() => { setSearched(true); document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="tour-search-button rounded-xl px-4 text-[12px] font-semibold">Search Experiences <Icon name="search" size={15} /></button></div></div>

          <div className="tour-category-tabs no-scrollbar">{categories.map((category) => <button key={category.label} onClick={() => { setActiveCategory(category.label); setSearched(false); }} className={`tour-category-tab ${activeCategory === category.label ? "active" : ""}`} aria-pressed={activeCategory === category.label}><span className="tour-category-icon"><Icon name={category.icon} size={19} /></span><span>{category.label}</span></button>)}</div>


          <section id="featured" className="tour-featured-section scroll-mt-28"><div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="font-display text-[34px] text-[#f2ca84] sm:text-[42px]">Curated for your route</h2><p className="tour-results-count">{visibleExperiences.length} experiences match your current filters</p></div><button type="button" onClick={() => { setActiveCategory("All"); setDestination("All Egypt"); setSearched(true); }} className="hidden items-center gap-2 text-[11px] text-white/65 transition hover:text-[#f4c577] sm:flex">View all experiences <Icon name="arrow" size={13} /></button></div>
            <div className="tour-featured-grid">{visibleExperiences.length ? visibleExperiences.map((experience) => <article key={experience.name} className="tour-card"><div className="tour-card-media" style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 10, 16, .02) 24%, rgba(3, 9, 15, .74) 100%), url('${experience.image}')` }}><button onClick={() => toggleFavorite(experience.name)} className={`tour-heart ${favorites.includes(experience.name) ? "saved" : ""}`} aria-label={`${favorites.includes(experience.name) ? "Remove" : "Save"} ${experience.name}`} aria-pressed={favorites.includes(experience.name)}><Icon name="heart" size={17} /></button></div><div className="tour-card-content"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-[21px] leading-tight text-[#f3d08e]">{experience.name}</h3><p className="mt-1 text-[10px] text-white/55">{experience.city}</p></div><span className="tour-card-category">{experience.category}</span></div><p className="mt-3 min-h-[48px] text-[11px] leading-5 text-white/65">{experience.description}</p><div className="mt-3 flex items-center gap-4 text-[10px] text-white/70"><span className="text-[#f9c34f]">★ {experience.rating}</span><span>({experience.reviews})</span><span className="flex items-center gap-1"><Icon name="clock" size={13} /> {experience.duration}</span></div><p className="mt-3 font-display text-[17px] text-[#f4cf8d]">{experience.price}</p><button onClick={() => { setBookingConfirmed(false); setSelectedExperience(experience); }} className="tour-book-button mt-3 w-full rounded-full px-4 py-2.5 text-[11px] font-semibold">Book Experience <Icon name="arrow" size={14} /></button></div></article>) : <div className="tour-empty-state"><strong>No experiences found</strong><span>Try another destination or category.</span></div>}</div>
            {searched && <div className="tour-notice mt-4 rounded-full px-4 py-2 text-[11px] text-[#f4cf8d]" role="status">Showing {activeCategory === "All" ? "all experiences" : activeCategory.toLowerCase()} in {destination} · {guests}</div>}
          </section>

          <section className="tour-recommendations"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#e6b567]">A thoughtful next chapter</p><h2 className="mt-2 font-display text-[28px] text-[#f2ca84] sm:text-[33px]">Recommended for You</h2></div><span className="hidden text-[10px] text-white/50 sm:block">Based on your route</span></div><div className="tour-recommendation-grid">{recommendations.map((recommendation) => <button key={recommendation.name} onClick={() => setSelectedExperience({ ...experiences[0], name: recommendation.name, city: recommendation.city, rating: recommendation.rating, reviews: recommendation.reviews, price: recommendation.price, image: recommendation.image })} className="tour-recommendation-card text-left"><span className="tour-recommendation-image" style={{ backgroundImage: `url('${recommendation.image}')` }} /><span><strong>{recommendation.name}</strong><small>{recommendation.city}</small><em><b>★</b> {recommendation.rating} ({recommendation.reviews})</em><small className="tour-recommendation-price">{recommendation.price}</small></span><Icon name="heart" size={14} /></button>)}</div></section>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 pb-5 pt-1 text-[11px] text-white/50 sm:px-7 lg:px-12"><p>Small moments, lasting memories <span className="mx-2 text-[#dcae61]">·</span> {activeCategory}</p><p className="font-display tracking-[0.16em] text-[#c7914d]">ALPNILE / TOURS 05</p></section>

      {selectedExperience && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => { setSelectedExperience(null); setBookingConfirmed(false); setBookingError(""); }}><div ref={dialogRef} className="tour-modal modal-depth relative w-full max-w-xl overflow-hidden rounded-[24px]" role="dialog" aria-modal="true" aria-labelledby="tour-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" data-dialog-close onClick={() => { setSelectedExperience(null); setBookingConfirmed(false); }} className="absolute right-5 top-5 z-10 text-white/70 transition hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><div className="tour-modal-image" style={{ backgroundImage: `url('${selectedExperience.image}')` }} /><div className="p-7 sm:p-9"><p className="text-[10px] uppercase tracking-[0.3em] text-[#e7b96a]">Selected experience · {selectedExperience.city}</p><h2 id="tour-title" className="mt-3 font-display text-[34px] text-[#f4cf8d]">{selectedExperience.name}</h2><div className="mt-2 flex items-center gap-3 text-[11px] text-white/65"><span className="text-[#f5c55e]">★ {selectedExperience.rating}</span><span>({selectedExperience.reviews} reviews)</span><span>·</span><span>{selectedExperience.duration}</span></div><p className="mt-5 text-[14px] leading-6 text-white/72">{selectedExperience.description} Your local host will shape the details around your pace, curiosity and time in Egypt.</p>{bookingConfirmed ? <div className="tour-confirmation mt-6"><strong>Booking request saved</strong><span>We opened WhatsApp with your details so the AlpNile team can confirm the next step.</span></div> : <form className="tour-request-form mt-6" onSubmit={submitExperienceRequest}><input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" /><div className="tour-request-grid"><input name="name" required placeholder="Full name" /><input name="email" type="email" required placeholder="Email address" /><input name="phone" required placeholder="WhatsApp number" /><input name="date" type="date" required min={new Date().toISOString().slice(0, 10)} /><StyledSelect name="guests" defaultValue="2" ariaLabel="Guests"><option value="1">1 adult</option><option value="2">2 adults</option><option value="3">3 adults</option><option value="4">4+ adults</option></StyledSelect></div><textarea name="notes" rows={3} placeholder="Notes or preferences (optional)" /><button type="submit" disabled={bookingSubmitting} className="tour-book-button mt-3 w-full rounded-full px-5 py-3 text-[11px] font-semibold">{bookingSubmitting ? "Saving request…" : "Continue to request"} <Icon name="arrow" size={14} /></button>{bookingError && <p className="home-form-error" role="alert">{bookingError}</p>}</form>}</div></div></div>}
    </main>
  );
}
