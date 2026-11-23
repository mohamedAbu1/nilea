"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { categories, products, type BazaarProduct, type CartLine, type ProductCategory } from "./catalog";
import { LocalizedPrice, useCurrency } from "../components/currency";
import { getAuthSession } from "../lib/auth-client";
import { getCatalogFavorites, toggleCatalogFavorite } from "../lib/intelligence-client";
const pageSize = 9;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function MarketPage() {
  const searchParams = useSearchParams();
  const queryProduct = searchParams.get("product");
  const queryCategory = searchParams.get("category") as ProductCategory | null;
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(queryCategory && categories.includes(queryCategory) ? queryCategory : "All objects");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BazaarProduct | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [accountRole, setAccountRole] = useState<string | null>(null);
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const { format } = useCurrency();
  const isAdmin = accountRole === "admin";
  const isProvider = accountRole === "driver" || accountRole === "property_owner";
  const canUseTravelerTools = accountLoaded && !isAdmin && !isProvider;

  useEffect(() => {
    void getAuthSession().then((session) => { setAccountRole(session?.user.accessRole ?? null); setAccountLoaded(true); });
  }, []);

  useEffect(() => {
    if (accountRole !== "traveler") {
      setFavoriteSlugs([]);
      return;
    }
    void getCatalogFavorites("product").then((result) => setFavoriteSlugs(result.data.map((favorite) => favorite.entity_slug)));
  }, [accountRole]);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("alpnile-bazaar-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartLine[];
        if (Array.isArray(parsedCart)) setCartLines(parsedCart.filter((line) => products.some((product) => product.slug === line.slug) && line.quantity > 0));
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

  useEffect(() => {
    if (!queryProduct) return;
    const match = products.find((product) => product.slug === queryProduct);
    if (match) setSelected(match);
  }, [queryProduct]);

  useEffect(() => {
    setActiveCategory(queryCategory && categories.includes(queryCategory) ? queryCategory : "All objects");
  }, [queryCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search]);

  const visibleProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = activeCategory === "All objects" || product.category === activeCategory;
      const searchMatch = !normalized || `${product.name} ${product.category} ${product.origin} ${product.material}`.toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const paginatedProducts = visibleProducts.slice((page - 1) * pageSize, page * pageSize);
  const firstProduct = visibleProducts.length ? (page - 1) * pageSize + 1 : 0;
  const lastProduct = Math.min(page * pageSize, visibleProducts.length);

  const cartItems = useMemo(() => cartLines.map((line) => {
    const product = products.find((item) => item.slug === line.slug);
    return product ? { product, quantity: line.quantity } : null;
  }).filter((item): item is { product: BazaarProduct; quantity: number } => Boolean(item)), [cartLines]);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const addToCart = (product: BazaarProduct) => {
    if (isAdmin) return;
    setCartLines((lines) => {
      const existingLine = lines.find((line) => line.slug === product.slug);
      if (existingLine) return lines.map((line) => line.slug === product.slug ? { ...line, quantity: line.quantity + 1 } : line);
      return [...lines, { slug: product.slug, quantity: 1 }];
    });
    setSelected(null);
    setCartOpen(true);
  };

  const toggleFavorite = async (product: BazaarProduct) => {
    if (!canUseTravelerTools) return;
    if (accountRole !== "traveler") {
      window.dispatchEvent(new CustomEvent("alpnile:open-account", { detail: { mode: "login" } }));
      return;
    }
    const saved = !favoriteSlugs.includes(product.slug);
    setFavoriteSlugs((slugs) => saved ? [...slugs, product.slug] : slugs.filter((slug) => slug !== product.slug));
    const result = await toggleCatalogFavorite({ entityType: "product", entitySlug: product.slug, saved });
    if (result.error) setFavoriteSlugs((slugs) => saved ? slugs.filter((slug) => slug !== product.slug) : [...slugs, product.slug]);
  };

  const updateCartQuantity = (slug: string, delta: number) => {
    setCartLines((lines) => lines.map((line) => line.slug === slug ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  };

  const removeFromCart = (slug: string) => setCartLines((lines) => lines.filter((line) => line.slug !== slug));

  const requestLink = selected ? `mailto:hello@alpnile.com?subject=${encodeURIComponent(`Bazaar request: ${selected.name}`)}&body=${encodeURIComponent(`Hello AlpNile, I would like to ask about the ${selected.name}.`)}` : "#";
  const checkoutLink = `mailto:hello@alpnile.com?subject=${encodeURIComponent("Bazaar order request")}&body=${encodeURIComponent(`Hello AlpNile, I would like to request checkout for:\n${cartItems.map((item) => `- ${item.product.name} × ${item.quantity} = ${format(item.product.price * item.quantity)}`).join("\n")}\n\nEstimated subtotal: ${format(cartSubtotal)}`)}`;

  return (
    <main className="bazaar-page">
      <section className="bazaar-hero">
        <div className="bazaar-dune bazaar-dune-one" aria-hidden="true" />
        <div className="bazaar-dune bazaar-dune-two" aria-hidden="true" />
        {!isAdmin && <button type="button" className="bazaar-cart-trigger bazaar-hero-cart" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag with ${cartCount} items`}><span className="bazaar-cart-trigger-icon" aria-hidden="true">◇</span><span>Shopping bag</span><strong aria-live="polite">{cartCount}</strong></button>}
        <div className="bazaar-wrap bazaar-hero-inner">
          <div className="bazaar-hero-copy">
            <p className="bazaar-kicker">ALPNILE / THE BAZAAR</p>
            <h1>Objects carried<br /><em>home.</em></h1>
            <p>Handmade pieces, warm materials and small reminders of the places that stay with you after the river disappears from view.</p>
            <div className="bazaar-hero-meta"><span><strong>{String(products.length).padStart(2, "0")}</strong> objects</span><span><strong>04</strong> cities</span><span><strong>01</strong> living route</span></div>
          </div>
          <div className="bazaar-hero-products" aria-label="Featured bazaar products">
            {products.slice(0, 3).map((product, index) => <button type="button" className={`bazaar-hero-product hero-product-${index + 1}`} key={product.slug} onClick={() => setSelected(product)} aria-label={`View ${product.name}`}><span>0{index + 1}</span><img src={product.image} alt="" /></button>)}
          </div>
        </div>
      </section>

      <section className="bazaar-wrap bazaar-catalog" id="bazaar-catalog">
        <div className="bazaar-catalog-heading"><div><p className="bazaar-kicker">From the markets</p><h2>Find your object</h2><p>Filter by the kind of piece you want to bring into your route.</p></div><div className="bazaar-catalog-side"><div className="bazaar-catalog-count"><strong>{visibleProducts.length}</strong><span>shown now</span></div>{!isAdmin && <button type="button" className="bazaar-cart-trigger bazaar-catalog-cart" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag with ${cartCount} items`}><span className="bazaar-cart-trigger-icon" aria-hidden="true">◇</span><span>Bag</span><strong aria-live="polite">{cartCount}</strong></button>}</div></div>
        <div className="bazaar-toolbar"><label className="bazaar-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the bazaar" aria-label="Search the bazaar" /></label><div className="bazaar-filter-list" role="tablist" aria-label="Filter products by category">{categories.map((category) => <button type="button" role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? "active" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></div>
        <div className="bazaar-result-line"><span>{activeCategory === "All objects" ? "Every object" : activeCategory}</span><span>{search ? `Matching “${search}”` : `Showing ${firstProduct}–${lastProduct} of ${visibleProducts.length} products`}</span></div>
        <div className="bazaar-product-grid">{paginatedProducts.map((product, index) => <article className="bazaar-product-card" key={product.slug}><div className="bazaar-product-button"><div className="bazaar-product-media"><span className="bazaar-product-index">{String((page - 1) * pageSize + index + 1).padStart(2, "0")}</span><span className="bazaar-product-origin">{product.origin}</span><img src={product.image} alt={product.name} loading={index < 3 ? "eager" : "lazy"} /></div><div className="bazaar-product-copy"><span className="bazaar-product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div><strong>From <LocalizedPrice amount={product.price} /></strong><Link href={`/market/${product.slug}`} className="bazaar-view-link">View object <Arrow /></Link></div></div></div>{canUseTravelerTools && <div className="bazaar-product-actions"><button type="button" className={`bazaar-favorite-button ${favoriteSlugs.includes(product.slug) ? "is-favorite" : ""}`} onClick={() => void toggleFavorite(product)} aria-label={`${favoriteSlugs.includes(product.slug) ? "Remove" : "Save"} ${product.name} ${favoriteSlugs.includes(product.slug) ? "from" : "to"} favorites`}><span aria-hidden="true">{favoriteSlugs.includes(product.slug) ? "♥" : "♡"}</span><small>{favoriteSlugs.includes(product.slug) ? "Saved" : "Save"}</small></button>{!isAdmin && <button type="button" className="bazaar-add-button" onClick={() => addToCart(product)}>Add to bag <span aria-hidden="true">+</span></button>}</div>}</article>)}</div>
        {visibleProducts.length > 0 && totalPages > 1 && <nav className="bazaar-pagination" aria-label="Product pages"><button type="button" onClick={() => setCurrentPage(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page">←</button><div className="bazaar-pagination-pages">{Array.from({ length: totalPages }, (_, index) => { const pageNumber = index + 1; return <button type="button" key={pageNumber} className={page === pageNumber ? "active" : ""} aria-current={page === pageNumber ? "page" : undefined} onClick={() => setCurrentPage(pageNumber)}>{pageNumber}</button>; })}</div><button type="button" onClick={() => setCurrentPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="Next page">→</button><span>Page {page} of {totalPages}</span></nav>}
        {!visibleProducts.length && <div className="bazaar-empty"><strong>Nothing in this aisle yet.</strong><span>Try another category or search term.</span><button type="button" onClick={() => { setActiveCategory("All objects"); setSearch(""); }}>Clear filters</button></div>}
      </section>

      <section className="bazaar-story"><div className="bazaar-wrap bazaar-story-inner"><div><p className="bazaar-kicker">A slower kind of shopping</p><h2>Not mass-made.<br /><em>Just well found.</em></h2></div><p>Every object is presented as a part of the route: where it comes from, what it is made of and why it feels good to keep. Ask us about availability, shipping or a piece you saw in one of Egypt&apos;s bazaars.</p></div></section>

      {selected && <div className="bazaar-modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}><div className="bazaar-modal" role="dialog" aria-modal="true" aria-labelledby="bazaar-product-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="bazaar-modal-close" onClick={() => setSelected(null)} aria-label="Close product details">×</button><div className="bazaar-modal-image"><img src={selected.fourK} alt={selected.name} /></div><div className="bazaar-modal-copy"><p className="bazaar-kicker">{selected.category} · {selected.origin}</p><h2 id="bazaar-product-title">{selected.name}</h2><p className="bazaar-modal-note">{selected.note}</p><p>{selected.description}</p><dl><div><dt>Material</dt><dd>{selected.material}</dd></div><div><dt>Starting price</dt><dd><LocalizedPrice amount={selected.price} /></dd></div></dl><div className="bazaar-modal-actions">{canUseTravelerTools && <button type="button" className="bazaar-favorite-button modal-favorite" onClick={() => void toggleFavorite(selected)}><span aria-hidden="true">{favoriteSlugs.includes(selected.slug) ? "♥" : "♡"}</span> {favoriteSlugs.includes(selected.slug) ? "Saved" : "Save"}</button>}{!isAdmin && <button type="button" className="bazaar-primary-button" onClick={() => addToCart(selected)}>Add to bag <Arrow /></button>}<a className="bazaar-secondary-link" href={requestLink}>Ask about this piece <Arrow /></a><a className="bazaar-secondary-link" href={selected.fourK} download>View 4K PNG <Arrow /></a></div></div></div></div>}
      {!isAdmin && cartOpen && <div className="bazaar-cart-backdrop" role="presentation" onMouseDown={() => setCartOpen(false)}><aside className="bazaar-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="bazaar-cart-title" onMouseDown={(event) => event.stopPropagation()}><div className="bazaar-cart-header"><div><p className="bazaar-kicker">YOUR BAZAAR BAG</p><h2 id="bazaar-cart-title">Take it with you.</h2><span>{cartCount} {cartCount === 1 ? "piece" : "pieces"} selected</span></div><button type="button" className="bazaar-modal-close" onClick={() => setCartOpen(false)} aria-label="Close shopping bag">×</button></div>{cartItems.length ? <><div className="bazaar-cart-items">{cartItems.map(({ product, quantity }) => <div className="bazaar-cart-item" key={product.slug}><div className="bazaar-cart-item-image"><img src={product.image} alt="" /></div><div className="bazaar-cart-item-copy"><span>{product.category}</span><h3>{product.name}</h3><strong><LocalizedPrice amount={product.price * quantity} /></strong><div className="bazaar-cart-item-controls"><button type="button" onClick={() => updateCartQuantity(product.slug, -1)} aria-label={`Remove one ${product.name}`}>−</button><b>{quantity}</b><button type="button" onClick={() => updateCartQuantity(product.slug, 1)} aria-label={`Add one ${product.name}`}>+</button><button type="button" className="bazaar-cart-remove" onClick={() => removeFromCart(product.slug)}>Remove</button></div></div></div>)}</div><div className="bazaar-cart-summary"><div><span>Estimated subtotal</span><strong><LocalizedPrice amount={cartSubtotal} /></strong></div><p>Shipping and final availability are confirmed personally by AlpNile before payment.</p><a className="bazaar-primary-button" href={checkoutLink}>Request checkout <Arrow /></a></div></> : <div className="bazaar-cart-empty"><span className="bazaar-cart-empty-icon" aria-hidden="true">◇</span><h3>Your bag is waiting.</h3><p>Add a piece from the bazaar and it will appear here.</p><button type="button" onClick={() => setCartOpen(false)}>Continue browsing <Arrow /></button></div>}</aside></div>}
    </main>
  );
}
