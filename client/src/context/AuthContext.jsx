import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "threadline_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const setToken = useCallback((t) => {
    setTokenState(t);
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
      setAuthToken(t);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      api
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setAuthToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token, setToken]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken]
  );

  const register = useCallback(
    async (name, email, password) => {
      const { data } = await api.post("/auth/register", { name, email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      setToken,
    }),
    [user, token, loading, login, register, logout, setToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
