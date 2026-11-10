"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function HomeWelcomeGate() {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(pathname === "/");

  const openHomepage = () => {
    window.localStorage.setItem("alpnile-welcome-seen", "true");
    setIsOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  useEffect(() => {
    if (pathname !== "/") {
      setIsOpen(false);
      return;
    }
    setIsOpen(window.localStorage.getItem("alpnile-welcome-seen") !== "true");
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") openHomepage();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  if (!isOpen || pathname !== "/") return null;

  return (
    <section className="home-welcome-screen" role="dialog" aria-modal="true" aria-labelledby="home-welcome-title">
      <div className="home-welcome-ambient home-welcome-ambient-one" aria-hidden="true" />
      <div className="home-welcome-ambient home-welcome-ambient-two" aria-hidden="true" />
      <div className="home-welcome-orbit home-welcome-orbit-one" aria-hidden="true" />
      <div className="home-welcome-orbit home-welcome-orbit-two" aria-hidden="true" />
      <div className="home-welcome-content">
        <div className="home-welcome-brand" aria-hidden="true"><span>✦</span><strong>ALPNILE</strong></div>
        <p className="home-welcome-eyebrow">WELCOME TO ALPNILE / EGYPT</p>
        <h1 id="home-welcome-title">Welcome to AlpNile.<br /><em>Your story starts here.</em></h1>
        <p className="home-welcome-lede">Welcome, traveler. Discover Egypt through considered routes, soulful stays, local experiences and river moments worth remembering.</p>
        <div className="home-welcome-route" aria-hidden="true"><span /><i /><b /><em /></div>
        <button type="button" className="home-welcome-action" onClick={openHomepage}>Enter AlpNile <span aria-hidden="true">↗</span></button>
        <button type="button" className="home-welcome-skip" onClick={openHomepage}>Skip intro</button>
        <p className="home-welcome-note">A royal introduction to the Nile, made for curious travelers.</p>
      </div>
      <div className="home-welcome-portal" aria-hidden="true">
        <div className="home-welcome-portal-image" />
        <img className="home-welcome-portal-statue" src="/alpnile-pharaoh-statue.svg" alt="" />
        <div className="home-welcome-portal-glow" />
        <div className="home-welcome-portal-caption"><span>THE NILE / 01</span><strong>Begin with wonder.</strong></div>
      </div>
    </section>
  );
}
