"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plane } from "lucide-react";
import { trip } from "@/lib/data";
import { travelers } from "@/lib/data";
import { Sticker } from "./ui/Sticker";
import { Heart, PlanePath } from "./ui/Doodles";

export function HeroTrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col gap-5 overflow-hidden rounded-xl3 bg-white p-5 shadow-soft md:flex-row md:p-6"
    >
      <PlanePath className="pointer-events-none absolute right-6 top-2 hidden w-44 opacity-80 lg:block" />

      <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl2 md:h-auto md:w-72">
        <img
          src={trip.image}
          alt={trip.destination}
          className="h-full w-full object-cover"
        />
        <Heart className="absolute right-3 top-3 w-6 drop-shadow" />
      </div>

      <div className="flex flex-1 flex-col">
        <span className="w-fit rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
          Upcoming Trip
        </span>
        <h2 className="mt-3 flex items-center gap-2 font-heading text-3xl font-bold text-ink">
          {trip.destination} <span className="text-2xl">🌴</span>
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted">
          {trip.dates} &nbsp;•&nbsp; {trip.days} Days
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex -space-x-3">
            {travelers.slice(0, 3).map((t) => (
              <img
                key={t.name}
                src={t.avatar}
                alt={t.name}
                className="h-9 w-9 rounded-full border-2 border-white object-cover"
              />
            ))}
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-brand-mint text-xs font-bold text-white">
              +2
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/itinerary"
              className="flex items-center gap-2 rounded-full border-2 border-brand-sky px-5 py-2.5 font-bold text-brand-sky transition hover:bg-brand-sky hover:text-white"
            >
              Lihat Itinerary <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
          </motion.div>
          <Sticker rotate={-8} className="hidden sm:inline-flex">
            ADVENTURE AWAITS! <Heart className="ml-1 inline w-3.5" />
          </Sticker>
        </div>
      </div>

      <motion.div
        animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-10 top-6 hidden text-brand-sky lg:block"
      >
        <Plane className="h-7 w-7 rotate-12" />
      </motion.div>
    </motion.div>
  );
}
