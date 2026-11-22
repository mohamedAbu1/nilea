import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loginWithGoogle } from "../../../lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "alpnile_google_state";
const RETURN_TO_COOKIE = "alpnile_google_return_to";
const COOKIE_MAX_AGE = 10 * 60;

function getSiteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
  return new URL(configured).origin;
}

function getRedirectUri(request: Request) {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || new URL("/api/auth/google/callback", getSiteOrigin(request)).toString();
}

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  response.cookies.set(RETURN_TO_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}

function redirectError(request: Request, message: string, returnTo = "/") {
  const target = new URL(safeReturnTo(returnTo), getSiteOrigin(request));
  target.searchParams.set("error_description", message);
  return clearOAuthCookies(NextResponse.redirect(target));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const callbackPath = requestUrl.pathname.endsWith("/callback");
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return redirectError(request, "Google sign-in is not configured on the server yet.");

  const store = await cookies();
  if (!callbackPath) {
    const state = randomBytes(32).toString("hex");
    const returnTo = safeReturnTo(requestUrl.searchParams.get("returnTo"));
    const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", getRedirectUri(request));
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("access_type", "online");
    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set(STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_MAX_AGE });
    response.cookies.set(RETURN_TO_COOKIE, returnTo, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_MAX_AGE });
    return response;
  }

  const returnTo = store.get(RETURN_TO_COOKIE)?.value || "/";
  const error = requestUrl.searchParams.get("error");
  if (error) return redirectError(request, requestUrl.searchParams.get("error_description") || "Google sign-in was cancelled.", returnTo);

  const state = requestUrl.searchParams.get("state");
  const savedState = store.get(STATE_COOKIE)?.value;
  if (!state || !savedState || state !== savedState) return redirectError(request, "Google sign-in expired. Please try again.", returnTo);

  const code = requestUrl.searchParams.get("code");
  if (!code) return redirectError(request, "Google did not return an authorization code.", returnTo);

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: getRedirectUri(request) }),
      cache: "no-store",
    });
    const token = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !token.access_token) throw new Error("Google token exchange failed.");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
    const profile = await profileResponse.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
    if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) throw new Error("Google did not return a verified email address.");

    await loginWithGoogle({ subject: profile.sub, email: profile.email, name: profile.name, avatarUrl: profile.picture });
    return clearOAuthCookies(NextResponse.redirect(new URL(safeReturnTo(returnTo), getSiteOrigin(request))));
  } catch (oauthError) {
    return redirectError(request, oauthError instanceof Error ? oauthError.message : "Google sign-in could not finish.", returnTo);
  }
}
