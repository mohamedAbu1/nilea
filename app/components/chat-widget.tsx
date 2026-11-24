"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  getChatUserId,
  getChatAttachmentUrl,
  getOrCreateConversation,
  listChatMessages,
  sendChatMessage,
  subscribeToChatConversation,
  uploadChatAttachment,
  DEFAULT_CHAT_AVATAR,
  OFFICIAL_ADMIN_AVATAR,
  type ChatConversation,
  type ChatMessage,
} from "../lib/chat";
import { getSubmissionErrorMessage } from "../lib/submissions";
import { getAuthSession } from "../lib/auth-client";
import ChatAttachment from "./chat-attachment";

const emojis = ["😊", "👋", "✨", "❤️", "📍", "🚗", "🏡", "🗺️", "🙏", "👍"];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
type ChatWidgetProps = {
  initialOpen?: boolean;
  hideLauncher?: boolean;
};

export default function ChatWidget({ initialOpen = false, hideLauncher = false }: ChatWidgetProps) {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(initialOpen);
  const [userId, setUserId] = useState("");
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [staffViewer, setStaffViewer] = useState(false);
  const emojiMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    void getAuthSession().then((session) => setStaffViewer(["admin", "support", "editor"].includes(session?.user.accessRole ?? "")));
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin") || staffViewer) return;
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
  }, [open, pathname, staffViewer]);

  useEffect(() => {
    const openFromWorkspace = () => setOpen(true);
    window.addEventListener("alpnile:open-support-chat", openFromWorkspace);
    return () => window.removeEventListener("alpnile:open-support-chat", openFromWorkspace);
  }, []);

  useEffect(() => {
    if (!emojiOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!emojiMenuRef.current?.contains(event.target as Node)) setEmojiOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEmojiOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [emojiOpen]);

  if (pathname.startsWith("/admin") || staffViewer) return null;

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
          <div><span className="alpnile-chat-head-avatar"><img src={OFFICIAL_ADMIN_AVATAR} alt="" /></span><div><strong>AlpNile concierge</strong><small>Usually replies within a few minutes</small></div></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
        </div>
        {!userId ? <div className="alpnile-chat-login"><span className="alpnile-chat-lock">✦</span><h3>Keep the conversation close.</h3><p>Sign in to send messages, share files and keep your route with the AlpNile team.</p><button type="button" onClick={askUserToSignIn}>Log in to chat <span>↗</span></button></div> : loading ? <div className="alpnile-chat-empty">Opening your private concierge channel…</div> : <><div className="alpnile-chat-messages" aria-live="polite">{messages.length ? messages.map((message) => { const isStaff = message.sender_role === "staff"; const avatar = isStaff ? OFFICIAL_ADMIN_AVATAR : message.sender_avatar || DEFAULT_CHAT_AVATAR; const label = isStaff ? "AlpNile support" : message.sender_name || "You"; return <article key={message.id} className={"alpnile-chat-message " + (isStaff ? "theirs" : "mine")}><img className="alpnile-chat-avatar" src={avatar} alt="" /><div><small className="alpnile-chat-message-author">{label}</small>{message.body && <p>{message.body}</p>}<ChatAttachment message={message} imageClassName="alpnile-chat-attachment-image" fileClassName="alpnile-chat-file" /><time>{formatTime(message.created_at)}</time></div></article>; }) : <div className="alpnile-chat-empty"><span>𓂀</span><strong>Tell us where the day begins.</strong><p>Ask about a stay, a route, a car or an experience.</p></div>}</div><form className="alpnile-chat-composer" onSubmit={send}><div className="alpnile-chat-tools" ref={emojiMenuRef}>{emojiOpen && <div id="alpnile-chat-emoji-menu" className="alpnile-chat-emoji-menu" role="listbox" aria-label="Emoji picker">{emojis.map((emoji) => <button type="button" key={emoji} aria-label={`Insert ${emoji}`} onClick={() => setDraft((value) => `${value}${value && !value.endsWith(" ") ? " " : ""}${emoji}`)}>{emoji}</button>)}</div>}<button type="button" className="alpnile-chat-tool-button" aria-label="Add emoji" aria-expanded={emojiOpen} aria-controls="alpnile-chat-emoji-menu" onClick={() => setEmojiOpen((value) => !value)}>☺</button><button type="button" className="alpnile-chat-tool-button" aria-label="Attach image or file" title="Attach image or file" onClick={() => fileInputRef.current?.click()}>＋</button><input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.doc,.docx" hidden onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} /></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={1} placeholder={selectedFile ? selectedFile.name : "Write to the AlpNile team…"} aria-label="Message" /><button className="alpnile-chat-send" type="submit" disabled={sending || (!draft.trim() && !selectedFile)} aria-label="Send message">{sending ? "…" : "↗"}</button></form>{selectedFile && <p className="alpnile-chat-file-preview">Attached: {selectedFile.name} <button type="button" onClick={() => setSelectedFile(null)}>Remove</button></p>}{error && <p className="alpnile-chat-error" role="alert">{error}</p>}</>}
      </section>}
      {!hideLauncher && <button className={"alpnile-chat-launcher " + (open ? "open" : "")} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`${open ? "Close" : "Open"} support chat — Chat with AlpNile`}><span className="alpnile-chat-launcher-mark"><Image src="/chat/alpnile-chat-3d.webp" alt="" width={64} height={64} sizes="38px" /></span><span><strong>Need a hand?</strong><small>Chat with AlpNile</small></span><b aria-hidden="true">{open ? "×" : "↗"}</b></button>}
    </div>
  );
}

