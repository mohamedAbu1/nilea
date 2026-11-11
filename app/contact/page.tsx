"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { StyledSelect } from "../components/styled-select";
import { insertInquiry } from "../lib/submissions";

const contactChannels = [
  { kicker: "Email", value: "hello@alpnile.com", detail: "A thoughtful reply within one working day.", href: "mailto:hello@alpnile.com", icon: "✉" },
  { kicker: "Call", value: "+20 100 271 2064", detail: "Daily · 09:00–18:00 EET", href: "tel:+201002712064", icon: "⌁" },
  { kicker: "Follow", value: "@alpnile", detail: "Stories, places and small moments from the river.", href: "https://www.instagram.com/alpnile", icon: "◎" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setSubmitting(false); return; }
    const result = await insertInquiry({
      request_type: "contact",
      full_name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
      details: { journey: String(form.get("journey") ?? "") },
      source: "contact-page",
    });
    if (result.error) {
      setError("We could not send your note right now. Please try again.");
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <main className="info-page contact-page">
      <section className="contact-content-section info-section" aria-labelledby="contact-form-title">
        <div className="contact-side-column">
          <p className="info-eyebrow">WAYS IN</p>
          <h2>Choose the<br /><em>easy door.</em></h2>
          <p className="contact-side-copy">No hard sell, no scripted itinerary. Just a good first conversation about where you want the river to take you.</p>
          <div className="contact-channel-list">
            {contactChannels.map((channel) => (
              <a key={channel.kicker} className="contact-channel-card" href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel={channel.href.startsWith("http") ? "noreferrer" : undefined}>
                <span className="contact-channel-icon" aria-hidden="true">{channel.icon}</span>
                <span className="contact-channel-copy"><small>{channel.kicker}</small><strong>{channel.value}</strong><span>{channel.detail}</span></span>
                <span className="contact-channel-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>

        <div className="contact-form-card">
          <div className="contact-form-heading"><p className="info-eyebrow">START A CONVERSATION</p><h2 id="contact-form-title">What are you<br /><em>imagining?</em></h2></div>
          {submitted ? (
            <div className="contact-success" role="status">
              <span className="contact-success-mark" aria-hidden="true">✓</span>
              <h3>Your note is on its way.</h3>
              <p>Thank you for reaching out. We’ll be in touch soon with a thoughtful next step.</p>
              <button type="button" className="info-secondary-action" onClick={() => setSubmitted(false)}>Send another note</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submitForm}>
              <input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="contact-form-grid">
                <label><span>Your name</span><input name="name" required placeholder="How should we call you?" /></label>
                <label><span>Email address</span><input type="email" name="email" required placeholder="you@example.com" /></label>
              </div>
              <label><span>What are you planning?</span><StyledSelect name="journey" defaultValue="" ariaLabel="What are you planning?" required><option value="">Select a starting point</option><option>My first Egypt journey</option><option>A return to a favourite place</option><option>A slower, more local trip</option><option>I’m still finding the feeling</option></StyledSelect></label>
              <label><span>Your note</span><textarea name="message" required placeholder="Dates, places, questions — tell us a little about the journey in your head." rows={5} /></label>
              <div className="contact-form-submit-row"><p>We usually reply within one working day.</p><button className="info-primary-action" type="submit" disabled={submitting}>{submitting ? "Saving your note…" : "Send your note"} <span aria-hidden="true">↗</span></button></div>
              {error && <p className="home-form-error" role="alert">{error}</p>}
            </form>
          )}
        </div>
      </section>

      <section className="contact-bottom-section info-section" aria-labelledby="contact-bottom-title">
        <div className="contact-bottom-art" aria-label="3D pharaonic travel concierge avatar"><div className="contact-bottom-sun" /><div className="contact-bottom-line contact-bottom-line-one" /><div className="contact-bottom-line contact-bottom-line-two" /><img className="contact-bottom-avatar" src="/alpnile-avatar-man-01.webp" alt="3D pharaonic travel concierge avatar" /><span>CAIRO</span><span>LUXOR</span><span>ASWAN</span></div>
        <div><p className="info-eyebrow">WHEN YOU’RE READY</p><h2 id="contact-bottom-title">The river<br /><em>will be here.</em></h2><Link href="/destinations" className="text-link">Browse the destinations <span aria-hidden="true">→</span></Link></div>
      </section>
    </main>
  );
}
