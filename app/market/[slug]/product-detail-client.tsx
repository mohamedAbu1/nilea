"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BazaarProduct, CartLine } from "../catalog";
import { LocalizedPrice } from "../../components/currency";
import { catalogGalleryLabel, readCatalogGallery } from "../../lib/catalog-gallery";

type Props = {
  product: BazaarProduct;
  gallery: string[];
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ProductDetailClient({ product, gallery }: Props) {
  const [activeView, setActiveView] = useState(0);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [added, setAdded] = useState(false);
  const [databaseGallery, setDatabaseGallery] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    void fetch(`/api/catalog?type=products&slug=${encodeURIComponent(product.slug)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<Array<{ metadata?: unknown }>> : [])
      .then((rows) => {
        if (active) setDatabaseGallery(readCatalogGallery(rows[0]?.metadata));
      })
      .catch(() => {
        if (active) setDatabaseGallery([]);
      });
    return () => { active = false; };
  }, [product.slug]);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("alpnile-bazaar-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartLine[];
        if (Array.isArray(parsedCart)) setCartLines(parsedCart.filter((line) => line.quantity > 0));
      }
    } catch {
      window.localStorage.removeItem("alpnile-bazaar-cart");
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (cartReady) window.localStorage.setItem("alpnile-bazaar-cart", JSON.stringify(cartLines));
  }, [cartLines, cartReady]);

  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const activeGallery = databaseGallery?.length ? databaseGallery : gallery;

  const addToBag = () => {
    setCartLines((lines) => {
      const existing = lines.find((line) => line.slug === product.slug);
      if (existing) return lines.map((line) => line.slug === product.slug ? { ...line, quantity: line.quantity + 1 } : line);
      return [...lines, { slug: product.slug, quantity: 1 }];
    });
    setAdded(true);
  };

  return (
    <main className="bazaar-page bazaar-product-page">
      <div className="bazaar-wrap bazaar-product-detail-shell">
        <div className="bazaar-product-detail-topbar"><Link href="/market#bazaar-catalog">← Back to the bazaar</Link><Link href="/market#bazaar-catalog" className="bazaar-detail-bag">Shopping bag <strong>{cartCount}</strong></Link></div>
        <div className="bazaar-product-detail-layout">
          <section className="bazaar-detail-gallery" aria-label={`${product.name} product gallery`}>
            <div className="bazaar-detail-main-image"><img src={activeGallery[activeView] ?? activeGallery[0]} alt={`${product.name}, ${catalogGalleryLabel(activeView, "Product image")}`} /><span>{String(activeView + 1).padStart(2, "0")} / {String(activeGallery.length).padStart(2, "0")}</span></div>
            <div className="bazaar-detail-thumbnails">{activeGallery.map((image, index) => <button type="button" key={`${image}-${index}`} className={activeView === index ? "active" : ""} onClick={() => setActiveView(index)} aria-label={`Show ${product.name} ${catalogGalleryLabel(index, "image")} view`}><img src={image} alt="" /><span>{catalogGalleryLabel(index, "Image")}</span></button>)}</div>
          </section>
          <section className="bazaar-product-detail-copy">
            <p className="bazaar-kicker">{product.category} · {product.origin}</p>
            <h1>{product.name}</h1>
            <p className="bazaar-detail-note">{product.note}</p>
            <p className="bazaar-detail-description">{product.description}</p>
            <div className="bazaar-detail-price"><span>Starting price</span><strong><LocalizedPrice amount={product.price} /></strong></div>
            <dl className="bazaar-detail-specs"><div><dt>Made in</dt><dd>{product.origin}</dd></div><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Collection</dt><dd>AlpNile Bazaar</dd></div></dl>
            <div className="bazaar-detail-actions"><button type="button" className="bazaar-primary-button" onClick={addToBag}>{added ? "Added to bag ✓" : "Add to bag"} <Arrow /></button><a className="bazaar-secondary-link" href={`mailto:hello@alpnile.com?subject=${encodeURIComponent(`Bazaar request: ${product.name}`)}`}>Ask about this piece <Arrow /></a></div>
            <p className="bazaar-detail-support"><span aria-hidden="true">✦</span> Handmade in Egypt · availability and shipping confirmed personally by AlpNile.</p>
          </section>
        </div>
      </div>
      <section className="bazaar-detail-story"><div className="bazaar-wrap"><p className="bazaar-kicker">A piece with a place</p><h2>Carry the route<br /><em>home with you.</em></h2><p>Each object is selected for its material, its maker and the small memory it brings into an everyday room. Browse the other pieces or keep this one close.</p><Link href="/market#bazaar-catalog" className="bazaar-secondary-link">Explore all 30 objects <Arrow /></Link></div></section>
    </main>
  );
}
