import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { assetUrl } from "../lib/assetUrl";
import { formatInr, FREE_SHIPPING_MIN_INR, SHIPPING_FLAT_INR } from "../lib/money";
import { productCover } from "../lib/productImages";

export function Cart() {
  const { lines, subtotal, loading, updateQuantity, removeItem } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_MIN_INR ? 0 : SHIPPING_FLAT_INR;
  const total = Math.round((subtotal + shipping) * 100) / 100;

  if (loading && lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-zinc-500 sm:px-6">
        Loading cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-white">Your cart</h1>
        <p className="mt-4 text-zinc-500">Nothing here yet. Go find something loud.</p>
        <Link to="/shop" className="btn-chrome mt-10 inline-flex">
          Shop the drop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">Your cart</h1>
      <div className="mt-10 gap-12 lg:grid lg:grid-cols-12 lg:items-start">
        <ul className="space-y-6 lg:col-span-7">
          {lines.map((line) => {
            const p = line.product;
            if (!p) return null;
            return (
              <li
                key={line.id}
                className="glass-panel flex gap-4 p-4 sm:gap-6 sm:p-5"
              >
                <Link
                  to={p.slug ? `/shop/${p.slug}` : "/shop"}
                  className="shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950"
                >
                  <img
                    src={assetUrl(productCover(p))}
                    alt=""
                    className="h-24 w-20 object-cover sm:h-28 sm:w-24"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={p.slug ? `/shop/${p.slug}` : "/shop"}
                    className="font-display font-bold text-white transition hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-500">
                    {line.size}
                    {line.color ? ` · ${line.color}` : ""}
                  </p>
                  <p className="mt-2 font-bold text-zinc-300">{formatInr(p.price)}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-500">
                      Qty
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={line.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            line.id,
                            Math.max(1, Math.min(99, Number(e.target.value) || 1))
                          )
                        }
                        className="w-16 rounded-lg border border-white/10 bg-zinc-900/80 px-2 py-1 text-center text-sm font-bold text-ink"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      className="text-sm font-bold text-zinc-500 underline-offset-2 transition hover:text-accent hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="hidden shrink-0 font-bold text-gradient-accent sm:block">
                  {formatInr(p.price * line.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
        <aside className="glass-panel mt-10 p-6 lg:col-span-5 lg:mt-0">
          <h2 className="font-display text-lg font-bold text-white">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="font-bold text-zinc-200">{formatInr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping</dt>
              <dd className="font-bold">
                {shipping === 0 ? (
                  <span className="text-lime-400">Free</span>
                ) : (
                  formatInr(shipping)
                )}
              </dd>
            </div>
            {subtotal < FREE_SHIPPING_MIN_INR && subtotal > 0 && (
              <p className="text-xs text-zinc-500">
                Add {formatInr(FREE_SHIPPING_MIN_INR - subtotal)} more for free shipping.
              </p>
            )}
            <div className="flex justify-between border-t border-white/10 pt-4 text-base font-bold text-white">
              <dt>Total</dt>
              <dd className="text-gradient-accent">{formatInr(total)}</dd>
            </div>
          </dl>
          <Link
            to="/checkout"
            className="mt-8 flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#eeff66] to-[#b8e600] py-3.5 text-sm font-bold text-zinc-950 shadow-[0_0_32px_-8px_rgba(212,255,0,0.45)] transition hover:brightness-105"
          >
            Checkout
          </Link>
          <Link
            to="/shop"
            className="mt-4 block text-center text-sm font-bold text-zinc-500 transition hover:text-accent"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
