import "server-only";

import { cookies } from "next/headers";
import { createHash, randomBytes, randomUUID, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { query, withTransaction } from "./mysql";
import { notifyAdmins } from "./notifications";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "alpnile_session";
const SESSION_DAYS = 30;

export type AccessRole = "traveler" | "driver" | "property_owner" | "support" | "editor" | "admin";

export const SUPER_ADMIN_EMAIL = "mohamedahmed33m11@gmail.com";

export function isSuperAdmin(user: { email?: string } | null | undefined) {
  return user?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

export type AuthProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar: string;
  gender: "male" | "female" | "";
  accessRole: AccessRole;
};

type AuthRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  gender: string | null;
  access_role: AccessRole;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validatePassword(password: string) {
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Use at least 8 characters, including a capital letter, number or symbol.");
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [, saltHex, hashHex] = encoded.split("$");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scrypt(password, Buffer.from(saltHex, "hex"), expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function profileFromRow(row: AuthRow): AuthProfile {
  const gender = row.gender === "male" || row.gender === "female" ? row.gender : "";
  return {
    id: row.id,
    email: row.email,
    name: row.full_name || row.email.split("@")[0] || "Traveler",
    phone: row.phone ?? "",
    avatar: row.avatar_url || "/alpnile-profile-avatar.webp",
    gender,
    accessRole: row.access_role,
  };
}

async function findUserByEmail(email: string) {
  const rows = await query<(AuthRow & { password_hash: string | null })[]>("SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, p.gender, p.access_role FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.email = ? LIMIT 1", [email]);
  return rows[0] ?? null;
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;
  const rows = await query<(AuthRow & { session_id: string })[]>("SELECT s.id AS session_id, u.id, u.email, u.full_name, u.phone, u.avatar_url, p.gender, p.access_role FROM auth_sessions s JOIN users u ON u.id = s.user_id LEFT JOIN profiles p ON p.id = u.id WHERE s.id = ? AND s.expires_at > UTC_TIMESTAMP(6) LIMIT 1", [token]);
  if (!rows[0]) return null;
  const profile = profileFromRow(rows[0]);
  void query("UPDATE profiles SET last_seen_at = UTC_TIMESTAMP(6) WHERE id = ?", [profile.id]).catch(() => undefined);
  return profile;
}

export async function requireUser(roles?: AccessRole[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  if (roles && !roles.includes(user.accessRole)) throw new Error("Staff access required.");
  return user;
}

async function setSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await query("INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [token, userId, expiresAt]);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(normalizeEmail(email));
  if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) throw new Error("The email or password is not correct.");
  await query("UPDATE users SET last_login_at = UTC_TIMESTAMP(6) WHERE id = ?", [user.id]);
  await setSession(user.id);
  return profileFromRow(user);
}

export async function loginWithGoogle(input: { subject: string; email: string; name?: string; avatarUrl?: string }) {
  const email = normalizeEmail(input.email);
  const subject = input.subject.trim();
  const name = input.name?.trim() || email.split("@")[0] || "Traveler";
  const avatarUrl = input.avatarUrl?.trim() || null;
  if (!subject || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Google did not return a valid account identity.");

  const rows = await query<(AuthRow & { password_hash: string | null })[]>(
    "SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, p.gender, p.access_role FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE (u.auth_provider = 'google' AND u.auth_provider_subject = ?) OR u.email = ? LIMIT 1",
    [subject, email],
  );
  const existing = rows[0];
  const userId = existing?.id ?? randomUUID();

  await withTransaction(async (connection) => {
    if (existing) {
      await connection.execute(
        "UPDATE users SET email = ?, full_name = ?, avatar_url = COALESCE(?, avatar_url), auth_provider = 'google', auth_provider_subject = ?, email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(6)), last_login_at = UTC_TIMESTAMP(6) WHERE id = ?",
        [email, name, avatarUrl, subject, userId],
      );
      await connection.execute(
        "INSERT INTO profiles (id, full_name, avatar_url) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), avatar_url = COALESCE(VALUES(avatar_url), avatar_url), updated_at = UTC_TIMESTAMP(6)",
        [userId, name, avatarUrl],
      );
      return;
    }

    await connection.execute(
      "INSERT INTO users (id, email, password_hash, full_name, avatar_url, auth_provider, auth_provider_subject, email_verified_at, last_login_at) VALUES (?, ?, NULL, ?, ?, 'google', ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))",
      [userId, email, name, avatarUrl, subject],
    );
    await connection.execute(
      "INSERT INTO profiles (id, full_name, avatar_url, device_type) VALUES (?, ?, ?, 'computer')",
      [userId, name, avatarUrl],
    );
  });

  await setSession(userId);
  if (!existing) {
    notifyAdmins({
      eventType: "account_created",
      title: "New traveler account",
      body: `${name} joined AlpNile with Google.`,
      userId,
      entityType: "user",
      entityId: userId,
      metadata: { email, provider: "google" },
    });
  }
  const profile = await getCurrentUser();
  if (!profile) throw new Error("The Google account was accepted, but the AlpNile session could not be created.");
  return profile;
}

export async function register(input: { name: string; email: string; phone?: string; gender?: string; avatarUrl?: string; password: string; deviceType?: string }) {
  const email = normalizeEmail(input.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email address.");
  if (input.name.trim().length < 2) throw new Error("Please enter your full name.");
  validatePassword(input.password);
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("An account with this email already exists.");
  const id = randomUUID();
  const passwordHash = await hashPassword(input.password);
  await withTransaction(async (connection) => {
    await connection.execute("INSERT INTO users (id, email, password_hash, full_name, phone, avatar_url, email_verified_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6))", [id, email, passwordHash, input.name.trim() || "Traveler", input.phone?.trim() || null, input.avatarUrl || null]);
    await connection.execute("INSERT INTO profiles (id, full_name, phone, avatar_url, gender, device_type) VALUES (?, ?, ?, ?, ?, ?)", [id, input.name.trim() || "Traveler", input.phone?.trim() || null, input.avatarUrl || null, input.gender === "male" || input.gender === "female" ? input.gender : null, input.deviceType === "phone" ? "phone" : "computer"]);
  });
  await setSession(id);
  notifyAdmins({
    eventType: "account_created",
    title: "New traveler account",
    body: `${input.name.trim() || "A new traveler"} created an AlpNile account.`,
    userId: id,
    entityType: "user",
    entityId: id,
    metadata: { email },
  });
  return profileFromRow({ id, email, full_name: input.name.trim() || "Traveler", phone: input.phone || null, avatar_url: input.avatarUrl || null, gender: input.gender || null, access_role: "traveler" });
}

export async function updateDeviceType(deviceType: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await query("UPDATE profiles SET device_type = ?, last_seen_at = UTC_TIMESTAMP(6) WHERE id = ?", [deviceType, user.id]);
}

export async function logout() {
  const token = await getSessionToken();
  if (token) await query("DELETE FROM auth_sessions WHERE id = ?", [token]);
  (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export async function createPasswordResetToken(email: string) {
  const user = await findUserByEmail(normalizeEmail(email));
  if (!user) return;
  const token = createHash("sha256").update(randomBytes(32)).digest("hex");
  await query("INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 1 HOUR))", [randomUUID(), user.id, token]);
  return token;
}

export async function resetPassword(token: string, password: string) {
  validatePassword(password);
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const rows = await query<{ id: string; user_id: string }[]>("SELECT id, user_id FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP(6) LIMIT 1", [tokenHash]);
  const reset = rows[0];
  if (!reset) throw new Error("This reset link is invalid or expired.");
  await withTransaction(async (connection) => {
    await connection.execute("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(password), reset.user_id]);
    await connection.execute("UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP(6) WHERE id = ?", [reset.id]);
  });
  await setSession(reset.user_id);
  return getCurrentUser();
}
