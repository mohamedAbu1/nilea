"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getSubmissionErrorMessage, insertTripBooking } from "../../lib/submissions";
import { getSimilarTours, getTourGallery, type TourDetail } from "../../lib/tour-details";
import { useCurrency, type CurrencyCode } from "../../components/currency";
import { trackCatalogEvent } from "../../lib/intelligence-client";

type BookingStep = "details" | "payment" | "success";

const whatsAppNumber = "41765082885";

function addDays(date: string, days: number) {
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  if (!date) return "Choose a date";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function formatMoney(amount: number, currency: string) {
  return `$${amount.toLocaleString("en-US")} ${currency}`;
}

function dateKeyForDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function getMonthDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [...Array(firstDay.getDay()).fill(null), ...Array.from({ length: dayCount }, (_, index) => dateKeyForDate(new Date(month.getFullYear(), month.getMonth(), index + 1)))];
}

function getDailyPrice(tour: TourDetail, date: string) {
  const seed = [...`${tour.slug}:${date}`].reduce((total, character) => total + character.charCodeAt(0), 0);
  return Math.max(0, tour.priceFrom + ((seed % 3) - 1) * 5);
}

function DetailIcon({ children }: { children: React.ReactNode }) {
  return <span className="tour-detail-icon" aria-hidden="true">{children}</span>;
}

export default function TourDetailClient({ tour }: { tour: TourDetail }) {
  const { format } = useCurrency();
  const formatMoney = (amount: number, currency: string) => format(amount, (currency || "USD") as CurrencyCode);
  const today = useMemo(() => dateKeyForDate(new Date()), []);
  const gallery = useMemo(() => getTourGallery(tour), [tour]);
  const similarTours = useMemo(() => getSimilarTours(tour), [tour]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [activeImage, setActiveImage] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [step, setStep] = useState<BookingStep>("details");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pay-later">("card");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveImage(0);
  }, [tour.slug]);

  useEffect(() => {
    trackCatalogEvent({ eventType: "view", entityType: "trip", entityId: tour.id, entitySlug: tour.slug, metadata: { name: tour.name, city: tour.city, source: tour.source } });
  }, [tour.city, tour.id, tour.name, tour.slug, tour.source]);

  useEffect(() => {
    if (galleryPaused || gallery.length < 2) return;
    const timer = window.setInterval(() => setActiveImage((current) => (current + 1) % gallery.length), 5000);
    return () => window.clearInterval(timer);
  }, [gallery.length, galleryPaused]);

  const previousImage = () => setActiveImage((current) => (current - 1 + gallery.length) % gallery.length);
  const nextImage = () => setActiveImage((current) => (current + 1) % gallery.length);

  const endDateRequired = tour.durationDays > 1;
  const selectedDailyPrice = startDate ? getDailyPrice(tour, startDate) : tour.priceFrom;
  const baseAmount = selectedDailyPrice * guests;
  const serviceFee = Math.round(baseAmount * 0.05);
  const totalAmount = baseAmount + serviceFee;
  const calendarDays = useMemo(() => getMonthDays(calendarMonth), [calendarMonth]);

  const changeCalendarMonth = (offset: number) => {
    setCalendarMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      return offset < 0 && next < currentMonth ? current : next;
    });
  };

  const selectCalendarDate = (date: string) => {
    if (date < today) return;
    setError("");
    setStartDate(date);
    if (endDateRequired) setEndDate(addDays(date, tour.durationDays - 1));
  };

  const continueToPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!startDate || (endDateRequired && !endDate)) {
      setError("Please choose an available date from the calendar before continuing.");
      return;
    }
    setStep("payment");
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const paymentLabel = paymentMethod === "card" ? "Secure card checkout requested" : "Pay later / confirm with AlpNile";
    const notes = [
      `Payment preference: ${paymentLabel}.`,
      `Daily rate: ${formatMoney(selectedDailyPrice, tour.currency)} per guest.`,
      `Estimated total: ${formatMoney(totalAmount, tour.currency)} for ${guests} guest${guests === 1 ? "" : "s"}.`,
      form.notes.trim(),
    ].filter(Boolean).join(" ");
    const result = await insertTripBooking({
      trip_id: tour.id,
      full_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      start_date: startDate,
      end_date: endDate,
      guests,
      notes,
    });
    if (result.error) {
      try {
        window.localStorage.setItem("alpnile-trip-booking-draft-" + tour.slug, JSON.stringify({ tour: tour.slug, startDate, endDate, guests, paymentMethod, form, savedAt: new Date().toISOString() }));
      } catch {
        // The booking form remains available even when local storage is blocked.
      }
      setError(getSubmissionErrorMessage(result.error, "We couldn’t save this booking request. Your details are still in the form; please try again."));
      setSubmitting(false);
      return;
    }
    try {
      window.localStorage.removeItem("alpnile-trip-booking-draft-" + tour.slug);
    } catch {
      // Ignore storage restrictions after a successful submission.
    }
    setSubmitting(false);
    setStep("success");
    trackCatalogEvent({ eventType: "booking", entityType: "trip", entityId: tour.id, entitySlug: tour.slug, metadata: { guests, startDate, endDate, paymentMethod } });
    const message = `Hello AlpNile, I would like to book ${tour.name}.\nName: ${form.name}\nDate: ${formatDate(startDate)}${endDate ? ` to ${formatDate(endDate)}` : ""}\nGuests: ${guests}\nPayment: ${paymentLabel}\nEstimated total: ${formatMoney(totalAmount, tour.currency)}\nPhone: ${form.phone}`;
    window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="tour-detail-page">
      <div className="tour-detail-wrap">
        <Link href="/tours-experiences" className="tour-detail-back">← <span>Back to experiences</span></Link>

        <section className="tour-detail-hero">
          <div className="tour-detail-hero-media tour-detail-gallery" role="region" aria-label={`${tour.name} photo gallery`} onMouseEnter={() => setGalleryPaused(true)} onMouseLeave={() => setGalleryPaused(false)} onFocusCapture={() => setGalleryPaused(true)} onBlurCapture={() => setGalleryPaused(false)}>
            <img key={gallery[activeImage].src} src={gallery[activeImage].src} alt={`${tour.name} — ${gallery[activeImage].label}`} />
            <div className="tour-detail-gallery-shade" aria-hidden="true" />
            <span className="tour-detail-hero-badge">{tour.category}</span>
            <span className="tour-detail-hero-mark">ALPNILE / JOURNEY</span>
            <div className="tour-detail-gallery-controls">
              <button type="button" onClick={previousImage} aria-label="Previous tour photo">‹</button>
              <span aria-live="polite">{String(activeImage + 1).padStart(2, "0")} <i>/</i> {String(gallery.length).padStart(2, "0")}</span>
              <button type="button" onClick={nextImage} aria-label="Next tour photo">›</button>
            </div>
            <div className="tour-detail-gallery-dots" aria-label="Choose tour photo">
              {gallery.map((image, index) => <button key={`${image.src}-${index}`} type="button" className={index === activeImage ? "active" : ""} aria-label={`Show ${image.label}`} aria-current={index === activeImage ? "true" : undefined} onClick={() => setActiveImage(index)} />)}
            </div>
            <span className="tour-detail-gallery-caption">{gallery[activeImage].label}</span>
            <span className={`tour-detail-gallery-autoplay ${galleryPaused ? "paused" : ""}`} aria-live="polite">{galleryPaused ? "Paused" : "Auto play"}</span>
          </div>
          <div className="tour-detail-hero-copy">
            <p className="tour-detail-eyebrow">A considered route through Egypt</p>
            <h1>{tour.name}</h1>
            <div className="tour-detail-meta"><span>⌖ {tour.city}</span><span>◷ {tour.duration}</span><span className="tour-detail-rating">★ {tour.rating === "New" ? "New" : `${tour.rating} (${tour.reviews})`}</span></div>
            <p className="tour-detail-description">{tour.description}</p>
            <div className="tour-detail-quickfacts"><span><DetailIcon>◷</DetailIcon><b>{tour.duration}</b><small>pace</small></span><span><DetailIcon>◆</DetailIcon><b>{tour.priceLevel ?? "Curated"}</b><small>experience</small></span><span><DetailIcon>✓</DetailIcon><b>Local support</b><small>throughout</small></span></div>
          </div>
        </section>

        <div className="tour-detail-grid">
          <div className="tour-detail-content">
            <section className="tour-detail-section">
              <p className="tour-detail-eyebrow">The route</p>
              <h2>How your day unfolds</h2>
              <div className="tour-detail-itinerary">
                {tour.itinerary.length ? tour.itinerary.map((day) => <div key={day.dayNumber} className="tour-detail-day"><div className="tour-detail-day-number">{String(day.dayNumber).padStart(2, "0")}</div><div><strong>Day {day.dayNumber}</strong><ul>{day.activities.length ? day.activities.map((activity) => <li key={`${day.dayNumber}-${activity.time}-${activity.title}`}><span>{activity.time}</span>{activity.title}</li>) : <li><span>All day</span>Time to explore at your own pace.</li>}</ul></div></div>) : <div className="tour-detail-empty">Your host will confirm the exact rhythm and meeting point after your request.</div>}
              </div>
            </section>

            <section className="tour-detail-section">
              <p className="tour-detail-eyebrow">Included</p>
              <h2>Details that make it easy</h2>
              <div className="tour-detail-includes">{tour.includes.length ? tour.includes.map((item) => <div key={item}><span>✓</span>{item}</div>) : <div><span>✓</span>Personalized support from the AlpNile team</div>}</div>
            </section>

            {tour.reviewDetails.length > 0 && <section className="tour-detail-section"><div className="tour-detail-section-heading"><div><p className="tour-detail-eyebrow">Guest notes</p><h2>Stories from the route</h2></div><span className="tour-detail-review-score">★ {tour.rating}</span></div><div className="tour-detail-reviews">{tour.reviewDetails.slice(0, 3).map((review) => <blockquote key={`${review.name}-${review.comment}`}><span>★ {review.rating}</span><p>“{review.comment}”</p><cite>{review.name}</cite></blockquote>)}</div></section>}

            <section className="tour-detail-trust"><div className="tour-detail-trust-mark">𓂀</div><div><strong>Thoughtful planning, clear confirmation.</strong><p>Your date request is saved first. The AlpNile team confirms availability and sends the secure payment step before any charge is made.</p></div></section>
          </div>

          <aside className="tour-booking-card" id="booking">
            <span className="tour-booking-card-orbit tour-booking-card-orbit-one" aria-hidden="true" />
            <span className="tour-booking-card-orbit tour-booking-card-orbit-two" aria-hidden="true" />
            <span className="tour-booking-card-lock" aria-hidden="true">𓂀</span>
            <p className="tour-booking-card-kicker">AlpNile / secure route</p>
            <div className="tour-booking-card-top"><div><p className="tour-detail-eyebrow">Reserve your place</p><h2>{step === "success" ? "Request received" : "Build your booking"}</h2></div><span className="tour-booking-price"><small>from</small><strong>{formatMoney(tour.priceFrom, tour.currency)}</strong><small>per guest</small></span></div>
            {step !== "success" && <div className="tour-booking-steps" aria-label="Booking progress"><span className={step === "details" ? "active" : "done"}><b>01</b>Details</span><i /><span className={step === "payment" ? "active" : ""}><b>02</b>Payment</span></div>}

            {step === "details" && <form className="tour-booking-form" onSubmit={continueToPayment}><div className="tour-booking-label tour-booking-calendar-field"><div className="tour-booking-calendar-title"><span>Choose your date</span><strong>{startDate ? formatDate(startDate) : "Select an available day"}</strong></div><div className="tour-booking-calendar" role="group" aria-label="Choose an available booking date"><div className="tour-booking-calendar-header"><button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Previous month">‹</button><strong>{formatMonthLabel(calendarMonth)}</strong><button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Next month">›</button></div><div className="tour-booking-calendar-weekdays" aria-hidden="true">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div><div className="tour-booking-calendar-grid">{calendarDays.map((date, index) => date ? <button key={date} type="button" className={`${date === startDate ? "selected " : ""}${date === today ? "today" : ""}`} disabled={date < today} aria-pressed={date === startDate} onClick={() => selectCalendarDate(date)}><b>{Number(date.slice(-2))}</b><small>{formatMoney(getDailyPrice(tour, date), tour.currency)}</small></button> : <span key={`empty-${index}`} aria-hidden="true" />)}</div><div className="tour-booking-calendar-footer"><span>Daily rates move by ±$5</span>{startDate && <strong>{formatMoney(selectedDailyPrice, tour.currency)} / guest</strong>}</div></div>{endDateRequired && <div className="tour-booking-return-date"><span>Return date</span><strong>{endDate ? formatDate(endDate) : "Choose a start date first"}</strong><small>{tour.durationDays} day route · return date is calculated for you</small></div>}</div><label className="tour-booking-label">Travelers<select value={guests} onChange={(event) => setGuests(Number(event.target.value))}><option value={1}>1 adult</option><option value={2}>2 adults</option><option value={3}>3 adults</option><option value={4}>4 adults</option><option value={5}>5 adults</option><option value={6}>6 adults</option><option value={7}>7 adults</option><option value={8}>8 adults</option></select></label><div className="tour-booking-form-row"><label className="tour-booking-label">Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" required /></label><label className="tour-booking-label">WhatsApp / phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+20 ..." required /></label></div><label className="tour-booking-label">Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label><label className="tour-booking-label">Notes <span>optional</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} placeholder="Pickup hotel, dietary needs or a special request..." /></label><button className="tour-detail-primary-button" type="submit">Continue to payment <span>→</span></button><small className="tour-booking-safe">🔒 Free request · no charge on this step</small>{error && <p className="tour-detail-error" role="alert">{error}</p>}</form>}

            {step === "payment" && <form className="tour-payment-form" onSubmit={submitBooking}><button type="button" className="tour-booking-edit" onClick={() => setStep("details")}>← Edit booking details</button><div className="tour-booking-summary"><div><span>{formatDate(startDate)}{endDate ? ` — ${formatDate(endDate)}` : ""}</span><small>{guests} guest{guests === 1 ? "" : "s"} · {tour.duration}</small></div><strong>{formatMoney(totalAmount, tour.currency)}</strong></div><p className="tour-payment-heading">Select how you would like to continue</p><label className={`tour-payment-option ${paymentMethod === "card" ? "selected" : ""}`}><input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /><span><strong>Secure card checkout</strong><small>We will send a protected payment link after availability is confirmed.</small></span><b>↗</b></label><label className={`tour-payment-option ${paymentMethod === "pay-later" ? "selected" : ""}`}><input type="radio" name="payment" checked={paymentMethod === "pay-later"} onChange={() => setPaymentMethod("pay-later")} /><span><strong>Pay later with AlpNile</strong><small>Confirm the route first, then settle securely with our team.</small></span><b>◌</b></label><div className="tour-payment-breakdown"><div><span>Experience · {guests} guests</span><strong>{formatMoney(baseAmount, tour.currency)}</strong></div><div><span>Service &amp; support</span><strong>{formatMoney(serviceFee, tour.currency)}</strong></div><div className="total"><span>Total estimate</span><strong>{formatMoney(totalAmount, tour.currency)}</strong></div></div><p className="tour-payment-note">Your request is recorded without storing card numbers or security codes. A confirmed availability message and secure payment instruction will follow.</p><button className="tour-detail-primary-button" type="submit" disabled={submitting}>{submitting ? "Saving your request…" : "Confirm booking request"} <span>→</span></button>{error && <p className="tour-detail-error" role="alert">{error}</p>}</form>}

            {step === "success" && <div className="tour-booking-success"><div className="tour-booking-success-icon">✓</div><h3>Your journey is in motion.</h3><p>We saved your request for <strong>{formatDate(startDate)}</strong> and opened WhatsApp so the AlpNile team can confirm availability and the secure payment step.</p><div className="tour-booking-success-summary"><span>{tour.name}</span><span>{guests} guest{guests === 1 ? "" : "s"} · {formatMoney(totalAmount, tour.currency)} estimate</span></div><Link href="/tours-experiences" className="tour-detail-secondary-button">Explore more experiences</Link></div>}
          </aside>
        </div>

        {similarTours.length > 0 && <section className="tour-similar-section"><div className="tour-similar-heading"><div><p className="tour-detail-eyebrow">Same city &amp; category</p><h2>More routes that fit your journey</h2></div><span>{similarTours.length} related experiences</span></div><div className="tour-similar-grid">{similarTours.map((relatedTour) => <Link href={`/tours-experiences/${relatedTour.slug}`} className="tour-similar-card" key={relatedTour.slug}><div className="tour-similar-card-media"><img src={relatedTour.image} alt={relatedTour.name} /><span>{relatedTour.categories.find((category) => tour.categories.includes(category)) ?? relatedTour.category}</span></div><div className="tour-similar-card-copy"><strong>{relatedTour.name}</strong><span>{relatedTour.city}</span><div><small>★ {relatedTour.rating === "New" ? "New" : `${relatedTour.rating} (${relatedTour.reviews})`}</small><b>From {formatMoney(relatedTour.priceFrom, relatedTour.currency)}</b></div></div></Link>)}</div></section>}
      </div>
    </main>
  );
}
