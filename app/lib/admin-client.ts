import type { ChatConversation } from "./chat";

export type AdminSession = { user: { id: string; email: string; name: string; accessRole: "support" | "editor" | "admin" } };
export type AdminRequestRow = { id: string; source: "inquiry" | "car" | "trip" | "stay"; name: string; contact: string; summary: string; status: string; created_at: string; table: string };

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
export async function saveAdminRates(rates: unknown[]) { return request<{ saved: boolean }>("/api/admin", { method: "POST", body: JSON.stringify({ action: "save-rates", rates }) }); }

export function unusedChatTypeGuard(_conversation: ChatConversation) { return true; }
