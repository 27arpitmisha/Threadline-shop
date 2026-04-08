import { Link } from "react-router-dom";
import { formatInr, FREE_SHIPPING_MIN_INR } from "../lib/money";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#050508]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 100%, rgba(139, 92, 246, 0.2), transparent), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(212, 255, 0, 0.06), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-bold text-gradient-accent">Sageइंक</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Limited runs, heavy cotton, fits that actually slap. Built for the feed and the street.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent/80">Shop</p>
            <ul className="mt-5 space-y-3 text-sm font-medium text-zinc-400">
              <li>
                <Link to="/shop" className="transition hover:text-accent">
                  All products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=graphic" className="transition hover:text-accent">
                  Graphics
                </Link>
              </li>
              <li>
                <Link to="/shop?category=basics" className="transition hover:text-accent">
                  Basics
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent/80">Account</p>
            <ul className="mt-5 space-y-3 text-sm font-medium text-zinc-400">
              <li>
                <Link to="/login" className="transition hover:text-accent">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/signup" className="transition hover:text-accent">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent/80">Ship</p>
            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              Free shipping on orders over {formatInr(FREE_SHIPPING_MIN_INR)}. Easy returns within 30
              days.
            </p>
          </div>
        </div>
        <p className="mt-14 border-t border-white/10 pt-10 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Threadline · Akash storefront
        </p>
      </div>
    </footer>
  );
}
