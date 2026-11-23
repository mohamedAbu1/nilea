"use client";

export type AccountProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  gender: "male" | "female" | "";
  accessRole: "traveler" | "driver" | "property_owner" | "support" | "editor" | "admin";
};

export type DeviceType = "phone" | "computer";

type ApiResponse<T> = { data?: T; error?: string; message?: string };

async function request<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, credentials: "same-origin" });
  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok) throw new Error(body.error || body.message || "The account service is unavailable.");
  return body.data as T;
}

export async function getAuthSession() {
  try { return await request<{ user: AccountProfile }>("/api/auth"); } catch { return null; }
}

export async function signIn(email: string, password: string) {
  return request<{ user: AccountProfile }>("/api/auth", { method: "POST", body: JSON.stringify({ action: "login", email, password }) });
}

export async function signUp(input: { name: string; email: string; phone?: string; gender?: string; avatarUrl?: string; password: string; deviceType?: DeviceType }) {
  return request<{ user: AccountProfile }>("/api/auth", { method: "POST", body: JSON.stringify({ action: "register", ...input }) });
}

export async function requestPasswordReset(email: string) {
  return request<{ message: string; resetToken?: string }>("/api/auth", { method: "POST", body: JSON.stringify({ action: "forgot", email }) });
}

export async function updatePassword(token: string, password: string) {
  return request<{ user: AccountProfile }>("/api/auth", { method: "POST", body: JSON.stringify({ action: "reset", token, password }) });
}

export async function signOut() {
  await request("/api/auth", { method: "DELETE" });
  window.dispatchEvent(new CustomEvent("alpnile:auth-changed"));
}

export function dispatchAuthChanged() {
  window.dispatchEvent(new CustomEvent("alpnile:auth-changed"));
}

export function detectDeviceType(): DeviceType {
  if (typeof navigator === "undefined") return "computer";
  return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent) ? "phone" : "computer";
}

export async function syncProfileDeviceType(deviceType = detectDeviceType()) {
  await fetch("/api/auth", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ deviceType }) }).catch(() => undefined);
}
