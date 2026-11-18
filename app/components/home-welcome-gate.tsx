"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useDialogA11y } from "./dialog";

export function HomeWelcomeGate() {
  const pathname = usePathname() || "/";
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  const closeWelcome = useCallback(() => {
    try {
      window.localStorage.setItem("alpnile-welcome-seen", "true");
    } catch {
      // Private browsing or storage restrictions should never trap the visitor in the gate.
    }
    setIsOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setIsOpen(false);
      setIsReady(true);
      return;
    }
    try {
      setIsOpen(window.localStorage.getItem("alpnile-welcome-seen") !== "true");
    } catch {
      setIsOpen(true);
    }
    setIsReady(true);
  }, [pathname]);

  useDialogA11y(isReady && isOpen && pathname === "/", closeWelcome, dialogRef);

  if (!isReady || !isOpen || pathname !== "/") return null;

  return (
    <section ref={dialogRef} className="home-welcome-screen welcome-page" role="dialog" aria-modal="true" aria-labelledby="home-welcome-title">
      <button type="button" className="home-welcome-close" onClick={closeWelcome} aria-label="Close welcome introduction">×</button>
      <div className="welcome-backdrop" aria-hidden="true" />
      <div className="welcome-layout home-welcome-layout">
        <section className="welcome-card home-welcome-card">
          <div className="welcome-mark" aria-hidden="true"><strong>A</strong><span>✦</span></div>
          <p className="home-redesign-eyebrow">WELCOME TO ALPNILE / EGYPT</p>
          <h1 id="home-welcome-title">Welcome to AlpNile.<br /><em>Your story starts here.</em></h1>
          <p className="welcome-lede">Welcome, traveler. Discover Egypt through considered routes, soulful stays, local experiences and river moments worth remembering.</p>
          <div className="welcome-route" aria-hidden="true"><span /><i /><b /><em /></div>
          <div className="welcome-actions">
            <button type="button" className="home-redesign-primary-button home-welcome-enter" onClick={closeWelcome}>Enter AlpNile <span aria-hidden="true">↗</span></button>
            <button type="button" className="home-redesign-secondary-button home-welcome-skip" onClick={closeWelcome}>Skip intro</button>
          </div>
          <div className="welcome-meta" aria-label="AlpNile highlights"><span><b>01</b> Curated routes</span><span><b>02</b> Nile moments</span><span><b>03</b> Local stories</span></div>
          <p className="welcome-note">A royal introduction to the Nile, made for curious travelers.</p>
        </section>

        <aside className="welcome-visual home-welcome-visual" aria-label="A golden pharaoh sculpture">
          <div className="welcome-visual-halo" aria-hidden="true" />
          <div className="welcome-visual-frame">
            <span className="welcome-visual-chip">THE NILE / 01</span>
            <img src="/alpnile-welcome-pharaoh.png" alt="Golden and deep blue pharaoh sculpture" />
            <div className="welcome-visual-reflection" aria-hidden="true" />
          </div>
          <div className="welcome-visual-caption"><span>EGYPT / TIMELESS</span><strong>Begin with wonder.</strong><p>One river. A thousand stories.</p></div>
        </aside>
      </div>
    </section>
  );
}
