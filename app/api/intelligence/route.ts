import { createHash, randomUUID } from "node:crypto";
import { getCurrentUser } from "../../lib/auth-server";
import { query } from "../../lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const eventTypes = new Set(["view", "search", "open_details", "save", "unsave", "like", "unlike", "inquiry", "booking", "purchase", "review", "planner_complete", "recommendation_click"]);
const entityTypes = new Set(["trip", "stay", "product", "city", "vehicle", "site"]);

function errorResponse(error: unknown, status = 400) {
  return Response.json({ error: error instanceof Error ? error.message : "Intelligence request failed." }, { status });
}

function anonymousHash(value: unknown) {
  const raw = String(value ?? "").trim();
  return raw ? createHash("sha256").update(raw).digest("hex") : null;
}

function safeJson(value: unknown, fallback: unknown) {
  try {
    const encoded = JSON.stringify(value ?? fallback);
    return encoded.length <= 4000 ? encoded : JSON.stringify(fallback);
  } catch {
    return JSON.stringify(fallback);
  }
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 30) : [];
}

function boundedLimit(value: string | null) {
  const parsed = Number(value ?? 6);
  return Number.isFinite(parsed) ? Math.min(12, Math.max(1, Math.floor(parsed))) : 6;
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const action = String(input.action ?? "event");
    const user = await getCurrentUser();

    if (action !== "event") return errorResponse(new Error("Unknown intelligence action."));
    const eventType = String(input.eventType ?? "");
    const entityType = String(input.entityType ?? "site");
    if (!eventTypes.has(eventType) || !entityTypes.has(entityType)) throw new Error("Invalid intelligence event.");

    const entityId = String(input.entityId ?? "").trim() || null;
    const entitySlug = String(input.entitySlug ?? "").trim().slice(0, 200) || null;
    const searchQuery = String(input.searchQuery ?? "").trim().slice(0, 255) || null;
    const anonymousKey = user ? null : anonymousHash(input.visitorKey);
    await query(
      "INSERT INTO catalog_events (id, user_id, anonymous_key, event_type, entity_type, entity_id, entity_slug, search_query, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [randomUUID(), user?.id ?? null, anonymousKey, eventType, entityType, entityId, entitySlug, searchQuery, safeJson(input.metadata, {})],
    );
    return Response.json({ data: { recorded: true } });
  } catch (error) {
    return errorResponse(error, 503);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(new Error("Sign in to save your travel preferences."), 401);
    const input = await request.json() as Record<string, unknown>;
    const tripStyles = safeArray(input.tripStyles);
    const preferredCities = safeArray(input.preferredCities);
    const dietaryPreferences = safeArray(input.dietaryPreferences);
    await query(
      `INSERT INTO user_preferences
        (user_id, preferred_locale, budget_level, trip_styles, preferred_cities,
         preferred_duration_min, preferred_duration_max, dietary_preferences,
         accessibility_needs, traveling_with_children, traveling_with_pets)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         preferred_locale = VALUES(preferred_locale), budget_level = VALUES(budget_level),
         trip_styles = VALUES(trip_styles), preferred_cities = VALUES(preferred_cities),
         preferred_duration_min = VALUES(preferred_duration_min), preferred_duration_max = VALUES(preferred_duration_max),
         dietary_preferences = VALUES(dietary_preferences), accessibility_needs = VALUES(accessibility_needs),
         traveling_with_children = VALUES(traveling_with_children), traveling_with_pets = VALUES(traveling_with_pets),
         updated_at = UTC_TIMESTAMP(6)`,
      [
        user.id,
        String(input.preferredLocale ?? "en").slice(0, 12),
        String(input.budgetLevel ?? "").slice(0, 40) || null,
        JSON.stringify(tripStyles),
        JSON.stringify(preferredCities),
        Number.isFinite(Number(input.durationMin)) ? Number(input.durationMin) : null,
        Number.isFinite(Number(input.durationMax)) ? Number(input.durationMax) : null,
        JSON.stringify(dietaryPreferences),
        input.accessibilityNeeds ? 1 : 0,
        input.travelingWithChildren ? 1 : 0,
        input.travelingWithPets ? 1 : 0,
      ],
    );
    return Response.json({ data: { saved: true } });
  } catch (error) {
    return errorResponse(error, 503);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const params = new URL(request.url).searchParams;
    const tripId = params.get("trip_id");
    const limit = boundedLimit(params.get("limit"));

    if (tripId) {
      const related = await query<Record<string, unknown>[]>(
        `SELECT t.id, t.slug, t.title, t.location_label, t.image_url, t.price_from, t.currency,
                t.rating, t.review_count, tr.score, tr.reason
           FROM trip_relations tr JOIN trips t ON t.id = tr.related_trip_id
          WHERE tr.trip_id = ? AND t.is_active = 1 AND t.catalog_visible = 1
          ORDER BY tr.score DESC, t.review_count DESC LIMIT ?`,
        [tripId, limit],
      );
      if (related.length) return Response.json({ data: related, source: "relations" });
    }

    const eventScope = user ? "ce.user_id = ?" : "ce.anonymous_key IS NOT NULL";
    const values: unknown[] = user ? [user.id] : [];
    const rows = await query<Record<string, unknown>[]>(
      `SELECT t.id, t.slug, t.title, t.location_label, t.image_url, t.price_from, t.currency,
              t.rating, t.review_count, t.is_featured,
              COALESCE(events.interactions, 0) AS interactions,
              (COALESCE(events.interactions, 0) * 10 + t.is_featured * 3 + COALESCE(t.rating, 0)) AS recommendation_score
         FROM trips t
         LEFT JOIN (
           SELECT ce.entity_id, COUNT(*) AS interactions
             FROM catalog_events ce
            WHERE ce.entity_type = 'trip' AND ce.event_type IN ('view', 'open_details', 'save', 'booking') AND ${eventScope}
            GROUP BY ce.entity_id
         ) events ON events.entity_id = t.id
        WHERE t.is_active = 1 AND t.catalog_visible = 1
        ORDER BY recommendation_score DESC, t.review_count DESC, t.updated_at DESC
        LIMIT ?`,
      [...values, limit],
    );
    return Response.json({ data: rows, source: user ? "personalized" : "popular" });
  } catch (error) {
    return errorResponse(error, 503);
  }
}
