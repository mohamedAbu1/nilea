"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deleteAdminNotifications, getAdminNotifications, markAdminNotificationsRead, type AdminNotification } from "../lib/admin-client";
import { listChatConversations, type ChatConversation } from "../lib/chat";

type Panel = "notifications" | "messages" | null;

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function notificationHref(item: AdminNotification) {
  const query = new URLSearchParams();
  if (item.entity_type === "conversation" && item.entity_id) {
    query.set("section", "inbox");
    query.set("conversation", item.entity_id);
  } else if (item.entity_type === "user" && item.user_id) {
    query.set("section", "users");
    query.set("user", item.user_id);
  } else if (item.event_type === "planner_complete") {
    query.set("section", "journeys");
  } else {
    query.set("section", "requests");
  }
  return `/admin?${query.toString()}`;
}

function NotificationIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 10.6a5.2 5.2 0 0 1 10.4 0v3.1l1.7 2.1H5.1l1.7-2.1z" /><path d="M9.8 18.2a2.4 2.4 0 0 0 4.4 0" /></svg>;
}

function MessageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 6.1h13.6v9.1H10l-4.8 3v-12z" /><path d="M8.2 10h7.6M8.2 13h5.1" /></svg>;
}

export default function AdminHeaderTools() {
  const [panel, setPanel] = useState<Panel>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openConversations = useMemo(() => conversations.filter((conversation) => ["open", "pending"].includes(conversation.status)), [conversations]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    const [notificationResult, conversationResult] = await Promise.all([getAdminNotifications().catch(() => null), listChatConversations()]);
    if (notificationResult) {
      setNotifications(notificationResult.rows);
      setUnreadNotifications(notificationResult.unread_count);
    }
    if (conversationResult.error) setError("Messages could not be loaded.");
    else setConversations(conversationResult.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const togglePanel = (next: Exclude<Panel, null>) => {
    setPanel((current) => current === next ? null : next);
    setError("");
  };

  const markAllRead = async () => {
    await markAdminNotificationsRead({ all: true });
    setNotifications((current) => current.map((item) => ({ ...item, is_read: 1 })));
    setUnreadNotifications(0);
  };

  const deleteNotification = async (id: string) => {
    await deleteAdminNotifications({ ids: [id] });
    const wasUnread = notifications.find((item) => item.id === id)?.is_read === 0;
    setNotifications((current) => current.filter((item) => item.id !== id));
    if (wasUnread) setUnreadNotifications((current) => Math.max(0, current - 1));
  };

  const openNotification = async (item: AdminNotification) => {
    if (!item.is_read) {
      await markAdminNotificationsRead({ ids: [item.id] });
      setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, is_read: 1 } : notification));
      setUnreadNotifications((current) => Math.max(0, current - 1));
    }
  };

  return <>
    <div className="site-admin-header-tools" aria-label="Admin updates">
      <button type="button" className={`site-admin-header-tool ${panel === "notifications" ? "active" : ""}`} onClick={() => togglePanel("notifications")} aria-label={`Open notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`} aria-expanded={panel === "notifications"}>
        <NotificationIcon />
        {unreadNotifications > 0 && <b>{unreadNotifications > 9 ? "9+" : unreadNotifications}</b>}
      </button>
      <button type="button" className={`site-admin-header-tool ${panel === "messages" ? "active" : ""}`} onClick={() => togglePanel("messages")} aria-label={`Open support messages${openConversations.length ? `, ${openConversations.length} open` : ""}`} aria-expanded={panel === "messages"}>
        <MessageIcon />
        {openConversations.length > 0 && <b>{openConversations.length > 9 ? "9+" : openConversations.length}</b>}
      </button>
    </div>
    {panel && <>
      <button type="button" className="site-admin-tools-backdrop" aria-label="Close admin updates" onClick={() => setPanel(null)} />
      <aside className="site-admin-tools-drawer" aria-label={panel === "notifications" ? "Admin notifications" : "Admin support messages"}>
        <div className="site-admin-tools-head">
          <div><span className="site-admin-tools-eyebrow">{panel === "notifications" ? "Operations pulse" : "Live support"}</span><h2>{panel === "notifications" ? "Notifications" : "Messages"}</h2><small>{loading ? "Refreshing…" : panel === "notifications" ? `${unreadNotifications} unread updates` : `${openConversations.length} open conversations`}</small></div>
          <button type="button" className="site-admin-tools-close" onClick={() => setPanel(null)} aria-label="Close">×</button>
        </div>
        {panel === "notifications" && <div className="site-admin-tools-actions"><button type="button" onClick={() => void markAllRead()}>Mark all read</button><button type="button" onClick={async () => { await deleteAdminNotifications({ all: true }); setNotifications([]); setUnreadNotifications(0); }}>Delete all</button></div>}
        {error && <p className="site-admin-tools-error">{error}</p>}
        <div className="site-admin-tools-list">
          {panel === "notifications" ? notifications.map((item) => <div className={`site-admin-update-row ${item.is_read ? "" : "unread"}`} key={item.id}>
            <Link href={notificationHref(item)} onClick={() => void openNotification(item)}><span className="site-admin-update-icon"><NotificationIcon /></span><span><strong>{item.title}</strong><small>{item.body}</small><time>{formatDate(item.created_at)}</time></span></Link>
            <button type="button" onClick={() => void deleteNotification(item.id)} aria-label={`Delete ${item.title}`}>×</button>
          </div>) : conversations.map((conversation) => <Link key={conversation.id} href={`/admin?section=inbox&conversation=${encodeURIComponent(conversation.id)}`} onClick={() => setPanel(null)} className="site-admin-message-row"><span className="site-admin-update-icon"><MessageIcon /></span><span><strong>{conversation.user_name || "Guest traveler"}</strong><small>{conversation.subject}</small><time>{conversation.status} · {formatDate(conversation.last_message_at)}</time></span></Link>)}
          {panel === "notifications" && !notifications.length && <div className="site-admin-tools-empty">You are all caught up.</div>}
          {panel === "messages" && !conversations.length && <div className="site-admin-tools-empty">No support conversations yet.</div>}
        </div>
      </aside>
    </>}
  </>;
}
