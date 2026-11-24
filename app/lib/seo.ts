export const SITE_URL = "https://alpnile.com";
export const SITE_NAME = "AlpNile";
export const SITE_DESCRIPTION =
  "Plan thoughtful Egypt journeys with AlpNile: local experiences, Nile stays, private cars, destinations and direct support.";
export const SITE_SOCIAL_IMAGE = "/alpnile-social-cover.webp";

export const SITE_KEYWORDS = [
  "Egypt travel",
  "Egypt tours",
  "Nile cruises",
  "Luxor tours",
  "Aswan tours",
  "Cairo experiences",
  "Egypt stays",
  "Egypt villas",
  "private cars in Egypt",
  "AlpNile",
] as const;

export const SITE_SOCIAL_LINKS = [
  "https://www.instagram.com/alpnile/",
  "https://www.facebook.com/profile.php?id=61596060581090",
  "https://www.tiktok.com/@alpnile",
] as const;

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
