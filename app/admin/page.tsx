"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getSubmissionErrorMessage } from "../lib/submissions";
import {
  getChatAttachmentUrl,
  listChatConversations,
  listChatMessages,
  sendChatMessage,
  subscribeToChatConversation,
  updateConversationStatus,
  uploadChatAttachment,
  DEFAULT_CHAT_AVATAR,
  OFFICIAL_ADMIN_AVATAR,
  type ChatConversation,
  type ChatMessage,
  type ChatStatus,
} from "../lib/chat";
import { deleteAdminCatalog, deleteAdminNotifications, getAdminCatalog, getAdminCustomJourneys, getAdminManagedUsers, getAdminNotifications, getAdminProfiles, getAdminRates, getAdminRequests, getAdminSession, getAdminStats, getAdminUserFile, getAdminUsers, markAdminNotificationsRead, saveAdminCatalog, saveAdminRates, updateAdminStatus, updateAdminUserRole, type AdminCustomJourney, type AdminManagedUser, type AdminNotification, type AdminUserFile, type AdminUserSummary } from "../lib/admin-client";
import { getAuthSession, signOut } from "../lib/auth-client";
import { currencyOptions, type CurrencyCode, type ExchangeRate } from "../components/currency";
import { CurrencyCoin } from "../components/currency-coin";
import { parseCatalogMetadata, getStayGalleryDefaults, readCatalogGallery, readCatalogGalleryOverride } from "../lib/catalog-gallery";
import { getTourDetail, getTourGallery } from "../lib/tour-details";
import { getProductGallery } from "../market/catalog";
import { getVehicle } from "../travel-transport/vehicle-data";
import ChatAttachment from "../components/chat-attachment";

type AccessRole = "traveler" | "driver" | "property_owner" | "support" | "editor" | "admin";
type DashboardSection = "overview" | "inbox" | "requests" | "users" | "people" | "journeys" | "stays" | "trips" | "market" | "vehicles" | "currency";
type CatalogCollection = "stays" | "trips" | "products" | "vehicles";
type Row = Record<string, unknown>;

type RequestRow = {
  id: string;
  source: "inquiry" | "car" | "trip" | "stay";
  name: string;
  contact: string;
  summary: string;
  status: string;
  created_at: string;
  table: string;
};

type EditorState = {
  id: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  image_url: string;
  location_label: string;
  duration_label: string;
  stay_type: string;
  vehicle_type: string;
  price: string;
  stock_quantity: string;
  passenger_capacity: string;
  max_guests: string;
  is_active: boolean;
  is_featured: boolean;
  metadata: Record<string, unknown>;
  gallery_images: string[];
};

const navItems: { id: DashboardSection; label: string; caption: string; icon: string }[] = [
  { id: "overview", label: "Overview", caption: "Control room", icon: "⌂" },
  { id: "inbox", label: "Live inbox", caption: "Chat with guests", icon: "◌" },
  { id: "requests", label: "Requests", caption: "Bookings & leads", icon: "▣" },
  { id: "users", label: "User files", caption: "Insights & activity", icon: "◎" },
  { id: "people", label: "Users & roles", caption: "Access control", icon: "♙" },
  { id: "journeys", label: "Custom journeys", caption: "Trip builder requests", icon: "⌁" },
  { id: "stays", label: "Stays & homes", caption: "Properties", icon: "⌂" },
  { id: "trips", label: "Trips", caption: "Experiences", icon: "✦" },
  { id: "market", label: "Bazaar", caption: "Products", icon: "◇" },
  { id: "vehicles", label: "Vehicles", caption: "Fleet", icon: "▰" },
  { id: "currency", label: "Currencies", caption: "Exchange rates", icon: "¤" },
];

const collectionLabels: Record<CatalogCollection, string> = {
  stays: "Stays & homes",
  trips: "Trips & experiences",
  products: "Bazaar products",
  vehicles: "Private vehicles",
};

const statusOptions = ["new", "in_progress", "contacted", "quoted", "confirmed", "completed", "closed", "cancelled", "spam"];
const CATALOG_PAGE_SIZE = 6;

function textValue(row: Row, key: string) {
  return String(row[key] ?? "");
}
function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function recordLabel(record: Row, collection: CatalogCollection) {
  return textValue(record, collection === "trips" ? "title" : "name") || textValue(record, "slug") || "Untitled record";
}

function defaultCatalogGallery(record: Row, collection: CatalogCollection) {
  const slug = textValue(record, "slug");
  if (collection === "stays") return getStayGalleryDefaults(slug);
  if (collection === "trips") {
    const tour = getTourDetail(slug);
    return tour ? getTourGallery(tour).map((image) => image.src) : [];
  }
  if (collection === "products") return getProductGallery(slug);
  if (collection === "vehicles") return getVehicle(slug)?.images.map((image) => image.src) ?? [];
  return [];
}

function editorFromRecord(record: Row, collection: CatalogCollection): EditorState {
  const metadata = parseCatalogMetadata(record.metadata);
  const storedGallery = readCatalogGallery(record.metadata);
  const hasExplicitGallery = readCatalogGalleryOverride(record.metadata) !== null;
  const galleryImages = hasExplicitGallery || storedGallery.length ? storedGallery : defaultCatalogGallery(record, collection);
  return {
    id: textValue(record, "id"),
    slug: textValue(record, "slug"),
    name: textValue(record, "name"),
    title: textValue(record, "title"),
    description: textValue(record, "description"),
    image_url: textValue(record, "image_url"),
    location_label: textValue(record, "location_label"),
    duration_label: textValue(record, "duration_label"),
    stay_type: textValue(record, "stay_type") || "villa",
    vehicle_type: textValue(record, "vehicle_type") || "suv",
    price: textValue(record, collection === "products" ? "price" : collection === "vehicles" ? "price_from" : "price_from"),
    stock_quantity: textValue(record, "stock_quantity") || "0",
    passenger_capacity: textValue(record, "passenger_capacity") || "4",
    max_guests: textValue(record, "max_guests") || "4",
    is_active: Boolean(record.is_active ?? true),
    is_featured: Boolean(record.is_featured ?? false),
    metadata,
    gallery_images: galleryImages,
  };
}

function blankEditor(collection: CatalogCollection): EditorState {
  return editorFromRecord({
    slug: "",
    name: collection === "vehicles" ? "New vehicle" : collection === "products" ? "New product" : "New listing",
    title: collection === "trips" ? "New experience" : "",
    description: "",
    is_active: true,
    is_featured: false,
  }, collection);
}

function editorGalleryPreview(editor: EditorState) {
  return editor.gallery_images.length ? editor.gallery_images : editor.image_url.trim() ? [editor.image_url.trim()] : [];
}

function chatPreview(messages: ChatMessage[]) {
  const last = messages[messages.length - 1];
  return last?.body || last?.attachment_name || "No messages yet";
}

function objectValue(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch { return {}; }
  }
  return {};
}

export default function AdminPage() {
  const [section, setSection] = useState<DashboardSection>("overview");
  const [role, setRole] = useState<AccessRole | "">("");
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [catalog, setCatalog] = useState<Row[]>([]);
  const [catalogCollection, setCatalogCollection] = useState<CatalogCollection>("stays");
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatUserNames, setChatUserNames] = useState<Record<string, string>>({});
  const [chatUserAvatars, setChatUserAvatars] = useState<Record<string, string>>({});
  const [currencyRows, setCurrencyRows] = useState<ExchangeRate[]>(currencyOptions);
  const [currencyDrafts, setCurrencyDrafts] = useState<Record<CurrencyCode, string>>(() => Object.fromEntries(currencyOptions.map((row) => [row.currency_code, String(row.rate_to_usd)])) as Record<CurrencyCode, string>);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userFile, setUserFile] = useState<AdminUserFile | null>(null);
  const [userFileLoading, setUserFileLoading] = useState(false);
  const [managedUsers, setManagedUsers] = useState<AdminManagedUser[]>([]);
  const [customJourneys, setCustomJourneys] = useState<AdminCustomJourney[]>([]);
  const [managedUserSearch, setManagedUserSearch] = useState("");
  const [roleSavingId, setRoleSavingId] = useState("");

  const selectedConversation = conversations.find((item) => item.id === selectedConversationId) ?? null;
  const canEditCatalog = role === "admin" || role === "editor";
  const canManageRates = role === "admin";
  const catalogPageCount = Math.max(1, Math.ceil(catalog.length / CATALOG_PAGE_SIZE));
  const pagedCatalog = catalog.slice((catalogPage - 1) * CATALOG_PAGE_SIZE, catalogPage * CATALOG_PAGE_SIZE);
  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) => `${user.full_name} ${user.email} ${user.phone ?? ""}`.toLowerCase().includes(needle));
  }, [users, userSearch]);
  const visibleNavItems = useMemo(() => role === "support" ? navItems.filter((item) => ["overview", "inbox", "requests"].includes(item.id)) : role === "editor" ? navItems.filter((item) => !["currency", "users", "people", "journeys"].includes(item.id)) : role === "admin" ? navItems.filter((item) => isSuperAdminUser || !["people", "journeys"].includes(item.id)) : navItems.filter((item) => !["users", "people", "journeys"].includes(item.id)), [isSuperAdminUser, role]);

  const loadNotifications = async () => {
    try {
      const result = await getAdminNotifications();
      setNotifications(result.rows);
      setUnreadNotifications(result.unread_count);
    } catch (error) {
      setError(getSubmissionErrorMessage(error, "Notifications could not be loaded."));
    }
  };

  const loadUsers = async (force = false) => {
    if (!force && role !== "admin") return;
    try { setUsers(await getAdminUsers()); }
    catch (error) { setError(getSubmissionErrorMessage(error, "User files could not be loaded.")); }
  };

  const loadManagedUsers = async (allowed = isSuperAdminUser) => {
    if (!allowed) return;
    try { setManagedUsers(await getAdminManagedUsers()); }
    catch (error) { setError(getSubmissionErrorMessage(error, "User roles could not be loaded.")); }
  };

  const loadCustomJourneys = async () => {
    try { setCustomJourneys(await getAdminCustomJourneys()); }
    catch (error) { setError(getSubmissionErrorMessage(error, "Custom journeys could not be loaded.")); }
  };

  const loadUserFile = async (id: string) => {
    setSelectedUserId(id);
    setUserFileLoading(true);
    try { setUserFile(await getAdminUserFile(id)); }
    catch (error) { setError(getSubmissionErrorMessage(error, "The user file could not be loaded.")); }
    setUserFileLoading(false);
  };

  const markAllNotificationsRead = async () => {
    try { await markAdminNotificationsRead({ all: true }); setNotifications((current) => current.map((item) => ({ ...item, is_read: 1 }))); setUnreadNotifications(0); }
    catch (error) { setError(getSubmissionErrorMessage(error, "Notifications could not be updated.")); }
  };

  const loadRequests = async () => {
    const rows = await getAdminRequests();
    setRequests(rows.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
    setStats((current) => ({ ...current, requests: rows.filter((row) => ["new", "in_progress", "contacted"].includes(row.status)).length }));
  };

  const loadStats = async () => {
    setStats(await getAdminStats());
  };

  const loadConversations = async (preferredId?: string) => {
    const result = await listChatConversations();
    if (result.error) {
      setError(getSubmissionErrorMessage(result.error, "The inbox could not be loaded."));
      return;
    }
    const items = result.data ?? [];
    setConversations(items);
    setSelectedConversationId((current) => preferredId && items.some((item) => item.id === preferredId) ? preferredId : items.some((item) => item.id === current) ? current : items[0]?.id ?? "");
    if (items.length) {
      const ids = Array.from(new Set(items.map((item) => item.user_id)));
      const names = await getAdminProfiles(ids);
      setChatUserNames(Object.fromEntries(items.map((item) => [item.user_id, item.user_name || names[item.user_id] || "Guest traveler"])));
      setChatUserAvatars(Object.fromEntries(items.map((item) => [item.user_id, item.user_avatar || DEFAULT_CHAT_AVATAR])));
    }
  };

  const loadCatalog = async (collection: CatalogCollection) => {
    setCatalogLoading(true);
    setCatalogPage(1);
    try { setCatalog(await getAdminCatalog(collection) as Row[]); }
    catch (error) { setError(getSubmissionErrorMessage(error, "This catalog could not be loaded.")); }
    setCatalogLoading(false);
  };

  const loadCurrencyRates = async () => {
    let rows: ExchangeRate[];
    try { rows = await getAdminRates(); }
    catch (error) { setError(getSubmissionErrorMessage(error, "Exchange rates could not be loaded.")); return; }
    const normalized = currencyOptions.map((fallback) => rows.find((row) => row.currency_code === fallback.currency_code) ?? fallback);
    setCurrencyRows(normalized);
    setCurrencyDrafts(Object.fromEntries(normalized.map((row) => [row.currency_code, String(row.rate_to_usd)])) as Record<CurrencyCode, string>);
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const identity = await getAdminSession();
        if (!active) return;
        setProfileName(identity.user.name || identity.user.email || "AlpNile team");
        setRole(identity.user.accessRole as AccessRole);
        setIsSuperAdminUser(identity.is_super_admin);
        setCheckingAccess(false);
        await Promise.all([loadStats(), loadRequests(), loadConversations(), loadCurrencyRates(), loadNotifications(), loadUsers(true), loadManagedUsers(identity.is_super_admin), loadCustomJourneys()]);
      } catch (error) {
        if (!active) return;
        setAccessError(getSubmissionErrorMessage(error, "Sign in with a staff account to enter the control room."));
        setCheckingAccess(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (checkingAccess) return;
    const params = new URLSearchParams(window.location.search);
    const requestedSection = params.get("section") as DashboardSection | null;
    if (requestedSection && navItems.some((item) => item.id === requestedSection)) setSection(requestedSection);
    const conversationId = params.get("conversation");
    if (conversationId) void loadConversations(conversationId);
    const userId = params.get("user");
    if (userId) void loadUserFile(userId);
  }, [checkingAccess]);

  useEffect(() => {
    if (!role || !["stays", "trips", "market", "vehicles"].includes(section)) return;
    const collection = section === "market" ? "products" : section;
    setCatalogCollection(collection as CatalogCollection);
    void loadCatalog(collection as CatalogCollection);
  }, [section, role]);

  useEffect(() => {
    setCatalogPage((current) => Math.min(current, catalogPageCount));
  }, [catalogPageCount]);

  useEffect(() => {
    if (!selectedConversationId) return;
    let active = true;
    let unsubscribe: () => void = () => undefined;
    void (async () => {
      const result = await listChatMessages(selectedConversationId);
      if (!active) return;
      setChatMessages(result.data ?? []);
      unsubscribe = subscribeToChatConversation(selectedConversationId, (message) => {
        setChatMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      });
    })();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (section !== "inbox" || !["support", "editor", "admin"].includes(role)) return;
    const timer = window.setInterval(() => {
      void listChatConversations().then((result) => {
        if (result.data) setConversations(result.data);
      });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [role, section]);

  const updateRequestStatus = async (row: RequestRow, status: string) => {
    setError("");
    try { await updateAdminStatus(row.table, row.id, status); }
    catch (error) { setError(getSubmissionErrorMessage(error, "The status could not be updated.")); return; }
    setRequests((current) => current.map((item) => item.id === row.id && item.table === row.table ? { ...item, status } : item));
    setNotice("Request status updated.");
  };

  const saveCatalog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || !canEditCatalog) return;
    setError("");
    const base: Row = {
      slug: editor.slug.trim(),
      description: editor.description.trim(),
      image_url: editor.image_url.trim() || null,
      metadata: JSON.stringify({ ...editor.metadata, galleryImages: editor.gallery_images.map((image) => image.trim()).filter(Boolean) }),
      is_active: editor.is_active,
      is_featured: editor.is_featured,
    };
    if (catalogCollection === "trips") Object.assign(base, { title: editor.title.trim(), location_label: editor.location_label.trim() || "Egypt", duration_label: editor.duration_label.trim() || "Curated route" });
    if (catalogCollection === "stays") Object.assign(base, { name: editor.name.trim(), location_label: editor.location_label.trim() || "Egypt", stay_type: editor.stay_type, max_guests: Number(editor.max_guests) || null });
    if (catalogCollection === "products") Object.assign(base, { name: editor.name.trim(), price: Number(editor.price) || 0, stock_quantity: Number(editor.stock_quantity) || 0, currency: "USD" });
    if (catalogCollection === "vehicles") Object.assign(base, { name: editor.name.trim(), vehicle_type: editor.vehicle_type, passenger_capacity: Number(editor.passenger_capacity) || 1, price_from: Number(editor.price) || 0, currency: "USD", with_driver: true });
    try { await saveAdminCatalog(catalogCollection, editor.id, base); }
    catch (error) { setError(getSubmissionErrorMessage(error, "The catalog record could not be saved.")); return; }
    setNotice("Catalog changes saved.");
    setEditor(null);
    await loadCatalog(catalogCollection);
  };

  const archiveCatalogRecord = async (record: Row) => {
    if (role !== "admin") return;
    const label = recordLabel(record, catalogCollection);
    if (!window.confirm(`Hide “${label}” from the public catalogue?`)) return;
    try { await deleteAdminCatalog(catalogCollection, textValue(record, "id")); }
    catch (error) { setError(getSubmissionErrorMessage(error, "The catalogue record could not be removed.")); return; }
    setNotice(`${label} was archived and hidden from the public site.`);
    await loadCatalog(catalogCollection);
  };

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedConversation || !chatDraft.trim() && !chatFile) return;
    const identity = await getAuthSession();
    if (!identity?.user) return;
    setChatSending(true);
    setError("");
    let attachmentPath = "";
    if (chatFile) {
      const upload = await uploadChatAttachment(selectedConversation.user_id, selectedConversation.id, chatFile);
      if (upload.error || !upload.data) {
        setError(getSubmissionErrorMessage(upload.error, upload.error?.message ?? "The file could not be uploaded."));
        setChatSending(false);
        return;
      }
      attachmentPath = upload.data.path;
    }
    const result = await sendChatMessage({
      conversationId: selectedConversation.id,
      senderId: identity.user.id,
      senderRole: "staff",
      body: chatDraft.trim(),
      messageType: chatFile ? (chatFile.type.startsWith("image/") ? "image" : "file") : "text",
      attachmentPath: attachmentPath || undefined,
      attachmentName: chatFile?.name,
      attachmentMime: chatFile?.type,
      attachmentSize: chatFile?.size,
    });
    if (result.error || !result.data) {
      setError(getSubmissionErrorMessage(result.error, "The reply could not be sent."));
      setChatSending(false);
      return;
    }
    const sentMessage = result.data.attachment_path
      ? { ...result.data, attachment_url: (await getChatAttachmentUrl(result.data.attachment_path)).data ?? undefined }
      : result.data;
    setChatMessages((current) => current.some((item) => item.id === sentMessage.id) ? current : [...current, sentMessage]);
    setChatDraft("");
    setChatFile(null);
    setChatSending(false);
    await loadConversations();
  };

  const changeChatStatus = async (status: ChatStatus) => {
    if (!selectedConversation) return;
    const result = await updateConversationStatus(selectedConversation.id, status);
    if (result.error) {
      setError(getSubmissionErrorMessage(result.error, "The conversation status could not be updated."));
      return;
    }
    setConversations((current) => current.map((item) => item.id === selectedConversation.id ? { ...item, status } : item));
    setNotice("Conversation status updated.");
  };

  const openActivity = (event: Row) => {
    const eventType = textValue(event, "event_type");
    const entityType = textValue(event, "entity_type");
    const slug = textValue(event, "entity_slug");
    if (eventType === "planner_complete") {
      setSection("journeys");
      void loadCustomJourneys();
      return;
    }
    if (entityType === "conversation" || eventType.includes("message")) {
      setSection("inbox");
      void loadConversations(textValue(event, "entity_id"));
      return;
    }
    if (["inquiry", "trip_booking", "stay_booking", "car_booking", "review"].includes(entityType) || ["inquiry", "booking", "review"].includes(eventType)) {
      setSection("requests");
      void loadRequests();
      return;
    }
    const route = entityType === "trip" ? `/tours-experiences/${encodeURIComponent(slug)}` : entityType === "product" ? `/market/${encodeURIComponent(slug)}` : entityType === "vehicle" ? `/travel-transport/${encodeURIComponent(slug)}` : entityType === "stay" ? `/stays-hotels?stay=${encodeURIComponent(slug)}` : "";
    if (route) window.open(route, "_blank", "noopener,noreferrer");
  };

  const openNotification = async (item: AdminNotification) => {
    if (!item.is_read) {
      await markAdminNotificationsRead({ ids: [item.id] });
      setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, is_read: 1 } : notification));
      setUnreadNotifications((current) => Math.max(0, current - 1));
    }
    if (item.entity_type === "user" && item.user_id) {
      setSection("users");
      await loadUsers(true);
      await loadUserFile(item.user_id);
    } else if (item.entity_type === "conversation") {
      setSection("inbox");
      await loadConversations(item.entity_id ?? undefined);
    } else if (["review", "inquiry", "trip_booking", "stay_booking", "car_booking"].includes(item.entity_type ?? "")) {
      setSection("requests");
      await loadRequests();
    } else if (item.event_type === "planner_complete") {
      setSection("journeys");
      await loadCustomJourneys();
    }
    setNotificationOpen(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteAdminNotifications({ ids: [id] });
      setNotifications((current) => current.filter((item) => item.id !== id));
      setUnreadNotifications((current) => Math.max(0, current - (notifications.find((item) => item.id === id)?.is_read ? 0 : 1)));
    } catch (error) { setError(getSubmissionErrorMessage(error, "The notification could not be deleted.")); }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("Delete all notifications from the operations panel?")) return;
    try {
      await deleteAdminNotifications({ all: true });
      setNotifications([]);
      setUnreadNotifications(0);
    } catch (error) { setError(getSubmissionErrorMessage(error, "Notifications could not be deleted.")); }
  };

  const saveUserRole = async (user: AdminManagedUser, accessRole: string) => {
    if (!isSuperAdminUser || user.email.toLowerCase() === "mohamedahmed33m11@gmail.com") return;
    setRoleSavingId(user.id);
    try {
      await updateAdminUserRole(user.id, accessRole);
      setManagedUsers((current) => current.map((item) => item.id === user.id ? { ...item, access_role: accessRole, account_type: ["driver", "property_owner"].includes(accessRole) ? "provider" : ["support", "editor", "admin"].includes(accessRole) ? "staff" : "user", provider_role: ["driver", "property_owner"].includes(accessRole) ? accessRole : null, approval_status: ["driver", "property_owner"].includes(accessRole) ? "approved" : item.approval_status } : item));
      setNotice(`${user.full_name || user.email} role updated.`);
    } catch (error) { setError(getSubmissionErrorMessage(error, "The user role could not be updated.")); }
    setRoleSavingId("");
  };

  const filteredManagedUsers = useMemo(() => {
    const needle = managedUserSearch.trim().toLowerCase();
    if (!needle) return managedUsers;
    return managedUsers.filter((user) => `${user.full_name} ${user.email} ${user.access_role} ${user.provider_role ?? ""}`.toLowerCase().includes(needle));
  }, [managedUserSearch, managedUsers]);

  const saveCurrencyRates = async () => {
    if (!canManageRates) return;
    setError("");
    const updates = currencyRows.map((row) => ({
      currency_code: row.currency_code,
      currency_name: row.currency_name,
      symbol: row.symbol,
      rate_to_usd: Number(currencyDrafts[row.currency_code]),
      decimal_digits: row.decimal_digits,
      is_active: row.is_active,
    }));
    if (updates.some((row) => !Number.isFinite(row.rate_to_usd) || row.rate_to_usd <= 0)) {
      setError("Every exchange rate must be a number greater than zero.");
      return;
    }
    try { await saveAdminRates(updates); }
    catch (error) { setError(getSubmissionErrorMessage(error, "Exchange rates could not be saved.")); return; }
    setNotice("Exchange rates updated for the whole site.");
    await loadCurrencyRates();
  };

  if (checkingAccess) return <main className="admin-page"><div className="admin-loading">Opening AlpNile control room…</div></main>;
  if (accessError) return <main className="admin-page"><div className="admin-access-card"><span>✦</span><p className="admin-eyebrow">AlpNile / private area</p><h1>Control room access</h1><p>{accessError}</p><Link href="/" className="admin-button admin-button-secondary">Back to AlpNile</Link></div></main>;

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <Link href="/" className="admin-brand"><span>✦</span><strong>AlpNile</strong><small>Control room</small></Link>
          <div className="admin-sidebar-user"><span className="admin-avatar">{profileName.slice(0, 1).toUpperCase()}</span><div><strong>{profileName}</strong><small>{role}</small></div></div>
          <nav className="admin-nav" aria-label="Admin navigation">{visibleNavItems.map((item) => <button key={item.id} type="button" className={section === item.id ? "active" : ""} onClick={() => { setSection(item.id); setNotice(""); setError(""); }}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.caption}</small>{item.id === "inbox" && stats.chat_conversations ? <b>{stats.chat_conversations}</b> : null}</button>)}</nav>
          <div className="admin-sidebar-footer"><Link href="/admin/providers">Provider operations ↗</Link><Link href="/">View live site ↗</Link><button type="button" onClick={() => void signOut()}>Sign out</button></div>
        </aside>
        <section className="admin-content">
          <header className="admin-topbar"><div><p className="admin-eyebrow">ALPNILE / OPERATIONS</p><h1>{navItems.find((item) => item.id === section)?.label}</h1></div><div className="admin-topbar-actions"><span className="admin-live-dot" /> Live workspace <button type="button" className={"admin-notification-trigger " + (notificationOpen ? "active" : "")} onClick={() => setNotificationOpen((current) => !current)} aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}><span className="admin-notification-icon">♢</span>{unreadNotifications > 0 && <b>{unreadNotifications > 9 ? "9+" : unreadNotifications}</b>}</button><Link href="/travel-transport">Open customer view ↗</Link></div>{notificationOpen && <><button type="button" className="admin-notification-backdrop" aria-label="Close notifications" onClick={() => setNotificationOpen(false)} /><aside className="admin-notification-drawer" aria-label="Operations notifications"><div className="admin-panel-head"><div><p className="admin-eyebrow">Operations pulse</p><h3>Notifications</h3><small>{unreadNotifications ? `${unreadNotifications} unread` : "All caught up"}</small></div><div className="admin-notification-drawer-actions"><button type="button" onClick={() => void markAllNotificationsRead()}>Mark all read</button><button type="button" className="admin-danger-button" onClick={() => void deleteAllNotifications()}>Delete all</button><button type="button" aria-label="Close notifications" onClick={() => setNotificationOpen(false)}>×</button></div></div>{notifications.length ? notifications.map((item) => <div className={"admin-notification-row " + (!item.is_read ? "unread" : "")} key={item.id}><button type="button" className="admin-notification-row-main" onClick={() => void openNotification(item)}><span className="admin-notification-row-icon">✦</span><span><strong>{item.title}</strong><small>{item.body}</small><time>{formatDate(item.created_at)}</time></span></button><button type="button" className="admin-notification-delete" onClick={() => void deleteNotification(item.id)} aria-label={`Delete ${item.title}`}>×</button></div>) : <div className="admin-empty">You are all caught up.</div>}</aside></>}</header>
          {(notice || error) && <div className={error ? "admin-flash error" : "admin-flash"} role={error ? "alert" : "status"}>{error || notice}<button type="button" onClick={() => { setError(""); setNotice(""); }}>×</button></div>}

          {section === "overview" && <section className="admin-overview">
            <div className="admin-welcome"><div><p className="admin-eyebrow">Operations intelligence</p><h2>Know every guest before the next reply.</h2><p>Review customer intent, open requests, unread alerts and the catalogue signals that shape better recommendations.</p></div><button type="button" className="admin-button" onClick={() => { setSection("users"); void loadUsers(); }}>Open user files ↗</button></div>
            <div className="admin-stat-grid">{[{label:"Open requests",value:stats.requests ?? 0,detail:"Need a reply",tone:"gold"},{label:"Unread alerts",value:stats.unread_notifications ?? unreadNotifications,detail:"New activity",tone:"teal"},{label:"Active travelers",value:stats.customers ?? 0,detail:"Customer files",tone:"blue"},{label:"Bookings · 30 days",value:stats.recent_bookings ?? 0,detail:"Recent intent",tone:"purple"}].map((item) => <article className={"admin-stat-card " + item.tone} key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></article>)}</div>
            <div className="admin-overview-grid"><div className="admin-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Guest pulse</p><h3>Recent requests</h3></div><button type="button" onClick={() => setSection("requests")}>View all ↗</button></div>{requests.slice(0, 5).map((row) => <div className="admin-request-row" key={row.table + row.id}><span className={"admin-request-type " + row.source}>{row.source}</span><div><strong>{row.name}</strong><small>{row.summary}</small></div><select value={row.status} onChange={(event) => void updateRequestStatus(row, event.target.value)} aria-label={"Update status for " + row.name}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></div>)}{!requests.length && <div className="admin-empty">No requests yet.</div>}</div><div className="admin-panel admin-quick-panel"><p className="admin-eyebrow">Quick actions</p><h3>Shape the next moment.</h3><button type="button" onClick={() => { setSection("inbox"); void loadConversations(); }}>Reply to guests <span>↗</span></button><button type="button" onClick={() => { setSection("trips"); setEditor(null); }}>Edit experiences <span>↗</span></button><button type="button" onClick={() => { setSection("vehicles"); setEditor(null); }}>Update the fleet <span>↗</span></button></div></div>
          </section>}

          {section === "requests" && <section className="admin-panel admin-full-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Guest operations</p><h2>Every request, one clear next step.</h2></div><button type="button" onClick={() => { void loadRequests(); void loadStats(); }}>Refresh ↻</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Guest</th><th>Route / request</th><th>Contact</th><th>Type</th><th>Status</th><th>Received</th></tr></thead><tbody>{requests.map((row) => <tr key={row.table + row.id}><td><strong>{row.name}</strong></td><td>{row.summary}</td><td>{row.contact}</td><td><span className={"admin-request-type " + row.source}>{row.source}</span></td><td><select value={row.status} onChange={(event) => void updateRequestStatus(row, event.target.value)} aria-label={"Update status for " + row.name}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></td><td>{formatDate(row.created_at)}</td></tr>)}</tbody></table></div>{!requests.length && <div className="admin-empty">No requests found.</div>}</section>}

          {section === "inbox" && <section className="admin-inbox"><div className="admin-inbox-list admin-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Live support</p><h2>Guest inbox</h2></div><button type="button" onClick={() => void loadConversations()}>Refresh ↻</button></div>{conversations.map((conversation) => <button type="button" key={conversation.id} className={"admin-conversation-row " + (selectedConversationId === conversation.id ? "active" : "")} onClick={() => setSelectedConversationId(conversation.id)}><img className="admin-avatar-image" src={conversation.user_avatar || chatUserAvatars[conversation.user_id] || DEFAULT_CHAT_AVATAR} alt="" /><span><strong>{chatUserNames[conversation.user_id] || conversation.user_name || "Guest traveler"}</strong><small>{conversation.subject}</small><em>{conversation.status}</em></span><time>{formatDate(conversation.last_message_at)}</time></button>)}{!conversations.length && <div className="admin-empty">No chat channels yet. New conversations will appear here.</div>}</div><div className="admin-chat-panel admin-panel">{selectedConversation ? <><div className="admin-panel-head"><div><p className="admin-eyebrow">Conversation</p><h2>{chatUserNames[selectedConversation.user_id] || selectedConversation.user_name || "Guest traveler"}</h2><small>Official AlpNile support · {selectedConversation.id}</small></div><select value={selectedConversation.status} onChange={(event) => void changeChatStatus(event.target.value as ChatStatus)} aria-label="Conversation status">{(["open", "pending", "resolved", "closed"] as ChatStatus[]).map((status) => <option key={status}>{status}</option>)}</select></div><div className="admin-chat-messages">{chatMessages.map((message) => { const isStaff = message.sender_role === "staff"; const avatar = isStaff ? OFFICIAL_ADMIN_AVATAR : message.sender_avatar || chatUserAvatars[selectedConversation.user_id] || DEFAULT_CHAT_AVATAR; return <article key={message.id} className={"admin-chat-message " + (isStaff ? "staff" : "guest")}><img className="admin-chat-avatar" src={avatar} alt="" /><div><small className="admin-chat-message-author" dir="auto">{isStaff ? "AlpNile support" : message.sender_name || chatUserNames[selectedConversation.user_id] || "Guest traveler"}</small>{message.body && <p dir="auto">{message.body}</p>}<ChatAttachment message={message} imageClassName="admin-chat-attachment-image" fileClassName="admin-chat-file" /><time>{formatDate(message.created_at)}</time></div></article>; })}</div><form className="admin-chat-composer" onSubmit={sendReply}><textarea rows={2} value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Reply with care…" aria-label="Reply message" /><div><label className="admin-attach-button">Attach file<input type="file" accept="image/*,.pdf,.txt,.doc,.docx" hidden onChange={(event) => setChatFile(event.target.files?.[0] ?? null)} /></label><span>{chatFile?.name || "Images and files up to 10 MB"}</span><button type="submit" className="admin-button" disabled={chatSending}>{chatSending ? "Sending…" : "Send reply ↗"}</button></div></form></> : <div className="admin-empty">Select a conversation to reply.</div>}</div></section>}

          {section === "users" && role === "admin" && <section className="admin-user-files"><div className="admin-user-list admin-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Customer intelligence</p><h2>User files</h2><p>Meaningful activity only: searches, views, saves, bookings, purchases, reviews and support conversations.</p></div><button type="button" onClick={() => void loadUsers(true)}>Refresh ↻</button></div><label className="admin-user-search"><span>⌕</span><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search by name, email or phone" /></label><div className="admin-user-list-rows">{filteredUsers.map((user) => <button type="button" key={user.id} className={"admin-user-row " + (selectedUserId === user.id ? "active" : "")} onClick={() => void loadUserFile(user.id)}><span className="admin-avatar">{(user.full_name || "T").slice(0, 1).toUpperCase()}</span><span><strong>{user.full_name}</strong><small>{user.email}</small><em>{user.last_activity_at ? `Active ${formatDate(user.last_activity_at)}` : `Joined ${formatDate(user.created_at)}`}</em></span><b>{user.event_count}<small>events</small></b></button>)}{!filteredUsers.length && <div className="admin-empty">No traveler files match this search.</div>}</div></div><div className="admin-user-detail admin-panel">{userFileLoading ? <div className="admin-empty">Opening the customer file…</div> : userFile ? <><div className="admin-panel-head"><div><p className="admin-eyebrow">Private customer file</p><h2>{String(userFile.user.full_name ?? "Traveler")}</h2><p>{String(userFile.user.email ?? "")} · {String(userFile.user.phone ?? "No phone")}</p></div><span className="admin-user-role">Traveler</span></div><div className="admin-user-metrics"><article><strong>{userFile.events.length}</strong><small>Tracked events</small></article><article><strong>{userFile.bookings.length}</strong><small>Bookings</small></article><article><strong>{userFile.orders.length}</strong><small>Purchases</small></article><article><strong>{userFile.conversations.length}</strong><small>Chats</small></article></div><div className="admin-user-section"><p className="admin-eyebrow">Interests detected</p><div className="admin-interest-tags">{userFile.interests.map((interest) => <span key={`${String(interest.entity_type)}-${String(interest.entity_slug)}`}>{String(interest.entity_slug)} · {String(interest.count)}</span>)}{!userFile.interests.length && <span>No repeated interest yet</span>}</div><p className="admin-user-preferences">Budget: {String(userFile.preferences?.budget_level ?? "not set")} · Cities: {String(userFile.preferences?.preferred_cities ?? "not set")} · Styles: {String(userFile.preferences?.trip_styles ?? "not set")}</p></div><div className="admin-user-section"><p className="admin-eyebrow">Recent activity</p><div className="admin-activity-list">{userFile.events.slice(0, 12).map((event) => <button type="button" className="admin-activity-row" key={String(event.id)} onClick={() => openActivity(event)}><span className="admin-activity-dot" /><span><strong>{String(event.event_type)}</strong><small>{String(event.entity_slug || event.search_query || event.entity_type || "site")}</small></span><time>{formatDate(String(event.occurred_at))}</time></button>)}{!userFile.events.length && <div className="admin-empty">Activity will appear as the traveler uses the site.</div>}</div></div><div className="admin-user-section"><p className="admin-eyebrow">Journey history</p><div className="admin-activity-list">{userFile.bookings.slice(0, 6).map((booking) => <div key={String(booking.id)}><span className="admin-activity-dot gold" /><span><strong>{String(booking.source)} · {String(booking.label)}</strong><small>{String(booking.status)} · {String(booking.guests)} guests</small></span><time>{formatDate(String(booking.created_at))}</time></div>)}{userFile.orders.slice(0, 4).map((order) => <div key={String(order.id)}><span className="admin-activity-dot teal" /><span><strong>Purchase · {String(order.delivery_country)}</strong><small>{String(order.status)}</small></span><time>{formatDate(String(order.created_at))}</time></div>)}{!userFile.bookings.length && !userFile.orders.length && <div className="admin-empty">No bookings or purchases yet.</div>}</div></div></> : <div className="admin-empty">Select a traveler to open the full customer file.</div>}</div></section>}

          {section === "people" && isSuperAdminUser && <section className="admin-panel admin-full-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Primary administrator</p><h2>Users & roles</h2><p>Assign controlled access for travelers, drivers, property owners and staff. The primary administrator account is protected.</p></div><button type="button" onClick={() => void loadManagedUsers(true)}>Refresh ↻</button></div><label className="admin-user-search"><span>⌕</span><input value={managedUserSearch} onChange={(event) => setManagedUserSearch(event.target.value)} placeholder="Search users by name, email or role" /></label><div className="admin-managed-users"><table className="admin-table"><thead><tr><th>User</th><th>Current role</th><th>Provider status</th><th>Last seen</th><th>Change access</th></tr></thead><tbody>{filteredManagedUsers.map((managedUser) => { const protectedUser = managedUser.email.toLowerCase() === "mohamedahmed33@gmail.com"; return <tr key={managedUser.id}><td><strong>{managedUser.full_name || "Unnamed user"}</strong><small>{managedUser.email}</small></td><td><span className="admin-role-pill">{managedUser.access_role}</span></td><td>{managedUser.provider_role ? `${managedUser.provider_role} · ${managedUser.approval_status || "pending"}` : managedUser.account_type}</td><td>{managedUser.last_seen_at ? formatDate(managedUser.last_seen_at) : "—"}</td><td>{protectedUser ? <span className="admin-protected-role">Primary admin</span> : <select className="admin-role-select" value={managedUser.access_role} disabled={roleSavingId === managedUser.id} onChange={(event) => void saveUserRole(managedUser, event.target.value)} aria-label={`Change role for ${managedUser.email}`}><option value="traveler">Traveler</option><option value="driver">Driver</option><option value="property_owner">Property owner</option><option value="support">Support admin</option><option value="editor">Content editor</option><option value="admin">Administrator</option></select>}</td></tr>; })}</tbody></table>{!filteredManagedUsers.length && <div className="admin-empty">No users match this search.</div>}</div></section>}

          {section === "journeys" && <section className="admin-panel admin-full-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Trip builder intelligence</p><h2>Custom journeys</h2><p>Review every personalized route with the traveler’s dates, preferences, destinations and selected transport details.</p></div><button type="button" onClick={() => void loadCustomJourneys()}>Refresh ↻</button></div><div className="admin-journey-grid">{customJourneys.map((journey) => { const metadata = objectValue(journey.metadata); const dayPlans = Array.isArray(metadata.dayPlans) ? metadata.dayPlans as Array<Record<string, unknown>> : []; const destinations = Array.isArray(metadata.destinations) ? metadata.destinations.map(String).join(" · ") : "No destinations selected"; return <article className="admin-journey-card" key={journey.id}><div className="admin-journey-card-head"><div><p className="admin-eyebrow">{journey.full_name}</p><h3>{journey.email}</h3></div><time>{formatDate(journey.occurred_at)}</time></div><div className="admin-journey-summary"><span><strong>{String(metadata.duration ?? (dayPlans.length || "—"))}</strong>days</span><span><strong>{String(metadata.travelers ?? "—")}</strong>travelers</span><span><strong>{String(metadata.selectedStyle ?? "—")}</strong>style</span><span><strong>{String(metadata.startDate ?? "—")}</strong>start</span></div><p className="admin-journey-destinations">{destinations}</p><div className="admin-journey-days">{dayPlans.slice(0, 6).map((day, index) => <div key={`${journey.id}-${index}`}><span>Day {index + 1}</span><strong>{String(day.destinationId ?? "Destination")}</strong><small>Vehicle: {String(day.vehicleId ?? "not selected")} · Guide: {String(day.guideId ?? "not selected")}</small><small>Landmarks: {Array.isArray(day.landmarkIds) ? day.landmarkIds.length : 0} · Experiences: {Array.isArray(day.experienceIds) ? day.experienceIds.length : 0}</small></div>)}</div></article>; })}{!customJourneys.length && <div className="admin-empty">No custom journeys have been built yet.</div>}</div></section>}

          {section === "currency" && <section className="admin-panel admin-full-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Pricing intelligence</p><h2>Exchange rate studio</h2><p>Set one controlled rate and every displayed catalog price updates without changing your base prices.</p></div><div className="admin-panel-head-actions"><button type="button" onClick={() => void loadCurrencyRates()}>Refresh ↻</button>{canManageRates && <button type="button" className="admin-button" onClick={() => void saveCurrencyRates()}>Save rates</button>}</div></div><div className="admin-rate-layout"><div className="admin-rate-table">{currencyRows.map((row) => <label className="admin-rate-row" key={row.currency_code}><CurrencyCoin code={row.currency_code} /><span className="admin-rate-code">{row.currency_code}</span><span className="admin-rate-name"><strong>{row.currency_name}</strong><small>1 USD equals</small></span><input type="number" min="0.000001" step="0.000001" value={currencyDrafts[row.currency_code] ?? row.rate_to_usd} disabled={!canManageRates} onChange={(event) => setCurrencyDrafts((current) => ({ ...current, [row.currency_code]: event.target.value }))} aria-label={`${row.currency_code} rate per US dollar`} /><span className="admin-rate-symbol">{row.symbol}</span></label>)}</div><aside className="admin-panel admin-rate-note"><p className="admin-eyebrow">How it works</p><h3>One source of truth.</h3><p>Catalog prices stay stored in their source currency. The public site converts them using these values and the visitor’s selected currency.</p><ul><li>USD, EUR, GBP, EGP and CHF are ready.</li><li>Visitors can choose currency independently from language.</li><li>Rates are protected by admin-only write policies.</li></ul></aside></div>{!canManageRates && <p className="admin-empty">Only an administrator can edit exchange rates.</p>}</section>}

          {["stays", "trips", "market", "vehicles"].includes(section) && <section className="admin-panel admin-full-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Content studio</p><h2>{collectionLabels[catalogCollection]}</h2><p>Update the records that power the AlpNile catalogue.</p></div><div className="admin-panel-head-actions">{canEditCatalog && <button type="button" className="admin-button" onClick={() => setEditor(blankEditor(catalogCollection))}>New record +</button>}<button type="button" onClick={() => void loadCatalog(catalogCollection)}>Refresh ↻</button></div></div>{catalogLoading ? <div className="admin-empty">Loading catalogue…</div> : <div className="admin-catalog-grid">{pagedCatalog.map((record) => <article className={"admin-catalog-card " + (!record.is_active ? "inactive" : "")} key={textValue(record, "id")}><div className="admin-catalog-card-media">{record.image_url ? <img src={String(record.image_url)} alt="" /> : <span>✦</span>}<span>{record.is_active ? "Live" : "Hidden"}</span></div><div><p className="admin-eyebrow">{textValue(record, "slug")}</p><h3>{recordLabel(record, catalogCollection)}</h3><p>{textValue(record, "description") || "No description yet."}</p><div className="admin-catalog-meta"><span>{catalogCollection === "products" ? "$" + textValue(record, "price") : "$" + (textValue(record, "price_from") || "—")}</span><span>Updated {formatDate(textValue(record, "updated_at"))}</span></div>{canEditCatalog && <div className="admin-catalog-card-actions"><button type="button" onClick={() => setEditor(editorFromRecord(record, catalogCollection))}>Edit record ↗</button>{role === "admin" && <button type="button" className="admin-danger-button" onClick={() => void archiveCatalogRecord(record)}>Archive / delete</button>}</div>}</div></article>)}</div>}{!catalogLoading && catalog.length > CATALOG_PAGE_SIZE && <nav className="admin-pagination" aria-label="Catalogue pages"><button type="button" disabled={catalogPage === 1} onClick={() => setCatalogPage((current) => Math.max(1, current - 1))}>← Previous</button><div className="admin-pagination-pages">{Array.from({ length: catalogPageCount }, (_, index) => index + 1).map((page) => <button type="button" key={page} className={catalogPage === page ? "active" : ""} aria-current={catalogPage === page ? "page" : undefined} onClick={() => setCatalogPage(page)}>{String(page).padStart(2, "0")}</button>)}</div><button type="button" disabled={catalogPage === catalogPageCount} onClick={() => setCatalogPage((current) => Math.min(catalogPageCount, current + 1))}>Next →</button><span className="admin-pagination-count">{catalog.length} records</span></nav>}{!catalogLoading && !catalog.length && <div className="admin-empty">No records found. Run the catalog migrations and seed data first.</div>}</section>}

          {editor && <div className="admin-editor-overlay" role="dialog" aria-modal="true" aria-label="Edit catalog record"><form className="admin-editor-card" onSubmit={saveCatalog}><div className="admin-panel-head"><div><p className="admin-eyebrow">Content editor</p><h2>{editor.id ? "Edit record" : "Create record"}</h2></div><button type="button" onClick={() => setEditor(null)} aria-label="Close editor">×</button></div><div className="admin-editor-grid"><label>Slug<input value={editor.slug} onChange={(event) => setEditor({ ...editor, slug: event.target.value })} required /></label>{catalogCollection === "trips" ? <label>Title<input value={editor.title} onChange={(event) => setEditor({ ...editor, title: event.target.value })} required /></label> : <label>Name<input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} required /></label>}<label className="wide">Description<textarea rows={4} value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} required /></label><div className="admin-editor-media-field wide"><div className="admin-editor-field-heading"><span>Catalog image</span><small>Preview · public URL</small></div><div className={"admin-editor-image-preview " + (!editor.image_url.trim() ? "empty" : "")}>{editor.image_url.trim() ? <img src={editor.image_url.trim()} alt={`${editor.title || editor.name || "Catalog record"} preview`} /> : <div className="admin-editor-image-empty"><span>✦</span><strong>No image selected</strong><small>Paste a public image URL below</small></div>}<div className="admin-editor-image-badge">Live preview</div></div><div className="admin-editor-image-actions"><label>Image URL<input value={editor.image_url} onChange={(event) => setEditor({ ...editor, image_url: event.target.value })} placeholder="/alpnile-image.webp" /></label>{editor.image_url.trim() && <button type="button" className="admin-editor-remove-image" onClick={() => setEditor({ ...editor, image_url: "" })}><span>Remove image</span><b>×</b></button>}</div><p className="admin-editor-image-help">Use a public URL or clear the image to fall back to the catalog placeholder.</p></div><div className="admin-editor-gallery-field wide"><div className="admin-editor-field-heading"><span>Internal gallery</span><small>{editor.gallery_images.length ? editor.gallery_images.length + " internal images" : editor.image_url.trim() ? "1 current catalog image" : "0 images"} · one URL per line</small></div><div className="admin-editor-gallery-preview">{editorGalleryPreview(editor).length ? editorGalleryPreview(editor).map((image, index) => <div className="admin-editor-gallery-tile" key={`${image}-${index}`}><img src={image} alt={`${editor.title || editor.name || "Catalog record"} internal image ${index + 1}`} />{editor.gallery_images.length > 0 && <button type="button" onClick={() => setEditor({ ...editor, gallery_images: editor.gallery_images.filter((_, imageIndex) => imageIndex !== index) })} aria-label={`Remove internal image ${index + 1}`}>×</button>}<span>{String(index + 1).padStart(2, "0")}</span></div>) : <div className="admin-editor-gallery-empty">Add internal images below to show them on the public detail page. The current catalog image is shown above when no internal image exists.</div>}</div><label>Internal image URLs<textarea rows={4} value={editor.gallery_images.join("\n")} onChange={(event) => setEditor({ ...editor, gallery_images: event.target.value.split(/\r?\n/).map((image) => image.trim()).filter(Boolean) })} placeholder="/images/record-interior.webp\n/images/record-bedroom.webp" /></label>{editor.gallery_images.length > 0 && <button type="button" className="admin-editor-clear-gallery" onClick={() => setEditor({ ...editor, gallery_images: [] })}>Clear internal gallery ×</button>}<p className="admin-editor-image-help">One public image URL per line. The cover image remains separate.</p></div>{catalogCollection === "trips" && <><label>Location<input value={editor.location_label} onChange={(event) => setEditor({ ...editor, location_label: event.target.value })} /></label><label>Duration<input value={editor.duration_label} onChange={(event) => setEditor({ ...editor, duration_label: event.target.value })} /></label></>}{catalogCollection === "stays" && <><label>Location<input value={editor.location_label} onChange={(event) => setEditor({ ...editor, location_label: event.target.value })} /></label><label>Stay type<select value={editor.stay_type} onChange={(event) => setEditor({ ...editor, stay_type: event.target.value })}><option>hotel</option><option>villa</option><option>home</option><option>residence</option></select></label><label>Max guests<input type="number" min="1" value={editor.max_guests} onChange={(event) => setEditor({ ...editor, max_guests: event.target.value })} /></label></>}{catalogCollection === "products" && <><label>Price<input type="number" min="0" value={editor.price} onChange={(event) => setEditor({ ...editor, price: event.target.value })} /></label><label>Stock quantity<input type="number" min="0" value={editor.stock_quantity} onChange={(event) => setEditor({ ...editor, stock_quantity: event.target.value })} /></label></>}{catalogCollection === "vehicles" && <><label>Vehicle type<select value={editor.vehicle_type} onChange={(event) => setEditor({ ...editor, vehicle_type: event.target.value })}><option>suv</option><option>van</option><option>sedan</option><option>minibus</option></select></label><label>Passenger capacity<input type="number" min="1" value={editor.passenger_capacity} onChange={(event) => setEditor({ ...editor, passenger_capacity: event.target.value })} /></label><label>Price from<input type="number" min="0" value={editor.price} onChange={(event) => setEditor({ ...editor, price: event.target.value })} /></label></>} {(catalogCollection !== "products" && catalogCollection !== "vehicles") && <label>Price from<input type="number" min="0" value={editor.price} onChange={(event) => setEditor({ ...editor, price: event.target.value })} /></label>}<label className="admin-check"><input type="checkbox" checked={editor.is_active} onChange={(event) => setEditor({ ...editor, is_active: event.target.checked })} /> Visible on the site</label><label className="admin-check"><input type="checkbox" checked={editor.is_featured} onChange={(event) => setEditor({ ...editor, is_featured: event.target.checked })} /> Featured record</label></div><div className="admin-editor-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => setEditor(null)}>Cancel</button><button type="submit" className="admin-button">Save changes ↗</button></div></form></div>}
        </section>
      </div>
    </main>
  );
}

