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
  trip as seedTrip,
  type Traveler,
  type ItineraryDay,
  type Expense,
  type Note,
} from "@/lib/data";

export type TripInfo = {
  destination: string;
  dates: string;
  days: number;
  image: string;
};

export type TripState = {
  trip: TripInfo;
  travelers: Traveler[];
  days: ItineraryDay[];
  expenses: Expense[];
  notes: Note[];
  savings: number;
  budgetTotal: number;
  savingsGoal: number;
};

function defaultState(): TripState {
  return {
    trip: {
      destination: seedTrip.destination,
      dates: seedTrip.dates,
      days: seedTrip.days,
      image: seedTrip.image,
    },
    travelers: seedTravelers,
    days: seedDays,
    expenses: seedExpenses,
    notes: seedNotes,
    savings: 2_000_000,
    budgetTotal: 8_500_000,
    savingsGoal: 3_000_000,
  };
}

/** Seed the "You" traveler with the trip creator's name. */
function personalize(
  s: TripState,
  user: { name: string } | null
): TripState {
  if (!user) return s;
  const hasYou = s.travelers.some((t) => t.status === "You");
  let travelers = s.travelers.map((t) =>
    t.status === "You" ? { ...t, name: user.name } : t
  );
  if (!hasYou) {
    travelers = [
      {
        name: user.name,
        role: "Trip Planner",
        status: "You" as const,
        avatar: "",
      },
      ...travelers,
    ];
  }
  return { ...s, travelers };
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
  setBudgetTotal: (v: Upd<number>) => void;
  setSavingsGoal: (v: Upd<number>) => void;
  setTrip: (v: Upd<TripInfo>) => void;
  // convenience for components that read travelers directly
  travelers: Traveler[];
};

function resolve<T>(v: Upd<T>, prev: T): T {
  return typeof v === "function" ? (v as (p: T) => T)(prev) : v;
}

const Ctx = createContext<TripData | null>(null);
const LOCAL_KEY = "tripjoy-data";

export function TripDataProvider({ children }: { children: React.ReactNode }) {
  const { user, code } = useSession();
  const [state, setState] = useState<TripState>(defaultState);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the trip for the current code
  useEffect(() => {
    let cancelled = false;
    loaded.current = false;
    setReady(false);

    async function load() {
      if (!code || !user) {
        setReady(false);
        return;
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("shared_trips")
          .select("data")
          .eq("code", code)
          .maybeSingle();

        if (cancelled) return;

        if (!error && data?.data && Object.keys(data.data).length) {
          // Joining an existing trip — use its data as-is.
          setState({ ...defaultState(), ...(data.data as TripState) });
        } else {
          // New trip — seed it with the creator as the first traveler.
          const fresh = personalize(defaultState(), user);
          setState(fresh);
          await supabase
            .from("shared_trips")
            .upsert({ code, data: fresh });
        }
      } else {
        // local fallback (no Supabase keys)
        try {
          const raw = localStorage.getItem(LOCAL_KEY + code);
          setState(
            raw
              ? { ...defaultState(), ...JSON.parse(raw) }
              : personalize(defaultState(), user)
          );
        } catch {
          setState(personalize(defaultState(), user));
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
  }, [code, user]);

  // Persist (debounced) on any change after load
  useEffect(() => {
    if (!loaded.current || !code) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncing(true);
    saveTimer.current = setTimeout(async () => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from("shared_trips").upsert({ code, data: state });
      } else {
        try {
          localStorage.setItem(LOCAL_KEY + code, JSON.stringify(state));
        } catch {}
      }
      setSyncing(false);
    }, 600);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, code]);

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
    setBudgetTotal: (v) =>
      setState((s) => ({ ...s, budgetTotal: resolve(v, s.budgetTotal) })),
    setSavingsGoal: (v) =>
      setState((s) => ({ ...s, savingsGoal: resolve(v, s.savingsGoal) })),
    setTrip: (v) => setState((s) => ({ ...s, trip: resolve(v, s.trip) })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTripData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTripData must be used within TripDataProvider");
  return ctx;
}
