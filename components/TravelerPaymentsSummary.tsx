"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { useTripData } from "@/components/trip/TripDataProvider";
import { InitialAvatar } from "@/components/ui/InitialAvatar";
import { rupiah } from "@/lib/utils";

export function TravelerPaymentsSummary() {
  const { state } = useTripData();
  const paying = state.travelers.filter(
    (t) => !!t.amountDue && t.status !== "Organizer" && t.status !== "You"
  );
  const expected = paying.reduce((s, t) => s + (t.amountDue || 0), 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-xl3 bg-white p-6 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
          <Users className="h-5 w-5 text-brand-pink" /> Traveler Payments
        </h3>
        {paying.length > 0 && (
          <span className="rounded-full bg-brand-soft/40 px-3 py-1 text-xs font-bold text-brand-sky">
            Expected: {rupiah(expected)}
          </span>
        )}
      </div>

      {paying.length === 0 ? (
        <p className="mt-4 rounded-2xl border-2 border-dashed border-line py-8 text-center text-sm font-semibold text-muted">
          No traveler payments yet — invite someone with an amount 👥
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {paying.slice(0, 4).map((t) => (
            <li
              key={t.name}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3"
            >
              <InitialAvatar name={t.name} className="h-10 w-10 text-lg" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-bold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  t.status === "Paid"
                    ? "bg-brand-mint/25 text-success"
                    : "bg-brand-pink/15 text-brand-pink"
                }`}
              >
                {t.status === "Paid" ? "Paid" : "Pending"}
              </span>
              <span className="font-heading font-bold text-ink">
                {rupiah(t.amountDue || 0)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/travelers"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-pink py-2.5 text-sm font-bold text-brand-pink transition hover:bg-brand-pink hover:text-white"
      >
        View payments <ArrowRight className="h-4 w-4" strokeWidth={3} />
      </Link>
    </motion.section>
  );
}
