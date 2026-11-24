import { randomUUID } from "node:crypto";
import { getCurrentUser, isSuperAdmin, type AccessRole } from "../../lib/auth-server";
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
    if (action === "session") return Response.json({ data: { user, is_super_admin: isSuperAdmin(user) } });
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
    if (action === "reviews") {
      if (user.accessRole !== "admin") throw new Error("Administrator access required.");
      const rows = await query("SELECT id, full_name, city_country, rating, journey, body, avatar_url, status, like_count, created_at FROM reviews ORDER BY created_at DESC LIMIT 500");
      return Response.json({ data: rows });
    }
    if (action === "stats") {
      const tables = ["inquiries", "car_bookings", "trip_bookings", "stay_bookings", "chat_conversations", "stays", "trips", "products", "vehicles"];
      const counts = await Promise.all(tables.map(async (table) => { const rows = await query<{ count: number }[]>(`SELECT COUNT(*) AS count FROM \`${table}\``); return [table, Number(rows[0]?.count ?? 0)] as const; }));
      const [customers, unreadNotifications, bookings, orders] = await Promise.all([
        query<{ count: number }[]>("SELECT COUNT(*) AS count FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE COALESCE(p.access_role, 'traveler') = 'traveler'"),
        query<{ count: number }[]>("SELECT COUNT(*) AS count FROM admin_notifications WHERE is_read = 0"),
        query<{ count: number }[]>("SELECT COUNT(*) AS count FROM (SELECT id FROM trip_bookings WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY) UNION ALL SELECT id FROM stay_bookings WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY) UNION ALL SELECT id FROM car_bookings WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY)) recent_bookings"),
        query<{ count: number }[]>("SELECT COUNT(*) AS count FROM product_orders WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY)"),
      ]);
      return Response.json({ data: { ...Object.fromEntries(counts), customers: Number(customers[0]?.count ?? 0), unread_notifications: Number(unreadNotifications[0]?.count ?? 0), recent_bookings: Number(bookings[0]?.count ?? 0), recent_orders: Number(orders[0]?.count ?? 0) } });
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
    if (action === "notifications") {
      const [rows, unread] = await Promise.all([
        query("SELECT id, event_type, title, body, user_id, entity_type, entity_id, metadata, is_read, created_at FROM admin_notifications ORDER BY created_at DESC LIMIT 40"),
        query<{ count: number }[]>("SELECT COUNT(*) AS count FROM admin_notifications WHERE is_read = 0"),
      ]);
      return Response.json({ data: { rows, unread_count: Number(unread[0]?.count ?? 0) } });
    }
    if (action === "users") {
      const rows = await query(`
        SELECT u.id, u.email, u.full_name, u.phone, u.created_at, u.last_login_at,
               COALESCE(p.access_role, 'traveler') AS access_role, p.last_seen_at,
               (SELECT COUNT(*) FROM catalog_events ce WHERE ce.user_id = u.id) AS event_count,
               (SELECT COUNT(*) FROM catalog_events ce WHERE ce.user_id = u.id AND ce.event_type = 'search') AS search_count,
               (SELECT COUNT(*) FROM catalog_events ce WHERE ce.user_id = u.id AND ce.event_type = 'like') AS like_count,
               (SELECT MAX(ce.occurred_at) FROM catalog_events ce WHERE ce.user_id = u.id) AS last_activity_at,
               (SELECT COUNT(*) FROM trip_bookings b WHERE b.user_id = u.id) +
               (SELECT COUNT(*) FROM stay_bookings b WHERE b.user_id = u.id) +
               (SELECT COUNT(*) FROM car_bookings b WHERE b.user_id = u.id) AS booking_count,
               (SELECT COUNT(*) FROM product_orders o WHERE o.user_id = u.id) AS purchase_count,
               (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) AS review_count,
               (SELECT COUNT(*) FROM chat_conversations c WHERE c.user_id = u.id) AS conversation_count
          FROM users u
          LEFT JOIN profiles p ON p.id = u.id
         WHERE COALESCE(p.access_role, 'traveler') = 'traveler'
         ORDER BY COALESCE((SELECT MAX(ce.occurred_at) FROM catalog_events ce WHERE ce.user_id = u.id), u.created_at) DESC
         LIMIT 200`);
      return Response.json({ data: rows });
    }
    if (action === "managed-users") {
      if (!isSuperAdmin(user)) throw new Error("Only the primary administrator can manage user roles.");
      const rows = await query(`
        SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.created_at, u.last_login_at,
               COALESCE(p.access_role, 'traveler') AS access_role,
               COALESCE(p.account_type, 'user') AS account_type, p.last_seen_at,
               pp.provider_role, pp.approval_status
          FROM users u
          LEFT JOIN profiles p ON p.id = u.id
          LEFT JOIN provider_profiles pp ON pp.user_id = u.id
         ORDER BY u.created_at DESC
         LIMIT 500`);
      return Response.json({ data: rows });
    }
    if (action === "custom-journeys") {
      const rows = await query(`
        SELECT ce.id, ce.user_id, u.full_name, u.email, ce.metadata, ce.occurred_at
          FROM catalog_events ce
          JOIN users u ON u.id = ce.user_id
         WHERE ce.event_type = 'planner_complete'
         ORDER BY ce.occurred_at DESC
         LIMIT 200`);
      return Response.json({ data: rows });
    }
    if (action === "user-profile") {
      const userId = params.get("id") || "";
      if (!/^[a-f0-9-]{36}$/i.test(userId)) throw new Error("Invalid user id.");
      const [userRows, preferences, events, bookings, orders, orderItems, reviews, conversations, saved] = await Promise.all([
        query("SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.created_at, u.last_login_at, p.preferred_locale, p.gender, p.last_seen_at FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = ? AND COALESCE(p.access_role, 'traveler') = 'traveler' LIMIT 1", [userId]),
        query("SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1", [userId]),
        query("SELECT id, event_type, entity_type, entity_id, entity_slug, search_query, metadata, occurred_at FROM catalog_events WHERE user_id = ? ORDER BY occurred_at DESC LIMIT 120", [userId]),
        query(`
          SELECT 'trip' AS source, b.id, b.trip_id AS entity_id, COALESCE(t.title, 'Trip request') AS label, b.status, b.start_date AS start_date, b.end_date AS end_date, b.guests, b.created_at
            FROM trip_bookings b LEFT JOIN trips t ON t.id = b.trip_id WHERE b.user_id = ?
          UNION ALL
          SELECT 'stay' AS source, b.id, b.stay_id AS entity_id, COALESCE(s.name, 'Stay request') AS label, b.status, b.check_in AS start_date, b.check_out AS end_date, b.guests, b.created_at
            FROM stay_bookings b LEFT JOIN stays s ON s.id = b.stay_id WHERE b.user_id = ?
          UNION ALL
          SELECT 'car' AS source, b.id, b.vehicle_id AS entity_id, COALESCE(v.name, 'Car request') AS label, b.status, b.pickup_date AS start_date, b.return_date AS end_date, b.passengers AS guests, b.created_at
            FROM car_bookings b LEFT JOIN vehicles v ON v.id = b.vehicle_id WHERE b.user_id = ?
          ORDER BY created_at DESC LIMIT 100`, [userId, userId, userId]),
        query("SELECT id, delivery_country, status, contact_preference, created_at FROM product_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100", [userId]),
        query("SELECT order_id, product_name, quantity, unit_price FROM product_order_items WHERE order_id IN (SELECT id FROM product_orders WHERE user_id = ?) ORDER BY created_at DESC", [userId]),
        query("SELECT id, full_name, city_country, rating, journey, body, status, like_count, created_at FROM reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 100", [userId]),
        query("SELECT c.id, c.subject, c.status, c.last_message_at, c.created_at, (SELECT COUNT(*) FROM chat_messages m WHERE m.conversation_id = c.id) AS message_count FROM chat_conversations c WHERE c.user_id = ? ORDER BY c.last_message_at DESC LIMIT 50", [userId]),
        Promise.all([
          query<{ count: number }[]>("SELECT COUNT(*) AS count FROM saved_destinations WHERE user_id = ?", [userId]),
          query<{ count: number }[]>("SELECT COUNT(*) AS count FROM saved_trips WHERE user_id = ?", [userId]),
          query<{ count: number }[]>("SELECT COUNT(*) AS count FROM saved_stays WHERE user_id = ?", [userId]),
          query<{ count: number }[]>("SELECT COUNT(*) AS count FROM saved_products WHERE user_id = ?", [userId]),
        ]),
      ]);
      if (!userRows[0]) throw new Error("User file not found.");
      const interestRows = await query("SELECT entity_type, entity_slug, COUNT(*) AS count FROM catalog_events WHERE user_id = ? AND entity_slug IS NOT NULL GROUP BY entity_type, entity_slug ORDER BY count DESC LIMIT 20", [userId]);
      return Response.json({ data: {
        user: userRows[0],
        preferences: preferences[0] ?? null,
        events,
        bookings,
        orders,
        order_items: orderItems,
        reviews,
        conversations,
        saved: { destinations: Number(saved[0][0]?.count ?? 0), trips: Number(saved[1][0]?.count ?? 0), stays: Number(saved[2][0]?.count ?? 0), products: Number(saved[3][0]?.count ?? 0) },
        interests: interestRows,
      } });
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
    const input = await request.json() as { action?: string; table?: string; id?: string; status?: string; collection?: string; values?: Record<string, unknown>; rates?: Array<Record<string, unknown>>; notificationIds?: string[]; markAll?: boolean; deleteAll?: boolean; accessRole?: string };
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
      const allowed = collection === "trips" ? ["slug", "title", "description", "image_url", "location_label", "duration_label", "metadata", "is_active", "is_featured"] : collection === "stays" ? ["slug", "name", "description", "image_url", "location_label", "stay_type", "max_guests", "metadata", "is_active", "is_featured"] : collection === "products" ? ["slug", "name", "description", "image_url", "price", "stock_quantity", "currency", "metadata", "is_active", "is_featured"] : ["slug", "name", "description", "image_url", "vehicle_type", "passenger_capacity", "price_from", "currency", "with_driver", "metadata", "is_active"];
      const clean = Object.fromEntries(allowed.filter((key) => key in values).map((key) => {
        const value = values[key];
        return [key, key === "metadata" && value && typeof value !== "string" ? JSON.stringify(value) : value === "" ? null : value];
      }));
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
    if (input.action === "delete-catalog") {
      if (user.accessRole !== "admin") throw new Error("Administrator access required.");
      const collection = input.collection as typeof catalogTables[number];
      if (!catalogTables.includes(collection) || !input.id) throw new Error("Invalid catalog record.");
      await query(`UPDATE \`${collection}\` SET is_active = 0, updated_at = UTC_TIMESTAMP(6) WHERE id = ?`, [input.id]);
      return Response.json({ data: { archived: true } });
    }
    if (input.action === "delete-review") {
      if (user.accessRole !== "admin") throw new Error("Administrator access required.");
      if (!input.id || !/^[a-f0-9-]{36}$/i.test(input.id)) throw new Error("Invalid review.");
      await query("DELETE FROM reviews WHERE id = ?", [input.id]);
      return Response.json({ data: { deleted: true } });
    }
    if (input.action === "mark-notifications-read") {
      if (input.markAll) await query("UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0");
      else if (input.notificationIds?.length) {
        const ids = input.notificationIds.filter((id) => /^[a-f0-9-]{36}$/i.test(id));
        if (ids.length) await query(`UPDATE admin_notifications SET is_read = 1 WHERE id IN (${ids.map(() => "?").join(",")})`, ids);
      }
      return Response.json({ data: { updated: true } });
    }
    if (input.action === "delete-notifications") {
      if (input.deleteAll) await query("DELETE FROM admin_notifications");
      else if (input.notificationIds?.length) {
        const ids = input.notificationIds.filter((id) => /^[a-f0-9-]{36}$/i.test(id));
        if (ids.length) await query(`DELETE FROM admin_notifications WHERE id IN (${ids.map(() => "?").join(",")})`, ids);
      }
      return Response.json({ data: { deleted: true } });
    }
    if (input.action === "update-user-role") {
      if (!isSuperAdmin(user)) throw new Error("Only the primary administrator can change user roles.");
      const accessRole = input.accessRole as AccessRole;
      if (!input.id || !["traveler", "driver", "property_owner", "support", "editor", "admin"].includes(accessRole)) throw new Error("Invalid user role.");
      const targetRows = await query<{ email: string }[]>("SELECT email FROM users WHERE id = ? LIMIT 1", [input.id]);
      if (!targetRows[0]) throw new Error("User not found.");
      if (isSuperAdmin(targetRows[0])) throw new Error("The primary administrator role is protected.");
      const accountType = ["driver", "property_owner"].includes(accessRole) ? "provider" : accessRole === "traveler" ? "user" : "staff";
      await query("INSERT INTO profiles (id, access_role, account_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE access_role = VALUES(access_role), account_type = VALUES(account_type), updated_at = UTC_TIMESTAMP(6)", [input.id, accessRole, accountType]);
      if (["driver", "property_owner"].includes(accessRole)) {
        await query("INSERT INTO provider_profiles (user_id, provider_role, approval_status, approved_at, approved_by) VALUES (?, ?, 'approved', UTC_TIMESTAMP(6), ?) ON DUPLICATE KEY UPDATE provider_role = VALUES(provider_role), approval_status = 'approved', approved_at = UTC_TIMESTAMP(6), approved_by = VALUES(approved_by), updated_at = UTC_TIMESTAMP(6)", [input.id, accessRole, user.id]);
      } else {
        await query("UPDATE provider_profiles SET approval_status = 'suspended', updated_at = UTC_TIMESTAMP(6) WHERE user_id = ?", [input.id]);
      }
      return Response.json({ data: { updated: true } });
    }
    return fail(new Error("Unknown admin action."));
  } catch (error) { return fail(error, 401); }
}
