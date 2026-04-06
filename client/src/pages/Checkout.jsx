import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatInr, FREE_SHIPPING_MIN_INR, SHIPPING_FLAT_INR } from "../lib/money";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-zinc-600 focus:border-accent/40 focus:ring-2 focus:ring-accent/25";

export function Checkout() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { lines, subtotal, refreshCart } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_MIN_INR ? 0 : SHIPPING_FLAT_INR;
  const total = Math.round((subtotal + shipping) * 100) / 100;

  const [form, setForm] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-zinc-500 sm:px-6">Loading…</div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/checkout" } }} />;
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <div className="glass-panel p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 text-lime-400 shadow-[0_0_40px_-10px_rgba(163,230,53,0.4)]">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-8 font-display text-2xl font-extrabold text-white">You&apos;re in</h1>
          <p className="mt-3 text-zinc-400">
            Order ref{" "}
            <span className="font-mono font-bold text-accent">{orderId}</span>
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Demo mode — no charge. Stock was updated on the server.
          </p>
          <Link to="/shop" className="btn-chrome mt-10 inline-flex">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim()) {
      setError("Please fill in name, address line 1, and city.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders/checkout", {
        shippingAddress: {
          fullName: form.fullName.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
      });
      setOrderId(data._id);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">Checkout</h1>
      <p className="mt-2 text-zinc-500">Ship it. Demo checkout — no real payment.</p>

      <div className="mt-10 gap-12 lg:grid lg:grid-cols-12 lg:items-start">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-7">
          {error && (
            <div
              className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}
          <fieldset className="glass-panel p-6 sm:p-8">
            <legend className="font-display px-1 text-lg font-bold text-white">Shipping</legend>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Full name
                </label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Address line 1
                </label>
                <input
                  required
                  value={form.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Address line 2 (optional)
                </label>
                <input
                  value={form.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  City
                </label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  State / region
                </label>
                <input
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Postal code
                </label>
                <input
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Country
                </label>
                <input
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="e.g. India"
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 p-6">
            <legend className="px-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Payment
            </legend>
            <p className="text-sm text-zinc-500">
              Demo: place order skips the card. Wire up Stripe or Razorpay in prod.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-b from-[#eeff66] to-[#b8e600] py-4 text-sm font-bold text-zinc-950 shadow-[0_0_40px_-10px_rgba(212,255,0,0.5)] transition hover:brightness-105 disabled:opacity-60 lg:max-w-xs"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </form>

        <aside className="glass-panel mt-10 p-6 lg:col-span-5 lg:mt-0">
          <h2 className="font-display text-lg font-bold text-white">Your order</h2>
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {lines.map((line) => {
              const p = line.product;
              if (!p) return null;
              return (
                <li key={line.id} className="flex justify-between gap-4 py-3 first:pt-0">
                  <span className="text-zinc-500">
                    {p.name} × {line.quantity}
                  </span>
                  <span className="shrink-0 font-bold text-zinc-200">
                    {formatInr(p.price * line.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="font-bold text-zinc-200">{formatInr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping</dt>
              <dd className="font-bold text-zinc-200">
                {shipping === 0 ? <span className="text-lime-400">Free</span> : formatInr(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-base font-extrabold text-white">
              <dt>Total</dt>
              <dd className="text-gradient-accent">{formatInr(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
