import { query } from "../../lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query("SELECT currency_code, currency_name, symbol, rate_to_usd, decimal_digits, is_active, updated_at FROM exchange_rates WHERE is_active = 1 ORDER BY currency_code");
    return Response.json(rows);
  } catch {
    return Response.json([], { status: 503 });
  }
}
