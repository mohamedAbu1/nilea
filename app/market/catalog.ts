export type ProductCategory = "All objects" | "Travel keepsakes" | "Home & light" | "Sculpture" | "Textiles" | "Spices & scents" | "Paper & gifts" | "Jewellery";

export type BazaarProduct = {
  slug: string;
  name: string;
  category: Exclude<ProductCategory, "All objects">;
  price: number;
  origin: string;
  material: string;
  description: string;
  image: string;
  fourK: string;
  note: string;
};

export type CartLine = {
  slug: string;
  quantity: number;
};

export const products: BazaarProduct[] = [
  { slug: "brass-nile-compass", name: "Brass Nile Compass", category: "Travel keepsakes", price: 48, origin: "Luxor workshops", material: "Engraved antique brass", description: "A small object for big journeys, made to sit quietly in a pocket or on a desk.", image: "/images/bazaar/web/brass-nile-compass.webp", fourK: "/images/bazaar/4k/brass-nile-compass-4k.png", note: "The river, carried." },
  { slug: "nubian-lantern", name: "Nubian Lantern", category: "Home & light", price: 72, origin: "Aswan market", material: "Punched brass & glass", description: "A warm pool of light with hand-punched geometry inspired by evening courtyards.", image: "/images/bazaar/web/nubian-lantern.webp", fourK: "/images/bazaar/4k/nubian-lantern-4k.png", note: "Light with a memory." },
  { slug: "alabaster-bastet", name: "Alabaster Bastet", category: "Sculpture", price: 95, origin: "West Bank, Luxor", material: "Honey-veined alabaster", description: "A polished feline form carved from the same pale stone used across Luxor's workshops.", image: "/images/bazaar/web/alabaster-bastet.webp", fourK: "/images/bazaar/4k/alabaster-bastet-4k.png", note: "A guardian for the shelf." },
  { slug: "desert-kilim", name: "Desert Kilim Cushion", category: "Textiles", price: 58, origin: "Siwa & Upper Egypt", material: "Handwoven wool", description: "A tactile kilim weave in desert reds, indigo and sand, finished with a soft fringe.", image: "/images/bazaar/web/desert-kilim.webp", fourK: "/images/bazaar/4k/desert-kilim-4k.png", note: "A little desert under you." },
  { slug: "spice-trio", name: "Egyptian Spice Trio", category: "Spices & scents", price: 26, origin: "Cairo spice lanes", material: "Ceramic, cork & brass", description: "Three bright jars of saffron, paprika and cumin for a kitchen that remembers the route.", image: "/images/bazaar/web/spice-trio.webp", fourK: "/images/bazaar/4k/spice-trio-4k.png", note: "A pantry of warm colour." },
  { slug: "papyrus-journal", name: "Papyrus Travel Journal", category: "Paper & gifts", price: 34, origin: "Giza papyrus studio", material: "Papyrus, leather & brass", description: "A handmade place for small observations, ticket stubs and the details worth keeping.", image: "/images/bazaar/web/papyrus-journal.webp", fourK: "/images/bazaar/4k/papyrus-journal-4k.png", note: "Leave room for the unexpected." },
  { slug: "silver-cartouche", name: "Silver Cartouche", category: "Jewellery", price: 64, origin: "Khan el-Khalili", material: "Polished silver", description: "A quiet oval pendant with decorative relief, made as a personal keepsake rather than a souvenir.", image: "/images/bazaar/web/silver-cartouche.webp", fourK: "/images/bazaar/4k/silver-cartouche-4k.png", note: "Wear the story lightly." },
  { slug: "river-route-token", name: "River Route Token", category: "Travel keepsakes", price: 22, origin: "Luxor workshops", material: "Patinated brass", description: "A palm-sized brass token stamped with a simple river route for a pocket, bag or desk.", image: "/images/bazaar/web/river-route-token.webp", fourK: "/images/bazaar/4k/river-route-token-4k.png", note: "Keep the route close." },
  { slug: "desert-direction-charm", name: "Desert Direction Charm", category: "Travel keepsakes", price: 29, origin: "Aswan market", material: "Brass and leather", description: "A small warm-metal charm for luggage, made for travellers who never take the straight road.", image: "/images/bazaar/web/desert-direction-charm.webp", fourK: "/images/bazaar/4k/desert-direction-charm-4k.png", note: "For roads still to come." },
  { slug: "nile-desk-compass", name: "Nile Desk Compass", category: "Travel keepsakes", price: 55, origin: "Cairo brass quarter", material: "Engraved brass", description: "A compact compass with a softly aged finish, designed to bring a little expedition energy home.", image: "/images/bazaar/web/nile-desk-compass.webp", fourK: "/images/bazaar/4k/nile-desk-compass-4k.png", note: "A desk-sized horizon." },
  { slug: "palm-shadow-lantern", name: "Palm Shadow Lantern", category: "Home & light", price: 68, origin: "Aswan market", material: "Punched brass and amber glass", description: "A lantern whose cut-outs scatter a palm-like shadow when the room turns quiet.", image: "/images/bazaar/web/palm-shadow-lantern.webp", fourK: "/images/bazaar/4k/palm-shadow-lantern-4k.png", note: "Let the walls glow." },
  { slug: "courtyard-star-lantern", name: "Courtyard Star Lantern", category: "Home & light", price: 79, origin: "Old Cairo bazaar", material: "Brass and coloured glass", description: "Geometric brasswork and jewel-toned glass for a small, generous pool of evening light.", image: "/images/bazaar/web/courtyard-star-lantern.webp", fourK: "/images/bazaar/4k/courtyard-star-lantern-4k.png", note: "Made for long evenings." },
  { slug: "oasis-table-light", name: "Oasis Table Light", category: "Home & light", price: 84, origin: "Siwa craft studio", material: "Hammered brass", description: "A sculptural little light with the gentle proportions of a desert water jar.", image: "/images/bazaar/web/oasis-table-light.webp", fourK: "/images/bazaar/4k/oasis-table-light-4k.png", note: "A warm corner of calm." },
  { slug: "horus-desk-guardian", name: "Horus Desk Guardian", category: "Sculpture", price: 88, origin: "West Bank, Luxor", material: "Polished alabaster", description: "A small carved guardian with a honeyed translucence that changes in afternoon light.", image: "/images/bazaar/web/horus-desk-guardian.webp", fourK: "/images/bazaar/4k/horus-desk-guardian-4k.png", note: "For the place where ideas begin." },
  { slug: "temple-cat-miniature", name: "Temple Cat Miniature", category: "Sculpture", price: 62, origin: "West Bank, Luxor", material: "Honey-veined stone", description: "A smaller keepsake version of the quiet feline forms found in Egyptian collections.", image: "/images/bazaar/web/temple-cat-miniature.webp", fourK: "/images/bazaar/4k/temple-cat-miniature-4k.png", note: "Small, watchful, timeless." },
  { slug: "sandstone-falcon", name: "Sandstone Falcon", category: "Sculpture", price: 104, origin: "Aswan stone studio", material: "Carved alabaster", description: "A tactile bird form with a soft polish and a silhouette that holds its own on a shelf.", image: "/images/bazaar/web/sandstone-falcon.webp", fourK: "/images/bazaar/4k/sandstone-falcon-4k.png", note: "A little flight of stone." },
  { slug: "wadi-stripe-throw", name: "Wadi Stripe Throw", category: "Textiles", price: 96, origin: "Siwa & Upper Egypt", material: "Handwoven wool", description: "A generous striped weave in sun-faded colour, made for a chair, bed or slow afternoon.", image: "/images/bazaar/web/wadi-stripe-throw.webp", fourK: "/images/bazaar/4k/wadi-stripe-throw-4k.png", note: "Texture for the slow days." },
  { slug: "indigo-market-runner", name: "Indigo Market Runner", category: "Textiles", price: 74, origin: "Fayoum weaving house", material: "Wool and cotton", description: "A narrow kilim runner with deep indigo geometry and a soft hand-finished edge.", image: "/images/bazaar/web/indigo-market-runner.webp", fourK: "/images/bazaar/4k/indigo-market-runner-4k.png", note: "A line of blue through the room." },
  { slug: "palm-oasis-mat", name: "Palm Oasis Table Mat", category: "Textiles", price: 31, origin: "Siwa market", material: "Woven wool", description: "A compact piece of desert pattern for a breakfast table, bedside or reading corner.", image: "/images/bazaar/web/palm-oasis-mat.webp", fourK: "/images/bazaar/4k/palm-oasis-mat-4k.png", note: "A softer place to land." },
  { slug: "tea-spice-duo", name: "Tea & Spice Duo", category: "Spices & scents", price: 24, origin: "Cairo spice lanes", material: "Ceramic and cork", description: "A pair of pantry jars for hibiscus tea and warming cinnamon, packed for the journey home.", image: "/images/bazaar/web/tea-spice-duo.webp", fourK: "/images/bazaar/4k/tea-spice-duo-4k.png", note: "Open, steep, remember." },
  { slug: "hibiscus-infusion-set", name: "Hibiscus Infusion Set", category: "Spices & scents", price: 27, origin: "Aswan market", material: "Glazed ceramic", description: "Bright red hibiscus and a small brass tray for the first cup after a long day outside.", image: "/images/bazaar/web/hibiscus-infusion-set.webp", fourK: "/images/bazaar/4k/hibiscus-infusion-set-4k.png", note: "A red note from the river." },
  { slug: "cairo-seasoning-set", name: "Cairo Seasoning Set", category: "Spices & scents", price: 30, origin: "Khan el-Khalili", material: "Ceramic, cork and brass", description: "Three pantry staples arranged as a compact introduction to Cairo's fragrant spice lanes.", image: "/images/bazaar/web/cairo-seasoning-set.webp", fourK: "/images/bazaar/4k/cairo-seasoning-set-4k.png", note: "A kitchen with a pulse." },
  { slug: "nile-sketch-folio", name: "Nile Sketch Folio", category: "Paper & gifts", price: 38, origin: "Giza papyrus studio", material: "Papyrus and leather", description: "A larger folio for maps, drawings and the kind of notes that do not fit in a phone.", image: "/images/bazaar/web/nile-sketch-folio.webp", fourK: "/images/bazaar/4k/nile-sketch-folio-4k.png", note: "For looking twice." },
  { slug: "temple-postcard-set", name: "Temple Postcard Set", category: "Paper & gifts", price: 18, origin: "Luxor print studio", material: "Papyrus paper", description: "A small set of tactile cards for sending a little Egyptian light to someone far away.", image: "/images/bazaar/web/temple-postcard-set.webp", fourK: "/images/bazaar/4k/temple-postcard-set-4k.png", note: "A hello from the other bank." },
  { slug: "artisan-gift-wrap", name: "Artisan Gift Wrap", category: "Paper & gifts", price: 16, origin: "Cairo paper quarter", material: "Papyrus and brass", description: "A considered wrap and tag set for turning a small object into a complete gesture.", image: "/images/bazaar/web/artisan-gift-wrap.webp", fourK: "/images/bazaar/4k/artisan-gift-wrap-4k.png", note: "The wrapping is part of it." },
  { slug: "desert-sun-earrings", name: "Desert Sun Earrings", category: "Jewellery", price: 52, origin: "Khan el-Khalili", material: "Silver and brass", description: "Light-catching earrings with a simple sun shape and an easy everyday weight.", image: "/images/bazaar/web/desert-sun-earrings.webp", fourK: "/images/bazaar/4k/desert-sun-earrings-4k.png", note: "A small glint of noon." },
  { slug: "nile-silver-ring", name: "Nile Silver Ring", category: "Jewellery", price: 46, origin: "Luxor silver studio", material: "Polished silver", description: "A smooth silver band with a subtle wave relief inspired by the river's long turn.", image: "/images/bazaar/web/nile-silver-ring.webp", fourK: "/images/bazaar/4k/nile-silver-ring-4k.png", note: "Keep the current moving." },
  { slug: "lotus-medallion", name: "Lotus Medallion", category: "Jewellery", price: 58, origin: "Cairo goldsmith quarter", material: "Silver and gold wash", description: "A quiet medallion with a lotus-inspired relief, designed to layer or stand alone.", image: "/images/bazaar/web/lotus-medallion.webp", fourK: "/images/bazaar/4k/lotus-medallion-4k.png", note: "A flower that remembers water." },
  { slug: "brass-palm-bookmark", name: "Brass Palm Bookmark", category: "Travel keepsakes", price: 19, origin: "Luxor workshops", material: "Brass and cotton cord", description: "A slim palm-shaped marker for the book you carry beside the river.", image: "/images/bazaar/web/brass-palm-bookmark.webp", fourK: "/images/bazaar/4k/brass-palm-bookmark-4k.png", note: "Save your place in the story." },
  { slug: "reed-and-ink-set", name: "Reed & Ink Set", category: "Paper & gifts", price: 23, origin: "Giza papyrus studio", material: "Papyrus, reed and brass", description: "A tactile writing set for postcards, field notes and small letters sent slowly.", image: "/images/bazaar/web/reed-and-ink-set.webp", fourK: "/images/bazaar/4k/reed-and-ink-set-4k.png", note: "Write it while it is still warm." },
];

export const categories: ProductCategory[] = ["All objects", "Travel keepsakes", "Home & light", "Sculpture", "Textiles", "Spices & scents", "Paper & gifts", "Jewellery"];

export const galleryViews = ["front", "left", "back", "right"] as const;

export function getProductGallery(slug: string) {
  return galleryViews.map((view) => `/images/bazaar/gallery/${slug}-${view}.webp`);
}

export function getBazaarProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getBazaarSlugs() {
  return products.map((product) => product.slug);
}

