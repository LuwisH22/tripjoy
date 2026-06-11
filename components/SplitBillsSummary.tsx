"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ReceiptText } from "lucide-react";
import { useTripData } from "@/components/trip/TripDataProvider";
import { rupiah } from "@/lib/utils";

export function SplitBillsSummary() {
  const { state } = useTripData();
  const bills = state.bills ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl3 bg-white p-6 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
          <ReceiptText className="h-5 w-5 text-brand-coral" /> Split Bills
        </h3>
        {bills.length > 0 && (
          <span className="rounded-full bg-brand-soft/40 px-3 py-1 text-xs font-bold text-brand-sky">
            {bills.length} {bills.length === 1 ? "bill" : "bills"}
          </span>
        )}
      </div>

      {bills.length === 0 ? (
        <p className="mt-4 rounded-2xl border-2 border-dashed border-line py-8 text-center text-sm font-semibold text-muted">
          No bills yet — split a meal on the Budget page 🧾
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {bills.slice(0, 4).map((b) => {
            const total = b.items.reduce((s, i) => s + i.amount, 0);
            return (
              <li
                key={b.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-coral/15 text-base">
                  🧾
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-bold text-ink">
                    {b.title || "Split bill"}
                  </p>
                  <p className="text-xs text-muted">
                    {b.items.length} {b.items.length === 1 ? "item" : "items"} ·
                    by {b.createdBy}
                  </p>
                </div>
                <span className="font-heading font-bold text-ink">
                  {rupiah(total)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/budget"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-coral py-2.5 text-sm font-bold text-brand-coral transition hover:bg-brand-coral hover:text-white"
      >
        View bills <ArrowRight className="h-4 w-4" strokeWidth={3} />
      </Link>
    </motion.section>
  );
}
