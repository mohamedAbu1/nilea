"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import {
  getChatUserId,
  getChatAttachmentUrl,
  getOrCreateConversation,
  listChatMessages,
  sendChatMessage,
  subscribeToChatConversation,
  uploadChatAttachment,
  type ChatConversation,
  type ChatMessage,
} from "../lib/chat";
import { getSubmissionErrorMessage } from "../lib/submissions";

const emojis = ["😊", "👋", "✨", "❤️", "📍", "🚗", "🏡", "🗺️", "🙏", "👍"];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
function formatSize(value: number | null) {
  if (!value) return "";
  if (value < 1024 * 1024) return Math.max(1, Math.round(value / 1024)) + " KB";
  return (value / (1024 * 1024)).toFixed(1) + " MB";
}

export default function ChatWidget() {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let unsubscribe: () => void = () => undefined;
    if (!open) return () => unsubscribe();
    let active = true;
    setLoading(true);
    setError("");
    void (async () => {
      const identity = await getChatUserId();
      if (!active) return;
      if (identity.error || !identity.data) {
        setUserId("");
        setLoading(false);
        return;
      }
      setUserId(identity.data);
      const result = await getOrCreateConversation(identity.data);
      if (!active) return;
      if (result.error || !result.data) {
        setError(getSubmissionErrorMessage(result.error, "We couldn’t open chat right now. Please try again."));
        setLoading(false);
        return;
      }
      setConversation(result.data);
      const history = await listChatMessages(result.data.id);
      if (!active) return;
      if (history.error) setError(getSubmissionErrorMessage(history.error, "We couldn’t load the conversation."));
      setMessages(history.data ?? []);
      unsubscribe = subscribeToChatConversation(result.data.id, async (message) => {
        const hydrated = message.attachment_path
          ? { ...message, attachment_url: (await getChatAttachmentUrl(message.attachment_path)).data ?? undefined }
          : message;
        setMessages((current) => current.some((item) => item.id === hydrated.id) ? current : [...current, hydrated]);
      });
      setLoading(false);
    })();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [open, pathname]);

  if (pathname.startsWith("/admin")) return null;

  const askUserToSignIn = () => {
    window.dispatchEvent(new CustomEvent("alpnile:open-account", { detail: { mode: "login" } }));
  };

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !conversation) return;
    const body = draft.trim();
    if (!body && !selectedFile) return;
    setSending(true);
    setError("");
    let attachmentPath = "";
    if (selectedFile) {
      const upload = await uploadChatAttachment(userId, conversation.id, selectedFile);
      if (upload.error || !upload.data) {
        setError(getSubmissionErrorMessage(upload.error, upload.error?.message ?? "The file could not be uploaded."));
        setSending(false);
        return;
      }
      attachmentPath = upload.data.path;
    }
    const messageType = selectedFile ? (selectedFile.type.startsWith("image/") ? "image" : "file") : (body.length <= 4 ? "emoji" : "text");
    const result = await sendChatMessage({
      conversationId: conversation.id,
      senderId: userId,
      senderRole: "user",
      body,
      messageType,
      attachmentPath: attachmentPath || undefined,
      attachmentName: selectedFile?.name,
      attachmentMime: selectedFile?.type,
      attachmentSize: selectedFile?.size,
    });
    if (result.error || !result.data) {
      setError(getSubmissionErrorMessage(result.error, "Your message could not be sent. Please try again."));
      setSending(false);
      return;
    }
    const sentMessage = result.data.attachment_path
      ? { ...result.data, attachment_url: (await getChatAttachmentUrl(result.data.attachment_path)).data ?? undefined }
      : result.data;
    setMessages((current) => current.some((item) => item.id === sentMessage.id) ? current : [...current, sentMessage]);
    setDraft("");
    setSelectedFile(null);
    setEmojiOpen(false);
    setSending(false);
  };

  return (
    <div className="alpnile-chat-shell">
      {open && <section className="alpnile-chat-panel" aria-label="AlpNile support chat">
        <div className="alpnile-chat-head">
          <div><span className="alpnile-chat-status-dot" /><div><strong>AlpNile concierge</strong><small>Usually replies within a few minutes</small></div></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
        </div>
        {!userId ? <div className="alpnile-chat-login"><span className="alpnile-chat-lock">✦</span><h3>Keep the conversation close.</h3><p>Sign in to send messages, share files and keep your route with the AlpNile team.</p><button type="button" onClick={askUserToSignIn}>Log in to chat <span>↗</span></button></div> : loading ? <div className="alpnile-chat-empty">Opening your private concierge channel…</div> : <><div className="alpnile-chat-messages" aria-live="polite">{messages.length ? messages.map((message) => <article key={message.id} className={"alpnile-chat-message " + (message.sender_role === "user" ? "mine" : "theirs")}><div>{message.body && <p>{message.body}</p>}{message.attachment_url && (message.message_type === "image" ? <a href={message.attachment_url} target="_blank" rel="noreferrer"><img src={message.attachment_url} alt={message.attachment_name ?? "Shared image"} /></a> : <a className="alpnile-chat-file" href={message.attachment_url} target="_blank" rel="noreferrer"><span>▣</span><span><strong>{message.attachment_name ?? "Shared file"}</strong><small>{formatSize(message.attachment_size)}</small></span></a>)}<time>{formatTime(message.created_at)}</time></div></article>) : <div className="alpnile-chat-empty"><span>𓂀</span><strong>Tell us where the day begins.</strong><p>Ask about a stay, a route, a car or an experience.</p></div>}</div><form className="alpnile-chat-composer" onSubmit={send}><div className="alpnile-chat-tools">{emojiOpen && <div className="alpnile-chat-emoji-menu" role="listbox" aria-label="Emoji picker">{emojis.map((emoji) => <button type="button" key={emoji} onClick={() => setDraft((value) => value + emoji)}>{emoji}</button>)}</div>}<button type="button" aria-label="Add emoji" onClick={() => setEmojiOpen((value) => !value)}>☺</button><button type="button" aria-label="Attach image or file" onClick={() => fileInputRef.current?.click()}>＋</button><input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.doc,.docx" hidden onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} /></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={1} placeholder={selectedFile ? selectedFile.name : "Write to the AlpNile team…"} aria-label="Message" /><button className="alpnile-chat-send" type="submit" disabled={sending || (!draft.trim() && !selectedFile)} aria-label="Send message">{sending ? "…" : "↗"}</button></form>{selectedFile && <p className="alpnile-chat-file-preview">Attached: {selectedFile.name} <button type="button" onClick={() => setSelectedFile(null)}>Remove</button></p>}{error && <p className="alpnile-chat-error" role="alert">{error}</p>}</>}
      </section>}
      <button className={"alpnile-chat-launcher " + (open ? "open" : "")} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close support chat" : "Open support chat"}><span className="alpnile-chat-launcher-mark"><img src="/chat/alpnile-chat-3d.png" alt="" /></span><span><strong>Need a hand?</strong><small>Chat with AlpNile</small></span><b>{open ? "×" : "↗"}</b></button>
    </div>
  );
}

