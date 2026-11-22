import { createPasswordResetToken, getCurrentUser, login, logout, register, resetPassword, updateDeviceType } from "../../lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ok<T>(data: T) {
  return Response.json({ data });
}

function fail(error: unknown, status = 400) {
  const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const message = error instanceof Error ? error.message : "";
  const databaseFailure = code === "ER_NO_SUCH_TABLE" || code === "ER_BAD_DB_ERROR" || code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT" || /Missing MYSQL_(HOST|USER|DATABASE)/.test(message);
  const publicMessage = code === "ER_NO_SUCH_TABLE"
    ? "The account database tables are not ready. Run the MySQL migrations on Hostinger."
    : databaseFailure
      ? "The account service is not connected to the MySQL database yet. Check the Hostinger environment variables."
      : message || "The account request failed.";
  return Response.json({ error: publicMessage }, { status: databaseFailure ? 503 : status });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok(user ? { user } : null);
  } catch (error) {
    return fail(error, 503);
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const action = String(input.action ?? "");
    if (action === "login") return ok({ user: await login(String(input.email ?? ""), String(input.password ?? "")) });
    if (action === "register") return ok({ user: await register({ name: String(input.name ?? ""), email: String(input.email ?? ""), phone: String(input.phone ?? ""), gender: String(input.gender ?? ""), avatarUrl: String(input.avatarUrl ?? ""), password: String(input.password ?? ""), deviceType: String(input.deviceType ?? "computer") }) });
    if (action === "forgot") {
      const resetToken = await createPasswordResetToken(String(input.email ?? ""));
      return ok({ message: "If this email is registered, a reset link will be sent once email delivery is configured.", ...(process.env.AUTH_RESET_DEBUG === "true" && resetToken ? { resetToken } : {}) });
    }
    if (action === "reset") return ok({ user: await resetPassword(String(input.token ?? ""), String(input.password ?? "")) });
    return fail(new Error("Unknown account action."));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const input = await request.json() as { deviceType?: string };
    await updateDeviceType(input.deviceType === "phone" ? "phone" : "computer");
    return ok({ updated: true });
  } catch (error) {
    return fail(error, 503);
  }
}

export async function DELETE() {
  try {
    await logout();
    return ok({ signedOut: true });
  } catch (error) {
    return fail(error, 503);
  }
}
