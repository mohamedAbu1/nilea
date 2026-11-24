import { getAuthSession } from "./auth-client";

export function isNetworkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /failed to fetch|fetch failed|networkerror|network request failed|enotfound|no such host|dns|unavailable/i.test(message);
}

export function getSubmissionErrorMessage(error: unknown, fallback: string, networkFallback?: string) {
  if (isNetworkError(error)) return networkFallback ?? "We couldn’t reach the AlpNile service. Nothing was submitted. Check your connection and try again.";
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message || fallback;
}

async function request<T>(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ action, ...payload }) });
  const body = await response.json().catch(() => ({})) as { data?: T; error?: string };
  if (!response.ok) throw new Error(body.error || "The request could not be saved.");
  return body.data as T;
}

export type InquiryPayload = {
  request_type: "trip" | "stay" | "car" | "market" | "contact";
  full_name: string;
  email?: string;
  phone?: string;
  message?: string;
  details?: Record<string, unknown>;
  source?: string;
};

export async function currentUserId() {
  const session = await getAuthSession();
  return session?.user.id ?? null;
}

export async function insertInquiry(payload: InquiryPayload) {
  try { return { data: await request<{ id: string }>("inquiry", payload as unknown as Record<string, unknown>), error: null }; }
  catch (error) { return { data: null, error: error instanceof Error ? error : new Error("The inquiry could not be saved.") }; }
}

export async function cancelInquiry(id: string) {
  try { return { data: await request<{ cancelled: boolean }>("cancel-inquiry", { id }), error: null }; }
  catch (error) { return { data: null, error: error instanceof Error ? error : new Error("The request could not be cancelled.") }; }
}

export type TripBookingPayload = {
  trip_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  start_date: string;
  end_date?: string;
  guests: number;
  notes?: string;
};

export async function insertTripBooking(payload: TripBookingPayload) {
  try { await request("trip-booking", payload as unknown as Record<string, unknown>); return { error: null }; }
  catch (error) { return { error: error instanceof Error ? error : new Error("The booking could not be saved.") }; }
}

export type CarBookingPayload = {
  vehicle_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  pickup_label: string;
  dropoff_label: string;
  dropoff_details?: string;
  pickup_date: string;
  pickup_time?: string;
  return_date?: string;
  return_time?: string;
  passengers: number;
  driver_service: string;
  luggage?: string;
  extras: string[];
  notes?: string;
};

export async function insertCarBooking(payload: CarBookingPayload) {
  try { await request("car-booking", payload as unknown as Record<string, unknown>); return { error: null }; }
  catch (error) { return { error: error instanceof Error ? error : new Error("The car booking could not be saved.") }; }
}

export type ReviewPayload = {
  full_name: string;
  city_country: string;
  rating: number;
  journey: string;
  body: string;
  avatar_url?: string;
};

export async function listPublishedReviews() {
  try {
    const response = await fetch("/api/submissions?type=reviews", { credentials: "same-origin" });
    const body = await response.json().catch(() => ({})) as { data?: unknown[]; error?: string };
    if (!response.ok) throw new Error(body.error || "Reviews could not be loaded.");
    return { data: (body.data ?? []) as Array<{ id: string; full_name: string; city_country: string; rating: number; journey: string; body: string; avatar_url: string | null; like_count: number; status?: "published" | "pending" }>, error: null };
  } catch (error) { return { data: [], error: error instanceof Error ? error : new Error("Reviews could not be loaded.") }; }
}

export async function insertReview(payload: ReviewPayload) {
  try { return { data: await request<{ id: string }>("review", payload as unknown as Record<string, unknown>), error: null }; }
  catch (error) { return { data: null, error: error instanceof Error ? error : new Error("The review could not be saved.") }; }
}

function getVisitorKey() {
  if (typeof window === "undefined") return "server-visitor-key";
  const storageKey = "alpnile-review-visitor";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

export async function toggleReviewLike(reviewId: string) {
  try { return { ...(await request<{ liked: boolean; count: number }>("like", { reviewId, visitorKey: getVisitorKey() })), error: null }; }
  catch (error) { return { liked: false, count: 0, error: error instanceof Error ? error : new Error("Unable to update review like") }; }
}

export async function subscribeToNewsletter(email: string) {
  try { await request("newsletter", { email: email.toLowerCase() }); return { error: null }; }
  catch (error) { return { error: error instanceof Error ? error : new Error("The newsletter subscription could not be saved.") }; }
}
