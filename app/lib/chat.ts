import { supabase } from "./supabase";

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
};

function unavailable() {
  return { error: new Error("Supabase is not configured"), data: null };
}
export async function getChatUserId() {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  try {
    const result = await supabase.auth.getUser();
    return { data: result.data.user?.id ?? null, error: result.error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Could not read the current session") };
  }
}

export async function getChatAttachmentUrl(path: string) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const result = await supabase.storage.from("chat-attachments").createSignedUrl(path, 3600);
  return { data: result.data?.signedUrl ?? null, error: result.error };
}

export async function getOrCreateConversation(userId: string) {
  if (!supabase) return unavailable();
  const existing = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["open", "pending"])
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing.error) return { data: null, error: existing.error };
  if (existing.data) return { data: existing.data as ChatConversation, error: null };
  const created = await supabase
    .from("chat_conversations")
    .insert({ user_id: userId, subject: "New AlpNile support request" })
    .select("*")
    .single();
  return { data: created.data as ChatConversation | null, error: created.error };
}

export async function listChatConversations() {
  if (!supabase) return unavailable();
  const result = await supabase
    .from("chat_conversations")
    .select("*")
    .order("last_message_at", { ascending: false });
  return { data: (result.data ?? []) as ChatConversation[], error: result.error };
}

export async function listChatMessages(conversationId: string) {
  if (!supabase) return unavailable();
  const result = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  const messages = (result.data ?? []) as ChatMessage[];
  if (!result.error && messages.some((message) => message.attachment_path)) {
    const withUrls = await Promise.all(messages.map(async (message) => {
      if (!message.attachment_path) return message;
      const signed = await getChatAttachmentUrl(message.attachment_path);
      return { ...message, attachment_url: signed.data ?? undefined };
    }));
    return { data: withUrls, error: result.error };
  }
  return { data: messages, error: result.error };
}

export async function uploadChatAttachment(userFolderId: string, conversationId: string, file: File) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  if (file.size > 10 * 1024 * 1024) return { data: null, error: new Error("Files must be 10 MB or smaller.") };
  const extension = file.name.includes(".") ? "." + file.name.split(".").pop() : "";
  const fileId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  const path = userFolderId + "/" + conversationId + "/" + fileId + extension;
  const result = await supabase.storage.from("chat-attachments").upload(path, file, { upsert: false, contentType: file.type || undefined });
  return { data: result.error ? null : { path }, error: result.error };
}

export async function sendChatMessage(payload: {
  conversationId: string;
  senderId: string;
  senderRole: "user" | "staff";
  body?: string;
  messageType?: ChatMessageType;
  attachmentPath?: string;
  attachmentName?: string;
  attachmentMime?: string;
  attachmentSize?: number;
}) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const result = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: payload.conversationId,
      sender_id: payload.senderId,
      sender_role: payload.senderRole,
      body: payload.body ?? "",
      message_type: payload.messageType ?? "text",
      attachment_path: payload.attachmentPath ?? null,
      attachment_name: payload.attachmentName ?? null,
      attachment_mime: payload.attachmentMime ?? null,
      attachment_size: payload.attachmentSize ?? null,
    })
    .select("*")
    .single();
  return { data: result.data as ChatMessage | null, error: result.error };
}

export async function updateConversationStatus(conversationId: string, status: ChatStatus) {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  const result = await supabase.from("chat_conversations").update({ status }).eq("id", conversationId);
  return { error: result.error };
}

export function subscribeToChatConversation(conversationId: string, onMessage: (message: ChatMessage) => void | Promise<void>) {
  if (!supabase) return () => undefined;
  const channel = supabase
    .channel("chat-conversation-" + conversationId)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "conversation_id=eq." + conversationId }, (payload) => {
      onMessage(payload.new as ChatMessage);
    })
    .subscribe();
  return () => { void supabase?.removeChannel(channel); };
}

