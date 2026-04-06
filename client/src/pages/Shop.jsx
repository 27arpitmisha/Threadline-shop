import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { assetUrl } from "../lib/assetUrl";
import { formatInr } from "../lib/money";
import { productCover, productImageList } from "../lib/productImages";

const categories = [
  { id: "", label: "All" },
  { id: "graphic", label: "Graphics" },
  { id: "basics", label: "Basics" },
  { id: "stripes", label: "Stripes" },
];

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const p = {};
    if (category) p.category = category;
    const q = search.trim();
    if (q) p.search = q;
    return p;
  }, [category, search]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [params]);

  function setCategory(id) {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("category", id);
    else next.delete("category");
    setSearchParams(next);
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set("q", search.trim());
    else next.delete("q");
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Shop <span className="text-gradient-accent">everything</span>
        </h1>
        <p className="mt-4 text-zinc-500">
          Filter the feed. Search by vibe. All in stock unless we say otherwise.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id || "all"}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                (c.id || "") === category
                  ? "bg-accent text-zinc-950 shadow-[0_0_24px_-6px_rgba(212,255,0,0.5)]"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <form onSubmit={onSearchSubmit} className="flex w-full max-w-md gap-2">
          <input
            type="search"
            placeholder="Search drops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-ink placeholder:text-zinc-600 outline-none ring-accent/30 transition focus:border-accent/40 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-b from-[#eeff66] to-[#b8e600] px-5 py-3 text-sm font-bold text-zinc-950 shadow-[0_0_20px_-6px_rgba(212,255,0,0.45)] transition hover:brightness-105"
          >
            Go
          </button>
        </form>
      </div>

      {loading ? (
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50"
            >
              <div className="aspect-[4/5] bg-zinc-800/80" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 rounded-lg bg-zinc-800" />
                <div className="h-4 w-1/4 rounded-lg bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-20 text-center text-zinc-500">Nothing matches that filter. Try another vibe.</p>
      ) : (
        <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p._id} className="perspective-[1200px]">
              <Link
                to={`/shop/${p.slug}`}
                className="card-3d group block overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-950">
                  <img
                    src={assetUrl(productCover(p))}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                  />
                  {productImageList(p).length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      {productImageList(p).length} photos
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-white/5 bg-zinc-950/60 p-5">
                  <div className="min-w-0">
                    <h2 className="font-display font-bold text-white transition group-hover:text-accent">
                      {p.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{p.description}</p>
                  </div>
                  <p className="shrink-0 font-display text-lg font-bold text-gradient-accent">
                    {formatInr(p.price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
