"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type AppUser = { name: string };

type SessionCtx = {
  user: AppUser | null;
  code: string | null;
  ready: boolean;
  /** Join an existing trip code, or pass an empty code to create a brand-new trip. */
  signIn: (name: string, code?: string) => { code: string };
  signOut: () => void;
};

const Ctx = createContext<SessionCtx | null>(null);
const KEY = "tripjoy-session";

/** 6-char human-friendly code, no ambiguous chars (0/O, 1/I). */
function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++)
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.name && s?.code) {
          setUser({ name: s.name });
          setCode(s.code);
        }
      }
    } catch {}
    setReady(true);
  }, []);

  const signIn = useCallback((name: string, codeInput?: string) => {
    const finalCode = (codeInput || "").trim().toUpperCase() || makeCode();
    const cleanName = name.trim() || "Traveler";
    setUser({ name: cleanName });
    setCode(finalCode);
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ name: cleanName, code: finalCode })
      );
    } catch {}
    return { code: finalCode };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setCode(null);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, []);

  return (
    <Ctx.Provider value={{ user, code, ready, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
