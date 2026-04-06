import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { assetUrl } from "../lib/assetUrl";
import { formatInr } from "../lib/money";
import { ProductGalleryArrows } from "../components/ProductGalleryArrows";
import { productImageList } from "../lib/productImages";
import { useCart } from "../context/CartContext";

export function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        setPhotoIndex(0);
        const sizes = res.data.sizes?.length ? res.data.sizes : ["S", "M", "L", "XL"];
        setSize(sizes.includes("M") ? "M" : sizes[0]);
        const colors = res.data.colors || [];
        setColor(colors[0] || "");
      })
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAdd() {
    if (!product) return;
    setAdding(true);
    setAdded(false);
    try {
      await addItem(product, qty, size, color);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="animate-pulse gap-10 lg:grid lg:grid-cols-2">
          <div className="aspect-[4/5] rounded-3xl bg-zinc-800/80" />
          <div className="mt-8 space-y-4 lg:mt-0">
            <div className="h-10 w-2/3 rounded-xl bg-zinc-800" />
            <div className="h-8 w-1/4 rounded-xl bg-zinc-800" />
            <div className="h-24 rounded-xl bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <p className="text-zinc-500">{error || "Unavailable"}</p>
        <Link
          to="/shop"
          className="mt-6 inline-block font-bold text-accent underline-offset-4 hover:underline"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  const colors = product.colors || [];
  const gallery = productImageList(product);
  const mainSrc = gallery[photoIndex] || gallery[0] || "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <nav className="text-sm text-zinc-500">
        <Link to="/shop" className="font-medium transition hover:text-accent">
          Shop
        </Link>
        <span className="mx-2 text-zinc-700">/</span>
        <span className="text-zinc-300">{product.name}</span>
      </nav>
      <div className="mt-10 gap-12 lg:grid lg:grid-cols-2 lg:items-start">
        <div className="perspective-[1000px]">
          <div className="card-3d overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-950 p-2 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7)]">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={assetUrl(mainSrc)}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
              {gallery.length > 1 && (
                <ProductGalleryArrows
                  onPrev={() =>
                    setPhotoIndex((i) => (i - 1 + gallery.length) % gallery.length)
                  }
                  onNext={() => setPhotoIndex((i) => (i + 1) % gallery.length)}
                />
              )}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {gallery.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setPhotoIndex(idx)}
                  className={`overflow-hidden rounded-xl border-2 transition ${
                    idx === photoIndex
                      ? "border-accent shadow-[0_0_16px_-4px_rgba(212,255,0,0.45)]"
                      : "border-white/10 opacity-75 hover:border-white/25 hover:opacity-100"
                  }`}
                >
                  <img
                    src={assetUrl(src)}
                    alt=""
                    className="h-16 w-14 object-cover sm:h-20 sm:w-16"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>
          <p className="mt-6 font-display text-3xl font-bold text-gradient-accent sm:text-4xl">
            {formatInr(product.price)}
          </p>
          <p className="mt-8 leading-relaxed text-zinc-400">{product.description}</p>

          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-[2.75rem] rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                    size === s
                      ? "border-accent bg-accent text-zinc-950 shadow-[0_0_20px_-6px_rgba(212,255,0,0.45)]"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {colors.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Color</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                      color === c
                        ? "border-accent bg-accent text-zinc-950 shadow-[0_0_20px_-6px_rgba(212,255,0,0.45)]"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-500">
              Qty
              <input
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                className="w-20 rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-center font-bold text-ink"
              />
            </label>
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              className="flex-1 min-w-[200px] rounded-2xl bg-gradient-to-b from-[#eeff66] to-[#b8e600] py-4 text-sm font-bold text-zinc-950 shadow-[0_0_40px_-10px_rgba(212,255,0,0.55)] transition hover:brightness-105 disabled:opacity-60 sm:flex-none sm:px-12"
            >
              {adding ? "Adding…" : "Add to cart"}
            </button>
          </div>
          {added && (
            <p className="mt-5 text-sm font-bold text-lime-400" role="status">
              In the bag —{" "}
              <Link to="/cart" className="underline underline-offset-2 hover:text-accent">
                view cart
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
