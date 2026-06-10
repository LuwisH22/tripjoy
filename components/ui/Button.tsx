"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

export function Button({
  children,
  onClick,
  variant = "solid",
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
}) {
  const styles: Record<Variant, string> = {
    solid: "bg-brand-sky text-white shadow-float",
    outline:
      "border-2 border-brand-sky text-brand-sky hover:bg-brand-sky hover:text-white",
    ghost: "text-muted hover:bg-brand-cream hover:text-ink",
  };
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-bold transition-colors",
        styles[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
