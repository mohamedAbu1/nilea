"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { StyledSelect } from "./components/styled-select";
import { HomeHero, Icon, bookingLocations, type IconName } from "./components/home-hero";
import { insertCarBooking, insertInquiry, insertReview, listPublishedReviews, toggleReviewLike } from "./lib/submissions";
import { supabase } from "./lib/supabase";

type Category = {
  title: string;
  label: string;
  description: string;
  image: string;
  href: string;
  tone: string;
  icon: IconName;
};

type City = {
  name: string;
  region: string;
  description: string;
  image: string;
  href: string;
};

type Trip = {
  title: string;
  location: string;
  category: string;
  duration: string;
  description: string;
  image: string;
  href: string;
  tone: string;
};

type Review = {
  id?: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
  avatar: string;
  trip: string;
  likes: number;
  liked?: boolean;
};

type InquiryMode = "trip" | "stay" | "car" | "market" | "contact";

const whatsAppNumber = "41765082885";
const whatsAppDisplayNumber = "+41 76 508 2885";
const inquiryModes: { key: InquiryMode; label: string; eyebrow: string; title: string; button: string }[] = [
  { key: "trip", label: "Plan a trip", eyebrow: "TRIP CONCIERGE", title: "Shape the journey around you.", button: "Send trip brief" },
  { key: "stay", label: "Find a stay", eyebrow: "STAY CONCIERGE", title: "Find a place that feels like yours.", button: "Check stay options" },
  { key: "car", label: "Reserve a car", eyebrow: "CAR CONCIERGE", title: "Keep the road open.", button: "Request a car" },
  { key: "market", label: "Shop the market", eyebrow: "ALPNILE MARKET", title: "Take a piece of the story home.", button: "Request a product" },
  { key: "contact", label: "Talk to us", eyebrow: "A HUMAN HELLO", title: "Tell us what you have in mind.", button: "Send message" },
];

const tripCategories = [
  { key: "all", label: "All routes", detail: "The full collection", icon: "compass" as IconName, tone: "teal" },
  { key: "heritage", label: "Heritage & culture", detail: "Temples, museums and stories", icon: "spark" as IconName, tone: "amber" },
  { key: "nile", label: "Nile escapes", detail: "Feluccas, cruises and river light", icon: "pin" as IconName, tone: "blue" },
  { key: "desert", label: "Desert & oasis", detail: "Stillness beyond the map", icon: "compass" as IconName, tone: "sand" },
  { key: "sea", label: "Beach & diving", detail: "Red Sea and Mediterranean days", icon: "spark" as IconName, tone: "coral" },
  { key: "food", label: "Food & local life", detail: "Tables, markets and people", icon: "bag" as IconName, tone: "violet" },
  { key: "family", label: "Family journeys", detail: "Easy days for everyone", icon: "home" as IconName, tone: "blue" },
];

const categories: Category[] = [
  { title: "Destinations", label: "Find your Egypt", description: "From Nile capitals to desert oases.", image: "/alpnile-destinations-v2.webp", href: "/destinations", tone: "teal", icon: "compass" },
  { title: "Villas & Homes", label: "Stay with character", description: "Private spaces, heritage homes and river views.", image: "/alpnile-villas-v2.webp", href: "/stays-hotels", tone: "sand", icon: "home" },
  { title: "Experiences", label: "Make the day yours", description: "Sails, temples, food walks and local stories.", image: "/alpnile-experiences-v2.webp", href: "/tours-experiences", tone: "coral", icon: "spark" },
  { title: "Travel Market", label: "Take a piece home", description: "Artisan objects and considered souvenirs.", image: "/alpnile-products-v2.webp", href: "/local-life", tone: "violet", icon: "bag" },
  { title: "Tourist Cars", label: "Move beautifully", description: "Comfortable cars for a smoother route.", image: "/alpnile-cars-v2.webp", href: "#car-booking", tone: "blue", icon: "car" },
];

const cities: City[] = [
  { name: "Safaga", region: "Red Sea · Diving", description: "Clear reefs, mineral-rich shores and a quieter Red Sea rhythm.", image: "/alpnile-hero-beach-3d-v2.webp", href: "/destinations?destination=safaga" },
  { name: "Marsa Alam", region: "Red Sea · Nature", description: "Wild coastlines, coral gardens and open horizons beyond the resort road.", image: "/alpnile-destination-sharm-v2.webp", href: "/destinations?destination=marsa-alam" },
  { name: "Luxor", region: "Upper Egypt · Heritage", description: "The world's greatest open-air museum, revealed slowly.", image: "/alpnile-destination-luxor.webp", href: "/destinations?destination=luxor" },
  { name: "Aswan", region: "Upper Egypt · Nile", description: "Feluccas, Nubian colour and the river at its most generous.", image: "/alpnile-tour-nile-sunset.webp", href: "/destinations?destination=aswan" },
  { name: "Cairo", region: "Lower Egypt · Culture", description: "Pyramids, museums and a city that never stops moving.", image: "/alpnile-city-cairo-v2.webp", href: "/destinations?destination=cairo" },
  { name: "Hurghada", region: "Red Sea · Water", description: "Clear water, coral gardens and long evenings by the sea.", image: "/alpnile-destination-hurghada-v2.webp", href: "/destinations?destination=hurghada" },
];

const trips: Trip[] = [
  { title: "Temples after dark", location: "Luxor", category: "heritage", duration: "4 hours", description: "A slow evening through stone, shadow and the last light on the Nile.", image: "/alpnile-tour-temple-night.webp", href: "/tours-experiences?experience=temples-after-dark", tone: "amber" },
  { title: "A table in the city", location: "Cairo", category: "food", duration: "3 hours", description: "A generous food walk through the tastes and rituals locals return to.", image: "/alpnile-tour-food-walk.webp", href: "/tours-experiences?experience=food-walk", tone: "coral" },
  { title: "Sail into the sunset", location: "Aswan", category: "nile", duration: "2.5 hours", description: "Quiet water, a traditional felucca and the river changing color around you.", image: "/alpnile-tour-nile-sunset.webp", href: "/tours-experiences?experience=nile-sunset", tone: "teal" },
  { title: "Safaga reef morning", location: "Safaga", category: "sea", duration: "5 hours", description: "A clear-water morning above reefs, warm shallows and the open Red Sea.", image: "/alpnile-hero-beach-3d-v2.webp", href: "/tours-experiences?destination=safaga", tone: "sand" },
  { title: "Coral garden morning", location: "Hurghada", category: "sea", duration: "5 hours", description: "Clear water, a private boat and the quiet rhythm of the Red Sea.", image: "/alpnile-destination-hurghada-v2.webp", href: "/tours-experiences?destination=hurghada", tone: "blue" },
  { title: "Pyramids with the family", location: "Cairo", category: "family", duration: "6 hours", description: "An easy, story-filled day made for curious eyes of every age.", image: "/alpnile-city-cairo-v2.webp", href: "/tours-experiences?destination=cairo", tone: "violet" },
];

const homes = [
  { name: "Winter Palace Riverside", place: "Luxor", image: "/alpnile-hotel-winter-palace.webp", href: "/stays-hotels?stay=winter-palace" },
  { name: "Nile Palace Residence", place: "Aswan", image: "/alpnile-hotel-nile-palace.webp", href: "/stays-hotels?stay=nile-palace" },
  { name: "Al Moudira", place: "West Luxor", image: "/alpnile-hotel-al-moudira.webp", href: "/stays-hotels?stay=al-moudira" },
];

const products = [
  { name: "Brass Nile Compass", detail: "A small object for big journeys", image: "/alpnile-bazaar-compass.webp", href: "/local-life?product=compass" },
  { name: "The Egypt Field Notes", detail: "A tactile guide for curious days", image: "/alpnile-bazaar-field-notes.webp", href: "/local-life?product=field-notes" },
  { name: "Pharaonic Keepsake", detail: "Made to carry the story home", image: "/alpnile-bazaar-keepsake.webp", href: "/local-life?product=keepsake" },
];

const marketSongEmbedUrl = "https://www.youtube.com/embed/qvqa7J9iHsU?rel=0&modestbranding=1";

const starterReviews: Review[] = [
  { name: "Maya Richardson", city: "London", rating: 5, quote: "AlpNile made Egypt feel beautifully human. Every transfer, table and quiet moment had been considered.", avatar: "/alpnile-avatar-woman-explorer-v1.webp", trip: "Cairo · Luxor · Aswan", likes: 18 },
  { name: "Omar Haddad", city: "Dubai", rating: 5, quote: "The route was effortless, but never generic. Our guide found the details we would have missed on our own.", avatar: "/alpnile-avatar-man-03.webp", trip: "Heritage & Nile escape", likes: 12 },
  { name: "Sofia Bennett", city: "Toronto", rating: 5, quote: "The villa, the car and the sunset sail all worked as one story. It was the rare trip that felt unrushed.", avatar: "/alpnile-avatar-woman-08.webp", trip: "Slow luxury in Upper Egypt", likes: 9 },
];

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: { label: string; href: string } }) {
  return (
    <div className="home-redesign-heading">
      <div>
        <p className="home-redesign-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="home-redesign-heading-copy">{description}</p>
      </div>
      {action && <Link className="home-redesign-text-link" href={action.href}>{action.label}<Icon name="arrow" size={15} /></Link>}
    </div>
  );
}

function AuthGate({ title, description, onLogin }: { title: string; description: string; onLogin: () => void }) {
  return (
    <div className="home-auth-gate" role="region" aria-label="Account required">
      <span className="home-auth-gate-mark" aria-hidden="true">𓂀</span>
      <div><p className="home-redesign-eyebrow">Traveler account required</p><h3>{title}</h3><p>{description}</p></div>
      <button type="button" className="home-redesign-primary-button" onClick={onLogin}>Log in to continue <Icon name="arrow" size={15} /></button>
    </div>
  );
}

export default function Home() {
  const [bookingSent, setBookingSent] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [tripCategory, setTripCategory] = useState("all");
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>("trip");
  const [inquirySent, setInquirySent] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [reviews, setReviews] = useState<Review[]>(starterReviews);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [likingReviewIds, setLikingReviewIds] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storyAudioOpen, setStoryAudioOpen] = useState(false);
  const [authGateMessage, setAuthGateMessage] = useState("");

  useEffect(() => {
    if (!supabase) {
      setIsAuthenticated(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthenticated(Boolean(data.session));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(session));
      if (session) setAuthGateMessage("");
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let active = true;
    void listPublishedReviews().then(({ data }) => {
      if (!active || !data.length) return;
      setReviews(data.map((review) => ({
        id: review.id,
        name: review.full_name,
        city: review.city_country,
        rating: review.rating,
        quote: review.body,
        avatar: review.avatar_url || "/alpnile-profile-avatar.webp",
        trip: review.journey,
        likes: review.like_count ?? 0,
      })));
    });
    return () => { active = false; };
  }, []);

  const requestLogin = (action: string) => {
    setAuthGateMessage(`Log in to ${action} and keep your route connected to your account.`);
    window.dispatchEvent(new CustomEvent("alpnile:open-account", { detail: { mode: "login" } }));
  };

  const openCarBooking = () => {
    if (!isAuthenticated) {
      requestLogin("reserve a car");
      return;
    }
    setAuthGateMessage("");
    setBookingOpen(true);
    requestAnimationFrame(() => document.getElementById("car-booking-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const resetBookingForm = () => {
    setBookingOpen(false);
    setBookingSent(false);
    setBookingSubmitting(false);
    setBookingError("");
    requestAnimationFrame(() => document.getElementById("car-booking")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      requestLogin("reserve a car");
      return;
    }
    setBookingError("");
    setBookingSubmitting(true);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setBookingSubmitting(false); return; }
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const pickupDate = value("pickupDate");
    const returnDate = value("returnDate");
    if (returnDate && pickupDate && returnDate < pickupDate) {
      setBookingError("Return date must be on or after the pick-up date.");
      setBookingSubmitting(false);
      return;
    }
    const extras = form.getAll("extras").map(String).join(", ") || "None";
    const message = [
      "Hello AlpNile, I would like to reserve a tourist car.",
      "",
      `Name: ${value("name")}`,
      `WhatsApp: ${value("phone")}`,
      `Email: ${value("email") || "Not provided"}`,
      `Pick-up: ${value("pickup")} on ${value("pickupDate")} at ${value("pickupTime")}`,
      `Drop-off: ${value("dropoff")}${value("dropoffDetails") ? ` — ${value("dropoffDetails")}` : ""}`,
      `Return: ${value("returnDate") || "One way"}${value("returnTime") ? ` at ${value("returnTime")}` : ""}`,
      `Car: ${value("carType")}`,
      `Passengers: ${value("passengers")} · Driver: ${value("driver")} · Luggage: ${value("luggage")}`,
      `Extras: ${extras}`,
      `Notes: ${value("notes") || "None"}`,
    ].join("\n");
    const result = await insertCarBooking({
      full_name: value("name"),
      phone: value("phone"),
      email: value("email") || undefined,
      pickup_label: value("pickup"),
      dropoff_label: value("dropoff"),
      dropoff_details: value("dropoffDetails") || undefined,
      pickup_date: pickupDate,
      pickup_time: value("pickupTime") || undefined,
      return_date: returnDate || undefined,
      return_time: value("returnTime") || undefined,
      passengers: Number(value("passengers").replace(/[^0-9]/g, "")) || 1,
      driver_service: value("driver"),
      luggage: value("luggage"),
      extras: form.getAll("extras").map(String),
      notes: value("notes") || undefined,
    });
    if (result.error) {
      setBookingError("The request could not be saved to the archive, but WhatsApp will still open with your details.");
    }
    const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
    setBookingSent(true);
    const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!popup) setBookingError("The request was saved, but your browser blocked WhatsApp. Please allow pop-ups.");
    setBookingSubmitting(false);
  };

  const selectInquiryMode = (mode: InquiryMode) => {
    setInquiryMode(mode);
    setInquirySent(false);
    setInquiryError("");
  };

  const resetInquiryForm = (form?: HTMLFormElement | null) => {
    form?.reset();
    setInquirySent(false);
    setInquirySubmitting(false);
    setInquiryError("");
  };

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      requestLogin("use the AlpNile concierge");
      return;
    }
    setInquiryError("");
    setInquirySubmitting(true);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setInquirySubmitting(false); return; }
    const details = Object.fromEntries(Array.from(form.entries()).filter(([key]) => !["name", "email", "phone", "message", "website"].includes(key)));
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const requestLabel = inquiryModes.find((mode) => mode.key === inquiryMode)?.label ?? inquiryMode;
    const result = await insertInquiry({
      request_type: inquiryMode,
      full_name: value("name"),
      email: value("email"),
      phone: value("phone") || undefined,
      message: value("message"),
      details,
    });
    if (result.error) {
      setInquiryError("The request could not be saved to the archive, but WhatsApp will still open with your details.");
    }
    const whatsappLines = Object.entries(details)
      .map(([key, entry]) => `${key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}: ${Array.isArray(entry) ? entry.join(", ") : String(entry)}`)
      .filter((line) => !line.endsWith(": "));
    const whatsappMessage = [
      "Hello AlpNile, I would like help planning my Egypt journey.",
      "",
      `Request type: ${requestLabel}`,
      `Name: ${value("name")}`,
      `Email: ${value("email")}`,
      `WhatsApp: ${value("phone") || "Not provided"}`,
      ...whatsappLines,
      "",
      `Sent from AlpNile · ${whatsAppDisplayNumber}`,
    ].join("\n");
    setInquirySent(true);
    const popup = window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`, "_blank", "noopener,noreferrer");
    if (!popup) setInquiryError("The request was saved, but your browser blocked WhatsApp. Please allow pop-ups.");
    setInquirySubmitting(false);
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      requestLogin("share a field note");
      return;
    }
    setReviewError("");
    setReviewSubmitting(true);
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setReviewSubmitting(false); return; }
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const rating = Number(value("rating")) || 5;
    const review = {
      name: value("name"),
      city: value("city"),
      rating,
      quote: value("review"),
      avatar: rating === 5 ? "/alpnile-avatar-woman-10.webp" : "/alpnile-avatar-man-15.webp",
      trip: value("trip"),
      likes: 0,
    };
    const result = await insertReview({ full_name: review.name, city_country: review.city, rating, journey: review.trip, body: review.quote, avatar_url: review.avatar });
    if (result.error) {
      setReviewError("We could not submit your note. Please try again in a moment.");
      setReviewSubmitting(false);
      return;
    }
    setReviews((current) => [{ ...review, id: result.data?.id }, ...current]);
    formElement.reset();
    setReviewSent(true);
    setReviewSubmitting(false);
  };

  const likeReview = async (review: Review, index: number) => {
    if (!review.id) {
      setReviews((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, likes: item.likes + (item.liked ? -1 : 1), liked: !item.liked } : item));
      return;
    }
    if (likingReviewIds.includes(review.id)) return;
    setLikingReviewIds((current) => [...current, review.id as string]);
    try {
      const result = await toggleReviewLike(review.id);
      if (result.error) return;
      setReviews((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, likes: result.count, liked: result.liked } : item));
    } finally {
      setLikingReviewIds((current) => current.filter((id) => id !== review.id));
    }
  };

  const openTripBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      requestLogin("start a service request");
      return;
    }
    const requestedMode = String(new FormData(event.currentTarget).get("heroIntent") ?? "trip") as "trip" | "stay" | "car";
    selectInquiryMode(requestedMode);
    if (requestedMode === "car") {
      setBookingOpen(true);
      requestAnimationFrame(() => document.getElementById("car-booking-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    document.getElementById(requestedMode === "stay" ? "stays" : "concierge")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeInquiry = inquiryModes.find((mode) => mode.key === inquiryMode) ?? inquiryModes[0];
  const visibleTrips = tripCategory === "all" ? trips : trips.filter((trip) => trip.category === tripCategory);

  return (
    <main className="home-redesign">
      <HomeHero onSubmit={openTripBrief} secondaryHref="#categories" />

      <div className="home-redesign-body">
        <section className="home-redesign-section home-redesign-categories" id="categories">
          <SectionHeading eyebrow="Choose your way in" title="A complete Egypt, in chapters." description="Move from the big first idea to the details that make a journey feel personal." action={{ label: "See the Smart Guide", href: "/trip-planner" }} />
          <div className="home-category-grid">
            {categories.map((category) => (
              <Link key={category.title} href={category.href} className={"home-category-card home-tone-" + category.tone}>
                <div className="home-category-image" style={{ backgroundImage: "url('" + category.image + "')" }} />
                <div className="home-category-overlay" />
                <span className="home-category-icon"><Icon name={category.icon} size={19} /></span>
                <div className="home-category-content"><p>{category.label}</p><h3>{category.title}</h3><span>{category.description}</span></div>
                <span className="home-category-arrow"><Icon name="arrow" size={16} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-concierge-section" id="concierge">
          <div className="home-concierge-visual" style={{ backgroundImage: "url('" + (inquiryMode === "contact" ? "/alpnile-contact-studio-v2.webp" : "/alpnile-concierge-v2.webp") + "')" }}>
            <div className="home-concierge-visual-overlay" />
            <div className="home-concierge-visual-caption"><span>ALPNILE CONCIERGE</span><strong>One thoughtful<br />conversation.</strong></div>
          </div>
          <div className="home-concierge-panel">
            <div className="home-concierge-intro"><p className="home-redesign-eyebrow">One form · every route</p><h2>{activeInquiry.title}</h2><p>Tell us the shape of the day you want. We will help turn the first idea into a clear next step.</p></div>
            <div className="home-concierge-tabs" role="tablist" aria-label="AlpNile request type">
              {inquiryModes.map((mode) => <button key={mode.key} type="button" role="tab" aria-selected={inquiryMode === mode.key} className={inquiryMode === mode.key ? "active" : ""} onClick={() => selectInquiryMode(mode.key)}>{mode.label}</button>)}
            </div>
            {authGateMessage && <p className="home-auth-gate-message" role="status">{authGateMessage}</p>}
            {isAuthenticated ? <form className="home-concierge-form" onSubmit={submitInquiry}>
              <input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="home-concierge-form-head"><span>{activeInquiry.eyebrow}</span><strong>Request details</strong></div>
              <div className="home-concierge-row"><label>Full name<input name="name" type="text" placeholder="Your name" required /></label><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label></div>
              {inquiryMode === "trip" && <>
                <div className="home-concierge-row"><label>Where are you curious about?<StyledSelect name="destination" defaultValue="luxor" ariaLabel="Where are you curious about?"><option value="safaga">Safaga</option><option value="marsa-alam">Marsa Alam</option><option value="luxor">Luxor</option><option value="aswan">Aswan</option><option value="cairo">Cairo</option><option value="hurghada">Hurghada</option><option value="open">I am not sure yet</option></StyledSelect></label><label>When would you like to go?<input name="travelDate" type="date" required /></label></div>
                <div className="home-concierge-row"><label>Travellers<StyledSelect name="travellers" defaultValue="2" ariaLabel="Travellers"><option value="1">1 traveller</option><option value="2">2 travellers</option><option value="3-4">3–4 travellers</option><option value="5+">5+ travellers</option></StyledSelect></label><label>Travel style<StyledSelect name="travelStyle" defaultValue="considered" ariaLabel="Travel style"><option value="considered">Considered and slow</option><option value="culture">Culture and history</option><option value="adventure">Adventure and outdoors</option><option value="family">Family time</option></StyledSelect></label></div>
              </>}
              {inquiryMode === "stay" && <>
                <div className="home-concierge-row"><label>Preferred city<StyledSelect name="stayCity" defaultValue="luxor" ariaLabel="Preferred city"><option value="safaga">Safaga</option><option value="marsa-alam">Marsa Alam</option><option value="luxor">Luxor</option><option value="aswan">Aswan</option><option value="cairo">Cairo</option><option value="hurghada">Hurghada</option><option value="open">Open to ideas</option></StyledSelect></label><label>Guests<StyledSelect name="guests" defaultValue="2" ariaLabel="Guests"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3-4">3–4 guests</option><option value="5+">5+ guests</option></StyledSelect></label></div>
                <div className="home-concierge-row"><label>Check-in<input name="checkIn" type="date" required /></label><label>Check-out<input name="checkOut" type="date" required /></label></div>
              </>}
              {inquiryMode === "car" && <>
                <div className="home-concierge-row"><label>Pick-up city<StyledSelect name="pickup" defaultValue="cairo" ariaLabel="Pick-up city"><option value="safaga">Safaga</option><option value="marsa-alam">Marsa Alam</option><option value="luxor">Luxor</option><option value="aswan">Aswan</option><option value="cairo">Cairo</option><option value="hurghada">Hurghada</option></StyledSelect></label><label>Pick-up date<input name="pickupDate" type="date" required /></label></div>
                <div className="home-concierge-row"><label>Car type<StyledSelect name="carType" defaultValue="comfort" ariaLabel="Car type"><option value="comfort">Comfort SUV</option><option value="van">Family van</option><option value="premium">Premium sedan</option></StyledSelect></label><label>With driver?<StyledSelect name="driver" defaultValue="yes" ariaLabel="With driver?"><option value="yes">Yes, please</option><option value="no">No, self-drive</option></StyledSelect></label></div>
              </>}
              {inquiryMode === "market" && <>
                <div className="home-concierge-row"><label>What would you like?<StyledSelect name="product" defaultValue="compass" ariaLabel="What would you like?"><option value="compass">Brass Nile Compass</option><option value="field-notes">The Egypt Field Notes</option><option value="keepsake">Pharaonic Keepsake</option><option value="custom">Something else</option></StyledSelect></label><label>Quantity<StyledSelect name="quantity" defaultValue="1" ariaLabel="Quantity"><option value="1">1 item</option><option value="2">2 items</option><option value="3+">3+ items</option></StyledSelect></label></div>
                <div className="home-concierge-row"><label>Delivery country<input name="country" type="text" placeholder="Country" required /></label><label>Preferred contact<StyledSelect name="contactPreference" defaultValue="email" ariaLabel="Preferred contact"><option value="email">Email</option><option value="whatsapp">WhatsApp</option></StyledSelect></label></div>
              </>}
              {inquiryMode === "contact" && <div className="home-concierge-row"><label>Topic<StyledSelect name="topic" defaultValue="general" ariaLabel="Topic"><option value="general">General question</option><option value="trip">Trip planning</option><option value="stay">Villas and homes</option><option value="car">Tourist cars</option><option value="market">Travel products</option></StyledSelect></label><label>Best way to reach you<StyledSelect name="contactMethod" defaultValue="email" ariaLabel="Best way to reach you"><option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option></StyledSelect></label></div>}
              <label className="home-concierge-message">Your note<textarea name="message" rows={3} placeholder={inquiryMode === "contact" ? "Tell us how we can help..." : "Anything else you want us to know?"} required /></label>
              <div className="home-concierge-actions"><button type="submit" disabled={inquirySubmitting} className="home-redesign-primary-button">{inquirySubmitting ? "Preparing WhatsApp…" : inquirySent ? "WhatsApp opened" : activeInquiry.button} <Icon name="arrow" size={16} /></button><button type="button" className="home-form-reset" onClick={(event) => resetInquiryForm(event.currentTarget.form)}>Clear all <span aria-hidden="true">↺</span></button></div>
              {inquirySubmitting && <p className="home-concierge-success" role="status">Saving your request…</p>}
              {inquirySent && <p className="home-concierge-success" role="status">Your request is ready in WhatsApp. Send the message to reach the AlpNile concierge team.</p>}
              {inquiryError && <p className="home-form-error" role="alert">{inquiryError}</p>}
            </form> : <AuthGate title="Your route starts with an account." description="Sign in before sending a request so we can keep your preferences, messages and WhatsApp follow-up together." onLogin={() => requestLogin("use the AlpNile concierge")} />}
          </div>
        </section>

        <section className="home-redesign-section home-cities-section" id="cities">
          <SectionHeading eyebrow="Six cities · one living route" title="Where will you begin?" description="Each city opens a different door into Egypt — choose the light, rhythm or silence that fits your trip." action={{ label: "Explore all destinations", href: "/destinations" }} />
          <div className="home-city-grid">
            {cities.map((city, index) => (
              <Link key={city.name} href={city.href} className={"home-city-card home-city-card-" + (index + 1)}>
                <div className="home-city-image" style={{ backgroundImage: "url('" + city.image + "')" }} />
                <div className="home-city-overlay" />
                <div className="home-city-content"><p>{city.region}</p><h3>{city.name}</h3><span>{city.description}</span><b>Discover city <Icon name="arrow" size={14} /></b></div>
                <span className="home-city-index">0{index + 1}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-redesign-section home-trips-section" id="trips">
          <SectionHeading eyebrow="The days you will remember" title="Signature trips, thoughtfully made." description="Not a checklist. A point of view — built around atmosphere, timing and the people who make a place feel real." action={{ label: "See every experience", href: "/tours-experiences" }} />
          <div className="home-trip-category-rail" role="tablist" aria-label="Egypt trip categories">
            {tripCategories.map((category) => <button key={category.key} type="button" role="tab" aria-selected={tripCategory === category.key} className={`home-trip-category home-tone-${category.tone} ${tripCategory === category.key ? "active" : ""}`} onClick={() => setTripCategory(category.key)}><span className="home-trip-category-icon"><Icon name={category.icon} size={17} /></span><span><strong>{category.label}</strong><small>{category.detail}</small></span></button>)}
          </div>
          <div className="home-trips-grid">
            {visibleTrips.map((trip, index) => (
              <Link key={trip.title} href={trip.href} className={"home-trip-card home-tone-" + trip.tone}>
                <div className="home-trip-image" style={{ backgroundImage: "url('" + trip.image + "')" }} />
                <div className="home-trip-top"><span>0{index + 1}</span><span>{trip.duration}</span></div>
                <div className="home-trip-content"><p>{trip.location} · {trip.duration}</p><h3>{trip.title}</h3><span>{trip.description}</span><b>View the experience <Icon name="arrow" size={14} /></b></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-stay-feature" id="stays">
          <div className="home-stay-feature-media" style={{ backgroundImage: "url('/alpnile-stays-hotels-v2.webp')" }} />
          <div className="home-stay-feature-copy">
            <p className="home-redesign-eyebrow">Sleep somewhere with a story</p>
            <h2>Stay close<br /><em>to the feeling.</em></h2>
            <p>From heritage residences beside the Nile to private homes made for slow mornings, choose a place that becomes part of the journey.</p>
            <Link className="home-redesign-primary-button" href="/stays-hotels">Find your stay <Icon name="arrow" size={16} /></Link>
            <div className="home-stay-mini-list">{homes.map((home) => <Link key={home.name} href={home.href}><span className="home-stay-mini-image" style={{ backgroundImage: "url('" + home.image + "')" }} /><span><strong>{home.name}</strong><small>{home.place}</small></span><Icon name="arrow" size={13} /></Link>)}</div>
          </div>
        </section>

        <section className="home-redesign-section home-market-section" id="market">
          <div className="home-market-archive">
            <div className="home-market-archive-bg" aria-hidden="true" />
            <div className="home-market-archive-panel">
              <div className="home-market-archive-copy">
                <p className="home-market-chapter">01 <i /> 06 CHAPTERS</p>
                <p className="home-redesign-eyebrow">Bring the story home</p>
                <h2>Ancient<br /><em>Egypt.</em></h2>
                <p className="home-market-archive-lede">A civilization of visionaries, builders and believers who transformed the Nile into a legacy for eternity.</p>
                <p className="home-market-key-label">Key dates</p>
                <strong className="home-market-key-date">c. 3100 — 332 BC</strong>
                <button type="button" className="home-market-audio-control" onClick={() => setStoryAudioOpen((open) => !open)} aria-expanded={storyAudioOpen} aria-controls="alpnile-story-audio" aria-label="Play the AlpNile story inside the site">
                  <span className="home-market-audio-icon">{storyAudioOpen ? "Ⅱ" : "▶"}</span>
                  <span><small>{storyAudioOpen ? "Now playing in AlpNile" : "Listen to the story"}</small><strong>Ancient Egypt · soundtrack</strong></span>
                  <Icon name="arrow" size={15} />
                </button>
                {storyAudioOpen && <div id="alpnile-story-audio" className="audio-player-preview home-market-audio-player"><iframe title="Ancient Egypt soundtrack" src={marketSongEmbedUrl} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>}
                <Link className="home-redesign-primary-button home-market-archive-cta" href="/local-life">Explore local life <Icon name="arrow" size={15} /></Link>
              </div>
              <div className="home-market-archive-explore">
                <div className="home-market-explore-head"><div><p className="home-redesign-eyebrow">Objects with a sense of place</p><h3>Explore artifacts</h3></div><Link href="/local-life">View all <Icon name="arrow" size={13} /></Link></div>
                <div className="home-market-artifact-grid">
                  {products.map((product, index) => <Link key={product.name} href={product.href} className="home-market-artifact-card"><span className="home-market-artifact-number">0{index + 1}</span><div className="home-market-artifact-image" style={{ backgroundImage: "url('" + product.image + "')" }} /><span className="home-market-artifact-copy"><strong>{product.name}</strong><small>{product.detail}</small></span><Icon name="arrow" size={13} /></Link>)}
                </div>
                <p className="home-market-archive-note"><span /> Where the river became a kingdom, and stone learned to speak.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-reviews-section" id="reviews" aria-labelledby="reviews-title">
          <div className="home-reviews-heading">
            <div>
              <p className="home-redesign-eyebrow">Stories from the route</p>
              <h2 id="reviews-title">The moments guests<br /><em>carry home.</em></h2>
              <p>Real notes from travellers who let the river shape the day around them.</p>
            </div>
            <span className="home-reviews-rating"><strong>4.9</strong><span>★★★★★<small>Trusted by curious travellers</small></span></span>
          </div>
          <div className="home-reviews-layout">
            <div className="home-review-grid">
              {reviews.slice(0, 3).map((review, index) => (
                <article className={`home-review-card home-review-card-${index + 1}`} key={`${review.name}-${index}`}>
                  <div className="home-review-card-top"><span className="home-review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}</span><button type="button" className={`home-review-like ${review.liked ? "liked" : ""}`} onClick={() => void likeReview(review, index)} disabled={Boolean(review.id && likingReviewIds.includes(review.id))} aria-label={`${review.liked ? "Unlike" : "Like"} ${review.name}'s review`} aria-pressed={review.liked}><span aria-hidden="true">♥</span> {review.likes}</button></div>
                  <blockquote>“{review.quote}”</blockquote>
                  <div className="home-review-author"><img src={review.avatar} alt={`${review.name} avatar`} loading="lazy" /><span><strong>{review.name}</strong><small>{review.city} · {review.trip}</small></span></div>
                </article>
              ))}
            </div>
            {isAuthenticated ? <form className="home-review-form" onSubmit={submitReview}>
              <input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div><p className="home-redesign-eyebrow">Leave a field note</p><h3>Share your<br /><em>Egypt story.</em></h3></div>
              <label>Your name<input name="name" required placeholder="Your name" /></label>
              <div className="home-review-form-row"><label>City / country<input name="city" required placeholder="Cairo, Egypt" /></label><label>Rating<StyledSelect name="rating" defaultValue="5" ariaLabel="Rating"><option value="5">5 · Exceptional</option><option value="4">4 · Beautiful</option><option value="3">3 · Good</option></StyledSelect></label></div>
              <label>Your journey<StyledSelect name="trip" defaultValue="Heritage & Nile escape" ariaLabel="Your journey"><option>Heritage &amp; Nile escape</option><option>Slow luxury in Upper Egypt</option><option>Red Sea days</option><option>Private villa stay</option></StyledSelect></label>
              <label>Your note<textarea name="review" required rows={4} placeholder="What made the journey memorable?" /></label>
              <button className="home-review-submit" type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? "Saving note…" : "Submit for review"} <Icon name="arrow" size={15} /></button>
              {reviewSent && <p className="home-review-success" role="status">Thank you. Your field note was submitted for review.</p>}
              {reviewError && <p className="home-form-error" role="alert">{reviewError}</p>}
            </form> : <AuthGate title="Your story belongs to your account." description="Log in to publish a field note and keep your travel memories connected to your AlpNile profile." onLogin={() => requestLogin("share a field note")} />}
          </div>
        </section>

        <section className="home-car-section" id="car-booking">
          <div className="home-car-background" aria-hidden="true" />
          <div className="home-car-shade" aria-hidden="true" />
          <div className="home-car-content">
            <div className="home-car-copy"><p className="home-redesign-eyebrow">Your road, your rhythm</p><h2>Move through Egypt<br /><em>with ease.</em></h2><p>Book a comfortable tourist car and keep the day open for the moments that were not on the itinerary.</p><div className="home-car-points"><span><Icon name="car" size={16} /> Comfortable cars</span><span><Icon name="pin" size={16} /> Local route support</span><span><Icon name="spark" size={16} /> Flexible days</span></div></div>
            <div className="home-car-booking-column">
              {!bookingOpen && <div className="home-car-booking-cta"><span className="home-car-booking-section-title">PRIVATE DRIVER · 24/7 SUPPORT</span><strong>Ready when your route is.</strong><p>Tell us where you are going and we will match you with the right car, timing and local support.</p><button type="button" className="home-redesign-primary-button home-whatsapp-button" onClick={openCarBooking}>Open car booking form <Icon name="arrow" size={16} /></button><small>Fast reply via WhatsApp · {whatsAppDisplayNumber}</small></div>}
            {bookingOpen && (isAuthenticated ? <form id="car-booking-form" className="home-car-booking-card" onSubmit={submitBooking}>
              <input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="home-car-booking-head"><span>CAR CONCIERGE / 01 · WHATSAPP BOOKING</span><strong>Reserve your ride</strong><p>Share the route and we will confirm the right car, driver and timing with you on WhatsApp.</p></div>
              <div className="home-car-booking-section"><span className="home-car-booking-section-title">Your details</span><div className="home-car-booking-row"><label>Full name<input name="name" type="text" placeholder="Your full name" required /></label><label>WhatsApp number<input name="phone" type="tel" placeholder="+20 100 000 0000" required /></label></div><label>Email address <span className="home-car-optional">optional</span><input name="email" type="email" placeholder="you@example.com" /></label></div>
              <div className="home-car-booking-section"><span className="home-car-booking-section-title">Route & timing</span><div className="home-car-booking-row"><label>Pick-up location<StyledSelect name="pickup" defaultValue="cairo" ariaLabel="Pick-up location" required>{bookingLocations.map(([value, label]) => <option key={value} value={label}>{label}</option>)}</StyledSelect></label><label>Drop-off location<StyledSelect name="dropoff" defaultValue="luxor" ariaLabel="Drop-off location" required>{bookingLocations.map(([value, label]) => <option key={value} value={label}>{label}</option>)}<option value="custom">Different location</option></StyledSelect></label></div><label>Drop-off details <span className="home-car-optional">hotel, airport or address</span><input name="dropoffDetails" type="text" placeholder="Hotel name or exact address" /></label><div className="home-car-booking-row home-car-booking-row-three"><label>Pick-up date<input name="pickupDate" type="date" required /></label><label>Pick-up time<input name="pickupTime" type="time" required /></label><label>Return date <span className="home-car-optional">optional</span><input name="returnDate" type="date" /></label></div><label>Return time <span className="home-car-optional">optional</span><input name="returnTime" type="time" /></label></div>
              <div className="home-car-booking-section"><span className="home-car-booking-section-title">Ride preferences</span><div className="home-car-booking-row"><label>Car type<StyledSelect name="carType" defaultValue="Comfort SUV" ariaLabel="Car type"><option>Comfort SUV</option><option>Family van</option><option>Premium sedan</option><option>Luxury minibus</option></StyledSelect></label><label>Passengers<StyledSelect name="passengers" defaultValue="2 passengers" ariaLabel="Passengers"><option>1 passenger</option><option>2 passengers</option><option>3–4 passengers</option><option>5–7 passengers</option><option>8+ passengers</option></StyledSelect></label></div><div className="home-car-booking-row"><label>Driver<StyledSelect name="driver" defaultValue="Private driver" ariaLabel="Driver"><option>Private driver</option><option>Airport meet &amp; greet</option><option>Self-drive request</option></StyledSelect></label><label>Luggage<StyledSelect name="luggage" defaultValue="1–2 bags" ariaLabel="Luggage"><option>No luggage</option><option>1–2 bags</option><option>3–5 bags</option><option>Large luggage</option></StyledSelect></label></div><fieldset className="home-car-extras"><legend>Helpful extras</legend><label><input type="checkbox" name="extras" value="Child seat" /> Child seat</label><label><input type="checkbox" name="extras" value="Wi-Fi" /> Wi-Fi</label><label><input type="checkbox" name="extras" value="Bilingual guide" /> Bilingual guide</label></fieldset><label>Notes <span className="home-car-optional">optional</span><textarea name="notes" rows={2} placeholder="Flight number, accessibility needs or anything else..." /></label></div>
              <div className="home-car-booking-actions"><button type="submit" disabled={bookingSubmitting} className="home-redesign-primary-button home-whatsapp-button"><span className="home-whatsapp-mark">◌</span>{bookingSubmitting ? "Saving request…" : bookingSent ? "WhatsApp request opened" : "Continue in WhatsApp"} <Icon name="arrow" size={16} /></button><button type="button" className="home-form-reset" onClick={resetBookingForm}>Clear form &amp; close <span aria-hidden="true">↺</span></button></div>
              {bookingSent && <p className="home-car-success" role="status">Your booking details are ready in WhatsApp. Send the message to complete the request.</p>}
              {bookingError && <p className="home-form-error" role="alert">{bookingError}</p>}
            </form> : <AuthGate title="Reserve your ride with a traveler account." description="Log in before booking so your route details and WhatsApp confirmation stay connected to you." onLogin={() => requestLogin("reserve a car")} />)}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
