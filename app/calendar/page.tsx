"use client";

import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { itineraryDetail } from "@/lib/data";

// June 2024: starts on a Saturday (index 6)
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const FIRST_WEEKDAY = 6;
const DAYS_IN_MONTH = 30;
const TRIP_START = 25;
const TRIP_END = 30; // (continues into July, shown as full week here)

const tripIcons: Record<number, string> = {};
itineraryDetail.forEach((d) => {
  const day = 24 + d.day; // day1 = 25 Jun
  tripIcons[day] = d.icon;
});

export default function CalendarPage() {
  const cells: (number | null)[] = [
    ...Array(FIRST_WEEKDAY).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <AppShell>
      <PageHeader
        emoji="📅"
        title="Calendar"
        subtitle="Your trip at a glance — June 2024."
      />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl3 bg-white p-6 shadow-soft"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-2xl font-bold text-ink">June 2024</h3>
          <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-ink">
            Bali Trip ✈️
          </span>
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
            const inTrip =
              day !== null && day >= TRIP_START && day <= TRIP_END;
            return (
              <div
                key={i}
                className={`relative aspect-square rounded-2xl p-2 text-sm font-bold transition ${
                  day === null
                    ? ""
                    : inTrip
                    ? "bg-gradient-to-br from-brand-sky/30 to-brand-mint/30 text-ink ring-2 ring-brand-sky/40"
                    : "bg-brand-cream/60 text-ink hover:bg-brand-cream"
                }`}
              >
                {day}
                {day !== null && tripIcons[day] && (
                  <span className="absolute bottom-1 right-1 text-base">
                    {tripIcons[day]}
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

      <section className="grid gap-4 sm:grid-cols-3">
        {itineraryDetail.map((d) => (
          <motion.div
            key={d.day}
            whileHover={{ y: -4 }}
            className="rounded-xl3 bg-white p-4 shadow-soft"
          >
            <span className="text-2xl">{d.icon}</span>
            <p className="mt-1 font-heading font-bold text-ink">
              Day {d.day} • {d.date}
            </p>
            <p className="text-sm text-muted">{d.title}</p>
          </motion.div>
        ))}
      </section>
    </AppShell>
  );
}
