"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Mail, Plus, Trash2, UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { InitialAvatar } from "@/components/ui/InitialAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { useTripData } from "@/components/trip/TripDataProvider";
import { type Traveler } from "@/lib/data";
import { cn, rupiah } from "@/lib/utils";

const statusStyle: Record<Traveler["status"], string> = {
  You: "bg-brand-yellow text-ink",
  Paid: "bg-brand-mint/25 text-success",
  Pending: "bg-brand-pink/25 text-brand-pink",
  Invited: "bg-brand-soft text-brand-sky",
};

export default function TravelersPage() {
  const { isAdmin, guard } = useAuth();
  const { code } = useSession();
  const { travelers, addTraveler, removeTraveler } = useTripData();
  const [open, setOpen] = useState(false);
  const [invited, setInvited] = useState<Traveler | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const inviteLink = invited
    ? `${siteUrl}/?code=${code ?? ""}&invite=${encodeURIComponent(invited.name)}${
        invited.amountDue ? `&pay=${invited.amountDue}` : ""
      }`
    : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = inviteLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const invite = () => {
    if (!name.trim()) return;
    const t: Traveler = {
      name: name.trim(),
      role: "Traveler",
      status: "Invited",
      avatar: "",
      amountDue: amount ? Number(amount) : 0,
    };
    addTraveler(t);
    setInvited(t);
    setName("");
    setAmount("");
    setOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        emoji="👥"
        title="Travelers"
        subtitle="Your crew for this adventure."
        action={
          <Button onClick={() => guard(() => setOpen(true))}>
            <UserPlus className="h-5 w-5" strokeWidth={3} /> Add Traveler
          </Button>
        }
      />

      <div className="relative overflow-hidden rounded-xl3 bg-gradient-to-r from-brand-soft/40 to-brand-pink/15 p-6">
        <div className="relative z-10 max-w-md">
          <h3 className="font-heading text-2xl font-bold text-ink">
            {travelers.length} travelers going to Bali 🌴
          </h3>
          <p className="mt-1 text-sm font-semibold text-muted">
            Good vibes &amp; tan lines guaranteed.
          </p>
        </div>
        <div className="absolute -right-2 bottom-0 text-7xl md:text-8xl">
          🧳✈️🏝️
        </div>
      </div>

      {travelers.length === 0 ? (
        <EmptyState
          emoji="🧳"
          title="No travelers yet"
          description="Invite your friends and start planning together!"
          action={
            <Button onClick={() => guard(() => setOpen(true))}>
              <Plus className="h-5 w-5" /> Add Traveler
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {travelers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col items-center gap-2 rounded-xl3 bg-white p-6 text-center shadow-soft"
            >
              {isAdmin && t.status !== "You" && (
                <button
                  onClick={() => removeTraveler(t.name)}
                  title={`Remove ${t.name}`}
                  className="absolute right-3 top-3 rounded-full bg-brand-cream p-1.5 text-muted opacity-0 transition hover:bg-brand-pink/15 hover:text-brand-pink group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <InitialAvatar
                name={t.name}
                className="h-20 w-20 border-4 border-brand-cream text-3xl"
              />
              <p className="font-heading text-lg font-bold text-ink">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  statusStyle[t.status]
                )}
              >
                {t.status}
              </span>
              {!!t.amountDue && (
                <p className="text-xs font-semibold text-muted">
                  Owes {rupiah(t.amountDue)}
                </p>
              )}
            </motion.div>
          ))}

          <button
            onClick={() => guard(() => setOpen(true))}
            className="flex flex-col items-center justify-center gap-2 rounded-xl3 border-2 border-dashed border-brand-sky/40 bg-brand-soft/15 p-6 text-brand-sky transition hover:bg-brand-soft/30"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-sky text-2xl text-white">
              +
            </span>
            <span className="font-bold">Invite Traveler</span>
          </button>
        </div>
      )}

      {/* Invite modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Invite Traveler">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rina Wijaya"
              className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink">
              Amount they need to pay (Rp)
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500000"
              className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
            />
            <span className="mt-1 block text-xs text-muted">
              This will be tracked on the Budget page.
            </span>
          </label>
          <Button onClick={invite} className="w-full">
            <Mail className="h-4 w-4" /> Send Invite
          </Button>
        </div>
      </Modal>

      {/* Invite confirmation popup */}
      <Modal
        open={!!invited}
        onClose={() => setInvited(null)}
        title="Invitation Sent! 🎉"
      >
        {invited && (
          <div className="space-y-4 text-center">
            <InitialAvatar
              name={invited.name}
              className="mx-auto h-20 w-20 text-3xl"
            />
            <div>
              <p className="font-heading text-lg font-bold text-ink">
                {invited.name}
              </p>
              <p className="text-sm text-muted">has been invited as a Traveler</p>
            </div>
            <div className="rounded-2xl bg-brand-soft/30 p-4">
              <p className="text-sm font-semibold text-muted">Amount to pay</p>
              <p className="font-heading text-2xl font-bold text-brand-sky">
                {rupiah(invited.amountDue || 0)}
              </p>
              <p className="mt-1 text-xs text-muted">
                Now showing on the Budget page 💰
              </p>
            </div>

            {/* Shareable invite link */}
            <div className="text-left">
              <p className="mb-1 text-sm font-bold text-ink">Invite link</p>
              <div className="flex items-center gap-2 rounded-2xl border border-line bg-brand-cream/50 p-2">
                <input
                  readOnly
                  value={inviteLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 truncate bg-transparent px-1 text-sm font-semibold text-muted outline-none"
                />
                <button
                  onClick={copyLink}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold text-white transition",
                    copied ? "bg-success" : "bg-brand-sky hover:scale-105"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Share this with {invited.name.split(" ")[0]} so they can join the
                trip.
              </p>
            </div>

            <Button onClick={() => setInvited(null)} className="w-full">
              Got it!
            </Button>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
