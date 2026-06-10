"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { LoginModal } from "./LoginModal";

const ADMIN_ID = "dieng2026";
const ADMIN_PASS = "kapanlagikaburkesana?";
const STORAGE_KEY = "tripjoy-admin";

type AuthCtx = {
  isAdmin: boolean;
  ready: boolean;
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  openLogin: () => void;
  /** Run action if admin, otherwise prompt for login. */
  guard: (action: () => void) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    try {
      setIsAdmin(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
    setReady(true);
  }, []);

  const login = useCallback((id: string, pass: string) => {
    const ok = id.trim() === ADMIN_ID && pass === ADMIN_PASS;
    if (ok) {
      setIsAdmin(true);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const openLogin = useCallback(() => setLoginOpen(true), []);

  const guard = useCallback(
    (action: () => void) => {
      if (isAdmin) action();
      else setLoginOpen(true);
    },
    [isAdmin]
  );

  return (
    <Ctx.Provider
      value={{ isAdmin, ready, login, logout, openLogin, guard }}
    >
      {children}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
