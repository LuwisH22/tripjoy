"use client";

import { motion } from "framer-motion";

const colors = ["#FFD166", "#FF8FA3", "#6EC6FF", "#7BD389", "#B9E7FF"];

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const color = colors[i % colors.length];
        const size = 8 + Math.random() * 8;
        return (
          <motion.span
            key={i}
            initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: "100vh",
              x: (Math.random() - 0.5) * 240,
              rotate: Math.random() * 720,
              opacity: 0,
            }}
            transition={{ duration: 2.2 + Math.random(), delay, ease: "easeIn" }}
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.6,
              background: color,
              borderRadius: 2,
            }}
            className="absolute top-0"
          />
        );
      })}
    </div>
  );
}
