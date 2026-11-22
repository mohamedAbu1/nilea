import { randomUUID } from "node:crypto";
import { query } from "./mysql";

export type AdminNotificationInput = {
  eventType: string;
  title: string;
  body: string;
  userId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

/** Fire-and-forget notification writer. A notification must never break the user action that created it. */
export async function createAdminNotification(input: AdminNotificationInput) {
  await query(
    `INSERT INTO admin_notifications
      (id, event_type, title, body, user_id, entity_type, entity_id, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      input.eventType.slice(0, 40),
      input.title.slice(0, 255),
      input.body,
      input.userId ?? null,
      input.entityType?.slice(0, 40) ?? null,
      input.entityId ?? null,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
}

export function notifyAdmins(input: AdminNotificationInput) {
  void createAdminNotification(input).catch(() => undefined);
}
