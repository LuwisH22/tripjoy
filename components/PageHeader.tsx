"use client";

import { motion } from "framer-motion";

export function PageHeader({
  title,
  subtitle,
  emoji,
  action,
}: {
  title: string;
  subtitle: string;
  emoji?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 className="flex items-center gap-2 font-heading text-3xl font-bold text-ink md:text-4xl">
          {emoji && <span>{emoji}</span>}
          {title}
        </h1>
        <p className="mt-1 text-[15px] text-muted">{subtitle}</p>
      </div>
      {action}
    </motion.div>
  );
}
