import { randomUUID } from "node:crypto";
import { getCurrentUser } from "../../lib/auth-server";
import { query } from "../../lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: unknown, status = 400) {
  return Response.json({ error: error instanceof Error ? error.message : "The request could not be saved." }, { status });
}

export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get("type");
    if (type !== "reviews") return jsonError(new Error("Unknown submission query."));
    const rows = await query("SELECT id, full_name, city_country, rating, journey, body, avatar_url, like_count FROM reviews WHERE status = 'published' ORDER BY created_at DESC LIMIT 3");
    return Response.json({ data: rows });
  } catch (error) {
    return jsonError(error, 503);
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const action = String(input.action ?? "");
    const user = await getCurrentUser();
    if (["inquiry", "trip-booking", "car-booking", "review"].includes(action) && !user) throw new Error("Please sign in before sending this request.");
    if (action === "inquiry") {
      await query("INSERT INTO inquiries (id, user_id, request_type, full_name, email, phone, message, details, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [randomUUID(), user?.id ?? null, input.request_type, input.full_name, input.email || null, input.phone || null, input.message || null, JSON.stringify(input.details ?? {}), input.source || "website"]);
      return Response.json({ data: { saved: true } });
    }
    if (action === "trip-booking") {
      await query("INSERT INTO trip_bookings (id, user_id, trip_id, full_name, email, phone, start_date, end_date, guests, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [randomUUID(), user?.id ?? null, input.trip_id || null, input.full_name, input.email || null, input.phone || null, input.start_date || null, input.end_date || null, Number(input.guests) || 1, input.notes || null]);
      return Response.json({ data: { saved: true } });
    }
    if (action === "car-booking") {
      await query("INSERT INTO car_bookings (id, user_id, vehicle_id, pickup_city_id, dropoff_city_id, full_name, phone, email, pickup_label, dropoff_label, dropoff_details, pickup_date, pickup_time, return_date, return_time, passengers, driver_service, luggage, extras, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [randomUUID(), user?.id ?? null, input.vehicle_id || null, input.pickup_city_id || null, input.dropoff_city_id || null, input.full_name, input.phone, input.email || null, input.pickup_label, input.dropoff_label, input.dropoff_details || null, input.pickup_date, input.pickup_time || null, input.return_date || null, input.return_time || null, Number(input.passengers) || 1, input.driver_service || "private_driver", input.luggage || null, JSON.stringify(input.extras ?? []), input.notes || null]);
      return Response.json({ data: { saved: true } });
    }
    if (action === "review") {
      const id = randomUUID();
      await query("INSERT INTO reviews (id, user_id, full_name, city_country, rating, journey, body, avatar_url, status, like_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)", [id, user?.id ?? null, input.full_name, input.city_country, Math.max(1, Math.min(5, Number(input.rating) || 5)), input.journey, input.body, input.avatar_url || null]);
      return Response.json({ data: { id } });
    }
    if (action === "like") {
      const reviewId = String(input.reviewId ?? "");
      const visitorKey = String(input.visitorKey ?? "");
      if (visitorKey.length < 16 || visitorKey.length > 128) throw new Error("Invalid visitor key.");
      const rows = await query<{ liked: number }[]>("SELECT 1 AS liked FROM review_likes WHERE review_id = ? AND visitor_key = ? LIMIT 1", [reviewId, visitorKey]);
      if (rows.length) await query("DELETE FROM review_likes WHERE review_id = ? AND visitor_key = ?", [reviewId, visitorKey]);
      else await query("INSERT INTO review_likes (review_id, visitor_key) SELECT ?, ? FROM reviews WHERE id = ? AND status = 'published'", [reviewId, visitorKey, reviewId]);
      const count = await query<{ like_count: number }[]>("SELECT COUNT(*) AS like_count FROM review_likes WHERE review_id = ?", [reviewId]);
      await query("UPDATE reviews SET like_count = ? WHERE id = ?", [Number(count[0]?.like_count ?? 0), reviewId]);
      return Response.json({ data: { liked: !rows.length, count: Number(count[0]?.like_count ?? 0) } });
    }
    if (action === "newsletter") {
      const email = String(input.email ?? "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email address.");
      await query("INSERT INTO newsletter_subscribers (id, user_id, email, is_active) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE is_active = 1, user_id = COALESCE(user_id, VALUES(user_id)), updated_at = UTC_TIMESTAMP(6)", [randomUUID(), user?.id ?? null, email]);
      return Response.json({ data: { saved: true } });
    }
    return jsonError(new Error("Unknown submission action."));
  } catch (error) {
    return jsonError(error, 500);
  }
}
