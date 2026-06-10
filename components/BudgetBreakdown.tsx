"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { breakdown } from "@/lib/data";
import { rupiah } from "@/lib/utils";

export function BudgetBreakdown() {
  const total = breakdown.reduce((s, b) => s + b.value, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-xl3 bg-white p-6 shadow-soft"
    >
      <h3 className="font-heading text-xl font-bold text-ink">
        Budget Breakdown
      </h3>

      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="value"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={3}
                stroke="none"
              >
                {breakdown.map((b) => (
                  <Cell key={b.name} fill={b.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => rupiah(v)}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #E5E7EB",
                  fontFamily: "var(--font-nunito)",
                  fontWeight: 700,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-muted">Total</span>
            <span className="font-heading text-lg font-bold text-ink">
              {rupiah(total)}
            </span>
          </div>
        </div>

        <ul className="flex-1 space-y-2.5">
          {breakdown.map((b) => (
            <li
              key={b.name}
              className="flex items-center gap-3 text-sm font-semibold"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: b.color }}
              />
              <span className="flex-1 text-ink">{b.name}</span>
              <span className="text-muted">{rupiah(b.value)}</span>
              <span className="w-9 text-right text-ink">{b.pct}%</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/budget"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-sky py-2.5 text-sm font-bold text-brand-sky transition hover:bg-brand-sky hover:text-white"
      >
        View Budget Detail <ArrowRight className="h-4 w-4" strokeWidth={3} />
      </Link>
    </motion.section>
  );
}
