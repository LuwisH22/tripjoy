"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Mail, Plus, Trash2, UserPlus, X } from "lucide-react";
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
  Organizer: "bg-brand-yellow/40 text-ink",
  Paid: "bg-brand-mint/25 text-success",
  Pending: "bg-brand-pink/25 text-brand-pink",
  Invited: "bg-brand-soft text-brand-sky",
  Joined: "bg-brand-mint/25 text-success",
};

export default function TravelersPage() {
  const { isAdmin, guard } = useAuth();
  const { code, user } = useSession();
  const { state, travelers, removeTraveler, setTravelers } =
    useTripData();
  const isMe = (t: Traveler) =>
    t.name.trim().toLowerCase() === (user?.name ?? "").trim().toLowerCase();
  const shownStatus = (t: Traveler): Traveler["status"] =>
    isMe(t) ? "You" : t.status === "You" ? "Organizer" : t.status;
  const isOrganizer = (t: Traveler) =>
    t.status === "Organizer" || t.status === "You";

  const togglePaid = (name: string) =>
    setTravelers((l) =>
      l.map((t) =>
        t.name === name
          ? { ...t, status: t.status === "Paid" ? "Pending" : "Paid" }
          : t
      )
    );

  const members = travelers.filter((t) => !isOrganizer(t));
  const paidCount = members.filter((t) => t.status === "Paid").length;
  const unpaidCount = members.length - paidCount;
  const place = state.trip.destination.split(",")[0];
  const [open, setOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkAmount, setLinkAmount] = useState(0);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  // The invite link carries only the trip code + (optional) amount owed.
  // Whoever opens it types their own name on the join screen.
  const inviteLink = `${siteUrl}/?code=${code ?? ""}${
    linkAmount ? `&pay=${linkAmount}` : ""
  }`;

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
    setLinkAmount(amount ? Number(amount) : 0);
    setAmount("");
    setOpen(false);
    setLinkOpen(true);
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
            {travelers.length} {travelers.length === 1 ? "traveler" : "travelers"}{" "}
            {place ? `going to ${place}` : "on this trip"} 🌴
          </h3>
          <p className="mt-1 text-sm font-semibold text-muted">
            Good vibes &amp; tan lines guaranteed.
          </p>
          {members.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-mint/25 px-3 py-1 text-xs font-bold text-success">
                ✅ {paidCount} paid
              </span>
              <span className="rounded-full bg-brand-pink/25 px-3 py-1 text-xs font-bold text-brand-pink">
                ⏳ {unpaidCount} not paid yet
              </span>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute -right-2 bottom-0 hidden text-7xl sm:block md:text-8xl">
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
              {isAdmin && !isMe(t) && (
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
                  statusStyle[shownStatus(t)]
                )}
              >
                {shownStatus(t)}
              </span>
              {!!t.amountDue && (
                <p className="text-xs font-semibold text-muted">
                  {t.status === "Paid" ? "Paid" : "Owes"} {rupiah(t.amountDue)}
                </p>
              )}
              {isAdmin && !isOrganizer(t) && (
                <button
                  onClick={() => guard(() => togglePaid(t.name))}
                  className={cn(
                    "mt-1 flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition",
                    t.status === "Paid"
                      ? "border-line text-muted hover:border-brand-pink hover:text-brand-pink"
                      : "border-brand-mint text-success hover:bg-brand-mint hover:text-white"
                  )}
                >
                  {t.status === "Paid" ? (
                    <>
                      <X className="h-3.5 w-3.5" /> Mark as not paid
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Mark as paid
                    </>
                  )}
                </button>
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

      {/* Invite modal — admin only sets the amount; joiner enters their own name */}
      <Modal open={open} onClose={() => setOpen(false)} title="Invite Traveler">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink">
              Amount they need to pay (Rp)
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invite()}
              placeholder="e.g. 1500000"
              className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
            />
            <span className="mt-1 block text-xs text-muted">
              Optional — leave blank if they don&apos;t owe anything. They&apos;ll
              type their own name when they open the link.
            </span>
          </label>
          <Button onClick={invite} className="w-full">
            <Mail className="h-4 w-4" /> Create invite link
          </Button>
        </div>
      </Modal>

      {/* Invite link popup */}
      <Modal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Invite link ready! 🎉"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-soft/40 text-4xl">
            🔗
          </div>
          {linkAmount > 0 ? (
            <div className="rounded-2xl bg-brand-soft/30 p-4">
              <p className="text-sm font-semibold text-muted">Amount to pay</p>
              <p className="font-heading text-2xl font-bold text-brand-sky">
                {rupiah(linkAmount)}
              </p>
              <p className="mt-1 text-xs text-muted">
                Charged to whoever joins with this link 💰
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              No amount attached — they just join the trip.
            </p>
          )}

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
              Share this — your friend opens it and enters their own name to
              join the trip.
            </p>
          </div>

          <Button onClick={() => setLinkOpen(false)} className="w-full">
            Got it!
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
