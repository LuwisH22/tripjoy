"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTripData } from "@/components/trip/TripDataProvider";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse a YYYY-MM-DD string into a local Date (midnight), or null. */
function parseDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
/** Format a Date back to YYYY-MM-DD. */
function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function rangeLabel(start: Date, end: Date) {
  return `${fmtShort(start)} – ${fmtShort(end)} ${end.getFullYear()}`;
}
function dayCount(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

export default function CalendarPage() {
  const { isAdmin, guard } = useAuth();
  const { state, setTrip } = useTripData();

  const start = parseDate(state.trip.startDate);
  const end = parseDate(state.trip.endDate);

  // Which month is on screen — defaults to the trip start, else today.
  const initial = start ?? new Date();
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });

  // Map each trip date to an itinerary icon, if any.
  const iconByDate: Record<string, string> = {};
  if (start) {
    state.days.forEach((d) => {
      const dt = new Date(start);
      dt.setDate(start.getDate() + (d.day - 1));
      if (d.icon) iconByDate[toKey(dt)] = d.icon;
    });
  }

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const inTrip = (day: number) => {
    if (!start || !end) return false;
    const d = new Date(view.year, view.month, day);
    return d >= start && d <= end;
  };

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      return {
        year: v.year + Math.floor(m / 12),
        month: ((m % 12) + 12) % 12,
      };
    });
  };

  // Admin edits a trip bound → recompute label + day count and sync.
  const updateBound = (which: "startDate" | "endDate", value: string) => {
    setTrip((t) => {
      const next = { ...t, [which]: value };
      const s = parseDate(next.startDate);
      const e = parseDate(next.endDate);
      if (s && e && e >= s) {
        next.dates = rangeLabel(s, e);
        next.days = dayCount(s, e);
      }
      return next;
    });
  };

  return (
    <AppShell>
      <PageHeader
        emoji="📅"
        title="Calendar"
        subtitle={
          state.trip.dates
            ? `Your trip at a glance — ${state.trip.dates}.`
            : "Set your travel dates to see them here."
        }
      />

      {/* Admin date editor */}
      {isAdmin && (
        <section className="rounded-xl3 bg-white p-5 shadow-soft">
          <p className="mb-3 flex items-center gap-2 font-heading font-bold text-ink">
            <CalendarDays className="h-5 w-5 text-brand-sky" /> Trip dates
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-ink">
                Start date
              </span>
              <input
                type="date"
                value={state.trip.startDate}
                onChange={(e) => updateBound("startDate", e.target.value)}
                className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-ink">
                End date
              </span>
              <input
                type="date"
                value={state.trip.endDate}
                min={state.trip.startDate || undefined}
                onChange={(e) => updateBound("endDate", e.target.value)}
                className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
              />
            </label>
          </div>
          {state.trip.days > 0 && (
            <p className="mt-2 text-sm font-semibold text-muted">
              {state.trip.days} {state.trip.days === 1 ? "day" : "days"} total
            </p>
          )}
        </section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl3 bg-white p-6 shadow-soft"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:bg-brand-cream hover:text-ink"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="min-w-[10rem] text-center font-heading text-2xl font-bold text-ink">
              {MONTHS[view.month]} {view.year}
            </h3>
            <button
              onClick={() => shiftMonth(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:bg-brand-cream hover:text-ink"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          {state.trip.destination && (
            <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-ink">
              {state.trip.destination.split(",")[0]} ✈️
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-bold uppercase text-muted"
            >
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            const trip = day !== null && inTrip(day);
            const key =
              day !== null ? toKey(new Date(view.year, view.month, day)) : "";
            return (
              <div
                key={i}
                className={`relative aspect-square rounded-2xl p-2 text-sm font-bold transition ${
                  day === null
                    ? ""
                    : trip
                    ? "bg-gradient-to-br from-brand-sky/30 to-brand-mint/30 text-ink ring-2 ring-brand-sky/40"
                    : "bg-brand-cream/60 text-ink hover:bg-brand-cream"
                }`}
              >
                {day}
                {day !== null && iconByDate[key] && (
                  <span className="absolute bottom-1 right-1 text-base">
                    {iconByDate[key]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-muted">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-sky/50" /> Trip days
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-cream" /> Free days
          </span>
        </div>
      </motion.section>

      {state.days.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          {state.days.map((d) => (
            <motion.div
              key={d.day}
              whileHover={{ y: -4 }}
              className="rounded-xl3 bg-white p-4 shadow-soft"
            >
              <span className="text-2xl">{d.icon || "📍"}</span>
              <p className="mt-1 font-heading font-bold text-ink">
                Day {d.day}
                {d.date ? ` • ${d.date}` : ""}
              </p>
              <p className="text-sm text-muted">{d.title}</p>
            </motion.div>
          ))}
        </section>
      )}
    </AppShell>
  );
}
