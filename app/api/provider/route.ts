import { randomUUID } from "node:crypto";
import { getCurrentUser, type AccessRole } from "../../lib/auth-server";
import { query } from "../../lib/mysql";
import { notifyAdmins } from "../../lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const providerRoles: AccessRole[] = ["driver", "property_owner"];
const adminRoles: AccessRole[] = ["admin", "support", "editor"];
const bookingTypes = ["car", "stay", "trip"] as const;
type BookingType = (typeof bookingTypes)[number];

function fail(error: unknown, status = 400) {
  return Response.json({ error: error instanceof Error ? error.message : "Provider operations failed." }, { status });
}

async function current() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in to continue.");
  return user;
}

async function requireOperations() {
  const user = await current();
  if (!adminRoles.includes(user.accessRole)) throw new Error("Staff access required.");
  return user;
}

async function requireAdministrator() {
  const user = await current();
  if (user.accessRole !== "admin") throw new Error("Administrator access required.");
  return user;
}

async function requireProvider() {
  const user = await current();
  if (!providerRoles.includes(user.accessRole)) throw new Error("An approved provider account is required.");
  return user;
}

function normalizeRole(value: unknown) {
  const role = String(value ?? "");
  if (role !== "driver" && role !== "property_owner") throw new Error("Choose driver or property owner.");
  return role as "driver" | "property_owner";
}

function normalizeBookingType(value: unknown) {
  const type = String(value ?? "");
  if (!bookingTypes.includes(type as BookingType)) throw new Error("Invalid booking type.");
  return type as BookingType;
}

async function loadAssignments(providerId?: string) {
  const filter = providerId ? "WHERE a.provider_id = ?" : "";
  const values = providerId ? [providerId] : [];
  const [cars, stays, trips] = await Promise.all([
    query(`
      SELECT a.*, 'car' AS booking_type, b.pickup_date AS service_date, b.pickup_time AS service_time,
             b.pickup_label AS booking_location, b.dropoff_label AS booking_destination,
             b.full_name AS booking_customer_name, b.phone AS booking_customer_phone,
             v.name AS catalog_name
        FROM provider_assignments a
        LEFT JOIN car_bookings b ON b.id = a.booking_id
        LEFT JOIN vehicles v ON v.id = b.vehicle_id
       ${filter}
       ORDER BY COALESCE(a.scheduled_at, a.created_at) DESC`, values),
    query(`
      SELECT a.*, 'stay' AS booking_type, b.check_in AS service_date, NULL AS service_time,
             s.location_label AS booking_location, s.name AS booking_destination,
             b.full_name AS booking_customer_name, b.phone AS booking_customer_phone,
             s.name AS catalog_name
        FROM provider_assignments a
        LEFT JOIN stay_bookings b ON b.id = a.booking_id
        LEFT JOIN stays s ON s.id = b.stay_id
       ${filter}
       ORDER BY COALESCE(a.scheduled_at, a.created_at) DESC`, values),
    query(`
      SELECT a.*, 'trip' AS booking_type, b.start_date AS service_date, NULL AS service_time,
             t.location_label AS booking_location, t.title AS booking_destination,
             b.full_name AS booking_customer_name, b.phone AS booking_customer_phone,
             t.title AS catalog_name
        FROM provider_assignments a
        LEFT JOIN trip_bookings b ON b.id = a.booking_id
        LEFT JOIN trips t ON t.id = b.trip_id
       ${filter}
       ORDER BY COALESCE(a.scheduled_at, a.created_at) DESC`, values),
  ]);
  return [...(cars as unknown[]), ...(stays as unknown[]), ...(trips as unknown[])].sort((a, b) => {
    const left = Date.parse(String((a as Record<string, unknown>).scheduled_at || (a as Record<string, unknown>).created_at));
    const right = Date.parse(String((b as Record<string, unknown>).scheduled_at || (b as Record<string, unknown>).created_at));
    return right - left;
  });
}

async function loadProviderPortal(userId: string) {
  const [profileRows, assignments, tasks] = await Promise.all([
    query("SELECT pp.*, p.access_role, u.full_name, u.email, u.phone, u.avatar_url FROM provider_profiles pp JOIN users u ON u.id = pp.user_id LEFT JOIN profiles p ON p.id = pp.user_id WHERE pp.user_id = ? LIMIT 1", [userId]),
    loadAssignments(userId),
    query(`SELECT t.*, a.booking_type, a.booking_id, a.scheduled_at, a.meeting_location, a.customer_name
              FROM provider_tasks t
              LEFT JOIN provider_assignments a ON a.id = t.assignment_id
             WHERE t.provider_id = ?
             ORDER BY CASE t.task_status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, COALESCE(t.due_at, t.created_at) ASC
             LIMIT 100`, [userId]),
  ]);
  return { profile: profileRows[0] ?? null, assignments, tasks };
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const action = params.get("action") || "portal";
    if (action === "admin") {
      await requireOperations();
      const [providers, cars, stays, trips, assignments] = await Promise.all([
        query(`SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, COALESCE(p.access_role, 'traveler') AS access_role,
                      pp.provider_role, pp.approval_status, pp.company_name, pp.license_number, pp.service_area,
                      pp.availability_status, pp.current_location_label, pp.location_updated_at, pp.verification_note, pp.created_at
                 FROM users u
                 LEFT JOIN profiles p ON p.id = u.id
                 JOIN provider_profiles pp ON pp.user_id = u.id
                WHERE pp.provider_role IN ('driver', 'property_owner')
                ORDER BY FIELD(pp.approval_status, 'pending', 'approved', 'rejected'), pp.created_at DESC
                LIMIT 200`),
        query("SELECT id, full_name, phone, pickup_date AS service_date, pickup_time AS service_time, pickup_label AS location, status, 'car' AS booking_type FROM car_bookings ORDER BY created_at DESC LIMIT 120"),
        query("SELECT b.id, b.full_name, b.phone, b.check_in AS service_date, NULL AS service_time, s.location_label AS location, b.status, 'stay' AS booking_type, s.name AS catalog_name FROM stay_bookings b LEFT JOIN stays s ON s.id = b.stay_id ORDER BY b.created_at DESC LIMIT 120"),
        query("SELECT b.id, b.full_name, b.phone, b.start_date AS service_date, NULL AS service_time, t.location_label AS location, b.status, 'trip' AS booking_type, t.title AS catalog_name FROM trip_bookings b LEFT JOIN trips t ON t.id = b.trip_id ORDER BY b.created_at DESC LIMIT 120"),
        query(`SELECT a.*, u.full_name AS provider_name, pp.provider_role, COALESCE(a.customer_name, 'Customer') AS assignment_customer
                 FROM provider_assignments a
                 JOIN users u ON u.id = a.provider_id
                 LEFT JOIN provider_profiles pp ON pp.user_id = a.provider_id
                ORDER BY COALESCE(a.scheduled_at, a.created_at) DESC LIMIT 200`),
      ]);
      return Response.json({ data: { providers, bookings: [...(cars as unknown[]), ...(stays as unknown[]), ...(trips as unknown[])], assignments } });
    }
    const user = await current();
    return Response.json({ data: { user, ...(await loadProviderPortal(user.id)) } });
  } catch (error) {
    return fail(error, 401);
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const action = String(input.action ?? "");

    if (action === "apply") {
      const user = await current();
      const role = normalizeRole(input.providerRole);
      const existing = await query<{ user_id: string; approval_status: string }[]>("SELECT user_id, approval_status FROM provider_profiles WHERE user_id = ? LIMIT 1", [user.id]);
      if (existing[0]?.approval_status === "approved") throw new Error("This account is already approved as a provider.");
      await query(`INSERT INTO provider_profiles (user_id, provider_role, company_name, license_number, service_area, bio, approval_status)
                   VALUES (?, ?, ?, ?, ?, ?, 'pending')
                   ON DUPLICATE KEY UPDATE provider_role = VALUES(provider_role), company_name = VALUES(company_name), license_number = VALUES(license_number), service_area = VALUES(service_area), bio = VALUES(bio), approval_status = 'pending', updated_at = UTC_TIMESTAMP(6)`, [
        user.id,
        role,
        String(input.companyName ?? "").trim() || null,
        String(input.licenseNumber ?? "").trim() || null,
        String(input.serviceArea ?? "").trim() || null,
        String(input.bio ?? "").trim() || null,
      ]);
      notifyAdmins({ eventType: "provider_application", title: "New provider application", body: `${user.name} applied as a ${role === "driver" ? "driver" : "property owner"}.`, userId: user.id, entityType: "provider", entityId: user.id, metadata: { providerRole: role } });
      return Response.json({ data: { submitted: true } });
    }

    if (action === "approve") {
      const admin = await requireAdministrator();
      const providerId = String(input.providerId ?? "");
      const role = normalizeRole(input.providerRole);
      const status = String(input.approvalStatus ?? "approved");
      if (!["approved", "rejected", "pending"].includes(status)) throw new Error("Invalid approval status.");
      await query("UPDATE provider_profiles SET provider_role = ?, approval_status = ?, verification_note = ?, approved_at = IF(? = 'approved', UTC_TIMESTAMP(6), NULL), approved_by = IF(? = 'approved', ?, NULL), updated_at = UTC_TIMESTAMP(6) WHERE user_id = ?", [role, status, String(input.note ?? "").trim() || null, status, status, admin.id, providerId]);
      await query("UPDATE profiles SET access_role = ?, updated_at = UTC_TIMESTAMP(6) WHERE id = ?", [status === "approved" ? role : "traveler", providerId]);
      notifyAdmins({ eventType: "provider_status", title: "Provider application updated", body: `${providerId} is now ${status}.`, userId: providerId, entityType: "provider", entityId: providerId, metadata: { providerRole: role, approvalStatus: status, changedBy: admin.id } });
      return Response.json({ data: { updated: true } });
    }

    if (action === "assign") {
      const admin = await requireAdministrator();
      const providerId = String(input.providerId ?? "");
      const bookingType = normalizeBookingType(input.bookingType);
      const bookingId = String(input.bookingId ?? "");
      const providerRows = await query<{ provider_role: string; approval_status: string }[]>("SELECT provider_role, approval_status FROM provider_profiles WHERE user_id = ? LIMIT 1", [providerId]);
      const provider = providerRows[0];
      if (!provider || provider.approval_status !== "approved") throw new Error("Only approved providers can receive assignments.");
      if (bookingType === "car" && provider.provider_role !== "driver") throw new Error("Car bookings can only be assigned to drivers.");
      if (bookingType === "stay" && provider.provider_role !== "property_owner") throw new Error("Stay bookings can only be assigned to property owners.");
      const bookingTable = bookingType === "car" ? "car_bookings" : bookingType === "stay" ? "stay_bookings" : "trip_bookings";
      const bookingRows = await query<Record<string, unknown>[]>(`SELECT * FROM \`${bookingTable}\` WHERE id = ? LIMIT 1`, [bookingId]);
      const booking = bookingRows[0];
      if (!booking) throw new Error("Booking not found.");
      const assignmentId = randomUUID();
      const scheduledAt = String(input.scheduledAt ?? "").trim() || null;
      const meetingLocation = String(input.meetingLocation ?? "").trim() || String(booking.pickup_label ?? booking.location_label ?? "").trim() || null;
      await query(`INSERT INTO provider_assignments (id, provider_id, booking_type, booking_id, assignment_status, scheduled_at, meeting_location, instructions, customer_name, customer_phone, assigned_by)
                   VALUES (?, ?, ?, ?, 'assigned', ?, ?, ?, ?, ?, ?)
                   ON DUPLICATE KEY UPDATE assignment_status = 'assigned', scheduled_at = VALUES(scheduled_at), meeting_location = VALUES(meeting_location), instructions = VALUES(instructions), customer_name = VALUES(customer_name), customer_phone = VALUES(customer_phone), assigned_by = VALUES(assigned_by), updated_at = UTC_TIMESTAMP(6)`, [assignmentId, providerId, bookingType, bookingId, scheduledAt, meetingLocation, String(input.instructions ?? "").trim() || null, String(booking.full_name ?? "").trim() || null, String(booking.phone ?? "").trim() || null, admin.id]);
      const assignmentRows = await query<{ id: string }[]>("SELECT id FROM provider_assignments WHERE provider_id = ? AND booking_type = ? AND booking_id = ? LIMIT 1", [providerId, bookingType, bookingId]);
      const actualAssignmentId = assignmentRows[0]?.id ?? assignmentId;
      await query(`INSERT INTO provider_tasks (id, provider_id, assignment_id, task_type, title, instructions, task_status, requires_location, due_at, created_by)
                   VALUES (?, ?, ?, 'assignment', ?, ?, 'pending', ?, ?, ?)`, [randomUUID(), providerId, actualAssignmentId, bookingType === "car" ? "Confirm pickup route" : bookingType === "stay" ? "Prepare the property" : "Confirm service plan", String(input.instructions ?? "Confirm the assignment and contact AlpNile if anything is unclear.").trim(), bookingType === "car" ? 1 : 0, scheduledAt, admin.id]);
      notifyAdmins({ eventType: "provider_assignment", title: "Provider assignment created", body: `A ${bookingType} booking was assigned to ${providerId}.`, userId: providerId, entityType: "provider_assignment", entityId: actualAssignmentId, metadata: { bookingType, bookingId } });
      return Response.json({ data: { assigned: true, assignmentId: actualAssignmentId } });
    }

    if (action === "create-task") {
      const admin = await requireAdministrator();
      const providerId = String(input.providerId ?? "");
      const providerRows = await query<{ approval_status: string }[]>("SELECT approval_status FROM provider_profiles WHERE user_id = ? LIMIT 1", [providerId]);
      if (providerRows[0]?.approval_status !== "approved") throw new Error("Only approved providers can receive tasks.");
      const assignmentId = String(input.assignmentId ?? "").trim() || null;
      if (assignmentId) {
        const assignmentRows = await query("SELECT id FROM provider_assignments WHERE id = ? AND provider_id = ? LIMIT 1", [assignmentId, providerId]);
        if (!assignmentRows[0]) throw new Error("Assignment not found for this provider.");
      }
      const taskId = randomUUID();
      await query(`INSERT INTO provider_tasks (id, provider_id, assignment_id, task_type, title, instructions, task_status, requires_location, due_at, created_by)
                   VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`, [taskId, providerId, assignmentId, String(input.taskType ?? "instruction").slice(0, 24), String(input.title ?? "Provider instruction").trim(), String(input.instructions ?? "").trim() || null, input.requiresLocation ? 1 : 0, String(input.dueAt ?? "").trim() || null, admin.id]);
      notifyAdmins({ eventType: "provider_task", title: "Provider task created", body: String(input.title ?? "A new provider task was created."), userId: providerId, entityType: "provider_task", entityId: taskId });
      return Response.json({ data: { created: true, taskId } });
    }

    const provider = await requireProvider();
    if (action === "task-update") {
      const taskId = String(input.taskId ?? "");
      const status = String(input.taskStatus ?? "");
      if (!["pending", "acknowledged", "in_progress", "done", "blocked"].includes(status)) throw new Error("Invalid task status.");
      const rows = await query<{ id: string; title: string }[]>("SELECT id, title FROM provider_tasks WHERE id = ? AND provider_id = ? LIMIT 1", [taskId, provider.id]);
      if (!rows[0]) throw new Error("Task not found.");
      await query("UPDATE provider_tasks SET task_status = ?, provider_note = ?, completed_at = IF(? = 'done', UTC_TIMESTAMP(6), NULL), updated_at = UTC_TIMESTAMP(6) WHERE id = ? AND provider_id = ?", [status, String(input.providerNote ?? "").trim() || null, status, taskId, provider.id]);
      notifyAdmins({ eventType: "provider_task_update", title: "Provider task updated", body: `${provider.name} marked “${rows[0].title}” as ${status}.`, userId: provider.id, entityType: "provider_task", entityId: taskId, metadata: { status } });
      return Response.json({ data: { updated: true } });
    }
    if (action === "assignment-update") {
      const assignmentId = String(input.assignmentId ?? "");
      const status = String(input.assignmentStatus ?? "");
      if (!["assigned", "accepted", "in_progress", "completed", "cancelled"].includes(status)) throw new Error("Invalid assignment status.");
      await query("UPDATE provider_assignments SET assignment_status = ?, accepted_at = IF(? = 'accepted', UTC_TIMESTAMP(6), accepted_at), started_at = IF(? = 'in_progress', UTC_TIMESTAMP(6), started_at), completed_at = IF(? = 'completed', UTC_TIMESTAMP(6), completed_at), updated_at = UTC_TIMESTAMP(6) WHERE id = ? AND provider_id = ?", [status, status, status, status, assignmentId, provider.id]);
      notifyAdmins({ eventType: "provider_assignment_update", title: "Provider assignment updated", body: `${provider.name} marked an assignment as ${status}.`, userId: provider.id, entityType: "provider_assignment", entityId: assignmentId, metadata: { status } });
      return Response.json({ data: { updated: true } });
    }
    if (action === "location") {
      const latitude = Number(input.latitude);
      const longitude = Number(input.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error("A valid location is required.");
      const assignmentId = String(input.assignmentId ?? "").trim() || null;
      const taskId = String(input.taskId ?? "").trim() || null;
      if (assignmentId) {
        const owned = await query("SELECT id FROM provider_assignments WHERE id = ? AND provider_id = ? LIMIT 1", [assignmentId, provider.id]);
        if (!owned[0]) throw new Error("Assignment not found.");
      }
      if (taskId) {
        const ownedTask = await query("SELECT id FROM provider_tasks WHERE id = ? AND provider_id = ? LIMIT 1", [taskId, provider.id]);
        if (!ownedTask[0]) throw new Error("Task not found.");
      }
      await query("UPDATE provider_profiles SET current_lat = ?, current_lng = ?, current_location_label = ?, location_updated_at = UTC_TIMESTAMP(6), updated_at = UTC_TIMESTAMP(6) WHERE user_id = ?", [latitude, longitude, String(input.locationLabel ?? "").trim() || null, provider.id]);
      await query("INSERT INTO provider_location_pings (id, provider_id, assignment_id, task_id, latitude, longitude, location_label, source) VALUES (?, ?, ?, ?, ?, ?, ?, 'browser')", [randomUUID(), provider.id, assignmentId, taskId, latitude, longitude, String(input.locationLabel ?? "").trim() || null]);
      notifyAdmins({ eventType: "provider_location", title: "Provider location received", body: `${provider.name} shared a new location.`, userId: provider.id, entityType: "provider", entityId: provider.id, metadata: { assignmentId, taskId } });
      return Response.json({ data: { updated: true } });
    }
    if (action === "availability") {
      const status = String(input.availabilityStatus ?? "offline");
      if (!["available", "busy", "offline"].includes(status)) throw new Error("Invalid availability status.");
      await query("UPDATE provider_profiles SET availability_status = ?, updated_at = UTC_TIMESTAMP(6) WHERE user_id = ?", [status, provider.id]);
      return Response.json({ data: { updated: true } });
    }
    if (action === "profile") {
      await query("UPDATE provider_profiles SET company_name = ?, license_number = ?, service_area = ?, bio = ?, updated_at = UTC_TIMESTAMP(6) WHERE user_id = ?", [String(input.companyName ?? "").trim() || null, String(input.licenseNumber ?? "").trim() || null, String(input.serviceArea ?? "").trim() || null, String(input.bio ?? "").trim() || null, provider.id]);
      return Response.json({ data: { updated: true } });
    }
    return fail(new Error("Unknown provider action."));
  } catch (error) {
    return fail(error, 401);
  }
}
