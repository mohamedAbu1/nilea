import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <div className="welcome-backdrop" aria-hidden="true" />
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
        <p className="welcome-note">A royal introduction to the Nile, made for curious travelers.</p>
      </section>
    </main>
  );
}
