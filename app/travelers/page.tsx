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
  const [copied, setCopied] = useState(false);
  // Payment line items being built for the invite, e.g. { name:"Car", amount:"1000000" }.
  const [rows, setRows] = useState<{ name: string; amount: string }[]>([
    { name: "", amount: "" },
  ]);
  // Snapshot of the items used to build the current link (after "Create link").
  const [linkItems, setLinkItems] = useState<
    { name: string; amount: number }[]
  >([]);
  const linkTotal = linkItems.reduce((s, i) => s + i.amount, 0);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  // The invite link carries the trip code, the total (?pay=) and, when there's
  // a breakdown, an encoded item list (?items=) so the joiner sees what it's for.
  const itemsParam = linkItems.length
    ? "&items=" +
      linkItems
        .map((i) => `${encodeURIComponent(i.name || "Item")}:${i.amount}`)
        .join(";")
    : "";
  const inviteLink = `${siteUrl}/?code=${code ?? ""}${
    linkTotal ? `&pay=${linkTotal}${itemsParam}` : ""
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

  const addRow = () => setRows((r) => [...r, { name: "", amount: "" }]);
  const updateRow = (i: number, patch: Partial<{ name: string; amount: string }>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeRow = (i: number) =>
    setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : r));

  const rowsTotal = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const invite = () => {
    // Keep only rows with a real amount.
    const items = rows
      .filter((r) => Number(r.amount) > 0)
      .map((r) => ({ name: r.name.trim() || "Item", amount: Number(r.amount) }));
    setLinkItems(items);
    setRows([{ name: "", amount: "" }]);
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
              {t.paymentItems && t.paymentItems.length > 0 && (
                <ul className="w-full space-y-0.5 rounded-xl bg-brand-cream/60 px-3 py-2 text-xs font-semibold">
                  {t.paymentItems.map((it, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="text-ink">{it.name}</span>
                      <span className="text-muted">{rupiah(it.amount)}</span>
                    </li>
                  ))}
                </ul>
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

      {/* Invite modal — admin builds a payment breakdown; joiner enters their name */}
      <Modal open={open} onClose={() => setOpen(false)} title="Invite Traveler">
        <div className="space-y-3">
          <span className="block text-sm font-bold text-ink">
            What do they need to pay for? (optional)
          </span>

          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.name}
                  onChange={(e) => updateRow(i, { name: e.target.value })}
                  placeholder="e.g. Car"
                  className="w-28 shrink-0 rounded-2xl border border-line px-3 py-2.5 text-sm font-semibold outline-none focus:border-brand-sky"
                />
                <div className="flex flex-1 items-center gap-1 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
                  <span className="text-sm font-bold text-muted">Rp</span>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateRow(i, { amount: e.target.value })}
                    placeholder="1000000"
                    className="w-full bg-transparent py-2.5 text-sm font-semibold outline-none"
                  />
                </div>
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(i)}
                    title="Remove"
                    className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-brand-pink/15 hover:text-brand-pink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm font-bold text-brand-sky transition hover:text-brand-sky/70"
          >
            <Plus className="h-4 w-4" strokeWidth={3} /> Add payment
          </button>

          <div className="flex items-center justify-between rounded-2xl bg-brand-soft/30 px-4 py-3">
            <span className="text-sm font-bold text-ink">Total</span>
            <span className="font-heading text-xl font-bold text-brand-sky">
              {rupiah(rowsTotal)}
            </span>
          </div>

          <p className="text-xs text-muted">
            Leave it all blank if they don&apos;t owe anything. They&apos;ll type
            their own name when they open the link.
          </p>

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
          {linkTotal > 0 ? (
            <div className="rounded-2xl bg-brand-soft/30 p-4 text-left">
              {linkItems.length > 0 && (
                <ul className="mb-2 space-y-1 text-sm font-semibold">
                  {linkItems.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-ink">{it.name}</span>
                      <span className="text-muted">{rupiah(it.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between border-t border-line pt-2">
                <span className="text-sm font-bold text-ink">Total to pay</span>
                <span className="font-heading text-xl font-bold text-brand-sky">
                  {rupiah(linkTotal)}
                </span>
              </div>
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
