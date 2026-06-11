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
      // A trip code in the URL (invite link) always wins over the saved session.
      const params = new URLSearchParams(window.location.search);
      const urlCode = (params.get("code") || "").trim().toUpperCase();
      // The name the admin assigned to this invite, if any.
      const urlInvite = (params.get("invite") || "").trim();

      const raw = localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : null;

      if (urlCode && urlInvite) {
        // Named invite link — join as the invited person, even on a device
        // that's already logged in under a different name. The invite name wins.
        const next = { name: urlInvite, code: urlCode };
        localStorage.setItem(KEY, JSON.stringify(next));
        setUser({ name: next.name });
        setCode(next.code);
      } else if (urlCode && saved?.name && saved?.code !== urlCode) {
        // Unnamed link to a different trip — switch trips, keep the same name.
        const next = { name: saved.name, code: urlCode };
        localStorage.setItem(KEY, JSON.stringify(next));
        setUser({ name: next.name });
        setCode(next.code);
      } else if (saved?.name && saved?.code) {
        setUser({ name: saved.name });
        setCode(saved.code);
      }
      // If there's a urlCode but no saved session and no invite name, the login
      // screen prefills the code field and the user joins normally.
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
