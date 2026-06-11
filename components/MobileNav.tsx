"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./Sidebar";
import { AccountControl } from "./auth/AccountControl";
import { useSession } from "./auth/SessionProvider";
import { InitialAvatar } from "./ui/InitialAvatar";

export function MobileNav() {
  const pathname = usePathname();
  const { user, code, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const firstName = user?.name?.split(" ")[0] ?? "Traveler";

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {/* Top bar (mobile/tablet only) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-heading text-xl font-bold text-ink">Trip</span>
          <span className="font-heading text-xl font-bold text-brand-pink">
            Joy
          </span>
          <span className="text-base">✦</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white shadow-soft"
        >
          <Menu className="h-5 w-5 text-ink" />
        </button>
      </header>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[290px] flex-col gap-4 overflow-y-auto bg-white px-5 py-6 shadow-float lg:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InitialAvatar
                    name={user?.name ?? "?"}
                    className="h-9 w-9 text-base"
                  />
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-ink">
                      Hai, {firstName}! 👋
                    </p>
                    <p className="text-xs text-muted">Traveler</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-line"
                >
                  <X className="h-5 w-5 text-ink" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition",
                        isActive
                          ? "bg-brand-yellow text-ink shadow-soft"
                          : "text-muted hover:bg-brand-cream hover:text-ink"
                      )}
                    >
                      <item.icon className="h-5 w-5" strokeWidth={2.4} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-3">
                <AccountControl />

                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 rounded-2xl border border-brand-soft bg-brand-soft/20 px-3 py-2 text-left"
                >
                  <span className="text-base">🎟️</span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                      Trip code — tap to copy
                    </p>
                    <p className="font-heading text-base font-bold tracking-widest text-ink">
                      {code}
                    </p>
                  </div>
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted" />
                  )}
                </button>

                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-line py-2.5 text-sm font-bold text-muted transition hover:text-ink"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
