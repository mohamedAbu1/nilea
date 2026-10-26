"use client";

import { useState } from "react";

type IconName = "search" | "menu" | "close" | "arrow" | "pin" | "calendar" | "plane" | "train" | "boat" | "car" | "swap" | "clock" | "wifi" | "bag" | "seat" | "sparkle";
type Mode = "Flights" | "Trains" | "Nile Cruises" | "Transfers" | "Private Drivers";

type Route = {
  provider: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  price: string;
  comfort: string;
  image: string;
};

const modes: { label: Mode; icon: IconName }[] = [
  { label: "Flights", icon: "plane" },
  { label: "Trains", icon: "train" },
  { label: "Nile Cruises", icon: "boat" },
  { label: "Transfers", icon: "car" },
  { label: "Private Drivers", icon: "car" },
];

const routesByMode: Record<Mode, Route[]> = {
  Flights: [
    { provider: "EgyptAir", from: "Cairo (CAI)", to: "Luxor (LXR)", depart: "07:30", arrive: "08:45", duration: "1h 15m", price: "$120", comfort: "High Comfort", image: "/nilea-transport-flight.png" },
    { provider: "Nile Air", from: "Cairo (CAI)", to: "Luxor (LXR)", depart: "12:20", arrive: "13:40", duration: "1h 20m", price: "$95", comfort: "Good Comfort", image: "/nilea-transport-flight.png" },
    { provider: "Air Cairo", from: "Cairo (CAI)", to: "Luxor (LXR)", depart: "18:10", arrive: "19:25", duration: "1h 15m", price: "$110", comfort: "High Comfort", image: "/nilea-transport-flight.png" },
  ],
  Trains: [
    { provider: "Watania", from: "Cairo (Ramses)", to: "Luxor Station", depart: "20:00", arrive: "06:10", duration: "10h 10m", price: "$68", comfort: "Sleeper Cabin", image: "/nilea-transport-cruise.png" },
    { provider: "Spanish Train", from: "Cairo (Ramses)", to: "Aswan Station", depart: "21:00", arrive: "10:30", duration: "13h 30m", price: "$52", comfort: "First Class", image: "/nilea-transport-cruise.png" },
  ],
  "Nile Cruises": [
    { provider: "Nile Star", from: "Luxor", to: "Aswan", depart: "16:00", arrive: "09:00", duration: "3 nights", price: "$420", comfort: "Full Board", image: "/nilea-transport-cruise.png" },
    { provider: "Sun Boat", from: "Cairo", to: "Luxor", depart: "18:30", arrive: "08:30", duration: "5 nights", price: "$690", comfort: "Deluxe Deck", image: "/nilea-transport-cruise.png" },
  ],
  Transfers: [
    { provider: "Cairo Express", from: "Cairo Airport", to: "Luxor Hotel", depart: "Any time", arrive: "Door to door", duration: "8h 30m", price: "$150", comfort: "Private Van", image: "/nilea-transport-hero.png" },
    { provider: "Nile Shuttle", from: "Luxor Airport", to: "West Bank", depart: "Any time", arrive: "Door to door", duration: "35m", price: "$24", comfort: "Comfort Car", image: "/nilea-transport-hero.png" },
  ],
  "Private Drivers": [
    { provider: "NILEA Select", from: "Cairo", to: "Luxor", depart: "Your time", arrive: "Your time", duration: "8h 15m", price: "$210", comfort: "Premium Sedan", image: "/nilea-transport-hero.png" },
    { provider: "NILEA Select", from: "Luxor", to: "Aswan", depart: "Your time", arrive: "Your time", duration: "3h 30m", price: "$95", comfort: "Premium Sedan", image: "/nilea-transport-hero.png" },
  ],
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6.7" /><path d="m16 16 4.3 4.3" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13" /><path d="m13 7 5 5-5 5" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.3" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="4" y="5.2" width="16" height="14.8" rx="2" /><path d="M8 3.8v3M16 3.8v3M4 9.5h16" /></svg>;
  if (name === "plane") return <svg {...common}><path d="m3 12 18-6-6 18-3-8-9-4Z" /><path d="M12 16 9 13" /></svg>;
  if (name === "train") return <svg {...common}><rect x="5" y="4" width="14" height="13" rx="3" /><path d="M8 20h8M9 17l-2 3M15 17l2 3M8 9h8M8 13h.01M16 13h.01" /></svg>;
  if (name === "boat") return <svg {...common}><path d="M4 14h16l-2 5H6l-2-5ZM12 4v10M8 8h8M6 19c2 2 4 2 6 0 2 2 4 2 6 0" /></svg>;
  if (name === "car") return <svg {...common}><path d="m5 16 1.6-6h10.8l1.6 6M3.5 16h17v3h-3M3.5 16v3h3M7 19h10M8 13h8" /><circle cx="7" cy="17" r="1" /><circle cx="17" cy="17" r="1" /></svg>;
  if (name === "swap") return <svg {...common}><path d="M6 7h12M14 4l4 3-4 3M18 17H6M10 14l-4 3 4 3" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "wifi") return <svg {...common}><path d="M3 9a14 14 0 0 1 18 0M6 13a9.5 9.5 0 0 1 12 0M9.5 17a4.5 4.5 0 0 1 5 0M12 21h.01" /></svg>;
  if (name === "bag") return <svg {...common}><path d="M5 8h14l1 12H4L5 8ZM8 8a4 4 0 0 1 8 0" /></svg>;
  if (name === "seat") return <svg {...common}><path d="M7 4h3v7h5a3 3 0 0 1 3 3v6H7v-6h3M7 20H4M10 14H7" /></svg>;
  if (name === "sparkle") return <svg {...common}><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></svg>;
  return <svg {...common}><path d="M4 12h16" /></svg>;
}

export default function TravelTransportPage() {
  const [activeMode, setActiveMode] = useState<Mode>("Flights");
  const [from, setFrom] = useState("Cairo (CAI)");
  const [to, setTo] = useState("Luxor (LXR)");
  const [departure, setDeparture] = useState("Apr 12, 2025");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const routes = routesByMode[activeMode];
  const swapRoute = () => { setFrom(to); setTo(from); };
  const cycleDeparture = () => setDeparture((value) => value === "Apr 12, 2025" ? "Apr 18, 2025" : "Apr 12, 2025");

  return (
    <main className="transport-shell">
      <header className="transport-header sticky top-0 z-40">
        <div className="mx-auto flex h-[74px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-7 lg:px-12">
          <a href="/" className="font-display text-[23px] tracking-[0.16em] text-[#f3ca82] transition hover:text-white">NILEA</a>
          <nav className="hidden items-center gap-5 text-[11px] text-[#d9d4ca] lg:flex" aria-label="Primary navigation">
            <a href="/" className="transition hover:text-[#f4ca80]">History</a>
            <a href="/local-life" className="transition hover:text-[#f4ca80]">Local Life &amp; Dining</a>
            <a href="/stays-hotels" className="transition hover:text-[#f4ca80]">Stays &amp; Hotels</a>
            <a href="/travel-transport" className="relative py-3 text-[#f4c577] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[#e9b85e]">Travel &amp; Transport</a>
            <a href="/tours-experiences" className="transition hover:text-[#f4ca80]">Tours &amp; Experiences</a>
          </nav>
          <div className="flex items-center gap-3"><a href="#routes" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] sm:flex" aria-label="Search routes"><Icon name="search" size={16} /></a><button onClick={() => setMenuOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] lg:hidden" aria-label="Open menu" aria-expanded={menuOpen}><Icon name={menuOpen ? "close" : "menu"} size={16} /></button><button onClick={() => document.getElementById("routes")?.scrollIntoView({ behavior: "smooth" })} className="hidden rounded-full bg-gradient-to-b from-[#f6d18d] to-[#d49643] px-5 py-2.5 text-[11px] font-semibold text-[#1e160c] shadow-[0_8px_22px_rgba(202,141,57,.22)] transition hover:brightness-110 sm:block">Plan Your Trip</button></div>
          {menuOpen && <div className="menu-popover absolute right-4 top-[66px] w-60 rounded-2xl border border-[#e8b65e]/30 bg-[#09141f]/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden"><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="/local-life" onClick={() => setMenuOpen(false)}>Local life &amp; dining</a><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="/stays-hotels" onClick={() => setMenuOpen(false)}>Stays &amp; hotels</a><a className="block rounded-xl px-4 py-3 text-sm text-[#f4c577] hover:bg-white/5" href="#routes" onClick={() => setMenuOpen(false)}>Search routes</a></div>}
        </div>
      </header>

      <section className="transport-hero">
        <div className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-12 sm:px-7 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="transport-hero-copy max-w-[550px]"><p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-[#e5b767]">Nile archives · chapter four</p><h1 className="font-display text-[60px] leading-[.88] tracking-[-.045em] text-[#f3c477] sm:text-[83px]">Travel &amp;<br />Transport</h1><p className="mt-5 font-display text-[27px] leading-none text-[#f3cf8d] sm:text-[33px]">Move through Egypt with ease.</p><p className="mt-4 max-w-[350px] text-[14px] leading-5 text-[#eee9df]/90">Flights, trains, Nile cruises, airport transfers and private drivers — all in one place.</p></div>
          <div className="transport-search-panel mt-8 rounded-[18px] p-3 sm:mt-10"><div className="grid gap-2 sm:grid-cols-[1fr_35px_1fr_1fr_170px] sm:gap-2"><button onClick={() => setFrom((value) => value === "Cairo (CAI)" ? "Alexandria (HBE)" : "Cairo (CAI)")} className="transport-control rounded-xl px-4 text-left"><small>From</small><strong><Icon name="pin" size={15} />{from}<span>⌄</span></strong></button><button onClick={swapRoute} className="transport-swap rounded-full" aria-label="Swap route"><Icon name="swap" size={16} /></button><button onClick={() => setTo((value) => value === "Luxor (LXR)" ? "Aswan (ASW)" : "Luxor (LXR)")} className="transport-control rounded-xl px-4 text-left"><small>To</small><strong><Icon name="pin" size={15} />{to}<span>⌄</span></strong></button><button onClick={cycleDeparture} className="transport-control rounded-xl px-4 text-left"><small>Departure</small><strong><Icon name="calendar" size={15} />{departure}<span>⌄</span></strong></button><button onClick={() => setSearched(true)} className="transport-search-button rounded-xl px-4 text-[12px] font-semibold">Search Routes <Icon name="arrow" size={14} /></button></div></div>

          <div id="routes" className="transport-content mt-6"><div className="transport-tabs no-scrollbar">{modes.map((mode) => <button key={mode.label} onClick={() => { setActiveMode(mode.label); setSearched(false); }} className={`transport-tab ${activeMode === mode.label ? "active" : ""}`}><Icon name={mode.icon} size={22} /><span>{mode.label}</span></button>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-[1.12fr_.88fr]"><div className="transport-route-list">{routes.map((route) => <button key={`${route.provider}-${route.depart}`} onClick={() => setSelectedRoute(route)} className="transport-route-card group text-left"><div className="transport-route-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(4, 11, 18, .04), rgba(4, 11, 18, .32)), url('${route.image}')` }} /><div className="transport-route-details"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] text-white/45">{route.provider}</p><p className="mt-1 text-[14px] text-white/90">{route.from} <span className="mx-2 text-[#f4c577]">→</span> {route.to}</p></div><div className="text-right"><p className="font-display text-[21px] text-[#f4cf8d]">{route.price}</p><small className="text-[9px] text-white/50">per person</small></div></div><div className="mt-3 flex items-center gap-5 text-[10px] text-white/65"><span>{route.depart} <b className="mx-1 text-[#f4c577]">→</b> {route.arrive}</span><span className="flex items-center gap-1"><Icon name="clock" size={13} />{route.duration}</span><span className="hidden items-center gap-1 sm:flex"><Icon name="wifi" size={13} />{route.comfort}</span></div><div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3"><span className="flex items-center gap-2 text-[10px] text-[#f4c577]"><span className="tracking-[0.12em]">●●●●</span><span className="text-white/60">{route.comfort}</span></span><span className="transport-select">Select <Icon name="arrow" size={12} /></span></div></div></button>)}</div><aside className="smart-route-panel rounded-[18px] p-5"><div className="relative z-10"><div className="flex items-start gap-3"><span className="smart-sparkle"><Icon name="sparkle" size={21} /></span><div><h2 className="font-display text-[24px] leading-none text-[#f3cd8d]">Smart Route Suggestions</h2><p className="mt-2 max-w-[260px] text-[12px] leading-4 text-white/70">The best ways to travel between Egypt&apos;s iconic destinations.</p></div></div><div className="smart-route-line"><span className="smart-node cairo-node">Cairo</span><span className="smart-node luxor-node">Luxor</span><span className="smart-node aswan-node">Aswan</span></div><div className="mt-5 grid gap-2">{[["Cairo → Luxor", "Fly · 1h 15m", "plane"], ["Cairo → Aswan", "Fly · 1h 30m", "plane"], ["Luxor → Aswan", "Nile Cruise · 3 nights", "boat"], ["Cairo → Hurghada", "Transfer · 5h", "car"], ["Cairo → Alexandria", "Train · 2h 30m", "train"]].map(([title, meta, icon]) => <button key={title} onClick={() => setSearched(true)} className="smart-route-item"><span className="smart-route-thumb" style={{ backgroundImage: `url('${icon === "boat" ? "/nilea-transport-cruise.png" : icon === "plane" ? "/nilea-transport-flight.png" : "/nilea-transport-hero.png"}')` }} /><span><strong>{title}</strong><small>{meta}</small></span><Icon name="arrow" size={14} /></button>)}</div></div></aside></div>{searched && <div className="transport-notice mt-4 rounded-full px-4 py-2 text-[11px] text-[#f4cf8d]">Routes updated for {from} → {to} on {departure} · {routes.length} options ready</div>}</div>
        </div>
      </section>

      <section id="guide" className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 pb-5 pt-1 text-[11px] text-white/50 sm:px-7 lg:px-12"><p>Follow the river, choose your pace <span className="mx-2 text-[#dcae61]">·</span> {activeMode}</p><p className="font-display tracking-[0.16em] text-[#c7914d]">NILEA / TRANSPORT 04</p></section>

      {selectedRoute && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="route-title"><div className="transport-modal modal-depth relative w-full max-w-lg overflow-hidden rounded-[24px]"><button onClick={() => setSelectedRoute(null)} className="absolute right-5 top-5 z-10 text-white/70 hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><div className="transport-modal-image" style={{ backgroundImage: `url('${selectedRoute.image}')` }} /><div className="p-7 sm:p-9"><p className="text-[10px] uppercase tracking-[0.3em] text-[#e7b96a]">Selected route · {selectedRoute.provider}</p><h2 id="route-title" className="mt-3 font-display text-[32px] text-[#f4cf8d]">{selectedRoute.from} → {selectedRoute.to}</h2><p className="mt-2 text-[12px] text-white/65">{selectedRoute.depart} → {selectedRoute.arrive} · {selectedRoute.duration}</p><p className="mt-5 text-[14px] leading-6 text-white/72">A considered way to cross Egypt with {selectedRoute.comfort.toLowerCase()} and a route built around your time.</p><button onClick={() => setSelectedRoute(null)} className="transport-search-button mt-7 w-full rounded-full px-5 py-3 text-[11px] font-semibold">Continue with this route <Icon name="arrow" size={14} /></button></div></div></div>}
    </main>
  );
}
