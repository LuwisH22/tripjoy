"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus } from "lucide-react";
import { Cloud, Heart } from "./ui/Doodles";
import { useAuth } from "./auth/AuthProvider";
import { useSession } from "./auth/SessionProvider";
import { useTripData } from "./trip/TripDataProvider";

/** Days from today until a YYYY-MM-DD date (negative if past), or null. */
function daysUntil(s: string): number | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function Topbar() {
  const { guard } = useAuth();
  const { user } = useSession();
  const { state } = useTripData();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const [bellOpen, setBellOpen] = useState(false);

  // Build live notifications from the real trip data.
  const notifs: string[] = [];

  // Countdown to the trip.
  const place = state.trip.destination.split(",")[0];
  const left = daysUntil(state.trip.startDate);
  if (left !== null && place) {
    if (left > 0)
      notifs.push(`✈️ ${left} ${left === 1 ? "day" : "days"} until your ${place} trip!`);
    else if (left === 0) notifs.push(`🎉 Your ${place} trip is today!`);
  }

  // Unpaid travelers (skip organizers and the people already paid).
  state.travelers
    .filter(
      (t) =>
        t.status !== "Paid" &&
        t.status !== "Organizer" &&
        t.status !== "You" &&
        !!t.amountDue
    )
    .forEach((t) =>
      notifs.push(`💸 ${t.name.split(" ")[0]}'s payment is still pending.`)
    );

  return (
    <div className="relative flex flex-wrap items-start justify-between gap-4">
      <div className="relative">
        <h1 className="flex items-center gap-2 font-heading text-3xl font-bold text-ink md:text-4xl">
          Hello, {firstName}!{" "}
          <motion.span
            animate={{ rotate: [0, 18, -8, 18, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5 }}
            className="inline-block origin-bottom"
          >
            👋
          </motion.span>
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Let&apos;s plan something amazing for your next trip.
        </p>
        <Cloud className="pointer-events-none absolute -right-24 -top-2 hidden w-20 opacity-90 md:block" />
        <Heart className="absolute -right-10 top-1 hidden w-5 md:block" />
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => guard(() => alert("New trip — let's go! ✈️ (admin)"))}
          className="flex items-center gap-2 rounded-full bg-brand-sky px-5 py-3 font-bold text-white shadow-float"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          New Trip
        </motion.button>

        <div className="relative">
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative grid h-12 w-12 place-items-center rounded-full border border-line bg-white shadow-soft transition hover:scale-105"
          >
            <Bell className="h-5 w-5 text-ink" strokeWidth={2.4} />
            {notifs.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-brand-pink text-[11px] font-bold text-white">
                {notifs.length}
              </span>
            )}
          </button>
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute right-0 top-14 z-30 w-72 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-line bg-white p-3 shadow-float"
              >
                <p className="mb-2 font-heading font-bold text-ink">
                  Notifications
                </p>
                <div className="space-y-2 text-sm">
                  {notifs.length === 0 ? (
                    <div className="rounded-xl bg-brand-cream p-2.5 text-muted">
                      🎉 You&apos;re all caught up!
                    </div>
                  ) : (
                    notifs.map((n, i) => (
                      <div key={i} className="rounded-xl bg-brand-cream p-2.5">
                        {n}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
