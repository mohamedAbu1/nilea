"use client";

type EntityType = "trip" | "stay" | "product" | "city" | "vehicle" | "site";
type EventType = "view" | "search" | "open_details" | "save" | "unsave" | "inquiry" | "booking" | "planner_complete" | "recommendation_click";

export type CatalogFavorite = {
  entity_type: EntityType;
  entity_slug: string;
  entity_id?: string | null;
  saved_at?: string;
};

type EventInput = {
  eventType: EventType;
  entityType: EntityType;
  entityId?: string;
  entitySlug?: string;
  searchQuery?: string;
  metadata?: Record<string, unknown>;
};

const visitorStorageKey = "alpnile-intelligence-visitor";

function getVisitorKey() {
  if (typeof window === "undefined") return "server-render";
  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) return existing;
  const generated = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(visitorStorageKey, generated);
  return generated;
}

export function trackCatalogEvent(input: EventInput) {
  if (typeof window === "undefined") return;
  void fetch("/api/intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify({ action: "event", visitorKey: getVisitorKey(), ...input }),
  }).catch(() => undefined);
}

export function saveUserPreferences(preferences: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  void fetch("/api/intelligence", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(preferences),
  }).catch(() => undefined);
}

export async function toggleCatalogFavorite(input: {
  entityType: EntityType;
  entitySlug: string;
  entityId?: string;
  saved: boolean;
}) {
  try {
    const response = await fetch("/api/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "favorite",
        eventType: input.saved ? "save" : "unsave",
        entityType: input.entityType,
        entitySlug: input.entitySlug,
        entityId: input.entityId,
      }),
    });
    const body = await response.json() as { data?: { saved?: boolean }; error?: string };
    if (!response.ok) throw new Error(body.error || "Your favorites could not be updated.");
    return { data: { saved: Boolean(body.data?.saved) }, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Your favorites could not be updated.") };
  }
}

export async function getCatalogFavorites(entityType?: EntityType) {
  try {
    const params = new URLSearchParams({ favorites: "1" });
    if (entityType) params.set("entity_type", entityType);
    const response = await fetch(`/api/intelligence?${params.toString()}`, { credentials: "same-origin", cache: "no-store" });
    const body = await response.json() as { data?: CatalogFavorite[]; error?: string };
    if (!response.ok) throw new Error(body.error || "Favorites could not be loaded.");
    return { data: Array.isArray(body.data) ? body.data : [], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error("Favorites could not be loaded.") };
  }
}
