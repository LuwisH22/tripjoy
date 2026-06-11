"use client";

import { useEffect, useRef, useState } from "react";
import { Wallet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InitialAvatar } from "@/components/ui/InitialAvatar";
import { useSession } from "@/components/auth/SessionProvider";
import { useTripData } from "./TripDataProvider";
import { rupiah } from "@/lib/utils";

/**
 * After someone joins a trip via an invite link, show them how much they
 * need to pay (once per trip per device, until they're marked Paid).
 */
export function PaymentNotice() {
  const { user, code } = useSession();
  const { state, ready, setTravelers } = useTripData();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [items, setItems] = useState<{ name: string; amount: number }[]>([]);
  const checked = useRef(false);

  useEffect(() => {
    if (!ready || !code || !user || checked.current) return;
    checked.current = true;

    // Read the invite's pay amount, then immediately drop the invite params
    // from the URL so a stale ?pay= / ?invite= can't be re-applied on a later
    // visit or a newly-created trip.
    let urlPay = 0;
    let urlItems: { name: string; amount: number }[] = [];
    try {
      const url = new URL(window.location.href);
      urlPay = Number(url.searchParams.get("pay") || 0);
      // Parse the optional breakdown: "Car:1000000;Hotel:500000".
      const raw = url.searchParams.get("items");
      if (raw) {
        urlItems = raw
          .split(";")
          .map((part) => {
            const idx = part.lastIndexOf(":");
            if (idx < 0) return null;
            return {
              name: decodeURIComponent(part.slice(0, idx)),
              amount: Number(part.slice(idx + 1)) || 0,
            };
          })
          .filter((x): x is { name: string; amount: number } => !!x);
      }
      if (
        url.searchParams.has("pay") ||
        url.searchParams.has("items") ||
        url.searchParams.has("invite") ||
        url.searchParams.has("code")
      ) {
        url.searchParams.delete("pay");
        url.searchParams.delete("items");
        url.searchParams.delete("invite");
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    } catch {}

    const meName = user.name.trim().toLowerCase();
    const me = state.travelers.find(
      (t) => t.name.trim().toLowerCase() === meName
    );
    if (!me) return;

    // The trip organizer/planner never owes a share — ignore any stale ?pay=
    // amount that might be lingering in the URL from a previous invite link.
    if (me.status === "Organizer" || me.status === "You") return;

    // If the invite link carried a ?pay= amount and my entry doesn't have one
    // yet, store it on my traveler entry so it syncs for everyone.
    let due = me.amountDue || 0;
    if (urlPay > 0 && !due) {
      due = urlPay;
      setTravelers((l) =>
        l.map((t) =>
          t.name.trim().toLowerCase() === meName
            ? {
                ...t,
                amountDue: urlPay,
                ...(urlItems.length ? { paymentItems: urlItems } : {}),
              }
            : t
        )
      );
    }

    if (!due || me.status === "Paid") return;

    // Prefer the freshly-parsed breakdown, else any already stored on my entry.
    setItems(urlItems.length ? urlItems : me.paymentItems ?? []);

    // Only nag once per trip per device.
    const key = `tripjoy-paynotice-${code}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {}

    setAmount(due);
    setOpen(true);
  }, [ready, code, user, state.travelers, setTravelers]);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Welcome to the trip! 🎉">
      <div className="space-y-4 text-center">
        <InitialAvatar
          name={user?.name ?? "?"}
          className="mx-auto h-20 w-20 text-3xl"
        />
        <p className="text-sm text-muted">
          Hi <span className="font-bold text-ink">{user?.name}</span> — you&apos;re
          in! Here&apos;s your share of the trip:
        </p>
        <div className="rounded-2xl bg-brand-soft/30 p-4">
          {items.length > 0 && (
            <ul className="mb-3 space-y-1 text-left text-sm font-semibold">
              {items.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-ink">{it.name}</span>
                  <span className="text-muted">{rupiah(it.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="flex items-center justify-center gap-1 text-sm font-semibold text-muted">
            <Wallet className="h-4 w-4" /> {items.length > 0 ? "Total to pay" : "Amount to pay"}
          </p>
          <p className="font-heading text-3xl font-bold text-brand-sky">
            {rupiah(amount)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Pay the trip organizer — they&apos;ll mark you as paid. 💸
          </p>
        </div>
        <Button onClick={() => setOpen(false)} className="w-full">
          Got it!
        </Button>
      </div>
    </Modal>
  );
}
