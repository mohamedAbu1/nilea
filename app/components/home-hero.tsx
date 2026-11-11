"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StyledSelect } from "./styled-select";

export type IconName = "arrow" | "calendar" | "car" | "compass" | "home" | "pin" | "spark" | "bag";

export const bookingLocations = [
  ["safaga", "Safaga"],
  ["marsa-alam", "Marsa Alam"],
  ["luxor", "Luxor"],
  ["aswan", "Aswan"],
  ["cairo", "Cairo"],
  ["hurghada", "Hurghada"],
] as const;

const heroSlides = [
  { image: "/alpnile-hero-beach-3d-v2.webp", kicker: "RED SEA · PRIVATE COAST · GOLDEN HOUR", title: "Let the sea", emphasis: "set the pace.", lede: "A quieter coast, clear water and a day shaped around the way you want Egypt to feel.", note: "Salt air / soft horizons" },
  { image: "/alpnile-hero-abu-simbel-3d-v2.webp", kicker: "ABU SIMBEL · ANCIENT WONDER · FIRST LIGHT", title: "Meet the", emphasis: "monuments at dawn.", lede: "Step into a monumental story before the desert wakes — with time to look closely and listen.", note: "Stone / silence / scale" },
  { image: "/alpnile-hero-giza-3d-v2.webp", kicker: "GIZA · MOONLIT HISTORY · CAIRO", title: "See Egypt", emphasis: "from a different light.", lede: "From pyramids to lantern-lit terraces, find the version of the city that stays with you.", note: "Skyline / memory / possibility" },
  { image: "/alpnile-hero-nile-sunset-3d-v2.webp", kicker: "THE NILE · FELUCCA · LAST LIGHT", title: "Follow the", emphasis: "river into evening.", lede: "A slow sail, warm water and a route that leaves room for the unexpected.", note: "River / rhythm / return" },
];

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "arrow") return <svg {...common}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M8 3.5v4M16 3.5v4M4 10h16" /></svg>;
  if (name === "car") return <svg {...common}><path d="m5 16 1.5-5.2A2 2 0 0 1 8.4 9.4h7.2a2 2 0 0 1 1.9 1.4L19 16" /><path d="M4 16h16v3H4zM7 19v1M17 19v1" /><circle cx="7" cy="16" r=".8" fill="currentColor" /><circle cx="17" cy="16" r=".8" fill="currentColor" /></svg>;
  if (name === "compass") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m15.8 8.2-2 5.6-5.6 2 2-5.6 5.6-2Z" /></svg>;
  if (name === "home") return <svg {...common}><path d="m4 11 8-7 8 7" /><path d="M6 10v9h12v-9M10 19v-5h4v5" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></svg>;
  return <svg {...common}><path d="M6 5h12v14H6zM8.5 8h7M8.5 11.5h7M8.5 15h4" /></svg>;
}

type HomeHeroProps = {
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  secondaryHref?: string;
};

export function HomeHero({ onSubmit, secondaryHref = "/#categories" }: HomeHeroProps) {
  const router = useRouter();
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroIntent, setHeroIntent] = useState<"trip" | "stay" | "car">("trip");
  const currentHero = heroSlides[heroSlide];

  useEffect(() => {
    if (heroPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      onSubmit(event);
      return;
    }
    event.preventDefault();
    router.push("/trip-planner");
  };

  return (
    <section className="home-redesign-hero" id="top" onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)} onFocusCapture={() => setHeroPaused(true)} onBlurCapture={() => setHeroPaused(false)}>
      <div key={currentHero.image} className="home-redesign-hero-media" style={{ backgroundImage: `url('${currentHero.image}')` }} aria-hidden="true" />
      <div className="home-redesign-hero-shade" aria-hidden="true" />
      <div className="home-redesign-hero-orbit" aria-hidden="true" />
      <div className="home-redesign-hero-inner">
        <div id="home-hero-story" className="home-redesign-hero-copy" role="tabpanel" tabIndex={-1}>
          <p className="home-redesign-kicker"><span>{currentHero.kicker.split(" · ")[0]}</span><i /> {currentHero.kicker.split(" · ").slice(1).join(" · ")}</p>
          <h1 aria-live="polite">{currentHero.title}<br /><em>{currentHero.emphasis}</em></h1>
          <p className="home-redesign-hero-lede">{currentHero.lede}</p>
          <div className="home-redesign-hero-actions">
            <Link className="home-redesign-primary-button" href="/trip-planner">Plan your route <Icon name="arrow" size={16} /></Link>
            <Link className="home-redesign-secondary-button" href={secondaryHref}>Explore the collection <span>↓</span></Link>
          </div>
        </div>
        <div className="home-redesign-hero-note"><span>0{heroSlide + 1}</span><p>{currentHero.note.split(" / ")[0]}<br />{currentHero.note.split(" / ").slice(1).join(" / ")}</p></div>
        <form className="home-redesign-hero-booker" onSubmit={handleSubmit}>
          <div className="home-redesign-booker-fields">
            <div className="home-redesign-booker-field"><span><Icon name="compass" size={14} /> I want to arrange</span><StyledSelect name="heroIntent" value={heroIntent} onChange={(nextValue) => setHeroIntent(nextValue as "trip" | "stay" | "car")} ariaLabel="I want to arrange" options={[{ value: "trip", label: "A trip or experience" }, { value: "stay", label: "A villa or home" }, { value: "car", label: "A tourist car" }]} /></div>
            <div className="home-redesign-booker-field"><span><Icon name="pin" size={14} /> Where in Egypt</span><StyledSelect name="heroCity" defaultValue="open" ariaLabel="Where in Egypt" options={[{ value: "open", label: "Help me choose" }, ...bookingLocations.map(([value, label]) => ({ value, label }))]} /></div>
            <div className="home-redesign-booker-field"><span><Icon name="calendar" size={14} /> Timing</span><StyledSelect name="heroTiming" defaultValue="flexible" ariaLabel="Timing" options={[{ value: "flexible", label: "I am flexible" }, { value: "soon", label: "Next 30 days" }, { value: "season", label: "This season" }]} /></div>
            <button type="submit" className="home-redesign-booker-submit" aria-label="Open smart journey form"><span className="home-papyrus-glyph" aria-hidden="true">𓂀</span><span className="home-booker-submit-label">Open smart form</span><Icon name="arrow" size={15} /></button>
          </div>
        </form>
        <div className="home-redesign-hero-metric"><strong>0{heroSlide + 1}</strong><span>Curated<br />chapter</span></div>
        <div className="home-hero-slider-controls" aria-label="Hero stories">
          <span className="home-hero-slider-count">0{heroSlide + 1}<i />0{heroSlides.length}</span>
          <div className="home-hero-slider-dots" role="tablist" aria-label="Choose hero story">
            {heroSlides.map((slide, index) => <button key={slide.image} type="button" role="tab" aria-selected={heroSlide === index} aria-controls="home-hero-story" tabIndex={heroSlide === index ? 0 : -1} aria-label={`Show story ${index + 1}`} className={heroSlide === index ? "active" : ""} onClick={() => setHeroSlide(index)} onKeyDown={(event) => { if (event.key === "ArrowRight") setHeroSlide((index + 1) % heroSlides.length); if (event.key === "ArrowLeft") setHeroSlide((index - 1 + heroSlides.length) % heroSlides.length); }} />)}
          </div>
          <div className="home-hero-slider-arrows"><button type="button" aria-label="Previous story" onClick={() => setHeroSlide((heroSlide - 1 + heroSlides.length) % heroSlides.length)}>←</button><button type="button" aria-label="Next story" onClick={() => setHeroSlide((heroSlide + 1) % heroSlides.length)}>→</button></div>
        </div>
      </div>
    </section>
  );
}
