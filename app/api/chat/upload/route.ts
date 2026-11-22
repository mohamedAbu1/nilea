import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "../../../lib/auth-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please sign in to upload a file." }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file");
    const conversationId = String(form.get("conversationId") ?? "").replace(/[^a-zA-Z0-9-]/g, "");
    if (!(file instanceof File) || !conversationId) return Response.json({ error: "A valid file is required." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: "Files must be 10 MB or smaller." }, { status: 413 });
    const extension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 8);
    const relative = `/uploads/chat/${user.id}/${conversationId}/${randomUUID()}${extension}`;
    const target = path.join(process.cwd(), "public", relative.replace(/^\//, ""));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await file.arrayBuffer()));
    return Response.json({ data: { path: relative } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "The file could not be uploaded." }, { status: 500 }); }
}
