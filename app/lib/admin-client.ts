import type { ChatConversation } from "./chat";

export type AdminSession = { user: { id: string; email: string; name: string; accessRole: "support" | "editor" | "admin" }; is_super_admin: boolean };
export type AdminRequestRow = { id: string; source: "inquiry" | "car" | "trip" | "stay"; name: string; contact: string; summary: string; status: string; created_at: string; table: string };
export type AdminNotification = { id: string; event_type: string; title: string; body: string; user_id: string | null; entity_type: string | null; entity_id: string | null; metadata: unknown; is_read: number; created_at: string };
export type AdminUserSummary = { id: string; email: string; full_name: string; phone: string | null; created_at: string; last_login_at: string | null; access_role: string; last_seen_at: string | null; event_count: number; search_count: number; like_count: number; last_activity_at: string | null; booking_count: number; purchase_count: number; review_count: number; conversation_count: number };
export type AdminUserFile = { user: Record<string, unknown>; preferences: Record<string, unknown> | null; events: Record<string, unknown>[]; bookings: Record<string, unknown>[]; orders: Record<string, unknown>[]; order_items: Record<string, unknown>[]; reviews: Record<string, unknown>[]; conversations: Record<string, unknown>[]; saved: Record<string, number>; interests: Record<string, unknown>[] };
export type AdminManagedUser = { id: string; email: string; full_name: string; phone: string | null; avatar_url: string | null; created_at: string; last_login_at: string | null; access_role: string; account_type: string; last_seen_at: string | null; provider_role: string | null; approval_status: string | null };
export type AdminCustomJourney = { id: string; user_id: string; full_name: string; email: string; metadata: unknown; occurred_at: string };

type ApiBody<T> = { data?: T; error?: string };

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, credentials: "same-origin" });
  const body = await response.json().catch(() => ({})) as ApiBody<T>;
  if (!response.ok) throw new Error(body.error || "Admin service is unavailable.");
  return body.data as T;
}

export async function getAdminSession() { return request<AdminSession>("/api/admin?action=session"); }
export async function getAdminRequests() { return request<AdminRequestRow[]>("/api/admin?action=requests"); }
export async function getAdminStats() { return request<Record<string, number>>("/api/admin?action=stats"); }
export async function getAdminProfiles(ids: string[]) { return request<Record<string, string>>(`/api/admin?action=profiles&ids=${encodeURIComponent(ids.join(","))}`); }
export async function getAdminCatalog(collection: string) { return request<Record<string, unknown>[]>(`/api/admin?action=catalog&collection=${encodeURIComponent(collection)}`); }
export async function getAdminRates() { return request<import("../components/currency").ExchangeRate[]>("/api/admin?action=rates"); }
export async function updateAdminStatus(table: string, id: string, status: string) { return request<{ updated: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "update-status", table, id, status }) }); }
export async function saveAdminCatalog(collection: string, id: string, values: Record<string, unknown>) { return request<{ saved: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "save-catalog", collection, id, values }) }); }
export async function deleteAdminCatalog(collection: string, id: string) { return request<{ archived: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "delete-catalog", collection, id }) }); }
export async function saveAdminRates(rates: unknown[]) { return request<{ saved: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "save-rates", rates }) }); }
export async function getAdminNotifications() { return request<{ rows: AdminNotification[]; unread_count: number }>("/api/admin?action=notifications"); }
export async function markAdminNotificationsRead(options: { ids?: string[]; all?: boolean } = {}) { return request<{ updated: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "mark-notifications-read", notificationIds: options.ids, markAll: options.all }) }); }
export async function deleteAdminNotifications(options: { ids?: string[]; all?: boolean } = {}) { return request<{ deleted: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "delete-notifications", notificationIds: options.ids, deleteAll: options.all }) }); }
export async function getAdminUsers() { return request<AdminUserSummary[]>("/api/admin?action=users"); }
export async function getAdminManagedUsers() { return request<AdminManagedUser[]>("/api/admin?action=managed-users"); }
export async function updateAdminUserRole(id: string, accessRole: string) { return request<{ updated: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "update-user-role", id, accessRole }) }); }
export async function getAdminCustomJourneys() { return request<AdminCustomJourney[]>("/api/admin?action=custom-journeys"); }
export async function getAdminUserFile(id: string) { return request<AdminUserFile>(`/api/admin?action=user-profile&id=${encodeURIComponent(id)}`); }

export function unusedChatTypeGuard(_conversation: ChatConversation) { return true; }
