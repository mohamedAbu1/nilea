"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthSession } from "../lib/auth-client";
import { getCatalogFavorites, toggleCatalogFavorite, type CatalogFavorite } from "../lib/intelligence-client";

function titleFromSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function favoriteHref(favorite: CatalogFavorite) {
  if (favorite.entity_type === "stay") return `/stays-hotels?stay=${encodeURIComponent(favorite.entity_slug)}`;
  if (favorite.entity_type === "trip") return `/tours-experiences/${encodeURIComponent(favorite.entity_slug)}`;
  if (favorite.entity_type === "product") return `/market/${encodeURIComponent(favorite.entity_slug)}`;
  if (favorite.entity_type === "vehicle") return `/travel-transport?vehicle=${encodeURIComponent(favorite.entity_slug)}`;
  return "/";
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<CatalogFavorite[]>([]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getAuthSession().then(async (session) => {
      if (!active) return;
      const user = session?.user;
      setSignedIn(Boolean(user));
      if (!user) {
        setReady(true);
        return;
      }
      const result = await getCatalogFavorites();
      if (!active) return;
      setFavorites(result.data);
      setError(result.error?.message ?? "");
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const removeFavorite = async (favorite: CatalogFavorite) => {
    const result = await toggleCatalogFavorite({ entityType: favorite.entity_type, entitySlug: favorite.entity_slug, entityId: favorite.entity_id ?? undefined, saved: false });
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setFavorites((items) => items.filter((item) => !(item.entity_type === favorite.entity_type && item.entity_slug === favorite.entity_slug)));
  };

  return (
    <main className="favorites-page">
      <div className="favorites-shell">
        <div className="favorites-heading">
          <div>
            <p className="favorites-kicker">YOUR ALPNILE LIST</p>
            <h1>Places worth keeping.</h1>
            <p>Save stays, journeys, vehicles and objects while you plan your route.</p>
          </div>
          <Link href="/" className="favorites-back-link">Back to AlpNile ↗</Link>
        </div>
        {!ready ? <div className="favorites-empty"><strong>Loading your list…</strong></div> : !signedIn ? <div className="favorites-empty"><strong>Sign in to build your list.</strong><span>Your favorites stay connected to your account on every device.</span><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("alpnile:open-account", { detail: { mode: "login" } }))}>Log in to continue ↗</button></div> : favorites.length ? <div className="favorites-grid">{favorites.map((favorite) => <article className="favorite-card" key={`${favorite.entity_type}:${favorite.entity_slug}`}><div><span>{favorite.entity_type}</span><h2>{titleFromSlug(favorite.entity_slug)}</h2><p>Saved to your personal AlpNile list.</p></div><div className="favorite-card-actions"><Link href={favoriteHref(favorite)}>Open <span aria-hidden="true">↗</span></Link><button type="button" onClick={() => void removeFavorite(favorite)} aria-label={`Remove ${titleFromSlug(favorite.entity_slug)} from favorites`}>Remove</button></div></article>)}</div> : <div className="favorites-empty"><strong>Your list is still open.</strong><span>Tap Save on a stay or the heart on a product to keep it here.</span><Link href="/stays-hotels">Explore stays ↗</Link></div>}
        {error && <p className="favorites-error" role="alert">{error}</p>}
      </div>
    </main>
  );
}
