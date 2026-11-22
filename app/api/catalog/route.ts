import { query } from "../../lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonValue(value: unknown) {
  if (typeof value !== "string") return value ?? null;
  try { return JSON.parse(value); } catch { return value; }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "trips";
  const slug = url.searchParams.get("slug");
  const includeEditorial = url.searchParams.get("include_editorial") === "1";

  try {
    if (type === "trips") {
      const filters = ["t.is_active = 1"];
      const values: unknown[] = [];
      if (!includeEditorial && !slug) filters.push("t.catalog_visible = 1");
      if (slug) { filters.push("t.slug = ?"); values.push(slug); }
      const rows = await query<Record<string, unknown>[]>(`SELECT t.id, t.slug, t.title, t.location_label, t.duration_label, t.duration_minutes, t.description, t.image_url, t.price_from, t.currency, t.rating, t.review_count, t.solo_price, t.discount_percent, t.price_level, t.source_type, t.catalog_visible, t.metadata, c.name AS city_name, tc.name AS category_name FROM trips t LEFT JOIN cities c ON c.id = t.city_id LEFT JOIN trip_categories tc ON tc.id = t.category_id WHERE ${filters.join(" AND ")} ORDER BY t.is_featured DESC, t.updated_at DESC, t.title ASC`, values);
      return Response.json(rows.map((row) => ({ ...row, metadata: jsonValue(row.metadata) })));
    }

    if (type === "stays") {
      const rows = await query<Record<string, unknown>[]>("SELECT s.id, s.slug, s.name, s.location_label, s.stay_type, s.description, s.image_url, s.price_from, s.currency, s.rating, s.review_count, s.amenities, s.max_guests, s.is_featured, s.metadata, c.name AS city_name FROM stays s LEFT JOIN cities c ON c.id = s.city_id WHERE s.is_active = 1 ORDER BY s.is_featured DESC, s.updated_at DESC, s.name ASC");
      return Response.json(rows.map((row) => ({ ...row, amenities: jsonValue(row.amenities), metadata: jsonValue(row.metadata) })));
    }

    if (type === "vehicles") {
      const rows = await query<Record<string, unknown>[]>("SELECT id, slug, name, vehicle_type, description, image_url, passenger_capacity, luggage_capacity, price_from, currency, with_driver, metadata FROM vehicles WHERE is_active = 1 ORDER BY name ASC");
      return Response.json(rows.map((row) => ({ ...row, metadata: jsonValue(row.metadata) })));
    }

    if (type === "products") {
      const rows = await query<Record<string, unknown>[]>("SELECT id, slug, name, description, image_url, price, currency, stock_quantity, is_featured, category, origin, material, four_k_image_url, note, metadata FROM products WHERE is_active = 1 ORDER BY is_featured DESC, updated_at DESC, name ASC");
      return Response.json(rows.map((row) => ({ ...row, metadata: jsonValue(row.metadata) })));
    }

    return Response.json({ error: "Unknown catalog type" }, { status: 400 });
  } catch {
    return Response.json({ error: "Catalog is unavailable" }, { status: 503 });
  }
}
