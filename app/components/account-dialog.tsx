"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { accountProfileFromUser, isSupabaseConfigured, supabase, type AccountProfile } from "../lib/supabase";
import { StyledSelect } from "./styled-select";

export type AuthMode = "login" | "register" | "forgot" | "reset";

type AccountDialogProps = {
  open: boolean;
  initialMode: AuthMode;
  initialError?: string;
  onClose: () => void;
  onAuthenticated: (profile: AccountProfile) => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "";
  password: string;
  confirmPassword: string;
  terms: boolean;
};

type AccountIconName = "user" | "mail" | "phone" | "lock" | "gender";

function AccountIcon({ name }: { name: AccountIconName }) {
  const paths: Record<AccountIconName, ReactNode> = {
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19.2c.7-3.1 3-4.8 6.5-4.8s5.8 1.7 6.5 4.8" /></>,
    mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 5.2L19.5 7" /></>,
    phone: <><path d="M7.2 4.7 9.5 4l1.5 4-1.7 1.2a14 14 0 0 0 5.5 5.5l1.2-1.7 4 1.5-.7 2.3a2.2 2.2 0 0 1-2.5 1.5A16.7 16.7 0 0 1 5.7 7.2a2.2 2.2 0 0 1 1.5-2.5Z" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v2" /></>,
    gender: <><circle cx="12" cy="8" r="3.2" /><path d="M12 11.5V21M8.5 16h7" /></>,
  };

  return <svg className="account-dialog-field-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function PasswordEyeIcon({ open }: { open: boolean }) {
  return <svg className="account-dialog-eye-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {open ? <><path d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z" /><circle cx="12" cy="12" r="2.3" /></> : <><path d="m4 4 16 16" /><path d="M10.6 6.2A9.5 9.5 0 0 1 12 6c5.3 0 8.5 6 8.5 6a15.5 15.5 0 0 1-2.8 3.6M6.3 7.4C4.5 9 3.5 12 3.5 12s3.2 6 8.5 6c.8 0 1.5-.1 2.2-.4" /></>}
  </svg>;
}

const defaultAvatar = "/alpnile-profile-avatar.webp";
const avatarPools: Record<"male" | "female", string[]> = {
  male: Array.from({ length: 15 }, (_, index) => `/alpnile-avatar-man-${String(index + 1).padStart(2, "0")}.webp`),
  female: ["/alpnile-avatar-woman-explorer-v1.webp", "/alpnile-avatar-woman-queen-v1.webp", ...Array.from({ length: 8 }, (_, index) => `/alpnile-avatar-woman-${String(index + 3).padStart(2, "0")}.webp`)],
};
const emptyForm: FormState = { name: "", email: "", phone: "", gender: "", password: "", confirmPassword: "", terms: false };

function randomAvatarFor(gender: "male" | "female") {
  const pool = avatarPools[gender];
  return pool[Math.floor(Math.random() * pool.length)] ?? defaultAvatar;
}

export default function AccountDialog({ open, initialMode, initialError = "", onClose, onAuthenticated }: AccountDialogProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setForm(emptyForm);
    setAvatarPreview(defaultAvatar);
    setShowPassword(false);
    setBusy(false);
    setError(initialError);
    setSuccess("");
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [initialError, initialMode, onClose, open]);

  const passwordScore = useMemo(() => [
    form.password.length >= 8,
    /[A-Z]/.test(form.password),
    /[0-9]/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password),
  ].filter(Boolean).length, [form.password]);

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "gender" && (value === "male" || value === "female")) setAvatarPreview(randomAvatarFor(value));
    if (field === "gender" && value === "") setAvatarPreview(defaultAvatar);
    setError("");
    setSuccess("");
  };

  const signInWithGoogle = async () => {
    setError("");
    setSuccess("");
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured yet. Add the public Supabase URL and anon key to .env.local.");
      return;
    }

    setBusy(true);
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (result.error) throw result.error;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to start Google sign-in.";
      setError(message.includes("provider") || message.includes("Google") ? "Google sign-in is not available yet. Check that Google is enabled in Supabase Auth and that http://localhost:3000 is on the redirect URL allow-list." : message);
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured yet. Add the public Supabase URL and anon key to .env.local.");
      return;
    }

    const email = form.email.trim().toLowerCase();
    if (mode !== "reset" && !email) { setError("Please enter your email address."); return; }
    if (mode === "register") {
      if (form.name.trim().length < 2) { setError("Please enter your full name."); return; }
      if (form.gender !== "male" && form.gender !== "female") { setError("Please choose whether you are a man or a woman so we can personalize your avatar."); return; }
      if (form.password.length < 8 || passwordScore < 3) { setError("Use at least 8 characters, including a capital letter, number or symbol."); return; }
      if (form.password !== form.confirmPassword) { setError("The passwords do not match."); return; }
      if (!form.terms) { setError("Please accept the terms and privacy policy."); return; }
    }
    if (mode === "reset" && (form.password.length < 8 || passwordScore < 3)) { setError("Use at least 8 characters, including a capital letter, number or symbol."); return; }
    if (mode === "reset" && form.password !== form.confirmPassword) { setError("The passwords do not match."); return; }

    setBusy(true);
    try {
      if (mode === "login") {
        const result = await supabase.auth.signInWithPassword({ email, password: form.password });
        if (result.error) throw result.error;
        const profile = accountProfileFromUser(result.data.user);
        if (profile) onAuthenticated(profile);
        onClose();
        return;
      }

      if (mode === "forgot") {
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/?auth=reset` });
        if (result.error) throw result.error;
        setSuccess("If this email is registered, a password reset link has been sent.");
        setBusy(false);
        return;
      }

      if (mode === "reset") {
        const result = await supabase.auth.updateUser({ password: form.password });
        if (result.error) throw result.error;
        const profile = accountProfileFromUser(result.data.user);
        if (profile) onAuthenticated(profile);
        setSuccess("Your password has been updated. Welcome back.");
        window.history.replaceState({}, document.title, window.location.pathname);
        window.setTimeout(onClose, 600);
        return;
      }

      const result = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: form.name.trim(), phone: form.phone.trim(), gender: form.gender, avatar_url: avatarPreview } },
      });
      if (result.error) throw result.error;
      const profile = accountProfileFromUser(result.data.user);
      if (result.data.session && profile) {
        onAuthenticated(profile);
        onClose();
      } else {
        setSuccess("Your account was created, but this Supabase project still requires email confirmation. Disable Confirm email in Supabase Auth settings to allow immediate login.");
        setMode("login");
        setForm((current) => ({ ...emptyForm, email: current.email }));
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to complete this request.";
      setError(message
        .replace("Invalid login credentials", "The email or password is not correct.")
        .replace("Email not confirmed", "Email confirmation is enabled in Supabase. Disable Confirm email in Auth settings, then try again."));
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="account-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
          <div className="account-dialog-visual">
          <img className="account-dialog-pharaoh" src="/alpnile-pharaoh-mask-gold-v1.png" alt="" aria-hidden="true" />
          <div className="account-dialog-pharaoh-glow" aria-hidden="true" />
          <div className="account-dialog-orbit account-dialog-orbit-one" />
          <div className="account-dialog-orbit account-dialog-orbit-two" />
          <div className="account-dialog-visual-copy"><span>ALPNILE / MEMBER SPACE</span><strong>Your route,<br /><em>kept close.</em></strong><p>Save the places, stays and stories you want to return to.</p></div>
          <div className="account-dialog-visual-mark"><span>✦</span><small>EGYPT</small></div>
        </div>
        <div className="account-dialog-panel">
          <button type="button" className="account-dialog-close" aria-label="Close account dialog" onClick={onClose}>×</button>
          <div className="account-dialog-heading"><p className="home-redesign-eyebrow">Traveler account</p><h2 id="account-dialog-title">{mode === "login" ? "Welcome back." : mode === "register" ? "Create your space." : mode === "forgot" ? "Reset access." : "Choose a new password."}</h2><p>{mode === "login" ? "Pick up where your next story left off." : mode === "register" ? "Keep your favorite Egypt moments in one thoughtful place." : mode === "forgot" ? "We will send a secure reset link to your inbox." : "Create a new password for your AlpNile account."}</p></div>
          {mode !== "reset" && <div className="account-dialog-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === "login" || mode === "forgot"} className={mode === "login" || mode === "forgot" ? "active" : ""} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>Log in</button>
            <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>Create account</button>
          </div>}
          <form className="account-dialog-form" onSubmit={submit}>
            {mode === "login" && <>
              <button type="button" className="account-dialog-google" onClick={() => void signInWithGoogle()} disabled={busy} aria-busy={busy}><span className="account-dialog-google-mark" aria-hidden="true">G</span><span>{busy ? "Opening Google..." : "Continue with Google"}</span></button>
              <div className="account-dialog-divider" aria-hidden="true"><span>or use email</span></div>
            </>}
            {(mode === "register") && <label><span className="account-dialog-field-label"><AccountIcon name="user" /> Full name</span><input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" autoComplete="name" required /></label>}
            {mode !== "reset" && <label><span className="account-dialog-field-label"><AccountIcon name="mail" /> Email address</span><input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required /></label>}
            {mode === "register" && <label><span className="account-dialog-field-label"><AccountIcon name="phone" /> WhatsApp number <span className="account-dialog-optional">optional</span></span><input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} type="tel" placeholder="+20 100 000 0000" autoComplete="tel" /></label>}
            {mode === "register" && <><label><span className="account-dialog-field-label"><AccountIcon name="gender" /> Personalize my avatar</span><StyledSelect name="gender" value={form.gender} onChange={(value) => updateField("gender", value)} ariaLabel="Choose your gender" required><option value="">Choose your avatar style</option><option value="male">Man</option><option value="female">Woman</option></StyledSelect></label><div className="account-dialog-avatar-preview"><img src={avatarPreview} alt="Preview of your randomly selected pharaonic avatar" /><span><strong>Your pharaonic avatar</strong><small>A new portrait is selected for your member profile.</small></span></div></>}
            {mode !== "forgot" && <label><span className="account-dialog-field-label"><AccountIcon name="lock" /> Password <button type="button" className="account-dialog-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}><PasswordEyeIcon open={showPassword} /><span>{showPassword ? "Hide" : "Show"}</span></button></span><span className="account-dialog-password-field"><input value={form.password} onChange={(event) => updateField("password", event.target.value)} type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} required /></span></label>}
            {(mode === "register" || mode === "reset") && <><div className="account-password-meter" aria-label={`Password strength ${passwordScore} of 4`}><span className={passwordScore > 0 ? "filled" : ""} /><span className={passwordScore > 1 ? "filled" : ""} /><span className={passwordScore > 2 ? "filled" : ""} /><span className={passwordScore > 3 ? "filled" : ""} /></div><p className="account-password-hint">Use 8+ characters with a capital letter, number or symbol.</p><label><span className="account-dialog-field-label"><AccountIcon name="lock" /> Password confirmation</span><input value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} type={showPassword ? "text" : "password"} placeholder="Repeat your password" autoComplete="new-password" required /></label></>}
            {mode === "register" && <label className="account-terms"><input checked={form.terms} onChange={(event) => updateField("terms", event.target.checked)} type="checkbox" /> <span>I agree to AlpNile&apos;s terms and privacy policy.</span></label>}
            {mode === "login" && <button type="button" className="account-dialog-forgot" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}>Forgot password?</button>}
            {mode === "forgot" && <button type="button" className="account-dialog-forgot" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>← Back to login</button>}
            {error && <p className="account-dialog-error" role="alert">{error}</p>}
            {success && <p className="account-dialog-success" role="status">{success}</p>}
            <button type="submit" className="account-dialog-submit" disabled={busy}>{busy ? "One moment..." : mode === "login" ? "Enter my account" : mode === "register" ? "Create my account" : mode === "forgot" ? "Send reset link" : "Update password"}<span aria-hidden="true">↗</span></button>
          </form>
          <p className="account-dialog-footnote">Account sessions are handled by Supabase Auth. Your password is never stored in this website.</p>
        </div>
      </section>
    </div>
  );
}
