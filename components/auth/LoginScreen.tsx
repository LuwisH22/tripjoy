"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Mail, MailCheck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "./SessionProvider";
import { Cloud, PlanePath, Sparkle } from "@/components/ui/Doodles";

export function LoginScreen() {
  const { signIn, verifyCode, configured } = useSession();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitedBy, setInvitedBy] = useState("");

  // Prefill name when arriving via an invite link (?invite=Name)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inv = params.get("invite");
    if (inv) {
      setName(inv);
      setInvitedBy(inv);
    }
  }, []);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return setError("Please enter a valid email.");
    setLoading(true);
    try {
      const { codeSent } = await signIn(email.trim(), name.trim());
      if (codeSent) setSent(true);
    } catch (e) {
      setError(
        (e as { message?: string })?.message ||
          "Couldn't send the code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError("");
    if (code.trim().length < 6)
      return setError("Enter the code from your email.");
    setLoading(true);
    try {
      const ok = await verifyCode(email.trim(), code.trim());
      if (!ok) setError("That code is wrong or expired. Try again.");
      // on success, the session updates automatically and the gate opens
    } catch {
      setError("Couldn't verify the code. Please try again.");
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
              Enter your code
            </h1>
            <p className="mt-2 text-sm text-muted">
              We emailed a login code to{" "}
              <span className="font-bold text-ink">{email}</span>. Pop it in
              below to hop aboard ✈️
            </p>

            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(e) => e.key === "Enter" && verify()}
              inputMode="numeric"
              autoFocus
              placeholder="Enter code"
              className="mx-auto mt-5 w-60 rounded-2xl border border-line py-3 text-center font-heading text-2xl font-bold tracking-[0.35em] outline-none placeholder:text-base placeholder:tracking-normal focus:border-brand-sky"
            />

            {error && (
              <p className="mt-3 text-sm font-bold text-danger">{error}</p>
            )}

            <Button onClick={verify} className="mt-5 w-full">
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  <KeyRound className="h-4 w-4" /> Verify &amp; enter
                </>
              )}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4 text-sm font-bold">
              <button
                onClick={submit}
                disabled={loading}
                className="text-brand-sky hover:underline"
              >
                Resend code
              </button>
              <button
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setError("");
                }}
                className="flex items-center gap-1 text-muted hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change email
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <h1 className="text-center font-heading text-2xl font-bold text-ink">
              {invitedBy ? `Welcome, ${invitedBy.split(" ")[0]}! 🎉` : "Welcome aboard! 🌴"}
            </h1>
            <p className="mt-1 text-center text-sm text-muted">
              {invitedBy
                ? "You've been invited to a trip — log in with your email to join."
                : "Log in with your email to plan & sync your trips across devices."}
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
                    <MailCheck className="h-4 w-4" /> Email me a code
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
