"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getAuthSession } from "../lib/auth-client";
import { applyAsProvider, getProviderPortal, shareProviderLocation, updateProviderAssignment, updateProviderAvailability, updateProviderProfile, updateProviderTask, type ProviderAssignment, type ProviderPortal, type ProviderTask } from "../lib/provider-client";

function dateLabel(value: string | null | undefined) {
  if (!value) return "Not scheduled yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function roleLabel(role: string) { return role === "property_owner" ? "Property owner" : "Driver"; }
function bookingLabel(type: string) { return type === "stay" ? "Property booking" : type === "car" ? "Private car booking" : "Experience booking"; }

function ProviderApply({ onSubmitted }: { onSubmitted: () => void }) {
  const [providerRole, setProviderRole] = useState("driver");
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError("");
    try { await applyAsProvider({ providerRole, companyName, licenseNumber, serviceArea, bio }); onSubmitted(); }
    catch (value) { setError(value instanceof Error ? value.message : "The application could not be sent."); }
    setSaving(false);
  };
  return <section className="provider-apply-card">
    <div className="provider-apply-mark">✦</div>
    <div><p className="provider-eyebrow">AlpNile partner network</p><h2>Work with the route, professionally.</h2><p className="provider-muted">Apply as a driver or property owner. The AlpNile team verifies your details, then gives you only the bookings and tasks that belong to your service.</p></div>
    <form onSubmit={submit} className="provider-form">
      <label>Partner type<select value={providerRole} onChange={(event) => setProviderRole(event.target.value)}><option value="driver">Driver</option><option value="property_owner">Property owner</option></select></label>
      <label>Company or property name<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required placeholder="Nile Route Cars / Habu Sunset Villa" /></label>
      <label>License or registration number<input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} placeholder="Optional verification reference" /></label>
      <label>Service area<input value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} required placeholder="Luxor, Aswan, Cairo" /></label>
      <label className="wide">About your service<textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Tell the AlpNile team what you provide and how you operate." /></label>
      {error && <p className="provider-error" role="alert">{error}</p>}
      <button className="provider-primary-button" type="submit" disabled={saving}>{saving ? "Sending application…" : "Send for verification ↗"}</button>
    </form>
  </section>;
}

function AssignmentCard({ assignment, onRefresh }: { assignment: ProviderAssignment; onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const update = async (status: string) => {
    setSaving(true);
    try { await updateProviderAssignment({ assignmentId: assignment.id, assignmentStatus: status }); onRefresh(); }
    catch { /* The parent refresh will surface the next server state. */ }
    setSaving(false);
  };
  return <article className="provider-assignment-card">
    <div className="provider-card-top"><div><p className="provider-eyebrow">{bookingLabel(assignment.booking_type)}</p><h3>{assignment.catalog_name || assignment.booking_destination || "AlpNile booking"}</h3></div><span className={`provider-status provider-status-${assignment.assignment_status}`}>{assignment.assignment_status.replaceAll("_", " ")}</span></div>
    <div className="provider-assignment-grid"><span><small>Customer</small><strong>{assignment.customer_name || "Customer details pending"}</strong></span><span><small>When</small><strong>{assignment.scheduled_at ? dateLabel(assignment.scheduled_at) : assignment.service_date || "To be confirmed"}</strong></span><span><small>Route / place</small><strong>{assignment.meeting_location || assignment.booking_location || "Details in chat"}</strong></span><span><small>Contact</small><strong>{assignment.customer_phone || "Shared after confirmation"}</strong></span></div>
    {assignment.instructions && <p className="provider-instructions"><b>AlpNile instruction</b>{assignment.instructions}</p>}
    <div className="provider-card-actions">{assignment.assignment_status === "assigned" && <button type="button" onClick={() => void update("accepted")} disabled={saving}>Accept assignment</button>}{assignment.assignment_status === "accepted" && <button type="button" onClick={() => void update("in_progress")} disabled={saving}>Start service</button>}{assignment.assignment_status === "in_progress" && <button type="button" onClick={() => void update("completed")} disabled={saving}>Mark completed</button>}<button type="button" className="provider-secondary-button" onClick={() => window.dispatchEvent(new CustomEvent("alpnile:open-support-chat"))}>Message AlpNile</button></div>
  </article>;
}

function TaskCard({ task, onRefresh }: { task: ProviderTask; onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const nextStatus = task.task_status === "pending" ? "acknowledged" : task.task_status === "acknowledged" ? "in_progress" : task.task_status === "in_progress" ? "done" : "pending";
  const update = async (status: string) => {
    setSaving(true);
    try { await updateProviderTask({ taskId: task.id, taskStatus: status }); onRefresh(); } catch { /* Keep the card stable on a transient request failure. */ }
    setSaving(false);
  };
  const shareLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => { setSaving(true); try { await shareProviderLocation({ taskId: task.id, assignmentId: task.assignment_id, latitude: coords.latitude, longitude: coords.longitude }); onRefresh(); } finally { setSaving(false); } }, () => undefined, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };
  return <article className="provider-task-card"><div className="provider-card-top"><div><p className="provider-eyebrow">{task.task_type.replaceAll("_", " ")}</p><h3>{task.title}</h3></div><span className={`provider-status provider-status-${task.task_status}`}>{task.task_status.replaceAll("_", " ")}</span></div><p className="provider-muted">{task.instructions || "Follow the assignment details and keep the AlpNile team informed."}</p>{task.due_at && <small className="provider-task-due">Due {dateLabel(task.due_at)}</small>}<div className="provider-card-actions">{task.task_status !== "done" && task.task_status !== "blocked" && <button type="button" onClick={() => void update(nextStatus)} disabled={saving}>{nextStatus === "done" ? "Complete task" : nextStatus === "in_progress" ? "Start task" : "Acknowledge"}</button>}{task.requires_location === 1 && <button type="button" className="provider-secondary-button" onClick={shareLocation} disabled={saving}>Share current location</button>}{task.task_status === "blocked" && <button type="button" onClick={() => void update("in_progress")} disabled={saving}>Resume task</button>}</div></article>;
}

function ProviderWorkspace({ data, onRefresh }: { data: ProviderPortal; onRefresh: () => void }) {
  const [availability, setAvailability] = useState<string>(data.profile?.availability_status || "offline");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [companyName, setCompanyName] = useState(data.profile?.company_name || "");
  const [licenseNumber, setLicenseNumber] = useState(data.profile?.license_number || "");
  const [serviceArea, setServiceArea] = useState(data.profile?.service_area || "");
  const [bio, setBio] = useState(data.profile?.bio || "");
  const openTasks = useMemo(() => data.tasks.filter((task) => !["done"].includes(task.task_status)), [data.tasks]);
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setProfileSaving(true); setProfileMessage(""); try { await updateProviderProfile({ companyName, licenseNumber, serviceArea, bio }); await updateProviderAvailability(availability); setProfileMessage("Profile and availability saved."); onRefresh(); } catch (error) { setProfileMessage(error instanceof Error ? error.message : "Could not save profile."); } setProfileSaving(false); };
  return <main className="provider-page"><div className="provider-shell"><header className="provider-hero"><div><p className="provider-eyebrow">ALPNILE / PARTNER OPERATIONS</p><h1>Keep every service moving.</h1><p className="provider-muted">Your private operations board contains only your assigned customers, timings, instructions and location checkpoints.</p></div><div className="provider-hero-badge"><img src={data.user.avatar} alt="" /><span><small>{roleLabel(data.profile?.provider_role || data.user.accessRole)}</small><strong>{data.user.name}</strong></span></div></header><section className="provider-metrics"><article><strong>{data.assignments.filter((item) => !["completed", "cancelled"].includes(item.assignment_status)).length}</strong><span>Active assignments</span></article><article><strong>{openTasks.length}</strong><span>Open tasks</span></article><article><strong>{data.profile?.availability_status === "available" ? "Ready" : data.profile?.availability_status === "busy" ? "Busy" : "Offline"}</strong><span>Availability</span></article><article><strong>{data.profile?.location_updated_at ? "Shared" : "Not yet"}</strong><span>Last location</span></article></section><div className="provider-columns"><section className="provider-panel"><div className="provider-panel-head"><div><p className="provider-eyebrow">Service queue</p><h2>Assigned bookings</h2></div><button type="button" onClick={onRefresh}>Refresh ↻</button></div><div className="provider-stack">{data.assignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} onRefresh={onRefresh} />)}{!data.assignments.length && <div className="provider-empty">No bookings have been assigned to you yet. AlpNile will place confirmed work here.</div>}</div></section><aside className="provider-panel"><div className="provider-panel-head"><div><p className="provider-eyebrow">Step by step</p><h2>Today’s tasks</h2></div><span className="provider-live-dot">● Live</span></div><div className="provider-stack">{data.tasks.map((task) => <TaskCard key={task.id} task={task} onRefresh={onRefresh} />)}{!data.tasks.length && <div className="provider-empty">Your next instruction will appear here when the team assigns work.</div>}</div></aside></div><section className="provider-columns provider-lower-columns"><section className="provider-panel"><div className="provider-panel-head"><div><p className="provider-eyebrow">Partner profile</p><h2>Keep your details current</h2></div></div><form className="provider-form" onSubmit={saveProfile}><label>Company or property name<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></label><label>License / registration<input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} /></label><label>Service area<input value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} /></label><label>Availability<select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="available">Available</option><option value="busy">Busy on a booking</option><option value="offline">Offline</option></select></label><label className="wide">Service note<textarea rows={3} value={bio} onChange={(event) => setBio(event.target.value)} /></label><button className="provider-primary-button" type="submit" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save partner profile"}</button>{profileMessage && <p className="provider-form-message" role="status">{profileMessage}</p>}</form></section><section className="provider-panel provider-chat-card"><p className="provider-eyebrow">Private admin channel</p><h2>One place for instructions.</h2><p className="provider-muted">Use the AlpNile chat for pickup changes, customer notes, access instructions and urgent updates. The operations team sees your provider identity and assignment context.</p><button className="provider-primary-button" type="button" onClick={() => window.dispatchEvent(new CustomEvent("alpnile:open-support-chat"))}>Open private AlpNile chat ↗</button><div className="provider-security-note">Only you and the AlpNile operations team can access this channel.</div></section></section></div></main>;
}

export default function ProviderPage() {
  const [data, setData] = useState<ProviderPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationSent, setApplicationSent] = useState(false);
  const load = async () => { setLoading(true); setError(""); try { setData(await getProviderPortal()); } catch (value) { setError(value instanceof Error ? value.message : "Please sign in to use the partner portal."); } setLoading(false); };
  useEffect(() => { void load(); }, []);
  if (loading) return <main className="provider-page"><div className="provider-shell"><div className="provider-empty">Opening your private partner workspace…</div></div></main>;
  if (error || !data) return <main className="provider-page"><div className="provider-shell"><section className="provider-locked"><p className="provider-eyebrow">Partner access</p><h1>Sign in to continue.</h1><p className="provider-muted">The partner portal is private. Use your AlpNile account, then apply as a driver or property owner.</p><button type="button" className="provider-primary-button" onClick={() => window.dispatchEvent(new CustomEvent("alpnile:open-account", { detail: { mode: "login" } }))}>Open account access ↗</button>{error && <small>{error}</small>}</section></div></main>;
  if (applicationSent || (data.profile && data.profile.approval_status !== "approved")) return <main className="provider-page"><div className="provider-shell"><header className="provider-hero"><div><p className="provider-eyebrow">ALPNILE / PARTNER NETWORK</p><h1>Verification comes first.</h1><p className="provider-muted">Your application is private and visible only to the AlpNile operations team.</p></div></header><section className="provider-application-status"><span className={`provider-status provider-status-${applicationSent ? "pending" : data.profile?.approval_status}`}>{applicationSent ? "pending" : data.profile?.approval_status}</span><h2>{applicationSent ? "Application received." : `Application ${data.profile?.approval_status}.`}</h2><p>We will review your service details before enabling customer and booking information. Until approval, your account remains a normal traveler account.</p><button type="button" className="provider-secondary-button" onClick={() => void load()}>Refresh status ↻</button></section>{!applicationSent && data.profile?.approval_status === "rejected" && <ProviderApply onSubmitted={() => setApplicationSent(true)} />}</div></main>;
  if (!data.profile) return <main className="provider-page"><div className="provider-shell"><ProviderApply onSubmitted={() => setApplicationSent(true)} /></div></main>;
  return <ProviderWorkspace data={data} onRefresh={() => void load()} />;
}
