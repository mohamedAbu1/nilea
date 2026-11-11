import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <div className="welcome-backdrop" aria-hidden="true" />
      <div className="welcome-layout">
        <section className="welcome-card" aria-labelledby="welcome-title">
          <div className="welcome-mark" aria-hidden="true">
            <strong>A</strong>
            <span>✦</span>
          </div>
          <p className="home-redesign-eyebrow">WELCOME TO ALPNILE / EGYPT</p>
          <h1 id="welcome-title">Welcome to AlpNile.<br /><em>Your story starts here.</em></h1>
          <p className="welcome-lede">
            Welcome, traveler. Discover Egypt through considered routes, soulful stays, local experiences and river moments worth remembering.
          </p>
          <div className="welcome-route" aria-hidden="true"><span /><i /><b /><em /></div>
          <div className="welcome-actions">
            <Link className="home-redesign-primary-button" href="/">Enter AlpNile <span aria-hidden="true">↗</span></Link>
            <Link className="home-redesign-secondary-button" href="/destinations">Explore destinations <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="welcome-meta" aria-label="AlpNile highlights">
            <span><b>01</b> Curated routes</span>
            <span><b>02</b> Nile moments</span>
            <span><b>03</b> Local stories</span>
          </div>
          <p className="welcome-note">A royal introduction to the Nile, made for curious travelers.</p>
        </section>

        <aside className="welcome-visual" aria-label="A golden pharaoh sculpture">
          <div className="welcome-visual-halo" aria-hidden="true" />
          <div className="welcome-visual-frame">
            <span className="welcome-visual-chip">THE NILE / 01</span>
            <img src="/alpnile-welcome-pharaoh.png" alt="Golden and deep blue pharaoh sculpture" />
            <div className="welcome-visual-reflection" aria-hidden="true" />
          </div>
          <div className="welcome-visual-caption"><span>EGYPT / TIMELESS</span><strong>Begin with wonder.</strong><p>One river. A thousand stories.</p></div>
        </aside>
      </div>
    </main>
  );
}
