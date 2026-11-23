import { getAuthSession } from "./auth-client";

export const OFFICIAL_ADMIN_AVATAR = "/chat/alpnile-admin-official.png";
export const DEFAULT_CHAT_AVATAR = "/alpnile-profile-avatar.webp";

function attachmentUrl(path: string) {
  return `/api/chat/file?path=${encodeURIComponent(path)}`;
}

export type ChatStatus = "open" | "pending" | "resolved" | "closed";
export type ChatMessageType = "text" | "emoji" | "image" | "file";

export type ChatConversation = {
  id: string;
  user_id: string;
  assigned_to: string | null;
  subject: string;
  status: ChatStatus;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string | null;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "user" | "staff";
  body: string;
  message_type: ChatMessageType;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_mime: string | null;
  attachment_size: number | null;
  read_at: string | null;
  created_at: string;
  attachment_url?: string;
  sender_name?: string;
  sender_avatar?: string | null;
};

type ApiBody<T> = { data?: T; error?: string };

async function get<T>(url: string) {
  const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
  const body = await response.json().catch(() => ({})) as ApiBody<T>;
  if (!response.ok) throw new Error(body.error || "Chat is unavailable.");
  return body.data as T;
}

async function post<T>(payload: Record<string, unknown>) {
  const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", cache: "no-store", body: JSON.stringify(payload) });
  const body = await response.json().catch(() => ({})) as ApiBody<T>;
  if (!response.ok) throw new Error(body.error || "Chat is unavailable.");
  return body.data as T;
}

export async function getChatUserId() {
  const session = await getAuthSession();
  return session ? { data: session.user.id, error: null } : { data: null, error: new Error("Please sign in to open chat.") };
}

export async function getChatAttachmentUrl(path: string) {
  return { data: attachmentUrl(path), error: null };
}

export async function getOrCreateConversation(userId: string) {
  try { return { data: await post<ChatConversation>({ action: "ensure", userId }), error: null }; }
  catch (error) { return { data: null, error: error instanceof Error ? error : new Error("Could not open chat.") }; }
}

export async function listChatConversations() {
  try { return { data: await get<ChatConversation[]>("/api/chat?action=conversations"), error: null }; }
  catch (error) { return { data: [], error: error instanceof Error ? error : new Error("Could not load conversations.") }; }
}

export async function listChatMessages(conversationId: string) {
  try {
    const messages = await get<ChatMessage[]>(`/api/chat?action=messages&conversationId=${encodeURIComponent(conversationId)}`);
    return { data: messages.map((message) => message.attachment_path ? { ...message, attachment_url: attachmentUrl(message.attachment_path) } : message), error: null };
  } catch (error) { return { data: [], error: error instanceof Error ? error : new Error("Could not load messages.") }; }
}

export async function uploadChatAttachment(userFolderId: string, conversationId: string, file: File) {
  if (file.size > 10 * 1024 * 1024) return { data: null, error: new Error("Files must be 10 MB or smaller.") };
  try {
    const form = new FormData();
    form.append("userFolderId", userFolderId);
    form.append("conversationId", conversationId);
    form.append("file", file);
    const response = await fetch("/api/chat/upload", { method: "POST", body: form, credentials: "same-origin" });
    const body = await response.json().catch(() => ({})) as ApiBody<{ path: string }>;
    if (!response.ok) throw new Error(body.error || "The file could not be uploaded.");
    return { data: body.data ?? null, error: null };
  } catch (error) { return { data: null, error: error instanceof Error ? error : new Error("The file could not be uploaded.") }; }
}

export async function sendChatMessage(payload: { conversationId: string; senderId: string; senderRole: "user" | "staff"; body?: string; messageType?: ChatMessageType; attachmentPath?: string; attachmentName?: string; attachmentMime?: string; attachmentSize?: number }) {
  try { return { data: await post<ChatMessage>({ action: "message", ...payload }), error: null }; }
  catch (error) { return { data: null, error: error instanceof Error ? error : new Error("The message could not be sent.") }; }
}

export async function updateConversationStatus(conversationId: string, status: ChatStatus) {
  try { await post({ action: "status", conversationId, status }); return { error: null }; }
  catch (error) { return { error: error instanceof Error ? error : new Error("The conversation status could not be updated.") }; }
}

export function subscribeToChatConversation(conversationId: string, onMessage: (message: ChatMessage) => void | Promise<void>) {
  let stopped = false;
  let fetching = false;
  let timer: number | undefined;
  const seenMessageIds = new Set<string>();
  const poll = async () => {
    if (stopped || fetching) return;
    fetching = true;
    try {
      const result = await listChatMessages(conversationId);
      const next = result.data ?? [];
      const fresh = next.filter((message) => !seenMessageIds.has(message.id));
      next.forEach((message) => seenMessageIds.add(message.id));
      for (const message of fresh) await onMessage(message);
    } finally {
      fetching = false;
      if (!stopped) timer = window.setTimeout(() => void poll(), 750);
    }
  };
  void poll();
  return () => {
    stopped = true;
    if (timer) window.clearTimeout(timer);
  };
}
