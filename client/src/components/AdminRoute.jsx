import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-zinc-500">Loading…</div>
    );
  }
  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: { pathname: location.pathname } }} />
    );
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
