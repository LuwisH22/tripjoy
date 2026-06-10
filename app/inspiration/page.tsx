"use client";

import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { inspirations } from "@/lib/data";
import { Sparkle } from "@/components/ui/Doodles";

export default function InspirationPage() {
  return (
    <AppShell>
      <Sparkle className="pointer-events-none absolute right-8 top-10 w-7 animate-floaty opacity-70" />
      <PageHeader
        emoji="✨"
        title="Inspiration"
        subtitle="Dream destinations for your next escape."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {inspirations.map((insp, i) => (
          <motion.article
            key={insp.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-xl3 bg-white shadow-soft"
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src={insp.image}
                alt={insp.place}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink">
                {insp.tag}
              </span>
              <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 transition hover:scale-110">
                <Heart className="h-4 w-4 text-brand-pink" />
              </button>
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-heading text-xl font-bold drop-shadow">
                  {insp.place}
                </p>
                <p className="flex items-center gap-1 text-sm font-semibold drop-shadow">
                  <MapPin className="h-3.5 w-3.5" /> {insp.country}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-semibold text-muted">
                Add to wishlist
              </span>
              <button className="rounded-full bg-brand-yellow px-4 py-1.5 text-sm font-bold text-ink transition hover:scale-105">
                Plan trip →
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </AppShell>
  );
}
