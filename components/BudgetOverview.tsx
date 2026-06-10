"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { budget } from "@/lib/data";
import { rupiah } from "@/lib/utils";

export function BudgetOverview() {
  const used = Math.round((budget.spent / budget.total) * 100);
  const [w, setW] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setW(used), 350);
    return () => clearTimeout(t);
  }, [used]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative flex flex-col gap-4 overflow-hidden rounded-xl3 bg-white p-6 shadow-soft"
    >
      <h3 className="font-heading text-xl font-bold text-ink">
        Budget Overview
      </h3>

      <Row label="Total Budget" value={rupiah(budget.total)} />
      <Row
        label="Total Spent"
        value={rupiah(budget.spent)}
        valueClass="text-success"
      />
      <Row
        label="Remaining"
        value={rupiah(budget.remaining)}
        valueClass="text-brand-sky"
      />

      <div className="mt-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-brand-cream">
          <motion.div
            animate={{ width: `${w}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-brand-sky to-brand-mint"
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-muted">
          {used}% of budget used
        </p>
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-2 right-4 text-5xl"
      >
        🐷
      </motion.div>
    </motion.div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-ink",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className={`font-heading text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
