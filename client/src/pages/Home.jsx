import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { assetUrl } from "../lib/assetUrl";
import { formatInr, FREE_SHIPPING_MIN_INR } from "../lib/money";
import { useAuth } from "../context/AuthContext";
import { ProductGalleryArrows } from "../components/ProductGalleryArrows";
import { productImageList } from "../lib/productImages";
import { useCart } from "../context/CartContext";

function defaultSize(product) {
  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  return sizes.includes("M") ? "M" : sizes[0];
}

function defaultColor(product) {
  const colors = product.colors || [];
  return colors[0] || "";
}

function FeaturedProductCard({ product: p, onAddToCart, addingId, addedId }) {
  const gallery = productImageList(p);
  const [photoIdx, setPhotoIdx] = useState(0);
  const idx = gallery.length ? photoIdx % gallery.length : 0;
  const src = gallery[idx] || "";

  return (
    <li className="perspective-[1200px]">
      <div className="card-3d flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm">
        <div className="group relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-zinc-950">
          <Link
            to={`/shop/${p.slug}`}
            className="absolute inset-0 z-[1] block overflow-hidden"
            aria-label={`View ${p.name}`}
          >
            <img
              src={assetUrl(src)}
              alt=""
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
            />
          </Link>
          {gallery.length > 1 && (
            <ProductGalleryArrows
              stopPropagation
              onPrev={() => setPhotoIdx((i) => (i - 1 + gallery.length) % gallery.length)}
              onNext={() => setPhotoIdx((i) => (i + 1) % gallery.length)}
            />
          )}
          {gallery.length > 1 && (
            <span className="pointer-events-none absolute bottom-3 right-3 z-[2] rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              +{gallery.length - 1} photos
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-white/5 bg-zinc-950/60 p-6">
          <Link to={`/shop/${p.slug}`}>
            <h3 className="font-display text-lg font-bold text-white transition hover:text-accent">
              {p.name}
            </h3>
          </Link>
          <p className="line-clamp-2 text-sm text-zinc-500">{p.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-xl font-bold text-gradient-accent">{formatInr(p.price)}</p>
            <button
              type="button"
              onClick={() => onAddToCart(p)}
              disabled={addingId === p._id}
              className="shrink-0 rounded-xl bg-gradient-to-b from-[#eeff66] to-[#b8e600] px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-[0_0_20px_-8px_rgba(212,255,0,0.45)] transition hover:brightness-105 disabled:opacity-60 sm:text-sm sm:px-5"
            >
              {addingId === p._id ? "Adding…" : "Add to cart"}
            </button>
          </div>
          {addedId === p._id && (
            <p className="text-xs font-bold text-lime-400" role="status">
              In the bag —{" "}
              <Link to="/cart" className="underline underline-offset-2 hover:text-accent">
                view cart
              </Link>
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export function Home() {
  const { token } = useAuth();
  const { addItem } = useCart();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    api
      .get("/products", { params: { featured: "true" } })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleAddToCart(product) {
    setAddingId(product._id);
    setAddedId(null);
    try {
      await addItem(product, 1, defaultSize(product), defaultColor(product));
      setAddedId(product._id);
      window.setTimeout(() => setAddedId((id) => (id === product._id ? null : id)), 2000);
    } catch {
      /* cart API surfaces errors rarely for guest; ignore */
    } finally {
      setAddingId(null);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.07] mesh-hero">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="pointer-events-none absolute -left-20 top-1/4 hidden h-40 w-40 rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600/30 to-transparent orb-3d float-slow xl:block" />
        <div className="pointer-events-none absolute right-[6%] top-[18%] hidden h-28 w-36 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-transparent float-delayed lg:block" />
        <div
          className="pointer-events-none absolute bottom-[12%] right-[20%] hidden h-24 w-24 rounded-2xl border border-accent/30 bg-accent/5 lg:block"
          style={{ transform: "perspective(500px) rotateY(35deg) rotateX(-10deg)" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-accent backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_10px_#d4ff00]" />
              New drop
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="text-gradient-brand">Tees that hit</span>
              <br />
              <span className="text-white">different.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-zinc-400 sm:text-xl">
              Store by Akash Rajawat
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/shop" className="btn-chrome">
                Shop the drop
              </Link>
              {token ? (
                <Link to="/cart" className="btn-outline-glow">
                  Your cart
                </Link>
              ) : (
                <Link to="/signup" className="btn-outline-glow">
                  Join the crew
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Heat <span className="text-gradient-accent">right now</span>
            </h2>
            <p className="mt-2 text-zinc-500">Featured pieces — tap in.</p>
          </div>
          <Link
            to="/shop"
            className="group text-sm font-bold text-accent transition hover:text-[#eeff66]"
          >
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50"
              >
                <div className="aspect-[4/5] bg-zinc-800/80" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-2/3 rounded-lg bg-zinc-800" />
                  <div className="h-4 w-1/3 rounded-lg bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <FeaturedProductCard
                key={p._id}
                product={p}
                onAddToCart={handleAddToCart}
                addingId={addingId}
                addedId={addedId}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="border-y border-white/[0.06] bg-zinc-950/40 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-3 sm:gap-8 sm:px-6">
          {[
            {
              t: `Free ship ${formatInr(FREE_SHIPPING_MIN_INR)}+`,
              d: "Stack your cart. We cover delivery when you go big.",
            },
            { t: "30-day returns", d: "Changed your mind? Send it back. No drama." },
            { t: "Secure checkout", d: "Your info stays on lock. Always." },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-accent/20 hover:shadow-[0_0_40px_-15px_rgba(212,255,0,0.12)]"
            >
              <p className="font-display text-lg font-bold text-white">{x.t}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{x.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
