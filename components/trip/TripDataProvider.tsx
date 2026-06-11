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
  type Traveler,
  type ItineraryDay,
  type Expense,
  type Note,
  type Bill,
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
  bills: Bill[];
  notes: Note[];
  savings: number;
  budgetTotal: number;
  savingsGoal: number;
};

const PENDING_KEY = "tripjoy-pending";

/** Ensure the current viewer exists in the trip's traveler list (joiners get added). */
function ensureMember(s: TripState, user: { name: string } | null): TripState {
  if (!user?.name) return s;
  const me = user.name.trim().toLowerCase();
  // Migrate any legacy "You" status to "Organizer", and mark the current
  // viewer as "Joined" if they were still on an "Invited" status — i.e. they
  // just opened their invite link / joined for the first time.
  let travelers = s.travelers.map((t) => {
    if (t.status === "You") return { ...t, status: "Organizer" as const };
    if (t.name.trim().toLowerCase() === me && t.status === "Invited")
      return { ...t, status: "Joined" as const };
    return t;
  });
  if (!travelers.some((t) => t.name.trim().toLowerCase() === me)) {
    travelers = [
      ...travelers,
      { name: user.name.trim(), role: "Traveler", status: "Joined" as const, avatar: "" },
    ];
  }
  return { ...s, travelers };
}

/** Apply trip details captured on the "new trip" screen, if they match this code. */
function applyPending(s: TripState, code: string): TripState {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return s;
    const p = JSON.parse(raw) as { code: string; trip: Partial<TripInfo> };
    if (p?.code === code && p.trip) {
      localStorage.removeItem(PENDING_KEY);
      return { ...s, trip: { ...s.trip, ...p.trip } };
    }
  } catch {}
  return s;
}

/** A brand-new trip: blank slate with only the creator as a traveler. */
function emptyState(user: { name: string } | null): TripState {
  return {
    trip: { destination: "", dates: "", days: 0, image: "" },
    travelers: [
      {
        name: user?.name ?? "You",
        role: "Trip Planner",
        status: "Organizer",
        avatar: "",
      },
    ],
    days: [],
    expenses: [],
    bills: [],
    notes: [],
    savings: 0,
    budgetTotal: 0,
    savingsGoal: 0,
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
  setBills: (v: Upd<Bill[]>) => void;
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

/**
 * Order-stable stringify used only to compare trip snapshots. Postgres jsonb
 * does not preserve object key order, so a plain JSON.stringify would make a
 * device think its own realtime echo is a remote change. Sorting keys fixes it.
 */
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (v && typeof v === "object")
    return `{${Object.keys(v as Record<string, unknown>)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + stable((v as Record<string, unknown>)[k]))
      .join(",")}}`;
  return JSON.stringify(v);
}

const Ctx = createContext<TripData | null>(null);
const LOCAL_KEY = "tripjoy-data";

export function TripDataProvider({ children }: { children: React.ReactNode }) {
  const { user, code } = useSession();
  const [state, setState] = useState<TripState>(() => emptyState(null));
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Snapshot of the data this device last wrote/received, so realtime echoes
  // of our own changes are ignored instead of bounced back.
  const lastSeen = useRef<string>("");
  // True while applying a remote change, so the save effect doesn't write it back.
  const applyingRemote = useRef(false);

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
          // Joining an existing trip — add this viewer to the traveler list.
          const merged = ensureMember(
            { ...emptyState(user), ...(data.data as TripState) },
            user
          );
          lastSeen.current = stable(merged);
          setState(merged);
        } else {
          // New trip — seed it with the creator + any details from the create screen.
          const fresh = applyPending(emptyState(user), code);
          lastSeen.current = stable(fresh);
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
              ? ensureMember({ ...emptyState(user), ...JSON.parse(raw) }, user)
              : applyPending(emptyState(user), code)
          );
        } catch {
          setState(emptyState(user));
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

    // This state change came in from another device — don't echo it back.
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncing(true);
    saveTimer.current = setTimeout(async () => {
      lastSeen.current = stable(state);
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

  // Live sync: subscribe to changes other devices make to this trip.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !code || !user) return;
    const client = supabase;

    const channel = client
      .channel(`trip-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shared_trips",
          filter: `code=eq.${code}`,
        },
        (payload) => {
          const incoming = (payload.new as { data?: TripState } | null)?.data;
          if (!incoming) return;
          const merged = ensureMember(
            { ...emptyState(user), ...incoming },
            user
          );
          const sig = stable(merged);
          if (sig === lastSeen.current) return; // our own change, ignore
          lastSeen.current = sig;
          applyingRemote.current = true;
          setState(merged);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [code, user]);

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
    setBills: (v) => setState((s) => ({ ...s, bills: resolve(v, s.bills) })),
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
