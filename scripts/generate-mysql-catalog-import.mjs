import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const typescript = require("typescript");

const root = process.cwd();
const rawArgs = process.argv.slice(2);
const outputArgument = rawArgs.find((argument) => !argument.startsWith("--"));
const databaseArgumentIndex = rawArgs.indexOf("--database");
const databaseName = databaseArgumentIndex >= 0
  ? rawArgs[databaseArgumentIndex + 1]
  : process.env.MYSQL_DATABASE ?? "u700970108_alpnile";
const outputPath = path.resolve(outputArgument ?? "database/mysql/003_catalog_import.sql");

if (!databaseName || !/^[A-Za-z0-9_$-]+$/.test(databaseName)) {
  throw new Error("The MySQL database name must be provided with --database and contain only letters, numbers, _, $, or -.");
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function transpileModule(source, filename) {
  const javascript = typescript.transpile(source, {
    fileName: filename,
    module: typescript.ModuleKind.CommonJS,
    target: typescript.ScriptTarget.ES2020,
    jsx: typescript.JsxEmit.ReactJSX,
  });
  const module = { exports: {} };
  const runner = new Function("module", "exports", "require", javascript);
  runner(module, module.exports, require);
  return module.exports;
}

function extractArrayModule(source, marker, exportName, endMarker = "];", startReplacement = null) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Could not find ${marker}`);
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Could not find the end of ${marker}`);
  const segment = source.slice(start, end + endMarker.length);
  const replacement = startReplacement ?? new RegExp(`^${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  const transformed = segment.replace(replacement, `module.exports.${exportName} =`);
  return transpileModule(`${transformed}\n`, "catalog-extract.ts")[exportName];
}

function loadLegacyCatalog() {
  const source = read("app/lib/legacy-catalog.ts")
    .replace(/^\/\/.*\r?\n/, "")
    .replace(/^export const legacyCatalog = /, "")
    .replace(/ as const;\s*$/, "");
  return JSON.parse(source);
}

function loadAddedTours() {
  return transpileModule(read("app/lib/added-tours.ts"), "added-tours.ts").addedTours;
}

function loadCatalogFixes() {
  return transpileModule(read("app/lib/tour-fixes.ts"), "tour-fixes.ts");
}

function loadCuratedTours() {
  const source = read("app/lib/tour-details.ts");
  return extractArrayModule(source, "const curatedTours: TourDetail[] = ", "curatedTours");
}

function loadCatalogTripImages() {
  const source = read("app/lib/tour-details.ts");
  const start = source.indexOf("export const catalogTripImages");
  const end = source.indexOf("const curatedTours", start);
  const segment = source.slice(start, end);
  return transpileModule(`${segment.replace(/export const catalogTripImages[^=]*=/, "module.exports.catalogTripImages =")}\n`, "trip-images.ts").catalogTripImages;
}

function loadVehicles() {
  return transpileModule(read("app/travel-transport/vehicle-data.ts"), "vehicle-data.ts").vehicles;
}

function loadProducts() {
  return transpileModule(read("app/market/catalog.ts"), "catalog.ts").products;
}

function loadStays() {
  const source = read("app/stays-hotels/page.tsx");
  const galleryStart = source.indexOf("const galleryImages");
  const staysStart = source.indexOf("const catalogStays: StayCard[] =", galleryStart);
  const staysEnd = source.indexOf("];", staysStart);
  if (galleryStart < 0 || staysStart < 0 || staysEnd < 0) throw new Error("Could not extract catalog stays");
  const segment = source.slice(galleryStart, staysEnd + 2).replace("const catalogStays: StayCard[] =", "module.exports.catalogStays =");
  return transpileModule(`${segment}\n`, "stays-extract.ts").catalogStays;
}

const legacyCatalog = loadLegacyCatalog();
const addedTours = loadAddedTours();
const curatedTours = loadCuratedTours();
const { catalogTripFixes, cleanCatalogText, normalizeCatalogCity } = loadCatalogFixes();
const catalogTripImages = loadCatalogTripImages();
const vehicles = loadVehicles();
const products = loadProducts();
const stays = loadStays();

const NAMESPACE = "9f8ccf3e-3ed0-5c04-98aa-7cd0b2e2b8c1";

function uuidFromKey(key) {
  const hash = crypto.createHash("sha1").update(`${NAMESPACE}:${key}`).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  return [hash.subarray(0, 4), hash.subarray(4, 6), hash.subarray(6, 8), hash.subarray(8, 10), hash.subarray(10, 16)]
    .map((part) => part.toString("hex"))
    .join("-");
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cityKey(value) {
  const normalized = normalizeCatalogCity(String(value).trim());
  return slugify(normalized === "Hurgada" ? "Hurghada" : normalized);
}

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `'${String(text).replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\u0000/g, "")}'`;
}

function json(value) {
  return sql(JSON.stringify(value ?? null));
}

function numeric(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function durationMinutes(duration, unit) {
  const amount = numeric(duration);
  if (amount === null) return null;
  const normalized = String(unit ?? "").toLowerCase();
  if (normalized.startsWith("day")) return Math.round(amount * 1440);
  if (normalized.startsWith("hour") || normalized === "hrs" || normalized === "hr") return Math.round(amount * 60);
  return null;
}

function durationLabel(duration, unit) {
  const amount = numeric(duration, 1);
  const normalized = String(unit ?? "days").toLowerCase();
  if (normalized.startsWith("day")) return `${amount} ${amount === 1 ? "day" : "days"}`;
  if (normalized.startsWith("hour") || normalized === "hrs" || normalized === "hr") return `${amount} hrs`;
  return `${amount} ${unit}`;
}

function numberFromText(value) {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function averageRating(reviews) {
  if (!reviews?.length) return null;
  const values = reviews.map((review) => numeric(review.rating)).filter((value) => value !== null);
  return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
}

function ratingValue(value) {
  const rating = numeric(value);
  return rating === null ? null : Number(rating.toFixed(1));
}

function regionForCity(name) {
  const key = cityKey(name);
  if (["cairo", "giza", "alexandria"].includes(key)) return "Lower Egypt";
  if (["hurghada", "marsa-alam", "safaga", "sharm-el-sheikh", "dahab"].includes(key)) return "Red Sea";
  if (["fayoum", "bahariya", "siwa"].includes(key)) return "Oases and desert";
  return "Upper Egypt";
}

function imagePath(value) {
  if (!value) return null;
  return String(value).replace(/^https?:\/\/[^/]+/, "");
}

const lines = [
  "-- AlpNile catalog import generated from the current application catalog.",
  "-- This file is additive and idempotent: it does not DROP or DELETE data.",
  `-- The USE statement allows importing from phpMyAdmin's server-level Import page. Target database: ${databaseName}`,
  "SET NAMES utf8mb4;",
  "SET time_zone = '+00:00';",
  `USE \`${databaseName.replace(/`/g, "``")}\`;`,
  "",
];

function statement(value) {
  lines.push(`${value};`, "");
}

function addColumnIfMissing(table, column, definition) {
  const marker = `${table}.${column}`;
  statement(`SET @catalog_sql_${column} = (SELECT IF(EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${sql(table)} AND COLUMN_NAME = ${sql(column)}), 'SELECT 1', ${sql(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)}))`);
  statement(`PREPARE catalog_stmt_${column} FROM @catalog_sql_${column}`);
  statement(`EXECUTE catalog_stmt_${column}`);
  statement(`DEALLOCATE PREPARE catalog_stmt_${column}`);
  lines.push(`-- ensured ${marker}`, "");
}

addColumnIfMissing("trips", "solo_price", "DECIMAL(12,2) NULL");
addColumnIfMissing("trips", "discount_percent", "DECIMAL(5,2) NULL");
addColumnIfMissing("trips", "price_level", "VARCHAR(80) NULL");
addColumnIfMissing("trips", "source_type", "VARCHAR(30) NOT NULL DEFAULT 'catalog'");
addColumnIfMissing("trips", "catalog_visible", "TINYINT(1) NOT NULL DEFAULT 1");
addColumnIfMissing("trips", "metadata", "JSON NULL");
addColumnIfMissing("stays", "metadata", "JSON NULL");
addColumnIfMissing("vehicles", "metadata", "JSON NULL");
addColumnIfMissing("products", "category", "VARCHAR(120) NULL");
addColumnIfMissing("products", "origin", "VARCHAR(255) NULL");
addColumnIfMissing("products", "material", "VARCHAR(255) NULL");
addColumnIfMissing("products", "four_k_image_url", "VARCHAR(1024) NULL");
addColumnIfMissing("products", "note", "VARCHAR(255) NULL");
addColumnIfMissing("products", "metadata", "JSON NULL");

statement("INSERT INTO schema_migrations (version) VALUES ('003_catalog_import') ON DUPLICATE KEY UPDATE version = VALUES(version)");

const cityRecords = new Map();
for (const city of legacyCatalog.cities) {
  cityRecords.set(cityKey(city.name), {
    id: city.id,
    slug: cityKey(city.name),
    name: normalizeCatalogCity(city.name),
    region: regionForCity(city.name),
    description: city.description ?? `Discover ${city.name} through thoughtfully paced routes and local stories.`,
    imageUrl: imagePath(city.image),
    sortOrder: cityRecords.size,
  });
}

function addCity(name) {
  const normalized = normalizeCatalogCity(String(name).trim());
  const key = cityKey(normalized);
  if (!cityRecords.has(key)) {
    cityRecords.set(key, {
      id: uuidFromKey(`city:${key}`),
      slug: key,
      name: normalized,
      region: regionForCity(normalized),
      description: `Discover ${normalized} through thoughtfully paced routes and local stories.`,
      imageUrl: null,
      sortOrder: cityRecords.size,
    });
  }
  return cityRecords.get(key);
}

const categoryRecords = new Map();
for (const category of legacyCatalog.categories) {
  categoryRecords.set(slugify(category.name), {
    id: category.id,
    slug: slugify(category.name),
    name: category.name,
    description: `Thoughtfully selected ${category.name.toLowerCase()} experiences in Egypt.`,
    sortOrder: categoryRecords.size,
  });
}

function addCategory(name) {
  const normalized = String(name).trim();
  const key = slugify(normalized);
  if (!categoryRecords.has(key)) {
    categoryRecords.set(key, {
      id: uuidFromKey(`category:${key}`),
      slug: key,
      name: normalized,
      description: `Thoughtfully selected ${normalized.toLowerCase()} experiences in Egypt.`,
      sortOrder: categoryRecords.size,
    });
  }
  return categoryRecords.get(key);
}

function legacyTripRecord(trip) {
  const fix = catalogTripFixes[trip.slug] ?? {};
  const cities = fix.city?.split(" · ") ?? trip.cities.map((city) => normalizeCatalogCity(city.name));
  const categories = fix.categories ?? trip.categories.map((category) => category.name);
  const duration = fix.duration ?? trip.duration;
  const durationUnit = fix.durationUnit ?? trip.durationUnit;
  const reviews = trip.reviews ?? [];
  return {
    id: trip.id,
    slug: trip.slug,
    title: fix.title ?? trip.title,
    cities,
    categories,
    duration,
    durationUnit,
    description: cleanCatalogText(String(trip.description ?? "").replace(/\s+/g, " ").trim()),
    image: imagePath(catalogTripImages[trip.slug] ?? trip.image),
    priceFrom: numeric(trip.groupPrice),
    soloPrice: numeric(trip.soloPrice),
    discountPercent: numeric(trip.discountPercent),
    priceLevel: trip.priceLevel ?? null,
    currency: trip.currency ?? "USD",
    rating: averageRating(reviews),
    reviewCount: reviews.length,
    includes: trip.includes ?? [],
    itinerary: trip.days ?? [],
    reviews,
    sourceType: "legacy",
    catalogVisible: 1,
    metadata: { source: "legacyCatalog", sourceCities: cities, sourceCategories: categories },
  };
}

function addedTripRecord(tour, sourceType = "added", catalogVisible = 1) {
  const cities = String(tour.city ?? "Egypt").split(" · ").map((value) => normalizeCatalogCity(value));
  const categories = [...(tour.categories ?? [tour.category ?? "Egypt"])];
  const isHours = String(tour.duration ?? "").toLowerCase().includes("hr");
  const durationNumber = isHours ? numberFromText(tour.duration) ?? 1 : numeric(tour.durationDays, 1);
  const durationUnit = isHours ? "hours" : "days";
  const reviews = tour.reviewDetails ?? [];
  return {
    id: tour.id ?? uuidFromKey(`trip:${tour.slug}`),
    slug: tour.slug,
    title: tour.name,
    cities,
    categories,
    duration: durationNumber,
    durationUnit,
    description: String(tour.description ?? "").trim(),
    image: imagePath(tour.image),
    priceFrom: numeric(tour.priceFrom),
    soloPrice: numeric(tour.soloPrice ?? tour.priceFrom),
    discountPercent: numeric(tour.discountPercent),
    priceLevel: tour.priceLevel ?? null,
    currency: tour.currency ?? "USD",
    rating: ratingValue(tour.rating),
    reviewCount: numeric(tour.reviews) ?? reviews.length,
    includes: [...(tour.includes ?? [])],
    itinerary: [...(tour.itinerary ?? [])],
    reviews,
    sourceType,
    catalogVisible,
    metadata: { source: sourceType === "editorial" ? "editorial" : "addedTours", sourceCities: cities, sourceCategories: categories },
  };
}

const tripRecords = [
  ...legacyCatalog.trips.map(legacyTripRecord),
  ...addedTours.map((tour) => addedTripRecord(tour)),
  ...curatedTours.map((tour) => addedTripRecord(tour, "editorial", 0)),
];

for (const trip of tripRecords) {
  for (const cityName of trip.cities) addCity(cityName);
  for (const categoryName of trip.categories) addCategory(categoryName);
}

for (const city of cityRecords.values()) {
  statement(`INSERT INTO cities (id, slug, name, region, description, image_url, sort_order, is_active) VALUES (${sql(city.id)}, ${sql(city.slug)}, ${sql(city.name)}, ${sql(city.region)}, ${sql(city.description)}, ${sql(city.imageUrl)}, ${city.sortOrder}, 1) ON DUPLICATE KEY UPDATE name = VALUES(name), region = VALUES(region), description = VALUES(description), image_url = VALUES(image_url), sort_order = VALUES(sort_order), is_active = 1`);
}

for (const category of categoryRecords.values()) {
  statement(`INSERT INTO trip_categories (id, slug, name, description, sort_order, is_active) VALUES (${sql(category.id)}, ${sql(category.slug)}, ${sql(category.name)}, ${sql(category.description)}, ${category.sortOrder}, 1) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), sort_order = VALUES(sort_order), is_active = 1`);
}

for (const trip of tripRecords) {
  const city = addCity(trip.cities[0] ?? "Egypt");
  const category = addCategory(trip.categories[0] ?? "Egypt");
  const cityReference = `(SELECT id FROM cities WHERE slug = ${sql(city.slug)} LIMIT 1)`;
  const categoryReference = `(SELECT id FROM trip_categories WHERE slug = ${sql(category.slug)} LIMIT 1)`;
  const locationLabel = trip.cities.join(" · ");
  const durationLabelValue = durationLabel(trip.duration, trip.durationUnit);
  const featured = trip.sourceType === "editorial" ? 1 : 0;
  statement(`INSERT INTO trips (id, slug, title, city_id, location_label, category_id, duration_label, duration_minutes, description, image_url, price_from, currency, rating, review_count, is_featured, is_active, solo_price, discount_percent, price_level, source_type, catalog_visible, metadata) VALUES (${sql(trip.id)}, ${sql(trip.slug)}, ${sql(trip.title)}, ${cityReference}, ${sql(locationLabel)}, ${categoryReference}, ${sql(durationLabelValue)}, ${sql(durationMinutes(trip.duration, trip.durationUnit))}, ${sql(trip.description)}, ${sql(trip.image)}, ${sql(trip.priceFrom)}, ${sql(trip.currency)}, ${sql(trip.rating)}, ${trip.reviewCount}, ${featured}, 1, ${sql(trip.soloPrice)}, ${sql(trip.discountPercent)}, ${sql(trip.priceLevel)}, ${sql(trip.sourceType)}, ${trip.catalogVisible}, ${json(trip.metadata)}) ON DUPLICATE KEY UPDATE title = VALUES(title), city_id = VALUES(city_id), location_label = VALUES(location_label), category_id = VALUES(category_id), duration_label = VALUES(duration_label), duration_minutes = VALUES(duration_minutes), description = VALUES(description), image_url = VALUES(image_url), price_from = VALUES(price_from), currency = VALUES(currency), rating = VALUES(rating), review_count = VALUES(review_count), is_featured = VALUES(is_featured), is_active = 1, solo_price = VALUES(solo_price), discount_percent = VALUES(discount_percent), price_level = VALUES(price_level), source_type = VALUES(source_type), catalog_visible = VALUES(catalog_visible), metadata = VALUES(metadata)`);

  const daysByNumber = new Map();
  for (const day of trip.itinerary) {
    const dayNumber = numeric(day.dayNumber, 1);
    const activities = daysByNumber.get(dayNumber) ?? [];
    activities.push(...(day.activities ?? []));
    daysByNumber.set(dayNumber, activities);
  }
  for (const [dayNumber, activities] of daysByNumber) {
    statement(`INSERT INTO trip_day_plans (trip_id, day_number, activities) VALUES ((SELECT id FROM trips WHERE slug = ${sql(trip.slug)} LIMIT 1), ${dayNumber}, ${json(activities)}) ON DUPLICATE KEY UPDATE activities = VALUES(activities)`);
  }
  for (const [index, item] of trip.includes.entries()) {
    statement(`INSERT INTO trip_inclusions (trip_id, item, sort_order) VALUES ((SELECT id FROM trips WHERE slug = ${sql(trip.slug)} LIMIT 1), ${sql(item)}, ${index}) ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)`);
  }
  for (const [index, review] of trip.reviews.entries()) {
    const reviewId = review.id ?? uuidFromKey(`review:${trip.slug}:${index}:${review.name}:${review.comment}`);
    statement(`INSERT INTO trip_catalog_reviews (id, trip_id, display_name, comment, rating, avatar_url) VALUES (${sql(reviewId)}, (SELECT id FROM trips WHERE slug = ${sql(trip.slug)} LIMIT 1), ${sql(review.name ?? "Traveler")}, ${sql(review.comment ?? "")}, ${numeric(review.rating, 5)}, ${sql(imagePath(review.avatar))}) ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), comment = VALUES(comment), rating = VALUES(rating), avatar_url = VALUES(avatar_url)`);
  }
}

// These six rows were already present in the Hostinger database before the full
// application catalog was imported. Keep them for history, but do not mix them
// into the public 50-trip catalog returned by /api/catalog.
const legacyDatabaseOnlyTripSlugs = [
  "food-walk",
  "coral-garden-morning",
  "salt-lakes-stars",
  "pyramids-family",
  "temples-after-dark",
  "nile-sunset",
];
statement(`UPDATE trips SET source_type = 'legacy-db', catalog_visible = 0 WHERE slug IN (${legacyDatabaseOnlyTripSlugs.map(sql).join(", ")})`);

for (const stay of stays) {
  const locationParts = String(stay.location ?? "Egypt").split(",").map((part) => part.trim()).filter(Boolean);
  const city = addCity(locationParts.at(-1) ?? "Egypt");
  const cityReference = `(SELECT id FROM cities WHERE slug = ${sql(city.slug)} LIMIT 1)`;
  const amenities = (stay.activities ?? []).map((activity) => activity.title).filter(Boolean);
  const id = uuidFromKey(`stay:${stay.slug}`);
  statement(`INSERT INTO stays (id, slug, name, city_id, location_label, stay_type, description, image_url, price_from, currency, rating, review_count, amenities, max_guests, is_featured, is_active, metadata) VALUES (${sql(id)}, ${sql(stay.slug)}, ${sql(stay.title)}, ${cityReference}, ${sql(stay.location)}, ${sql(String(stay.kind ?? "Hotel room").toLowerCase().replace(/\s+/g, "_"))}, ${sql(stay.description)}, ${sql(stay.image)}, ${sql(stay.price)}, 'USD', ${sql(ratingValue(stay.rating))}, ${numeric(stay.reviews, 0)}, ${json(amenities)}, ${numeric(stay.guests)}, ${stay.slug === "habu-sunset-villa" ? 1 : 0}, ${stay.available ? 1 : 0}, ${json(stay)}) ON DUPLICATE KEY UPDATE name = VALUES(name), city_id = VALUES(city_id), location_label = VALUES(location_label), stay_type = VALUES(stay_type), description = VALUES(description), image_url = VALUES(image_url), price_from = VALUES(price_from), rating = VALUES(rating), review_count = VALUES(review_count), amenities = VALUES(amenities), max_guests = VALUES(max_guests), is_featured = VALUES(is_featured), is_active = VALUES(is_active), metadata = VALUES(metadata)`);
}

for (const vehicle of vehicles) {
  const id = uuidFromKey(`vehicle:${vehicle.id}`);
  const firstImage = vehicle.images?.[0]?.src ?? null;
  statement(`INSERT INTO vehicles (id, slug, name, vehicle_type, description, image_url, passenger_capacity, luggage_capacity, price_from, currency, with_driver, is_active, metadata) VALUES (${sql(id)}, ${sql(vehicle.id)}, ${sql(vehicle.name)}, ${sql(String(vehicle.category ?? "family").toLowerCase())}, ${sql(vehicle.description)}, ${sql(firstImage)}, ${numeric(numberFromText(vehicle.seats), 1)}, ${numeric(numberFromText(vehicle.luggage), null)}, ${sql(vehicle.price)}, 'USD', 1, 1, ${json(vehicle)}) ON DUPLICATE KEY UPDATE name = VALUES(name), vehicle_type = VALUES(vehicle_type), description = VALUES(description), image_url = VALUES(image_url), passenger_capacity = VALUES(passenger_capacity), luggage_capacity = VALUES(luggage_capacity), price_from = VALUES(price_from), with_driver = 1, is_active = 1, metadata = VALUES(metadata)`);
}

for (const product of products) {
  const id = uuidFromKey(`product:${product.slug}`);
  statement(`INSERT INTO products (id, slug, name, description, image_url, price, currency, stock_quantity, is_featured, is_active, category, origin, material, four_k_image_url, note, metadata) VALUES (${sql(id)}, ${sql(product.slug)}, ${sql(product.name)}, ${sql(product.description)}, ${sql(product.image)}, ${sql(product.price)}, 'USD', 0, 0, 1, ${sql(product.category)}, ${sql(product.origin)}, ${sql(product.material)}, ${sql(product.fourK)}, ${sql(product.note)}, ${json(product)}) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), image_url = VALUES(image_url), price = VALUES(price), category = VALUES(category), origin = VALUES(origin), material = VALUES(material), four_k_image_url = VALUES(four_k_image_url), note = VALUES(note), is_active = 1, metadata = VALUES(metadata)`);
}

statement("INSERT INTO schema_migrations (version) VALUES ('003_catalog_data') ON DUPLICATE KEY UPDATE version = VALUES(version)");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

console.log(JSON.stringify({
  output: outputPath,
  trips: tripRecords.length,
  catalogTrips: tripRecords.filter((trip) => trip.catalogVisible).length,
  editorialTrips: tripRecords.filter((trip) => !trip.catalogVisible).length,
  cities: cityRecords.size,
  categories: categoryRecords.size,
  stays: stays.length,
  vehicles: vehicles.length,
  products: products.length,
}, null, 2));
