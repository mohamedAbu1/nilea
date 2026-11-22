import { randomUUID } from "node:crypto";
import { getCurrentUser, type AccessRole } from "../../lib/auth-server";
import { query } from "../../lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const staffRoles: AccessRole[] = ["support", "editor", "admin"];
const catalogTables = ["stays", "trips", "products", "vehicles"] as const;
const requestTables = ["inquiries", "car_bookings", "trip_bookings", "stay_bookings"] as const;

function fail(error: unknown, status = 400) { return Response.json({ error: error instanceof Error ? error.message : "Admin request failed." }, { status }); }
async function staff() {
  const user = await getCurrentUser();
  if (!user || !staffRoles.includes(user.accessRole)) throw new Error("Staff access required.");
  return user;
}

export async function GET(request: Request) {
  try {
    const user = await staff();
    const params = new URL(request.url).searchParams;
    const action = params.get("action");
    if (action === "session") return Response.json({ data: { user } });
    if (action === "requests") {
      const [inquiries, cars, trips, stays] = await Promise.all([
        query("SELECT id, full_name, email, phone, message, request_type, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 80"),
        query("SELECT id, full_name, email, phone, pickup_label, dropoff_label, status, created_at FROM car_bookings ORDER BY created_at DESC LIMIT 80"),
        query("SELECT id, full_name, email, phone, start_date, guests, status, created_at FROM trip_bookings ORDER BY created_at DESC LIMIT 80"),
        query("SELECT id, full_name, email, phone, check_in, check_out, guests, status, created_at FROM stay_bookings ORDER BY created_at DESC LIMIT 80"),
      ]);
      const rows = [
        ...(inquiries as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), source: "inquiry" as const, name: String(row.full_name), contact: String(row.email || row.phone || "No contact"), summary: String(row.message || row.request_type), status: String(row.status), created_at: String(row.created_at), table: "inquiries" })),
        ...(cars as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), source: "car" as const, name: String(row.full_name), contact: String(row.phone || row.email || "No contact"), summary: `${row.pickup_label} → ${row.dropoff_label}`, status: String(row.status), created_at: String(row.created_at), table: "car_bookings" })),
        ...(trips as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), source: "trip" as const, name: String(row.full_name), contact: String(row.phone || row.email || "No contact"), summary: `Trip date ${row.start_date || "open"} · ${row.guests} guests`, status: String(row.status), created_at: String(row.created_at), table: "trip_bookings" })),
        ...(stays as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), source: "stay" as const, name: String(row.full_name), contact: String(row.phone || row.email || "No contact"), summary: `Stay ${row.check_in} → ${row.check_out} · ${row.guests} guests`, status: String(row.status), created_at: String(row.created_at), table: "stay_bookings" })),
      ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
      return Response.json({ data: rows });
    }
    if (action === "stats") {
      const tables = ["inquiries", "car_bookings", "trip_bookings", "stay_bookings", "chat_conversations", "stays", "trips", "products", "vehicles"];
      const counts = await Promise.all(tables.map(async (table) => { const rows = await query<{ count: number }[]>(`SELECT COUNT(*) AS count FROM \`${table}\``); return [table, Number(rows[0]?.count ?? 0)] as const; }));
      return Response.json({ data: Object.fromEntries(counts) });
    }
    if (action === "profiles") {
      const ids = (params.get("ids") || "").split(",").map((id) => id.trim()).filter((id) => /^[a-f0-9-]{36}$/i.test(id));
      if (!ids.length) return Response.json({ data: {} });
      const placeholders = ids.map(() => "?").join(",");
      const rows = await query<{ id: string; full_name: string }[]>(`SELECT id, full_name FROM profiles WHERE id IN (${placeholders})`, ids);
      return Response.json({ data: Object.fromEntries(rows.map((row) => [row.id, row.full_name])) });
    }
    if (action === "catalog") {
      const collection = params.get("collection") as typeof catalogTables[number];
      if (!catalogTables.includes(collection)) throw new Error("Invalid catalog collection.");
      const rows = await query(`SELECT * FROM \`${collection}\` ORDER BY updated_at DESC LIMIT 100`);
      return Response.json({ data: rows });
    }
    if (action === "rates") {
      const rows = await query("SELECT currency_code, currency_name, symbol, rate_to_usd, decimal_digits, is_active, updated_at FROM exchange_rates ORDER BY currency_code");
      return Response.json({ data: rows });
    }
    return fail(new Error("Unknown admin query."));
  } catch (error) { return fail(error, 401); }
}

export async function POST(request: Request) {
  try {
    const user = await staff();
    const input = await request.json() as { action?: string; table?: string; id?: string; status?: string; collection?: string; values?: Record<string, unknown>; rates?: Array<Record<string, unknown>> };
    if (input.action === "update-status") {
      if (!requestTables.includes(input.table as typeof requestTables[number])) throw new Error("Invalid request table.");
      await query(`UPDATE \`${input.table}\` SET status = ? WHERE id = ?`, [input.status, input.id]);
      return Response.json({ data: { updated: true } });
    }
    if (input.action === "save-rates") {
      if (user.accessRole !== "admin") throw new Error("Administrator access required.");
      for (const rate of input.rates ?? []) await query("INSERT INTO exchange_rates (currency_code, currency_name, symbol, rate_to_usd, decimal_digits, is_active) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE currency_name = VALUES(currency_name), symbol = VALUES(symbol), rate_to_usd = VALUES(rate_to_usd), decimal_digits = VALUES(decimal_digits), is_active = VALUES(is_active)", [rate.currency_code, rate.currency_name, rate.symbol, rate.rate_to_usd, rate.decimal_digits, rate.is_active ? 1 : 0]);
      return Response.json({ data: { saved: true } });
    }
    if (input.action === "save-catalog") {
      if (!["admin", "editor"].includes(user.accessRole)) throw new Error("Editor access required.");
      const collection = input.collection as typeof catalogTables[number];
      if (!catalogTables.includes(collection)) throw new Error("Invalid catalog collection.");
      const values = input.values ?? {};
      const allowed = collection === "trips" ? ["slug", "title", "description", "image_url", "location_label", "duration_label", "is_active", "is_featured"] : collection === "stays" ? ["slug", "name", "description", "image_url", "location_label", "stay_type", "max_guests", "is_active", "is_featured"] : collection === "products" ? ["slug", "name", "description", "image_url", "price", "stock_quantity", "currency", "is_active", "is_featured"] : ["slug", "name", "description", "image_url", "vehicle_type", "passenger_capacity", "price_from", "currency", "with_driver", "is_active"];
      const clean = Object.fromEntries(allowed.filter((key) => key in values).map((key) => [key, values[key] === "" ? null : values[key]]));
      if (!input.id) {
        const defaults: Record<string, unknown> = collection === "trips" ? { id: randomUUID(), city_id: null, location_label: "Egypt", duration_label: "Curated route", currency: "USD" } : collection === "stays" ? { id: randomUUID(), city_id: null, location_label: "Egypt", stay_type: "villa", currency: "USD" } : collection === "products" ? { id: randomUUID(), currency: "USD", price: 0, stock_quantity: 0 } : { id: randomUUID(), vehicle_type: "suv", passenger_capacity: 1, currency: "USD", with_driver: 1 };
        const merged = { ...defaults, ...clean };
        const columns = Object.keys(merged);
        await query(`INSERT INTO \`${collection}\` (${columns.map((column) => `\`${column}\``).join(",")}) VALUES (${columns.map(() => "?").join(",")})`, columns.map((column) => typeof merged[column] === "boolean" ? (merged[column] ? 1 : 0) : merged[column]));
      } else {
        const columns = Object.keys(clean);
        if (!columns.length) throw new Error("No catalog changes supplied.");
        await query(`UPDATE \`${collection}\` SET ${columns.map((column) => `\`${column}\` = ?`).join(", ")} WHERE id = ?`, [...columns.map((column) => typeof clean[column] === "boolean" ? (clean[column] ? 1 : 0) : clean[column]), input.id]);
      }
      return Response.json({ data: { saved: true } });
    }
    return fail(new Error("Unknown admin action."));
  } catch (error) { return fail(error, 401); }
}
