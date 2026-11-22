import { randomUUID } from "node:crypto";
import { getCurrentUser } from "../../lib/auth-server";
import { query } from "../../lib/mysql";
import { notifyAdmins } from "../../lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown, status = 400) {
  return Response.json({ error: error instanceof Error ? error.message : "Chat request failed." }, { status });
}

async function authorizedConversation(id: string, userId: string, staff: boolean) {
  const rows = await query<{ id: string; user_id: string }[]>("SELECT id, user_id FROM chat_conversations WHERE id = ? AND (? = 1 OR user_id = ?) LIMIT 1", [id, staff ? 1 : 0, userId]);
  return rows[0] ?? null;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Please sign in to open chat.");
    const params = new URL(request.url).searchParams;
    const action = params.get("action");
    if (action === "conversations") {
      if (!["support", "editor", "admin"].includes(user.accessRole)) throw new Error("Staff access required.");
      const rows = await query("SELECT c.* FROM chat_conversations c LEFT JOIN profiles p ON p.id = c.user_id WHERE COALESCE(p.access_role, 'traveler') NOT IN ('admin', 'support', 'editor') ORDER BY c.last_message_at DESC");
      return Response.json({ data: rows });
    }
    if (action === "messages") {
      const id = params.get("conversationId") || "";
      if (!await authorizedConversation(id, user.id, ["support", "editor", "admin"].includes(user.accessRole))) throw new Error("Conversation not found.");
      const rows = await query("SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC", [id]);
      return Response.json({ data: rows });
    }
    return errorResponse(new Error("Unknown chat query."));
  } catch (error) { return errorResponse(error, 401); }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Please sign in to use chat.");
    const input = await request.json() as Record<string, unknown>;
    const action = String(input.action ?? "");
    if (action === "ensure") {
      const existing = await query("SELECT * FROM chat_conversations WHERE user_id = ? AND status IN ('open', 'pending') ORDER BY last_message_at DESC LIMIT 1", [user.id]);
      if (existing[0]) return Response.json({ data: existing[0] });
      const id = randomUUID();
      await query("INSERT INTO chat_conversations (id, user_id, subject) VALUES (?, ?, ?)", [id, user.id, "New AlpNile support request"]);
      const created = await query("SELECT * FROM chat_conversations WHERE id = ?", [id]);
      return Response.json({ data: created[0] });
    }
    if (action === "message") {
      const conversationId = String(input.conversationId ?? "");
      const staff = ["support", "editor", "admin"].includes(user.accessRole);
      if (!await authorizedConversation(conversationId, user.id, staff)) throw new Error("Conversation not found.");
      const senderRole = staff ? "staff" : "user";
      const id = randomUUID();
      await query("INSERT INTO chat_messages (id, conversation_id, sender_id, sender_role, body, message_type, attachment_path, attachment_name, attachment_mime, attachment_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, conversationId, user.id, senderRole, String(input.body ?? ""), input.messageType || "text", input.attachmentPath || null, input.attachmentName || null, input.attachmentMime || null, input.attachmentSize || null]);
      await query("UPDATE chat_conversations SET last_message_at = UTC_TIMESTAMP(6) WHERE id = ?", [conversationId]);
      if (!staff) {
        notifyAdmins({
          eventType: "chat_message",
          title: "New support message",
          body: `${user.name} sent a new message to AlpNile support${String(input.body ?? "").trim() ? `: ${String(input.body).trim().slice(0, 140)}` : "."}`,
          userId: user.id,
          entityType: "conversation",
          entityId: conversationId,
          metadata: { messageId: id, messageType: input.messageType || "text" },
        });
      }
      const created = await query("SELECT * FROM chat_messages WHERE id = ?", [id]);
      return Response.json({ data: created[0] });
    }
    if (action === "status") {
      if (!["support", "editor", "admin"].includes(user.accessRole)) throw new Error("Staff access required.");
      await query("UPDATE chat_conversations SET status = ? WHERE id = ?", [input.status, input.conversationId]);
      return Response.json({ data: { updated: true } });
    }
    return errorResponse(new Error("Unknown chat action."));
  } catch (error) { return errorResponse(error, 401); }
}
