import { supabase } from "./supabase";

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
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function insertInquiry(payload: InquiryPayload) {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  const userId = await currentUserId();
  const { error } = await supabase.from("inquiries").insert({
    ...payload,
    user_id: userId,
    details: payload.details ?? {},
    source: payload.source ?? "website",
  });
  return { error };
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
  if (!supabase) return { error: new Error("Supabase is not configured") };
  const userId = await currentUserId();
  const { error } = await supabase.from("trip_bookings").insert({
    ...payload,
    user_id: userId,
    trip_id: payload.trip_id ?? null,
    end_date: payload.end_date || null,
  });
  return { error };
}

export type CarBookingPayload = {
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
  if (!supabase) return { error: new Error("Supabase is not configured") };
  const userId = await currentUserId();
  const { error } = await supabase.from("car_bookings").insert({ ...payload, user_id: userId });
  return { error };
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
  if (!supabase) return { data: [], error: new Error("Supabase is not configured") };
  const result = await supabase
    .from("reviews")
    .select("id, full_name, city_country, rating, journey, body, avatar_url, like_count")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);
  return { data: result.data ?? [], error: result.error };
}

export async function insertReview(payload: ReviewPayload) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const userId = await currentUserId();
  const result = await supabase.from("reviews").insert({ ...payload, user_id: userId, status: "pending" }).select("id").single();
  return { data: result.data, error: result.error };
}

function getVisitorKey() {
  if (typeof window === "undefined") return "server";
  const storageKey = "alpnile-review-visitor";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

export async function toggleReviewLike(reviewId: string) {
  if (!supabase) return { liked: false, count: 0, error: new Error("Supabase is not configured") };
  const visitorKey = getVisitorKey();
  const result = await supabase.rpc("toggle_review_like", { p_review_id: reviewId, p_visitor_key: visitorKey }).single();
  if (result.error || !result.data) return { liked: false, count: 0, error: result.error ?? new Error("Unable to update review like") };
  const likeState = result.data as { liked?: boolean; like_count?: number };
  return { liked: Boolean(likeState.liked), count: Number(likeState.like_count ?? 0), error: null };
}

export async function subscribeToNewsletter(email: string) {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  const { error } = await supabase.rpc("subscribe_to_newsletter", { p_email: email.toLowerCase() });
  return { error };
}
