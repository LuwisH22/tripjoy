"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSession } from "@/components/auth/SessionProvider";
import {
  travelers as seedTravelers,
  itineraryDetail as seedDays,
  expenses as seedExpenses,
  notes as seedNotes,
  type Traveler,
  type ItineraryDay,
  type Expense,
  type Note,
} from "@/lib/data";

export type TripState = {
  travelers: Traveler[];
  days: ItineraryDay[];
  expenses: Expense[];
  notes: Note[];
  savings: number;
};

function defaultState(): TripState {
  return {
    travelers: seedTravelers,
    days: seedDays,
    expenses: seedExpenses,
    notes: seedNotes,
    savings: 2_000_000,
  };
}

type Upd<T> = T | ((prev: T) => T);

type TripData = {
  state: TripState;
  ready: boolean;
  syncing: boolean;
  setTravelers: (v: Upd<Traveler[]>) => void;
  addTraveler: (t: Traveler) => void;
  removeTraveler: (name: string) => void;
  setDays: (v: Upd<ItineraryDay[]>) => void;
  setExpenses: (v: Upd<Expense[]>) => void;
  setNotes: (v: Upd<Note[]>) => void;
  setSavings: (v: Upd<number>) => void;
  // convenience for components that read travelers directly
  travelers: Traveler[];
};

function resolve<T>(v: Upd<T>, prev: T): T {
  return typeof v === "function" ? (v as (p: T) => T)(prev) : v;
}

const Ctx = createContext<TripData | null>(null);
const LOCAL_KEY = "tripjoy-data";

export function TripDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [state, setState] = useState<TripState>(defaultState);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const userId = useRef<string | null>(null);
  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load when a user logs in
  useEffect(() => {
    let cancelled = false;
    loaded.current = false;
    setReady(false);

    async function load() {
      if (!user) {
        setReady(false);
        return;
      }

      if (isSupabaseConfigured && supabase) {
        const { data: auth } = await supabase.auth.getUser();
        userId.current = auth.user?.id ?? null;

        const { data, error } = await supabase
          .from("trip_data")
          .select("data")
          .eq("user_id", userId.current)
          .maybeSingle();

        if (cancelled) return;

        if (!error && data?.data && Object.keys(data.data).length) {
          setState({ ...defaultState(), ...(data.data as TripState) });
        } else {
          const fresh = defaultState();
          setState(fresh);
          // seed a row for this user
          await supabase.from("trip_data").upsert({
            user_id: userId.current,
            email: user.email,
            name: user.name,
            data: fresh,
          });
        }
      } else {
        // local mode
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          setState(raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState());
        } catch {
          setState(defaultState());
        }
      }

      if (!cancelled) {
        loaded.current = true;
        setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Persist (debounced) on any change after load
  useEffect(() => {
    if (!loaded.current || !user) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncing(true);
    saveTimer.current = setTimeout(async () => {
      if (isSupabaseConfigured && supabase && userId.current) {
        await supabase.from("trip_data").upsert({
          user_id: userId.current,
          email: user.email,
          name: user.name,
          data: state,
        });
      } else {
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
        } catch {}
      }
      setSyncing(false);
    }, 600);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, user]);

  const value: TripData = {
    state,
    ready,
    syncing,
    travelers: state.travelers,
    setTravelers: (v) =>
      setState((s) => ({ ...s, travelers: resolve(v, s.travelers) })),
    addTraveler: (t) =>
      setState((s) => ({ ...s, travelers: [...s.travelers, t] })),
    removeTraveler: (name) =>
      setState((s) => ({
        ...s,
        travelers: s.travelers.filter((t) => t.name !== name),
      })),
    setDays: (v) => setState((s) => ({ ...s, days: resolve(v, s.days) })),
    setExpenses: (v) =>
      setState((s) => ({ ...s, expenses: resolve(v, s.expenses) })),
    setNotes: (v) => setState((s) => ({ ...s, notes: resolve(v, s.notes) })),
    setSavings: (v) =>
      setState((s) => ({ ...s, savings: resolve(v, s.savings) })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTripData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTripData must be used within TripDataProvider");
  return ctx;
}
