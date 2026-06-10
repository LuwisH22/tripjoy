"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Map,
  Wallet,
  Users,
  Calendar,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountControl } from "./auth/AccountControl";
import { useSession } from "./auth/SessionProvider";
import { InitialAvatar } from "./ui/InitialAvatar";

const items = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Map, label: "Itinerary", href: "/itinerary" },
  { icon: Wallet, label: "Budget", href: "/budget" },
  { icon: Users, label: "Travelers", href: "/travelers" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: StickyNote, label: "Notes", href: "/notes" },
  { icon: Sparkles, label: "Inspiration", href: "/inspiration" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const firstName = user?.name?.split(" ")[0] ?? "Traveler";

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col gap-6 border-r border-line bg-white/70 px-5 py-7 lg:flex">
      <Link href="/" className="flex items-center gap-1 px-2">
        <span className="font-heading text-2xl font-bold text-ink">Trip</span>
        <span className="font-heading text-2xl font-bold text-brand-pink">
          Joy
        </span>
        <span className="text-xl">✦</span>
      </Link>

      <nav className="flex flex-col gap-1.5">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold transition-all",
                isActive
                  ? "text-ink"
                  : "text-muted hover:bg-brand-cream hover:text-ink"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-0 rounded-2xl bg-brand-yellow shadow-soft"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-transform group-hover:scale-110",
                  isActive ? "text-ink" : "text-muted"
                )}
                strokeWidth={2.4}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-center text-5xl"
        >
          🚐
        </motion.div>
        <div className="rounded-2xl bg-brand-pink/15 p-4">
          <p className="font-heading text-base font-semibold text-ink">
            Time to explore the world! 🌍
          </p>
          <p className="mt-1 text-sm text-muted">Collect memories, not things.</p>
        </div>

        <AccountControl />

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-soft">
          <InitialAvatar name={user?.name ?? "?"} className="h-10 w-10 text-lg" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold text-ink">
              Hai, {firstName}! 👋
            </p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="rounded-lg p-1.5 text-muted transition hover:bg-brand-cream hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
