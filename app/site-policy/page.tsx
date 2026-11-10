import type { Metadata } from "next";
import { PolicyPage } from "../components/policy-page";

export const metadata: Metadata = {
  title: "AlpNile — Site Policy",
  description: "The terms and standards that guide the AlpNile experience.",
};

export default function SitePolicyPage() {
  return <PolicyPage accent="site" eyebrow="ALPNILE / POLICIES" title="Site Policy" intro="A clear, human guide to using AlpNile, planning your journey and understanding the role we play in your Egypt experience." updated="November 4, 2026" sections={[
    { id: "scope", title: "Scope and purpose", body: "AlpNile is a travel discovery and planning platform. We bring together destination stories, local experiences, stays and itinerary tools so you can make more informed choices before you travel." },
    { id: "content", title: "Our content", body: "We work to keep descriptions, images and recommendations useful and accurate. Travel conditions, opening times, availability and provider offerings can change, so please confirm important details with the relevant provider before departure." },
    { id: "planning", title: "Planning and bookings", body: "Some AlpNile actions prepare a request or direct you to a third-party provider. A request is not a confirmed booking until the provider accepts it and gives you a confirmation. Provider terms may apply in addition to this policy." },
    { id: "respect", title: "Respectful travel", items: ["Follow local laws, heritage-site rules and photography guidance.", "Treat local hosts, communities, staff and other travelers with respect.", "Do not use the platform to submit abusive, deceptive or unlawful content."] },
    { id: "third-party", title: "Third-party services", body: "AlpNile may link to maps, video, payment, accommodation and experience services operated by others. Those services have their own policies, privacy practices and availability. Review their terms before sharing information or completing a purchase." },
    { id: "contact", title: "Questions", body: "If something on the site is unclear or appears inaccurate, please contact us so we can review it and improve the experience." },
  ]} />;
}
