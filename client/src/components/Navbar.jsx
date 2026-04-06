import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const linkClass = ({ isActive }) =>
  `text-sm font-semibold transition-all ${
    isActive
      ? "text-accent drop-shadow-[0_0_12px_rgba(212,255,0,0.35)]"
      : "text-zinc-400 hover:text-ink"
  }`;

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight sm:text-xl"
        >
          <span className="text-gradient-accent">Threadline</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/shop" className={linkClass}>
            Shop
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart
            {count > 0 && (
              <span className="ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-zinc-950">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </NavLink>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <>
                  <NavLink to="/admin/upload" className={linkClass}>
                    Upload
                  </NavLink>
                  <NavLink to="/admin" end className={linkClass}>
                    Admin
                  </NavLink>
                </>
              )}
              <span className="hidden max-w-[120px] truncate text-xs font-medium text-zinc-500 sm:inline sm:max-w-[140px] sm:text-sm">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 sm:px-4"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:text-ink sm:inline sm:px-4"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-b from-[#eeff66] to-[#b8e600] px-4 py-2 text-sm font-bold text-zinc-950 shadow-[0_0_24px_-6px_rgba(212,255,0,0.5)] transition hover:brightness-105"
              >
                Sign up
              </Link>
            </>
          )}
          <Link
            to="/cart"
            className="relative inline-flex rounded-xl border border-white/10 bg-white/5 p-2 md:hidden"
            aria-label="Cart"
          >
            <svg className="h-5 w-5 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-zinc-950">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="flex border-t border-white/[0.06] bg-zinc-950/40 px-2 py-2 backdrop-blur-md md:hidden">
        <NavLink to="/shop" className={(p) => `${linkClass(p)} flex-1 rounded-lg py-2 text-center`}>
          Shop
        </NavLink>
        <NavLink to="/cart" className={(p) => `${linkClass(p)} flex-1 rounded-lg py-2 text-center`}>
          Cart{count > 0 ? ` (${count})` : ""}
        </NavLink>
        {isAuthenticated && user?.role === "admin" && (
          <>
            <NavLink
              to="/admin/upload"
              className={(p) => `${linkClass(p)} flex-1 rounded-lg py-2 text-center`}
            >
              Upload
            </NavLink>
            <NavLink
              to="/admin"
              end
              className={(p) => `${linkClass(p)} flex-1 rounded-lg py-2 text-center`}
            >
              Admin
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
