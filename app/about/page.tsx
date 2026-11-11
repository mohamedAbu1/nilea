import Link from "next/link";

const principles = [
  {
    number: "01",
    title: "Curiosity first",
    copy: "We start with the questions that make a place feel alive: who shaped it, what is changing and where the quieter stories are hiding.",
    icon: "✦",
  },
  {
    number: "02",
    title: "Context matters",
    copy: "A temple, a table and a river bend belong to the same story. We connect the details so every stop has a little more meaning.",
    icon: "◈",
  },
  {
    number: "03",
    title: "Travel with care",
    copy: "Thoughtful planning leaves room for local voices, slower moments and the kind of discovery you cannot schedule down to the minute.",
    icon: "⌁",
  },
];

const collection = [
  { label: "Places", title: "The landmarks and the lanes", copy: "From Cairo's pulse to the stillness of Siwa, we make the landscape easy to enter and impossible to flatten.", tone: "gold" },
  { label: "People", title: "The voices between the lines", copy: "Local life, makers, hosts and guides bring texture to the route — the human details that stay with you.", tone: "teal" },
  { label: "Pace", title: "A route with breathing room", copy: "Build a day around the way you actually travel: curious, unrushed and open to a better turn when it appears.", tone: "sand" },
];

export default function AboutPage() {
  return (
    <main className="info-page about-page">
      <section className="about-story-section info-section" aria-labelledby="story-title">
        <div className="section-intro">
          <p className="info-eyebrow">A LIVING ARCHIVE</p>
          <h2 id="story-title">Egypt is not one story.<br /><em>It is a conversation.</em></h2>
        </div>
        <div className="about-story-copy">
          <p>We built AlpNile for travellers who want more than a checklist. The grand monuments matter, of course — but so do the walk home after dinner, the sound of a felucca rope against the dock and the guide who notices the detail everyone else walks past.</p>
          <p>Our job is to make those layers easier to find. We bring destinations, stays, local life and experiences into one considered route, so planning feels like the beginning of the journey rather than admin before it.</p>
          <Link href="/trip-planner" className="text-link">Shape your journey <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="about-principles-section info-section" aria-labelledby="principles-title">
        <div className="section-heading-row">
          <div>
            <p className="info-eyebrow">OUR NORTH STAR</p>
            <h2 id="principles-title">Good journeys leave<br /><em>something behind.</em></h2>
          </div>
          <span className="section-index" aria-hidden="true">03 / 03</span>
        </div>
        <div className="principles-grid">
          {principles.map((principle) => (
            <article key={principle.number} className="principle-card">
              <div className="principle-card-top"><span>{principle.number}</span><i aria-hidden="true">{principle.icon}</i></div>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
              <span className="principle-card-line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="about-collection-section info-section" aria-labelledby="collection-title">
        <div className="collection-art" aria-label="3D pharaonic AlpNile avatar">
          <div className="collection-art-ring collection-art-ring-one" />
          <div className="collection-art-ring collection-art-ring-two" />
          <img className="collection-art-avatar" src="/alpnile-avatar-woman-queen-v1.webp" alt="3D pharaonic woman avatar" />
          <div className="collection-art-core"><span>𓂀</span></div>
          <div className="collection-art-label">ALPNILE / 2026</div>
        </div>
        <div className="collection-copy">
          <p className="info-eyebrow">WHAT WE CURATE</p>
          <h2 id="collection-title">A clearer way<br /><em>into the story.</em></h2>
          <div className="collection-list">
            {collection.map((item) => (
              <div key={item.label} className={`collection-item collection-item-${item.tone}`}>
                <span className="collection-item-label">{item.label}</span>
                <div><h3>{item.title}</h3><p>{item.copy}</p></div>
                <span className="collection-item-arrow" aria-hidden="true">↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="info-cta-section" aria-labelledby="about-cta-title">
        <div className="info-cta-orbit" aria-hidden="true" />
        <div>
          <p className="info-eyebrow">YOUR NEXT CHAPTER</p>
          <h2 id="about-cta-title">Start with a feeling.<br /><em>We’ll help with the route.</em></h2>
        </div>
        <Link href="/contact" className="info-primary-action">Tell us what you’re looking for <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
