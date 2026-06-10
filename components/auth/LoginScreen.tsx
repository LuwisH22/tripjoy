"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailCheck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "./SessionProvider";
import { Cloud, PlanePath, Sparkle } from "@/components/ui/Doodles";

export function LoginScreen() {
  const { signIn, configured } = useSession();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return setError("Please enter a valid email.");
    setLoading(true);
    try {
      const { magicLinkSent } = await signIn(email.trim(), name.trim());
      if (magicLinkSent) setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

        {sent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-3 text-6xl"
            >
              📬
            </motion.div>
            <h1 className="font-heading text-2xl font-bold text-ink">
              Check your inbox!
            </h1>
            <p className="mt-2 text-sm text-muted">
              We sent a magic login link to{" "}
              <span className="font-bold text-ink">{email}</span>. Click it to
              hop in — see you on the other side ✈️
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-5 text-sm font-bold text-brand-sky hover:underline"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <>
            <h1 className="text-center font-heading text-2xl font-bold text-ink">
              Welcome aboard! 🌴
            </h1>
            <p className="mt-1 text-center text-sm text-muted">
              Log in with your email to plan &amp; sync your trips across
              devices.
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
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="e.g. Naya Putri"
                    className="w-full bg-transparent py-2.5 font-semibold outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-ink">
                  Email
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
                  <Mail className="h-4 w-4 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="you@email.com"
                    className="w-full bg-transparent py-2.5 font-semibold outline-none"
                  />
                </div>
              </label>

              {error && (
                <p className="text-sm font-bold text-danger">{error}</p>
              )}

              <Button onClick={submit} className="w-full">
                {loading ? (
                  "Sending..."
                ) : configured ? (
                  <>
                    <MailCheck className="h-4 w-4" /> Send magic link
                  </>
                ) : (
                  <>
                    <MailCheck className="h-4 w-4" /> Continue
                  </>
                )}
              </Button>

              {!configured && (
                <p className="text-center text-xs text-muted">
                  Running in local mode — add Supabase keys to enable real email
                  login &amp; cross-device sync.
                </p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
