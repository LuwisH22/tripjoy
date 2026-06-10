"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { itinerary } from "@/lib/data";
import { Star } from "./ui/Doodles";
import { useAuth } from "./auth/AuthProvider";

export function ItineraryTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { guard } = useAuth();

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-xl3 bg-white p-6 shadow-soft"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
          🗺️ Itinerary Overview
        </h3>
        <Link
          href="/itinerary"
          className="flex items-center gap-1 rounded-full border border-brand-sky px-4 py-2 text-sm font-bold text-brand-sky transition hover:bg-brand-sky hover:text-white"
        >
          View Full Itinerary
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-soft transition hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5 text-ink" />
        </button>
        <button
          onClick={() => scroll(1)}
          className="absolute -right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-soft transition hover:scale-110"
        >
          <ChevronRight className="h-5 w-5 text-ink" />
        </button>

        <div
          ref={ref}
          className="scroll-x flex snap-x gap-4 overflow-x-auto px-1 pb-3"
        >
          {itinerary.map((d, i) => (
            <motion.article
              key={d.day}
              whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
              className="group relative w-[200px] shrink-0 snap-start rounded-xl2 border border-line bg-white p-3 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading text-lg font-bold text-ink">
                    Day {d.day}
                  </p>
                  <p className="text-xs font-semibold text-muted">{d.date}</p>
                </div>
                <span className="text-xl">{d.icon}</span>
              </div>

              <p className="mt-2 min-h-[40px] text-sm font-semibold text-ink">
                {d.title}
              </p>

              <div className="relative mt-2 overflow-hidden rounded-xl2">
                <img
                  src={d.image}
                  alt={d.title}
                  className="h-24 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <Star className="absolute right-1 top-1 w-5 opacity-0 transition group-hover:opacity-100" />
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-muted">
                <MapPin className="h-3.5 w-3.5 text-brand-pink" /> Bali
              </div>
            </motion.article>
          ))}

          <button
            onClick={() => guard(() => router.push("/itinerary"))}
            className="flex w-[140px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-brand-sky/50 bg-brand-soft/20 p-3 text-brand-sky transition hover:bg-brand-soft/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-sky text-2xl text-white">
              +
            </span>
            <span className="text-sm font-bold">Add Day</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
