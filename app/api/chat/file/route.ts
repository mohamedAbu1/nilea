import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "../../../lib/auth-server";
import { query } from "../../../lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttachmentRow = {
  user_id: string;
  attachment_mime: string | null;
  attachment_path: string;
};

function contentTypeFor(filePath: string, storedMime: string | null) {
  if (storedMime) return storedMime;
  const extension = path.extname(filePath).toLowerCase();
  return ({
    ".gif": "image/gif",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
  } as Record<string, string>)[extension] ?? "application/octet-stream";
}

function safeAttachmentPath(value: string) {
  const normalized = value.replace(/\\/g, "/");
  const segments = normalized.split("/");
  if (!normalized.startsWith("/uploads/chat/") || segments.includes("..") || normalized.includes("\0")) return null;
  return normalized;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

    const requestedPath = safeAttachmentPath(new URL(request.url).searchParams.get("path") ?? "");
    if (!requestedPath) return Response.json({ error: "Attachment path is invalid." }, { status: 400 });

    const rows = await query<AttachmentRow[]>(`
      SELECT c.user_id, m.attachment_mime, m.attachment_path
        FROM chat_messages m
        JOIN chat_conversations c ON c.id = m.conversation_id
       WHERE m.attachment_path = ?
       LIMIT 1`, [requestedPath]);
    const attachment = rows[0];
    if (!attachment) return Response.json({ error: "Attachment not found." }, { status: 404 });

    const staff = ["support", "editor", "admin"].includes(user.accessRole);
    if (!staff && attachment.user_id !== user.id) return Response.json({ error: "Attachment access denied." }, { status: 403 });

    const storageRoot = path.resolve(process.env.CHAT_UPLOAD_DIR?.trim() || path.join(process.cwd(), "public"));
    const target = path.resolve(storageRoot, requestedPath.replace(/^\/+/, ""));
    if (target === storageRoot || !target.startsWith(`${storageRoot}${path.sep}`)) return Response.json({ error: "Attachment path is invalid." }, { status: 400 });

    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(await readFile(target));
    } catch {
      return Response.json({ error: "Attachment file is no longer available." }, { status: 404 });
    }

    return new Response(bytes, {
      headers: {
        "Cache-Control": "private, max-age=31536000, immutable",
        "Content-Disposition": "inline",
        "Content-Length": String(bytes.byteLength),
        "Content-Type": contentTypeFor(requestedPath, attachment.attachment_mime),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Attachment could not be loaded." }, { status: 500 });
  }
}
