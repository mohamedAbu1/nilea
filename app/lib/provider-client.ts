"use client";

import type { AccountProfile } from "./auth-client";

export type ProviderProfile = {
  user_id: string;
  provider_role: "driver" | "property_owner";
  approval_status: "pending" | "approved" | "rejected";
  company_name: string | null;
  license_number: string | null;
  service_area: string | null;
  bio: string | null;
  availability_status: "available" | "busy" | "offline";
  current_location_label: string | null;
  current_lat: number | null;
  current_lng: number | null;
  location_updated_at: string | null;
  verification_note: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
};

export type ProviderAssignment = {
  id: string;
  provider_id: string;
  booking_type: "car" | "stay" | "trip";
  booking_id: string;
  assignment_status: "assigned" | "accepted" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string | null;
  meeting_location: string | null;
  instructions: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  service_date: string | null;
  service_time: string | null;
  booking_location: string | null;
  booking_destination: string | null;
  catalog_name: string | null;
};

export type ProviderTask = {
  id: string;
  provider_id: string;
  assignment_id: string | null;
  task_type: string;
  title: string;
  instructions: string | null;
  task_status: "pending" | "acknowledged" | "in_progress" | "done" | "blocked";
  requires_location: number;
  due_at: string | null;
  provider_note: string | null;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
  booking_type?: string | null;
  customer_name?: string | null;
};

export type ProviderPortal = { user: AccountProfile; profile: ProviderProfile | null; assignments: ProviderAssignment[]; tasks: ProviderTask[] };
export type ProviderAdminData = {
  providers: Array<ProviderProfile & { id: string; access_role: string; created_at: string }>;
  bookings: Array<Record<string, unknown> & { id: string; booking_type: "car" | "stay" | "trip"; full_name: string; service_date: string | null; location: string | null }>;
  assignments: Array<Record<string, unknown> & { id: string; provider_name: string; provider_role: string; booking_type: string; booking_id: string; assignment_status: string; assignment_customer: string }>;
};

type ApiBody<T> = { data?: T; error?: string };

async function request<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, credentials: "same-origin", cache: "no-store" });
  const body = await response.json().catch(() => ({})) as ApiBody<T>;
  if (!response.ok) throw new Error(body.error || "Provider operations are unavailable.");
  return body.data as T;
}

export async function getProviderPortal() { return request<ProviderPortal>("/api/provider"); }
export async function getProviderAdmin() { return request<ProviderAdminData>("/api/provider?action=admin"); }
export async function applyAsProvider(input: Record<string, unknown>) { return request<{ submitted: boolean }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "apply", ...input }) }); }
export async function approveProvider(input: Record<string, unknown>) { return request<{ updated: boolean }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "approve", ...input }) }); }
export async function assignProviderBooking(input: Record<string, unknown>) { return request<{ assigned: boolean; assignmentId: string }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "assign", ...input }) }); }
export async function createProviderTask(input: Record<string, unknown>) { return request<{ created: boolean; taskId: string }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "create-task", ...input }) }); }
export async function updateProviderTask(input: Record<string, unknown>) { return request<{ updated: boolean }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "task-update", ...input }) }); }
export async function updateProviderAssignment(input: Record<string, unknown>) { return request<{ updated: boolean }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "assignment-update", ...input }) }); }
export async function shareProviderLocation(input: Record<string, unknown>) { return request<{ updated: boolean }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "location", ...input }) }); }
export async function updateProviderAvailability(availabilityStatus: string) { return request<{ updated: boolean }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "availability", availabilityStatus }) }); }
export async function updateProviderProfile(input: Record<string, unknown>) { return request<{ updated: boolean }>("/api/provider", { method: "POST", body: JSON.stringify({ action: "profile", ...input }) }); }
