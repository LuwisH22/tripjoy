"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RefreshCw } from "lucide-react";
import { useTripData } from "@/components/trip/TripDataProvider";

export function SyncIndicator() {
  const { syncing, ready } = useTripData();
  const [status, setStatus] = useState<"idle" | "syncing" | "saved">("idle");

  useEffect(() => {
    if (!ready) return;
    if (syncing) {
      setStatus("syncing");
    } else if (status === "syncing") {
      setStatus("saved");
      const t = setTimeout(() => setStatus("idle"), 2200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing, ready]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-float ${
              status === "syncing"
                ? "bg-white text-brand-sky"
                : "bg-brand-mint text-white"
            }`}
          >
            {status === "syncing" ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Syncing…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" strokeWidth={3} /> Synced
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
