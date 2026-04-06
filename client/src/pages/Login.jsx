import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-ink outline-none transition placeholder:text-zinc-600 focus:border-accent/40 focus:ring-2 focus:ring-accent/25";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not log in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="glass-panel p-8 sm:p-10">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-500">Log in and keep your cart synced.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-300 py-3.5 text-sm font-bold text-zinc-950 shadow-[0_0_28px_-8px_rgba(255,255,255,0.25)] transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Log in"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link to="/signup" className="font-bold text-accent underline-offset-2 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
