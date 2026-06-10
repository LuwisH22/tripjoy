"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AppUser = { email: string; name: string };

type SessionCtx = {
  user: AppUser | null;
  ready: boolean;
  /** In Supabase mode returns true when a magic link was sent. In local mode signs in immediately. */
  signIn: (email: string, name: string) => Promise<{ magicLinkSent: boolean }>;
  signOut: () => Promise<void>;
  configured: boolean;
};

const Ctx = createContext<SessionCtx | null>(null);
const LOCAL_KEY = "tripjoy-local-session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const s = data.session;
        if (s?.user) {
          setUser({
            email: s.user.email ?? "",
            name:
              (s.user.user_metadata?.name as string) ||
              s.user.email?.split("@")[0] ||
              "Traveler",
          });
        }
        setReady(true);
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        if (s?.user) {
          setUser({
            email: s.user.email ?? "",
            name:
              (s.user.user_metadata?.name as string) ||
              s.user.email?.split("@")[0] ||
              "Traveler",
          });
        } else {
          setUser(null);
        }
      });
      unsub = () => sub.subscription.unsubscribe();
    } else {
      // Local fallback (no keys yet)
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      setReady(true);
    }

    return () => unsub?.();
  }, []);

  const signIn = useCallback(async (email: string, name: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { name },
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      return { magicLinkSent: true };
    }
    const u = { email, name };
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(u));
    } catch {}
    setUser(u);
    return { magicLinkSent: false };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      try {
        localStorage.removeItem(LOCAL_KEY);
      } catch {}
    }
    setUser(null);
  }, []);

  return (
    <Ctx.Provider
      value={{ user, ready, signIn, signOut, configured: isSupabaseConfigured }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
