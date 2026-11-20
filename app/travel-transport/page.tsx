"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDestinationLabel, getMatchingVehicles, normalizeDestinationId } from "../lib/travel-availability";
import { getSubmissionErrorMessage, insertCarBooking } from "../lib/submissions";
import { LocalizedPrice } from "../components/currency";

type FleetCategory = "Executive" | "Family" | "Group" | "Desert" | "Accessible";
type VehicleImage = { src: string; label: string };
type Vehicle = {
  id: string;
  name: string;
  arabicName: string;
  category: FleetCategory;
  label: string;
  description: string;
  arabicDescription: string;
  seats: string;
  luggage: string;
  price: number;
  bestFor: string;
  arabicBestFor: string;
  fuel: string;
  arabicFuel: string;
  images: VehicleImage[];
  features: string[];
  arabicFeatures: string[];
};

type BookingReceipt = {
  reference: string;
  vehicle: string;
  service: string;
  date: string;
  pickup: string;
  dropoff: string;
  contact: string;
};

const standardGallery = (prefix: string): VehicleImage[] => [
  { src: `/vehicles/${prefix}-front.webp`, label: "Front three-quarter" },
  { src: `/vehicles/${prefix}-rear.webp`, label: "Rear three-quarter" },
  { src: `/vehicles/${prefix}-side.webp`, label: "Full side profile" },
  { src: `/vehicles/${prefix}-interior.webp`, label: "Passenger cabin" },
  { src: `/vehicles/${prefix}-luggage.webp`, label: "Luggage space" },
];

const xpanderGallery: VehicleImage[] = [
  { src: "/vehicles/branded/xpander-front.png", label: "Front three-quarter" },
  { src: "/vehicles/branded/xpander-rear.png", label: "Rear three-quarter" },
  { src: "/vehicles/branded/xpander-side.png", label: "Full side profile" },
  { src: "/vehicles/branded/xpander-interior.png", label: "Passenger cabin" },
  { src: "/vehicles/branded/xpander-luggage.png", label: "Luggage space" },
];

const hiaceGallery: VehicleImage[] = [
  { src: "/vehicles/branded/hiace-front.png", label: "Front three-quarter" },
  { src: "/vehicles/branded/hiace-rear.png", label: "Rear three-quarter" },
  { src: "/vehicles/branded/hiace-side.png", label: "Full side profile" },
  { src: "/vehicles/branded/hiace-rear-side.png", label: "Rear side profile" },
  { src: "/vehicles/branded/hiace-front-side.png", label: "Alternate front" },
];

const vehicles: Vehicle[] = [
  {
    id: "executive-sedan",
    name: "Nile Executive Sedan",
    arabicName: "سيدان النيل التنفيذية",
    category: "Executive",
    label: "Quiet luxury for the city",
    description: "A polished private sedan for airport arrivals, hotel transfers and unhurried city days with a little more room to breathe.",
    arabicDescription: "سيارة سيدان خاصة وهادئة للاستقبال من المطار والتنقل بين الفنادق والجولات داخل المدينة براحة وأناقة.",
    seats: "Up to 3 guests",
    luggage: "2 large bags",
    price: 55,
    bestFor: "Airport arrivals, couples and city routes",
    arabicBestFor: "استقبال المطار، الأزواج والجولات داخل المدينة",
    fuel: "Comfort-tuned petrol",
    arabicFuel: "بنزين مهيأ للراحة",
    images: standardGallery("executive-sedan"),
    features: ["Air conditioning", "Bottled water", "Phone charging", "Professional driver", "Door-to-door pickup"],
    arabicFeatures: ["تكييف هواء", "مياه معدنية", "شحن الهاتف", "سائق محترف", "استقبال من الباب إلى الباب"],
  },
  {
    id: "toyota-hiace",
    name: "Toyota Hiace",
    arabicName: "تويوتا هاي إيس",
    category: "Group",
    label: "A calm cabin for larger groups",
    description: "A real AlpNile group van for airport runs, family journeys and full-day tours, with easy boarding and generous room for luggage.",
    arabicDescription: "فان حقيقي من أسطول AlpNile للمجموعات والعائلات، مناسب للمطارات والرحلات اليومية مع مساحة واسعة للركاب والأمتعة.",
    seats: "Up to 12 guests",
    luggage: "8 large bags",
    price: 85,
    bestFor: "Groups, airport transfers and full-day tours",
    arabicBestFor: "المجموعات، استقبال المطار والرحلات اليومية",
    fuel: "Long-range diesel",
    arabicFuel: "ديزل اقتصادي للرحلات الطويلة",
    images: hiaceGallery,
    features: ["High-roof cabin", "USB charging", "Climate control", "Large luggage bay", "Flexible route timing"],
    arabicFeatures: ["مقصورة مرتفعة", "شحن USB", "تحكم في المناخ", "مساحة أمتعة كبيرة", "مرونة في توقيت الرحلة"],
  },
  {
    id: "desert-suv",
    name: "Desert Trail 4×4",
    arabicName: "دفع رباعي لمسارات الصحراء",
    category: "Desert",
    label: "Ready for the road beyond the road",
    description: "A capable 4×4 for desert tracks, oases and open landscapes, with the comfort and local support needed for a full day out.",
    arabicDescription: "سيارة دفع رباعي للطرق الصحراوية والواحات والمساحات المفتوحة، مع راحة ودعم محلي طوال اليوم.",
    seats: "Up to 4 guests",
    luggage: "4 large bags",
    price: 95,
    bestFor: "Desert safaris, oases and remote viewpoints",
    arabicBestFor: "السفاري، الواحات والنقاط البعيدة",
    fuel: "All-terrain diesel",
    arabicFuel: "ديزل للطرق الوعرة",
    images: standardGallery("desert-suv"),
    features: ["High-clearance drive", "Cooler box", "Desert-ready tires", "Sun protection", "Experienced local driver"],
    arabicFeatures: ["ارتفاع مناسب للطرق الوعرة", "صندوق تبريد", "إطارات صحراوية", "حماية من الشمس", "سائق محلي خبير"],
  },
  {
    id: "mitsubishi-xpander",
    name: "Mitsubishi Xpander",
    arabicName: "ميتسوبيشي إكسباندر",
    category: "Family",
    label: "The family car from our real fleet",
    description: "A real AlpNile family vehicle with comfortable seating, easy loading and the flexibility to move from airport pickup to a full day of exploring.",
    arabicDescription: "سيارة عائلية حقيقية من أسطول AlpNile بمقاعد مريحة وتحميل سهل، مناسبة من لحظة الاستقبال وحتى يوم كامل من الاستكشاف.",
    seats: "Up to 6 guests",
    luggage: "4 large bags",
    price: 72,
    bestFor: "Families, airport transfers and city-to-city routes",
    arabicBestFor: "العائلات، استقبال المطار والتنقل بين المدن",
    fuel: "Efficient petrol",
    arabicFuel: "بنزين اقتصادي",
    images: xpanderGallery,
    features: ["Comfortable family cabin", "Child-seat request", "Wide rear doors", "Air conditioning", "Flexible stops"],
    arabicFeatures: ["مقصورة عائلية مريحة", "إمكانية طلب مقعد أطفال", "أبواب خلفية واسعة", "تكييف هواء", "توقفات مرنة"],
  },
  {
    id: "accessible-minibus",
    name: "Accessible Nile Shuttle",
    arabicName: "حافلة النيل المجهزة",
    category: "Accessible",
    label: "Thoughtful access, without compromise",
    description: "A spacious accessible vehicle with a discreet ramp, clear boarding space and a team ready to shape the route around your needs.",
    arabicDescription: "سيارة واسعة ومجهزة لسهولة الوصول، مع منحدر عملي ومساحة صعود واضحة وفريق يراعي احتياجات الرحلة.",
    seats: "Up to 6 guests + 1 wheelchair",
    luggage: "4 large bags",
    price: 90,
    bestFor: "Accessible routes, families and assisted travel",
    arabicBestFor: "الرحلات المجهزة، العائلات والسفر بمساعدة",
    fuel: "Smooth diesel",
    arabicFuel: "ديزل سلس",
    images: standardGallery("accessible-minibus"),
    features: ["Side wheelchair ramp", "Low-step boarding", "Wide aisle", "Trained support team", "Route accessibility review"],
    arabicFeatures: ["منحدر جانبي للكرسي المتحرك", "صعود منخفض", "ممر واسع", "فريق مدرب", "مراجعة سهولة المسار"],
  },
];

const categories: (FleetCategory | "All")[] = ["All", "Executive", "Family", "Group", "Desert", "Accessible"];

function FleetMark({ type }: { type: "seat" | "bag" | "route" | "check" }) {
  if (type === "seat") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v8a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9" /><path d="M6 16v3M18 16v3M9 5a2 2 0 1 1 4 0v6H9V5ZM4 19h16" /></svg>;
  if (type === "bag") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5a3 3 0 0 1 6 0v2M8 12h.01M16 12h.01" /></svg>;
  if (type === "route") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18c6 0 2-10 8-12" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function TravelTransportPage() {
  const searchParams = useSearchParams();
  const requestedDestination = normalizeDestinationId(searchParams.get("destination"));
  const requestedTravelers = Number.parseInt(searchParams.get("travelers") ?? "", 10);
  const [category, setCategory] = useState<FleetCategory | "All">("All");
  const [selectedId, setSelectedId] = useState("executive-sedan");
  const [bookingReceipt, setBookingReceipt] = useState<BookingReceipt | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [routeDestination, setRouteDestination] = useState(requestedDestination);
  const [travelerFilter, setTravelerFilter] = useState(Number.isFinite(requestedTravelers) ? Math.min(12, Math.max(1, requestedTravelers)) : 0);
  const [passengerCount, setPassengerCount] = useState(Number.isFinite(requestedTravelers) ? Math.min(12, Math.max(1, requestedTravelers)) : 2);

  useEffect(() => {
    setRouteDestination(requestedDestination);
    if (Number.isFinite(requestedTravelers)) {
      const count = Math.min(12, Math.max(1, requestedTravelers));
      setTravelerFilter(count);
      setPassengerCount(count);
    }
  }, [requestedDestination, requestedTravelers]);

  const recommendedVehicleIds = useMemo(() => travelerFilter ? new Set(getMatchingVehicles({ travelers: travelerFilter, destinationId: routeDestination }).map((match) => match.vehicle.id)) : null, [routeDestination, travelerFilter]);
  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) => (category === "All" || vehicle.category === category) && (!recommendedVehicleIds || recommendedVehicleIds.has(vehicle.id))), [category, recommendedVehicleIds]);
  const requestVehicleOptions = useMemo(() => recommendedVehicleIds ? vehicles.filter((vehicle) => recommendedVehicleIds.has(vehicle.id)) : vehicles, [recommendedVehicleIds]);

  useEffect(() => {
    if (requestVehicleOptions.length && !requestVehicleOptions.some((vehicle) => vehicle.id === selectedId)) {
      setSelectedId(requestVehicleOptions[0].id);
    }
  }, [requestVehicleOptions, selectedId]);

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingError("");
    setBookingSubmitting(true);
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const vehicle = vehicles.find((item) => item.id === data.get("vehicle")) ?? vehicles[0];
    const date = value("date");
    const pickup = value("pickup");
    const dropoff = value("dropoff");
    const phone = value("phone");
    const email = value("email");
    const passengers = Number.parseInt(value("passengers"), 10) || 1;
    const tripType = value("tripType");
    const flight = value("flight");
    const notes = [
      "Trip type: " + tripType,
      flight ? "Flight or train: " + flight : "",
      value("notes"),
    ].filter(Boolean).join(" ");
    const extras = [value("childSeats"), value("accessibility")].filter((item) => item && item !== "None");
    const result = await insertCarBooking({
      full_name: value("name"),
      phone,
      email,
      pickup_label: pickup,
      dropoff_label: dropoff,
      pickup_date: date,
      pickup_time: value("time"),
      passengers,
      driver_service: value("service") + " · " + tripType,
      luggage: value("bags"),
      extras,
      notes,
    });
    if (result.error) {
      try {
        window.localStorage.setItem("alpnile-vehicle-request-draft", JSON.stringify({ ...Object.fromEntries(data.entries()), savedAt: new Date().toISOString() }));
      } catch {
        // The form remains available even when local storage is blocked.
      }
      setBookingError(getSubmissionErrorMessage(result.error, "We couldn’t save this vehicle request. Your details are still in the form; please try again."));
      setBookingSubmitting(false);
      return;
    }
    try {
      window.localStorage.removeItem("alpnile-vehicle-request-draft");
    } catch {
      // Ignore storage restrictions after a successful submission.
    }
    setSelectedId(vehicle.id);
    setBookingReceipt({
      reference: `AN-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicle: vehicle.name,
      service: value("service") || "Private transfer",
      date,
      pickup,
      dropoff,
      contact: phone || email,
    });
    setBookingSubmitting(false);
  };

  return (
    <main className="fleet-page">
      <section className="fleet-hero" aria-labelledby="fleet-title">
        <div className="fleet-hero-copy">
          <p className="fleet-eyebrow"><span aria-hidden="true">✦</span> AlpNile private fleet</p>
          <h1 id="fleet-title">The right vehicle<br /><em>for the way you travel.</em></h1>
          <p className="fleet-hero-description">From quiet city transfers to long desert days, choose a vehicle that makes the route feel easy. Explore our real AlpNile vehicles alongside the specialist fleet prepared for every route.</p>
          <div className="fleet-hero-actions"><a className="fleet-primary-action" href="#fleet-catalog">Explore the fleet</a><a className="fleet-secondary-action" href="#fleet-request">Request a vehicle</a></div>
        </div>
        <div className="fleet-hero-art" aria-hidden="true"><div className="fleet-hero-orbit fleet-hero-orbit-one" /><div className="fleet-hero-orbit fleet-hero-orbit-two" /><div className="fleet-hero-stamp"><span>05</span><small>vehicles<br />ready to move</small></div></div>
        <div className="fleet-hero-note"><FleetMark type="route" /><span>Egypt-wide routes · Local support · Flexible timing</span></div>
      </section>

      <section className="fleet-catalog" id="fleet-catalog" aria-labelledby="fleet-catalog-title">
        <div className="fleet-section-heading"><div><p className="fleet-eyebrow">Choose your rhythm</p><h2 id="fleet-catalog-title">A small fleet, thoughtfully matched.</h2></div><p>Each vehicle is prepared for the route you choose, with room for the details that make a travel day feel personal.</p></div>
        <div className="fleet-filter-bar" role="group" aria-label="Filter vehicles by category">{categories.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === "All" ? "All vehicles" : item}</button>)}</div>
        {travelerFilter > 0 && <div className="fleet-route-context" role="status"><div><span>Smart match</span><strong>{getDestinationLabel(routeDestination)} · {travelerFilter} {travelerFilter === 1 ? "traveler" : "travelers"}</strong><small>Only vehicles with enough seats and route fit are shown.</small></div><Link href={`/trip-planner?destination=${routeDestination || "luxor"}&travelers=${travelerFilter}`}>Tune the complete route <span aria-hidden="true">↗</span></Link><button type="button" onClick={() => { setTravelerFilter(0); setRouteDestination(""); }}>Show all vehicles</button></div>}
        <div className="fleet-grid">{filteredVehicles.map((vehicle, index) => <article className="fleet-card" key={vehicle.id}>
          <Link href={`/travel-transport/${vehicle.id}`} className="fleet-card-image-button" aria-label={`View ${vehicle.name}`}><span className="fleet-card-image"><img src={vehicle.images[0].src} alt={`${vehicle.name} front view`} /><span className="fleet-card-image-count">5 views</span></span></Link>
          <div className="fleet-card-content"><div className="fleet-card-topline"><span>0{index + 1}</span><small>{vehicle.category}</small></div><p className="fleet-card-label">{vehicle.label}</p><h3>{vehicle.name}</h3><p className="fleet-card-arabic" lang="ar" dir="rtl">{vehicle.arabicName}</p><p>{vehicle.description}</p><div className="fleet-card-specs"><span><FleetMark type="seat" />{vehicle.seats}</span><span><FleetMark type="bag" />{vehicle.luggage}</span></div><div className="fleet-card-footer"><strong>From <LocalizedPrice amount={vehicle.price} /><small> / route</small></strong><Link href={`/travel-transport/${vehicle.id}`} className="fleet-card-details-link">View details</Link></div></div>
        </article>)}</div>
      </section>

      <section className="fleet-request" id="fleet-request" aria-labelledby="fleet-request-title"><div className="fleet-request-copy"><p className="fleet-eyebrow">Private transport desk</p><h2 id="fleet-request-title">Build your route, beautifully.</h2><p>Tell us the details once and our team will return with availability, a clear quote and a pickup plan tailored to your day.</p><div className="fleet-request-promise"><FleetMark type="check" /><span>Fast reply via WhatsApp or email · Driver-led routes across Egypt.</span></div><div className="fleet-booking-steps" aria-label="Booking steps"><span><b>01</b> Route</span><span><b>02</b> Vehicle</span><span><b>03</b> Confirmation</span></div></div><div className="fleet-request-panel">{bookingReceipt ? <div className="fleet-booking-success" role="status" aria-live="polite"><span className="fleet-success-icon"><FleetMark type="check" /></span><p className="fleet-eyebrow">Request received</p><h3>Your route is with the AlpNile desk.</h3><p>We&apos;ll confirm availability and the final quote using the contact details you shared.</p><div className="fleet-receipt-grid"><div><span>Reference</span><strong>{bookingReceipt.reference}</strong></div><div><span>Vehicle</span><strong>{bookingReceipt.vehicle}</strong></div><div><span>Service</span><strong>{bookingReceipt.service}</strong></div><div><span>Travel date</span><strong>{bookingReceipt.date}</strong></div><div><span>Pickup</span><strong>{bookingReceipt.pickup}</strong></div><div><span>Drop-off</span><strong>{bookingReceipt.dropoff}</strong></div></div><p className="fleet-booking-note">Keep this reference for your conversation with our team: <strong>{bookingReceipt.contact}</strong></p><button className="fleet-reset" type="button" onClick={() => setBookingReceipt(null)}>Create another request</button></div> : <form className="fleet-request-form" onSubmit={submitRequest}>
        <fieldset className="fleet-form-section"><legend>Trip details</legend><div className="fleet-form-grid fleet-form-grid-three"><label className="fleet-form-field"><span>Service type</span><select name="service" defaultValue="Private airport transfer" required><option>Private airport transfer</option><option>Hotel or city transfer</option><option>Full-day driver</option><option>City-to-city route</option><option>Desert or custom route</option></select></label><label className="fleet-form-field"><span>Vehicle</span><select name="vehicle" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required>{requestVehicleOptions.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}</select></label><label className="fleet-form-field"><span>Trip type</span><select name="tripType" defaultValue="One way" required><option>One way</option><option>Round trip</option><option>Hourly driver</option></select></label></div><div className="fleet-form-grid"><label className="fleet-form-field"><span>Pickup location</span><input name="pickup" type="text" required placeholder="Hotel, airport, landmark or address" /></label><label className="fleet-form-field"><span>Drop-off location</span><input name="dropoff" type="text" required placeholder="Where should we take you?" /></label><label className="fleet-form-field"><span>Travel date</span><input name="date" type="date" required /></label><label className="fleet-form-field"><span>Pickup time</span><input name="time" type="time" required /></label></div></fieldset>
        <fieldset className="fleet-form-section"><legend>Guests & comfort</legend><div className="fleet-form-grid fleet-form-grid-three"><label className="fleet-form-field"><span>Passengers</span><select name="passengers" value={String(Math.min(6, passengerCount))} onChange={(event) => { const next = Number(event.target.value); setPassengerCount(next); setTravelerFilter(next); }} required><option value="1">1 passenger</option><option value="2">2 passengers</option><option value="3">3 passengers</option><option value="4">4 passengers</option><option value="5">5 passengers</option><option value="6">6+ passengers</option></select></label><label className="fleet-form-field"><span>Large bags</span><select name="bags" defaultValue="2 bags"><option>No large bags</option><option>1 bag</option><option>2 bags</option><option>3 bags</option><option>4+ bags</option></select></label><label className="fleet-form-field"><span>Child seats</span><select name="childSeats" defaultValue="None"><option>None</option><option>1 child seat</option><option>2 child seats</option></select></label></div><label className="fleet-form-field"><span>Accessibility or comfort requests</span><input name="accessibility" type="text" placeholder="Wheelchair space, extra legroom, quiet cabin…" /></label></fieldset>
        <fieldset className="fleet-form-section"><legend>Your contact</legend><div className="fleet-form-grid"><label className="fleet-form-field"><span>Full name</span><input name="name" type="text" autoComplete="name" required placeholder="Your name" /></label><label className="fleet-form-field"><span>WhatsApp / phone</span><input name="phone" type="tel" autoComplete="tel" required placeholder="+20 …" /></label><label className="fleet-form-field"><span>Email address</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label className="fleet-form-field"><span>Flight or train number <small>optional</small></span><input name="flight" type="text" placeholder="For airport or station pickup" /></label></div></fieldset>
  <label className="fleet-form-field fleet-form-field-full"><span>Route notes</span><textarea name="notes" rows={3} placeholder="Stops, hotel name, arrival details, preferred route or anything else we should know…" /></label><label className="fleet-booking-consent"><input name="consent" type="checkbox" required /><span>I agree that AlpNile may contact me about this vehicle request.</span></label>{bookingError && <p className="fleet-booking-error" role="alert">{bookingError}</p>}<div className="fleet-booking-submit-row"><p>We&apos;ll reply with availability, driver details and a transparent quote.</p><button className="fleet-submit" type="submit" disabled={bookingSubmitting}>{bookingSubmitting ? "Saving request…" : "Send booking request"} <span aria-hidden="true">↗</span></button></div>
      </form>}</div></section>
    </main>
  );
}
