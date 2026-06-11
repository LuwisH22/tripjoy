"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { useTripData } from "@/components/trip/TripDataProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sticker } from "./ui/Sticker";
import { Heart, PlanePath } from "./ui/Doodles";
import { InitialAvatar } from "./ui/InitialAvatar";

export function HeroTrip() {
  const { state, travelers, setTrip } = useTripData();
  const { isAdmin } = useAuth();
  const trip = state.trip;

  const onPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTrip((t) => ({ ...t, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col gap-5 overflow-hidden rounded-xl3 bg-white p-5 shadow-soft md:flex-row md:p-6"
    >
      <PlanePath className="pointer-events-none absolute right-6 top-2 hidden w-44 opacity-80 lg:block" />

      <div className="group relative h-48 w-full shrink-0 overflow-hidden rounded-xl2 md:h-auto md:w-72">
        {trip.image ? (
          <img
            src={trip.image}
            alt={trip.destination || "Trip"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full min-h-[12rem] w-full place-items-center bg-gradient-to-br from-brand-soft/50 to-brand-pink/20 text-5xl">
            🏝️
          </div>
        )}
        <Heart className="absolute right-3 top-3 w-6 drop-shadow" />
        {isAdmin && (
          <label className="absolute bottom-2 left-2 cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow-soft opacity-0 transition group-hover:opacity-100">
            <ImageIcon className="mr-1 inline h-3.5 w-3.5" /> Change photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPhoto(e.target.files?.[0])}
            />
          </label>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <span className="w-fit rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
          Upcoming Trip
        </span>

        {isAdmin ? (
          <input
            value={trip.destination}
            onChange={(e) =>
              setTrip((t) => ({ ...t, destination: e.target.value }))
            }
            placeholder="Where to? 🌍"
            className="mt-3 w-full rounded-lg font-heading text-3xl font-bold text-ink outline-none focus:bg-brand-cream"
          />
        ) : (
          <h2 className="mt-3 flex items-center gap-2 font-heading text-3xl font-bold text-ink">
            {trip.destination || "Your next trip"}{" "}
            <span className="text-2xl">🌴</span>
          </h2>
        )}

        {isAdmin ? (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
            <input
              value={trip.dates}
              onChange={(e) => setTrip((t) => ({ ...t, dates: e.target.value }))}
              placeholder="25 June – 2 July 2024"
              className="rounded bg-transparent outline-none focus:bg-brand-cream"
            />
            <span>•</span>
            <input
              type="number"
              value={trip.days}
              onChange={(e) =>
                setTrip((t) => ({ ...t, days: Number(e.target.value) || 0 }))
              }
              className="w-12 rounded bg-transparent text-center outline-none focus:bg-brand-cream"
            />
            <span>Days</span>
          </div>
        ) : (
          <p className="mt-1 text-sm font-semibold text-muted">
            {trip.dates
              ? `${trip.dates} • ${trip.days} Days`
              : "Dates not set yet"}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4">
          <div className="flex -space-x-3">
            {travelers.slice(0, 3).map((t) => (
              <InitialAvatar
                key={t.name}
                name={t.name}
                className="h-9 w-9 border-2 border-white text-sm"
              />
            ))}
            {travelers.length > 3 && (
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-brand-mint text-xs font-bold text-white">
                +{travelers.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/itinerary"
              className="flex items-center gap-2 rounded-full border-2 border-brand-sky px-5 py-2.5 font-bold text-brand-sky transition hover:bg-brand-sky hover:text-white"
            >
              View Itinerary <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
          </motion.div>
          <Sticker rotate={-8} className="hidden sm:inline-flex">
            ADVENTURE AWAITS! <Heart className="ml-1 inline w-3.5" />
          </Sticker>
        </div>
      </div>
    </motion.div>
  );
}
