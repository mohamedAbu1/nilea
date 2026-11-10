import Link from "next/link";

type PolicySection = {
  id: string;
  title: string;
  body?: string;
  items?: string[];
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: PolicySection[];
  accent: "site" | "financial";
};

export function PolicyPage({ eyebrow, title, intro, updated, sections, accent }: PolicyPageProps) {
  return (
    <main className={`policy-page policy-page-${accent}`}>
      <section className="policy-hero">
        <div className="policy-hero-mark" aria-hidden="true"><span>✦</span><strong>{accent === "site" ? "𓂀" : "𓂋"}</strong></div>
        <div>
          <p className="policy-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="policy-intro">{intro}</p>
          <p className="policy-updated">Last updated · {updated}</p>
        </div>
      </section>
      <div className="policy-layout">
        <aside className="policy-index" aria-label="Policy contents">
          <p>On this page</p>
          <nav>{sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>0{index + 1}</span>{section.title}</a>)}</nav>
          <Link href="/" className="policy-back-link">Back to AlpNile <span aria-hidden="true">↗</span></Link>
        </aside>
        <article className="policy-content">
          {sections.map((section, index) => <section key={section.id} id={section.id} className={`policy-section policy-section-${index + 1}`}><div className="policy-section-seal" aria-hidden="true"><span>𓂀</span><small>0{index + 1}</small></div><div className="policy-section-heading"><p>Chapter 0{index + 1}</p><h2>{section.title}</h2></div>{section.body && <p>{section.body}</p>}{section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}
          <div className="policy-contact"><span className="policy-contact-icon" aria-hidden="true">✦</span><div><strong>Need a clearer answer?</strong><p>We keep every journey human. Reach out before you book and our team will help you understand the details.</p></div><a href="mailto:hello@alpnile.com" aria-label="Email AlpNile">Contact us <span aria-hidden="true">↗</span></a></div>
        </article>
      </div>
    </main>
  );
}
