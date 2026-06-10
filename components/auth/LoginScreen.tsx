"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Plus, Ticket, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "./SessionProvider";
import { Cloud, PlanePath, Sparkle } from "@/components/ui/Doodles";

export function LoginScreen() {
  const { signIn } = useSession();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [invitedBy, setInvitedBy] = useState("");

  // Prefill from an invite link (?code=ABC123 &invite=Name)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    const inv = params.get("invite");
    if (c) setCode(c.toUpperCase());
    if (inv) {
      setName(inv);
      setInvitedBy(inv);
    }
  }, []);

  const join = () => {
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!code.trim())
      return setError("Enter a trip code, or tap “Start a new trip”.");
    signIn(name, code);
  };

  const create = () => {
    setError("");
    if (!name.trim()) return setError("Please enter your name first.");
    signIn(name); // empty code → generates a new one
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-brand-cream px-4">
      <Cloud className="pointer-events-none absolute left-10 top-16 w-28 opacity-70" />
      <Cloud className="pointer-events-none absolute right-16 top-32 w-20 opacity-60" />
      <Sparkle className="pointer-events-none absolute left-1/3 top-24 w-6 animate-floaty opacity-70" />
      <PlanePath className="pointer-events-none absolute right-8 bottom-24 hidden w-56 opacity-70 md:block" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative z-10 w-full max-w-md rounded-xl3 bg-white p-8 shadow-float"
      >
        <div className="mb-6 flex items-center justify-center gap-1">
          <span className="font-heading text-3xl font-bold text-ink">Trip</span>
          <span className="font-heading text-3xl font-bold text-brand-pink">
            Joy
          </span>
          <span className="text-2xl">✦</span>
        </div>

        <h1 className="text-center font-heading text-2xl font-bold text-ink">
          {invitedBy ? `Welcome, ${invitedBy.split(" ")[0]}! 🎉` : "Welcome aboard! 🌴"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          {invitedBy
            ? "You've been invited — enter your name to join the trip."
            : "Enter your name and a trip code to plan together, or start a new trip."}
        </p>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink">
              Your name
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
              <User className="h-4 w-4 text-muted" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (code ? join() : create())}
                placeholder="e.g. Naya Putri"
                className="w-full bg-transparent py-2.5 font-semibold outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink">
              Trip code{" "}
              <span className="font-normal text-muted">
                (to join an existing trip)
              </span>
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
              <Ticket className="h-4 w-4 text-muted" />
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase().replace(/\s/g, ""))
                }
                onKeyDown={(e) => e.key === "Enter" && join()}
                placeholder="e.g. K7P2QX"
                className="w-full bg-transparent py-2.5 font-semibold uppercase tracking-widest outline-none"
              />
            </div>
          </label>

          {error && <p className="text-sm font-bold text-danger">{error}</p>}

          <Button onClick={join} className="w-full">
            <KeyRound className="h-4 w-4" /> Join trip
          </Button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-bold text-muted">OR</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={create}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-mint py-2.5 font-bold text-success transition hover:bg-brand-mint hover:text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={3} /> Start a new trip
          </button>

          <p className="text-center text-xs text-muted">
            Your trip syncs across devices — log in with the same code anywhere.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
