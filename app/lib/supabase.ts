import { createClient, type User } from "@supabase/supabase-js";

export type AccountProfile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  gender: "male" | "female" | "";
};

export type DeviceType = "phone" | "computer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function detectDeviceType(): DeviceType {
  if (typeof navigator === "undefined") return "computer";
  return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent) ? "phone" : "computer";
}

export async function syncProfileDeviceType(userId: string, deviceType = detectDeviceType()) {
  if (!supabase || !userId) return;
  try {
    await supabase.from("profiles").update({ device_type: deviceType, last_seen_at: new Date().toISOString() }).eq("id", userId);
  } catch {
    // The profile context migration may not be applied yet; auth should remain usable.
  }
}

export function accountProfileFromUser(user: User | null): AccountProfile | null {
  if (!user) return null;
  const gender = user.user_metadata?.gender === "male" || user.user_metadata?.gender === "female" ? user.user_metadata.gender : "";
  return {
    name: String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Traveler"),
    email: user.email ?? "",
    phone: String(user.user_metadata?.phone ?? ""),
    avatar: String(user.user_metadata?.avatar_url ?? "/alpnile-profile-avatar.webp"),
    gender,
  };
}
