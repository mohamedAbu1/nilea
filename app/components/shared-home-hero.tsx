import Link from "next/link";

type SharedHomeHeroProps = {
  eyebrow: string;
  title: string;
  emphasis: string;
  lede: string;
  image: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  note: string;
  chapter: string;
  sectionId?: string;
};

function Arrow() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function SharedHomeHero({ eyebrow, title, emphasis, lede, image, primaryHref, primaryLabel, secondaryHref, secondaryLabel, note, chapter, sectionId }: SharedHomeHeroProps) {
  const eyebrowParts = eyebrow.split(" · ");

  return (
    <section className="home-redesign shared-home-hero home-redesign-hero" id={sectionId} aria-labelledby={`${sectionId ?? "shared-home"}-title`}>
      <div className="home-redesign-hero-media" style={{ backgroundImage: `url('${image}')` }} aria-hidden="true" />
      <div className="home-redesign-hero-shade" aria-hidden="true" />
      <div className="home-redesign-hero-orbit" aria-hidden="true" />
      <div className="home-redesign-hero-inner">
        <div className="home-redesign-hero-copy">
          <p className="home-redesign-kicker"><span>{eyebrowParts[0]}</span><i /> {eyebrowParts.slice(1).join(" · ")}</p>
          <h1 id={`${sectionId ?? "shared-home"}-title`}>{title}<br /><em>{emphasis}</em></h1>
          <p className="home-redesign-hero-lede">{lede}</p>
          <div className="home-redesign-hero-actions">
            <Link className="home-redesign-primary-button" href={primaryHref}>{primaryLabel} <Arrow /></Link>
            <Link className="home-redesign-secondary-button" href={secondaryHref}>{secondaryLabel} <span aria-hidden="true">↓</span></Link>
          </div>
        </div>

        <div className="home-redesign-hero-note"><span>{chapter}</span><p>{note.split(" / ")[0]}<br />{note.split(" / ").slice(1).join(" / ")}</p></div>
        <div className="home-redesign-hero-metric"><strong>{chapter}</strong><span>Curated<br />chapter</span></div>
        <div className="shared-home-hero-slider" aria-hidden="true"><span>01 <i /> 04</span><b /><b className="active" /><b /><b /></div>

        <div className="home-redesign-hero-booker shared-home-hero-booker">
          <div className="home-redesign-booker-fields shared-home-hero-booker-fields">
            <div className="home-redesign-booker-field"><span>✦ &nbsp; I want to arrange</span><strong>A trip or experience</strong></div>
            <div className="home-redesign-booker-field"><span>⌖ &nbsp; Where in Egypt</span><strong>Help me choose</strong></div>
            <div className="home-redesign-booker-field"><span>◷ &nbsp; Timing</span><strong>I am flexible</strong></div>
            <Link className="home-redesign-booker-submit" href={primaryHref}><span className="home-papyrus-glyph" aria-hidden="true">𓂀</span><span>Open smart form</span><Arrow /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
