"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./brand-logo";
import { localeOptions, useLanguage, type LocaleCode } from "./language";
import AccountDialog, { type AuthMode } from "./account-dialog";
import { accountProfileFromUser, supabase, type AccountProfile } from "../lib/supabase";
import { subscribeToNewsletter } from "../lib/submissions";

type NavKey = "home" | "about" | "contact" | "trips";

const navigation: { key: NavKey; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "about", label: "About", href: "/about" },
  { key: "contact", label: "Contact", href: "/contact" },
  { key: "trips", label: "Trips", href: "/tours-experiences" },
];

const navIconClass: Record<NavKey, string> = {
  home: "pharaonic-ui-compass",
  about: "pharaonic-ui-guide",
  contact: "pharaonic-ui-search",
  trips: "pharaonic-ui-ticket",
};

function isActive(key: NavKey, pathname: string) {
  if (key === "home") return pathname === "/";
  return navigation.find((item) => item.key === key)?.href === pathname;
}

const searchItems = [
  { label: "Destinations", detail: "Safaga, Marsa Alam, Luxor, Aswan, Cairo and Hurghada", href: "/destinations" },
  { label: "Local Life & Dining", detail: "Restaurants, cafés, markets and local moments", href: "/local-life" },
  { label: "Stays & Hotels", detail: "Riverfront stays and historic hotels", href: "/stays-hotels" },
  { label: "Tours & Experiences", detail: "Curated journeys with local experts", href: "/tours-experiences" },
  { label: "Smart Guide", detail: "Build a personalized Nile itinerary", href: "/trip-planner" },
];

const footerContact = {
  phone: "+20 100 271 2064",
  secondaryPhone: "+41 76 508 2885",
  email: "hello@alpnile.com",
  address: "Luxor, Egypt",
  hours: "Open 24 hours",
};

const socialLinks = [
  { label: "Instagram", handle: "@alpnile", href: "https://www.instagram.com/alpnile", kind: "instagram" },
  { label: "Facebook", handle: "AlpNile", href: "https://www.facebook.com/alpnile", kind: "facebook" },
  { label: "Gmail", handle: "hello@alpnile.com", href: "mailto:hello@alpnile.com", kind: "gmail" },
  { label: "Tripadvisor", handle: "AlpNile", href: "https://www.tripadvisor.com/Search?q=AlpNile", kind: "tripadvisor" },
  { label: "TikTok", handle: "@alpnile", href: "https://www.tiktok.com/@alpnile", kind: "tiktok" },
] as const;

function SocialIcon({ kind }: { kind: (typeof socialLinks)[number]["kind"] }) {
  if (kind === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.3" cy="6.8" r=".8" fill="currentColor" stroke="none" /></svg>;
  if (kind === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 20v-7h2.5l.5-3H14V8.2c0-.9.3-1.5 1.6-1.5H17V4.1c-.4-.1-1.2-.2-2.2-.2-2.3 0-3.8 1.4-3.8 4v2.1H8.5v3H11v7" /></svg>;
  if (kind === "gmail") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5 12 13l8-6.5" /><path d="M4 6.5V19h16V6.5" /><path d="M4 19l5-5M20 19l-5-5" /></svg>;
  if (kind === "tripadvisor") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.5C5.2 8.3 8 6.7 12 6.7s6.8 1.6 8.5 4.8" /><circle cx="8.5" cy="13" r="3.1" /><circle cx="15.5" cy="13" r="3.1" /><circle cx="8.5" cy="13" r=".9" fill="currentColor" stroke="none" /><circle cx="15.5" cy="13" r=".9" fill="currentColor" stroke="none" /><path d="M10.5 17.5 12 19l1.5-1.5" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5v9.3a3.7 3.7 0 1 1-3.2-3.7" /><path d="M14 5c1 2.4 2.4 3.6 5 3.8" /></svg>;
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const { locale, setLocale, t } = useLanguage();
  const showPrimaryNavigation = navigation.some((item) => item.href === pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<AuthMode>("login");
  const [accountError, setAccountError] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setLanguageOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onAccountRequest = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: AuthMode }>).detail?.mode;
      setAccountMode(mode === "register" ? "register" : "login");
      setAccountError("");
      setAccountOpen(true);
      setAccountMenuOpen(false);
    };
    window.addEventListener("alpnile:open-account", onAccountRequest);
    return () => window.removeEventListener("alpnile:open-account", onAccountRequest);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) setAccount(accountProfileFromUser(data.session?.user ?? null)); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (mounted) setAccount(accountProfileFromUser(session?.user ?? null)); });
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") || params.get("error");
    if (oauthError) {
      setAccountMode("login");
      setAccountError(`Google sign-in could not finish: ${oauthError.replace(/_/g, " ")}`);
      setAccountOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    const isRecovery = window.location.hash.includes("type=recovery") || params.get("auth") === "reset";
    if (isRecovery) {
      setAccountMode("reset");
      setAccountOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!languageOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setLanguageOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [languageOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!searchPanelRef.current?.contains(target) && !searchButtonRef.current?.contains(target)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [searchOpen]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchItems;
    return searchItems.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query));
  }, [searchQuery]);

  const openAccount = (mode: AuthMode) => {
    setAccountMode(mode);
    setAccountError("");
    setAccountOpen(true);
    setAccountMenuOpen(false);
  };

  const signOut = () => {
    void supabase?.auth.signOut();
    setAccount(null);
    setAccountMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <BrandLogo href="/" />
        {showPrimaryNavigation && (
          <nav className="site-nav" aria-label={t("Primary navigation")}>
            {navigation.map((item) => (
              <Link key={item.key} href={item.href} className={isActive(item.key, pathname) ? "active" : ""} aria-current={isActive(item.key, pathname) ? "page" : undefined}>
                <span className={`site-nav-icon pharaonic-ui-icon ${navIconClass[item.key]}`} aria-hidden="true" />
                {t(item.label)}
              </Link>
            ))}
          </nav>
        )}
        <div className="site-header-actions">
          <div className="site-language-picker" data-no-translate>
            <span className="site-language-globe" aria-hidden="true">◎</span>
            <button type="button" className="site-language-trigger" aria-label={t("Language")} aria-haspopup="listbox" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>{localeOptions.find((option) => option.code === locale)?.native ?? "English"}</button>
            <span className="site-language-chevron" aria-hidden="true">⌄</span>
            {languageOpen && <div className="site-language-menu" role="listbox" aria-label={t("Language")}>
              {localeOptions.map((option) => <button key={option.code} type="button" role="option" aria-selected={locale === option.code} className={locale === option.code ? "active" : ""} onClick={() => { setLocale(option.code); setLanguageOpen(false); }}>{option.native}<span aria-hidden="true">{locale === option.code ? "✓" : ""}</span></button>)}
            </div>}
          </div>
          <button ref={searchButtonRef} type="button" className="site-header-search" aria-label={t("Search AlpNile")} aria-expanded={searchOpen} aria-controls="site-search-panel" onClick={() => setSearchOpen((open) => !open)}>
            <span className="site-action-icon pharaonic-ui-icon pharaonic-ui-search" aria-hidden="true" />
          </button>
          {showPrimaryNavigation && (
            <button className="site-header-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? t("Close menu") : t("Open menu")} aria-expanded={menuOpen}>
              <span className={`site-action-icon pharaonic-ui-icon ${menuOpen ? "pharaonic-ui-close" : "pharaonic-ui-menu"}`} aria-hidden="true" />
            </button>
          )}
          <div className="site-user-area">
            <button type="button" className="site-user-profile" aria-label={account ? `Open traveler profile for ${account.name}` : "Open account access"} aria-expanded={accountMenuOpen} onClick={() => account ? setAccountMenuOpen((open) => !open) : openAccount("login")}><img src={account?.avatar ?? "/alpnile-profile-avatar.webp"} alt={account ? `${account.name} profile` : "Traveler avatar"} /><span><small>{account ? "Signed in" : "Welcome back"}</small><strong>{account?.name ?? "Traveler"}</strong></span></button>
            {account ? <button type="button" className="site-header-login" onClick={signOut}>Log out <span aria-hidden="true">↗</span></button> : <button type="button" className="site-header-login" onClick={() => openAccount("login")}>Log in <span className="site-plan-icon pharaonic-ui-icon pharaonic-ui-arrow" aria-hidden="true" /></button>}
            {account && accountMenuOpen && <div className="site-account-popover" role="dialog" aria-label="Traveler profile"><div className="site-account-popover-head"><img src={account.avatar} alt="" /><span><small>Traveler account</small><strong>{account.name}</strong></span></div><p>{account.email}</p><button type="button" onClick={() => openAccount("login")}>Manage account <span aria-hidden="true">↗</span></button></div>}
          </div>
        </div>
        {searchOpen && (
          <div ref={searchPanelRef} id="site-search-panel" className="site-search-panel" role="search">
            <label className="site-search-label">
              <span className="sr-only">{t("Search AlpNile")}</span>
              <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t("Search destinations, stays or experiences")} />
            </label>
            <div className="site-search-results">
              {searchResults.length ? searchResults.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setSearchOpen(false)}>
                  <strong>{t(item.label)}</strong>
                  <span>{t(item.detail)}</span>
                </Link>
              )) : <p>{t("No results found")}</p>}
            </div>
          </div>
        )}
        {showPrimaryNavigation && menuOpen && (
          <nav className="site-mobile-menu" aria-label={t("Mobile navigation")}>
            {navigation.map((item) => (
              <Link key={item.key} href={item.href} className={isActive(item.key, pathname) ? "active" : ""} aria-current={isActive(item.key, pathname) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                <span className={`site-nav-icon pharaonic-ui-icon ${navIconClass[item.key]}`} aria-hidden="true" />
                {t(item.label)}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <AccountDialog open={accountOpen} initialMode={accountMode} initialError={accountError} onClose={() => setAccountOpen(false)} onAuthenticated={(profile) => { setAccount(profile); setAccountError(""); setAccountMenuOpen(false); }} />
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterError("");
    setNewsletterSubmitting(true);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) { setNewsletterSubmitting(false); return; }
    const result = await subscribeToNewsletter(email.trim());
    if (result.error) {
      setNewsletterError("We could not save your email. Please try again.");
      setNewsletterSubmitting(false);
      return;
    }
    setNewsletterSubmitted(true);
    setEmail("");
    setNewsletterSubmitting(false);
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <BrandLogo href="/" />
          <p>{t("Same river. A thousand stories.")}</p>
          <span className="site-footer-signature">Egypt · Switzerland · One living route</span>
        </div>
        <div className="site-footer-column">
          <p className="site-footer-label">Main pages</p>
          <nav className="site-footer-links" aria-label="Footer navigation">
            <Link href="/">{t("Home")}</Link>
            <Link href="/about">{t("About AlpNile")}</Link>
            <Link href="/contact">{t("Contact")}</Link>
            <Link href="/tours-experiences">{t("Trips")}</Link>
          </nav>
        </div>
        <div className="site-footer-column">
          <p className="site-footer-label">More routes</p>
          <nav className="site-footer-links" aria-label="More routes navigation">
            <Link href="/destinations">{t("Destinations")}</Link>
            <Link href="/local-life">{t("Local Life")}</Link>
            <Link href="/stays-hotels">{t("Stays")}</Link>
            <Link href="/trip-planner">{t("Smart Guide")}</Link>
          </nav>
        </div>
        <div className="site-footer-column">
          <p className="site-footer-label">Policies</p>
          <nav className="site-footer-links" aria-label="Policies navigation">
            <Link href="/site-policy">{t("Site Policy")}</Link>
            <Link href="/financial-policy">{t("Financial Policy")}</Link>
          </nav>
          <div className="site-footer-socials" aria-label="Social media">
            {socialLinks.map((social) => <a key={social.label} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noreferrer" : undefined} className="site-footer-social" aria-label={`${social.label} ${social.handle}`}><SocialIcon kind={social.kind} /></a>)}
          </div>
        </div>
        <div className="site-footer-contact">
          <p className="site-footer-label">Talk to us</p>
          <a href={`tel:${footerContact.phone.replace(/\s/g, "")}`} className="site-footer-contact-phone">{footerContact.phone}</a>
          <a href={`tel:${footerContact.secondaryPhone.replace(/\s/g, "")}`} className="site-footer-contact-secondary">{footerContact.secondaryPhone}</a>
          <a href={`mailto:${footerContact.email}`} className="site-footer-contact-email">{footerContact.email}</a>
          <span>{footerContact.address} · {footerContact.hours}</span>
          <Link href="/trip-planner" className="site-footer-plan">Plan a journey <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="site-footer-newsletter">
          <p className="site-footer-label">Stay in the loop</p>
          <h3>Nile notes, once in a while.</h3>
          <p>New places, thoughtful routes and small stories from Egypt.</p>
          <form onSubmit={submitNewsletter} className="site-footer-newsletter-form">
            <input name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <label className="sr-only" htmlFor="footer-email">Email address</label>
            <input id="footer-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" />
            <button type="submit" disabled={newsletterSubmitting} aria-label="Subscribe to AlpNile updates">{newsletterSubmitting ? "…" : "↗"}</button>
          </form>
          {newsletterSubmitted && <span className="site-footer-newsletter-success" role="status">You&apos;re on the list. Thank you.</span>}
          {newsletterError && <span className="home-form-error" role="alert">{newsletterError}</span>}
        </div>
      </div>
      <div className="site-footer-bottom"><p>© 2026 AlpNile · {t("Same river. A thousand stories.")}</p><p className="site-footer-meta">ALPNILE · EGYPT 2026</p></div>
    </footer>
  );
}

export function BackToTop() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button className={`back-to-top ${visible ? "is-visible" : ""}`} type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={t("Back to top")}>
      <span aria-hidden="true">↑</span>
      <small>{t("TOP")}</small>
    </button>
  );
}
