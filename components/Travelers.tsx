"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Users } from "lucide-react";
import { type Traveler } from "@/lib/data";
import { useTripData } from "@/components/trip/TripDataProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { InitialAvatar } from "@/components/ui/InitialAvatar";
import { cn } from "@/lib/utils";

const statusStyle: Record<Traveler["status"], string> = {
  You: "bg-brand-yellow text-ink",
  Organizer: "bg-brand-yellow/40 text-ink",
  Paid: "bg-brand-mint/25 text-success",
  Pending: "bg-brand-pink/25 text-brand-pink",
  Invited: "bg-brand-soft text-brand-sky",
  Joined: "bg-brand-mint/25 text-success",
};

export function Travelers() {
  const { travelers } = useTripData();
  const { user } = useSession();
  const shownStatus = (t: Traveler): Traveler["status"] =>
    t.name.trim().toLowerCase() === (user?.name ?? "").trim().toLowerCase()
      ? "You"
      : t.status === "You"
      ? "Organizer"
      : t.status;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="relative overflow-hidden rounded-xl3 bg-white p-6 shadow-soft"
    >
      <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
        <Users className="h-5 w-5 text-brand-sky" /> Travelers
      </h3>

      <ul className="mt-4 space-y-2">
        {travelers.map((t) => (
          <motion.li
            key={t.name}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-soft"
          >
            <InitialAvatar name={t.name} className="h-10 w-10 text-lg" />
            <div className="flex-1 leading-tight">
              <p className="text-sm font-bold text-ink">{t.name}</p>
              <p className="text-xs text-muted">{t.role}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold",
                statusStyle[shownStatus(t)]
              )}
            >
              {shownStatus(t)}
            </span>
          </motion.li>
        ))}
      </ul>

      <Link
        href="/travelers"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-sky/50 py-3 text-sm font-bold text-brand-sky transition hover:bg-brand-soft/30"
      >
        <UserPlus className="h-4 w-4" /> Invite Traveler
      </Link>

      <p className="mt-4 rotate-[-3deg] text-center font-heading text-sm font-semibold text-muted">
        Good vibes & tan lines ☀️
      </p>
    </motion.section>
  );
}
