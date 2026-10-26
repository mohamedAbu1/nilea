"use client";

import { useMemo, useState } from "react";

type IconName = "search" | "menu" | "arrow" | "play" | "pause" | "close";

type Era = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  dates: string;
  note: string;
  imagePosition: string;
  artifacts: { name: string; type: string; position: string }[];
};

const eras: Era[] = [
  {
    id: "ancient",
    label: "Ancient Egypt",
    shortLabel: "Ancient\nEgypt",
    description: "A civilization of visionaries, builders and believers who transformed the Nile into a legacy for eternity.",
    dates: "c. 3100 – 332 BC",
    note: "Where the river became a kingdom, and stone learned to speak.",
    imagePosition: "13% 56%",
    artifacts: [
      { name: "Golden mask", type: "Regalia", position: "9% 68%" },
      { name: "Temple figure", type: "Sculpture", position: "34% 63%" },
      { name: "Canopic jar", type: "Ceramic", position: "58% 73%" },
      { name: "Wall relief", type: "Inscription", position: "87% 62%" },
    ],
  },
  {
    id: "ptolemaic",
    label: "Ptolemaic Era",
    shortLabel: "Ptolemaic\nEra",
    description: "A luminous meeting of Egyptian ritual, Greek imagination and the restless curiosity of Alexandria.",
    dates: "305 – 30 BC",
    note: "A cosmopolitan age where ideas travelled as freely as the Nile.",
    imagePosition: "31% 54%",
    artifacts: [
      { name: "Alexandria coin", type: "Metalwork", position: "8% 66%" },
      { name: "Isis figure", type: "Sculpture", position: "36% 61%" },
      { name: "Blue vessel", type: "Ceramic", position: "59% 74%" },
      { name: "Greek inscription", type: "Relief", position: "88% 60%" },
    ],
  },
  {
    id: "roman",
    label: "Roman Egypt",
    shortLabel: "Roman\nEgypt",
    description: "A frontier of empires, where Roman roads, Egyptian gods and Mediterranean trade met under one sky.",
    dates: "30 BC – 641 AD",
    note: "The old gods remained; the world around them kept changing.",
    imagePosition: "50% 52%",
    artifacts: [
      { name: "Fayoum portrait", type: "Painting", position: "7% 64%" },
      { name: "Roman bust", type: "Sculpture", position: "35% 61%" },
      { name: "Trade amphora", type: "Ceramic", position: "61% 74%" },
      { name: "Coptic fragment", type: "Textile", position: "90% 62%" },
    ],
  },
  {
    id: "islamic",
    label: "Islamic Cairo",
    shortLabel: "Islamic\nCairo",
    description: "A city of courtyards, calligraphy and commerce, shaped by centuries of learning along the river.",
    dates: "641 – 1517 AD",
    note: "Listen closely: every lane carries a story from another century.",
    imagePosition: "69% 48%",
    artifacts: [
      { name: "Brass astrolabe", type: "Science", position: "6% 65%" },
      { name: "Lattice lantern", type: "Craft", position: "35% 61%" },
      { name: "Ceramic tile", type: "Pattern", position: "61% 73%" },
      { name: "Calligraphy panel", type: "Manuscript", position: "90% 60%" },
    ],
  },
  {
    id: "modern",
    label: "Modern Egypt",
    shortLabel: "Modern\nEgypt",
    description: "A living, layered culture carrying its inheritance forward while imagining what the next chapter can be.",
    dates: "1517 AD – present",
    note: "The river still moves. So does the story.",
    imagePosition: "87% 45%",
    artifacts: [
      { name: "Nile map", type: "Cartography", position: "6% 65%" },
      { name: "City sculpture", type: "Modern art", position: "36% 61%" },
      { name: "Blue glass", type: "Design", position: "61% 73%" },
      { name: "Photo archive", type: "Memory", position: "90% 60%" },
    ],
  },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6.7" /><path d="m16 16 4.3 4.3" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13" /><path d="m13 7 5 5-5 5" /></svg>;
  if (name === "play") return <svg {...common} fill="currentColor" stroke="none"><path d="M8.4 5.7a1 1 0 0 1 1.52-.85l7.6 6.3a1.1 1.1 0 0 1 0 1.7l-7.6 6.3a1 1 0 0 1-1.52-.85V5.7Z" /></svg>;
  if (name === "pause") return <svg {...common} fill="currentColor" stroke="none"><rect x="7" y="5" width="3.3" height="14" rx="1" /><rect x="13.7" y="5" width="3.3" height="14" rx="1" /></svg>;
  return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function AudioWave({ playing }: { playing: boolean }) {
  const heights = [8, 16, 10, 22, 14, 29, 18, 34, 12, 25, 19, 30, 11, 21, 17, 28, 9, 18, 13, 23, 15, 11, 20, 8, 16, 12, 19, 10, 16, 7];
  return <div className={`waveform flex h-9 items-center gap-[3px] ${playing ? "animate-pulse" : ""}`} aria-hidden="true">{heights.map((height, i) => <span key={i} style={{ height }} />)}</div>;
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const activeEra = useMemo(() => eras[activeIndex], [activeIndex]);

  const selectEra = (index: number) => {
    setActiveIndex(index);
    setPlaying(false);
  };

  return (
    <main className="site-shell">
      <div className="ambient-orbit orbit-a" aria-hidden="true" />
      <div className="ambient-orbit orbit-b" aria-hidden="true" />
      <div className="mx-auto min-h-screen w-full max-w-[1500px] px-4 pb-10 sm:px-7 lg:px-12">
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-white/15 bg-[#06111c]/45 backdrop-blur-md">
          <a href="#top" className="font-display text-[23px] tracking-[0.16em] text-[#f3ca82] transition hover:text-white">NILEA</a>
          <nav className="hidden items-center gap-5 text-[11px] text-[#d9d4ca] lg:flex" aria-label="Primary navigation">
            {[
              ["Explore", "#journey"],
              ["Destinations", "#artifacts"],
              ["History", "#journey"],
              ["Local Life & Dining", "/local-life"],
              ["Stays & Hotels", "/stays-hotels"],
              ["Travel & Transport", "/travel-transport"],
            ].map(([label, href], i) => <a key={label} href={href} className={`relative py-3 transition hover:text-[#f4ca80] ${i === 2 ? "text-[#f4c577] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[#e9b85e]" : ""}`}>{label}</a>)}
            <a href="#guide" className="py-3 transition hover:text-[#f4ca80]">Smart Guide</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#journey" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577] sm:flex" aria-label="Search"><Icon name="search" size={16} /></a>
            <button onClick={() => setMenuOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-[#f4c577] hover:text-[#f4c577]" aria-label="Open menu" aria-expanded={menuOpen}><Icon name={menuOpen ? "close" : "menu"} size={16} /></button>
            <button onClick={() => setTripOpen(true)} className="hidden rounded-full bg-gradient-to-b from-[#f6d18d] to-[#d49643] px-5 py-2.5 text-[11px] font-semibold text-[#1e160c] shadow-[0_8px_22px_rgba(202,141,57,.22)] transition hover:brightness-110 sm:block">Plan Your Trip</button>
          </div>
          {menuOpen && <div className="menu-popover absolute right-0 top-[68px] w-52 rounded-2xl border border-[#e8b65e]/30 bg-[#09141f]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden"><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="#journey" onClick={() => setMenuOpen(false)}>Explore the eras</a><a className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5" href="#artifacts" onClick={() => setMenuOpen(false)}>View artifacts</a><button className="block w-full rounded-xl px-4 py-3 text-left text-sm text-[#f4c577] hover:bg-white/5" onClick={() => { setMenuOpen(false); setTripOpen(true); }}>Plan your trip</button></div>}
        </header>

        <section id="top" className="relative pt-14 sm:pt-20 lg:pt-24">
          <div className="hero-depth max-w-[670px]">
            <p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-[#e5b767]">Nile archives · chapter one</p>
            <h1 className="text-glow max-w-[680px] font-display text-[59px] leading-[.92] tracking-[-.04em] text-[#f3c477] sm:text-[84px] lg:text-[98px]">Journey<br />Through Time</h1>
            <p className="mt-6 max-w-[380px] text-[14px] leading-6 text-[#eee9df]/90 sm:text-[15px]">Five eras. A timeless civilization.<br />Explore Egypt&apos;s extraordinary story through<br className="hidden sm:block" /> the places, people and cultures that shaped it.</p>
          </div>
          <div className="absolute right-1 top-20 hidden w-40 text-[12px] leading-5 text-[#ebe0cf] lg:block"><span className="block text-[#f5c67b]">Same River</span><span>A Thousand Stories</span><div className="mt-4 h-px w-16 bg-[#e8b463]" /></div>
        </section>

        <section id="journey" className="relative mt-12 sm:mt-16">
          <div className="absolute left-[6%] right-[6%] top-[60%] h-px bg-gradient-to-r from-transparent via-[#edb45e]/55 to-transparent" />
          <div className="timeline-stage relative grid grid-cols-5 gap-2 sm:gap-4 lg:gap-7">
            {eras.map((era, index) => (
              <button key={era.id} onClick={() => selectEra(index)} style={{ animationDelay: `${index * 80}ms` }} className={`timeline-card relative flex min-w-0 flex-col items-center text-center ${activeIndex === index ? "active" : "opacity-75 hover:opacity-100"}`} aria-pressed={activeIndex === index}>
                <div className={`relative aspect-[.68] w-full overflow-hidden rounded-[28px] border bg-[#172735] shadow-[0_16px_30px_rgba(0,0,0,.28)] ${activeIndex === index ? "border-[#f1be6c]" : "border-white/25"}`}>
                  <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "linear-gradient(180deg, rgba(5,15,25,.04), rgba(3,10,16,.84)), url('/nilea-eras.png')", backgroundSize: "500% 100%", backgroundPosition: `${index * 25}% center` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111b] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-1/2 flex h-4 w-4 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-[#f5ca7b] bg-[#111a22] text-[7px] text-[#f5ca7b]">{String(index + 1).padStart(2, "0")}</div>
                </div>
                <span className="mt-5 whitespace-pre-line font-display text-[11px] leading-[1.05] text-[#f2e6d1] sm:text-[14px]">{era.shortLabel}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="artifacts" className="glass-panel artifacts-3d relative mt-14 overflow-hidden rounded-[18px] p-5 sm:mt-20 sm:p-8 lg:p-9">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
            <div className="flex flex-col justify-between">
              <div>
                <div className="section-cap text-[9px] uppercase tracking-[0.25em] text-[#e7b96a]"><span>{String(activeIndex + 1).padStart(2, "0")}</span><span className="h-px w-4 bg-[#dcaa5b]/60" /><span>05 chapters</span></div>
                <h2 className="mt-4 font-display text-[34px] uppercase tracking-[0.02em] text-[#f4d08e] sm:text-[39px]">{activeEra.label}</h2>
                <p className="mt-3 max-w-[500px] text-[14px] leading-6 text-[#e5e1d8]/82">{activeEra.description}</p>
                <div className="mt-5"><p className="text-[12px] text-white/75">Key dates</p><p className="mt-1 font-display text-[18px] text-[#f1be6c]">{activeEra.dates}</p></div>
              </div>
              <div className="mt-8">
                <p className="mb-3 text-[11px] text-white/80">Listen to the story</p>
                <div className="audio-deck flex max-w-[420px] items-center gap-3 rounded-full border border-[#e4b568]/45 bg-black/20 px-3 py-2">
                  <button onClick={() => setPlaying((value) => !value)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f2c478] text-[#f2c478] transition hover:bg-[#f2c478] hover:text-[#1b140d]" aria-label={playing ? "Pause audio" : "Play audio"}><Icon name={playing ? "pause" : "play"} size={15} /></button>
                  <AudioWave playing={playing} />
                  <span className="ml-auto whitespace-nowrap text-[10px] text-white/65">{playing ? "00:42" : "00:00"} / 3:28</span>
                </div>
                <button onClick={() => setTripOpen(true)} className="cta-depth mt-5 inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#f6d18d] to-[#d49643] px-6 py-3 text-[12px] font-semibold text-[#1e160c] transition hover:brightness-110">Explore {activeEra.label.toLowerCase()} <Icon name="arrow" size={15} /></button>
              </div>
            </div>

            <div className="relative min-h-[245px] border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="mb-5 flex items-center justify-between"><p className="font-display text-[16px] text-[#f1c77d]">Explore artifacts</p><button className="flex items-center gap-2 text-[10px] text-white/60 transition hover:text-[#f1c77d]" onClick={() => setTripOpen(true)}>View all <Icon name="arrow" size={12} /></button></div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {activeEra.artifacts.map((artifact, index) => <button key={artifact.name} className="artifact-tile group relative aspect-[.78] overflow-hidden rounded-xl border border-white/20 text-left transition" style={{ backgroundPosition: `${index * 33.333}% center` }} onClick={() => setTripOpen(true)}><span className="absolute bottom-2 left-2 right-2 text-[9px] leading-3 text-white/80 transition group-hover:text-[#f6cf88] sm:text-[10px]">{artifact.name}<small className="mt-0.5 block text-[8px] text-white/45">{artifact.type}</small></span><span className="absolute right-2 top-2 text-[9px] text-white/50">0{index + 1}</span></button>)}
              </div>
              <div className="mt-5 flex items-start gap-3 border-t border-white/10 pt-4"><div className="mt-0.5 h-2 w-2 rounded-full bg-[#e9b65f] shadow-[0_0_12px_#e9b65f]" /><p className="max-w-[390px] text-[11px] leading-5 text-white/55">{activeEra.note}</p></div>
            </div>
          </div>
        </section>

        <section id="guide" className="mt-8 flex flex-col items-start justify-between gap-4 px-2 pb-6 pt-1 text-[11px] text-white/50 sm:flex-row sm:items-center"><p>Scroll to move through the archive <span className="mx-2 text-[#dcae61]">·</span> {activeIndex + 1} / 5 chapters open</p><p className="font-display tracking-[0.16em] text-[#c7914d]">NILEA / ARCHIVE 01</p></section>
      </div>

      {tripOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02070c]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="trip-title"><div className="glass-panel modal-depth relative w-full max-w-lg rounded-[24px] p-7 sm:p-9"><button onClick={() => setTripOpen(false)} className="absolute right-5 top-5 text-white/60 transition hover:text-[#f4c577]" aria-label="Close dialog"><Icon name="close" size={18} /></button><p className="section-cap text-[9px] uppercase tracking-[0.3em] text-[#e7b96a]">A personal route through the Nile archives</p><h2 id="trip-title" className="mt-4 font-display text-4xl text-[#f4cf8d]">Plan your trip</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/70">Start with <span className="text-[#f4c577]">{activeEra.label}</span>, then follow the river into the next chapter. Your interactive guide is ready for the journey.</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={() => setTripOpen(false)} className="rounded-full border border-[#e8b664]/55 px-5 py-3 text-sm text-[#f4c577] transition hover:bg-[#f4c577]/10">Keep exploring</button><a href="#journey" onClick={() => setTripOpen(false)} className="cta-depth flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f6d18d] to-[#d49643] px-5 py-3 text-sm font-semibold text-[#1e160c]">Choose an era <Icon name="arrow" size={15} /></a></div></div></div>}
    </main>
  );
}
