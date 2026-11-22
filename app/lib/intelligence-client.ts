"use client";

type EntityType = "trip" | "stay" | "product" | "city" | "vehicle" | "site";
type EventType = "view" | "search" | "open_details" | "save" | "unsave" | "inquiry" | "booking" | "planner_complete" | "recommendation_click";

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
