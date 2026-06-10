"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  KeyRound,
  MapPin,
  Plus,
  Rocket,
  Ticket,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "./SessionProvider";
import { Cloud, PlanePath, Sparkle } from "@/components/ui/Doodles";

function fmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function rangeLabel(start: string, end: string) {
  if (!start || !end) return "";
  return `${fmt(start)} – ${fmt(end)} ${new Date(end).getFullYear()}`;
}
function dayCount(start: string, end: string) {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

export function LoginScreen() {
  const { signIn } = useSession();
  const [step, setStep] = useState<"auth" | "newtrip">("auth");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [invitedBy, setInvitedBy] = useState("");

  // New-trip fields
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const days = dayCount(startDate, endDate);

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

  const goToNewTrip = () => {
    setError("");
    if (!name.trim()) return setError("Please enter your name first.");
    setStep("newtrip");
  };

  const createTrip = () => {
    setError("");
    if (!destination.trim()) return setError("Where are you going?");
    if (!startDate || !endDate) return setError("Pick your start and end dates.");
    if (new Date(endDate) < new Date(startDate))
      return setError("End date can't be before the start date.");

    // Stash the details so the data provider seeds the new trip with them
    const { code: newCode } = signIn(name); // generates a fresh code
    try {
      localStorage.setItem(
        "tripjoy-pending",
        JSON.stringify({
          code: newCode,
          trip: {
            destination: destination.trim(),
            dates: rangeLabel(startDate, endDate),
            days,
          },
        })
      );
    } catch {}
    // signIn already set the session; provider will pick up the pending details
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

        {step === "auth" ? (
          <>
            <h1 className="text-center font-heading text-2xl font-bold text-ink">
              {invitedBy
                ? `Welcome, ${invitedBy.split(" ")[0]}! 🎉`
                : "Welcome aboard! 🌴"}
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
                    onKeyDown={(e) =>
                      e.key === "Enter" && (code ? join() : goToNewTrip())
                    }
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
                onClick={goToNewTrip}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-mint py-2.5 font-bold text-success transition hover:bg-brand-mint hover:text-white"
              >
                <Plus className="h-4 w-4" strokeWidth={3} /> Start a new trip
              </button>

              <p className="text-center text-xs text-muted">
                Your trip syncs across devices — log in with the same code
                anywhere.
              </p>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep("auth")}
              className="mb-2 flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-center font-heading text-2xl font-bold text-ink">
              Where are you headed? ✈️
            </h1>
            <p className="mt-1 text-center text-sm text-muted">
              Set up your trip — you can edit all of this later.
            </p>

            <div className="mt-6 space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-ink">
                  Destination
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
                  <MapPin className="h-4 w-4 text-brand-pink" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Bali, Indonesia"
                    className="w-full bg-transparent py-2.5 font-semibold outline-none"
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-ink">
                    Start date
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
                    <CalendarDays className="h-4 w-4 text-brand-sky" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm font-semibold outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-ink">
                    End date
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
                    <CalendarDays className="h-4 w-4 text-brand-sky" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm font-semibold outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="rounded-2xl bg-brand-soft/25 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Trip length
                </p>
                <p className="font-heading text-2xl font-bold text-brand-sky">
                  {days > 0 ? `${days} ${days === 1 ? "Day" : "Days"}` : "—"}
                </p>
                {startDate && endDate && (
                  <p className="text-xs font-semibold text-muted">
                    {rangeLabel(startDate, endDate)}
                  </p>
                )}
              </div>

              {error && <p className="text-sm font-bold text-danger">{error}</p>}

              <Button onClick={createTrip} className="w-full">
                <Rocket className="h-4 w-4" /> Create trip
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
