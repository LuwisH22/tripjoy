"use client";

import { useEffect, useState } from "react";
import { ReceiptText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/components/auth/SessionProvider";
import { useTripData } from "./TripDataProvider";
import { rupiah } from "@/lib/utils";
import type { Bill } from "@/lib/data";

/**
 * Notifies a traveler when a new split bill includes their name.
 * Shows once per bill per device (tracked in localStorage).
 */
export function BillNotice() {
  const { user, code } = useSession();
  const { state, ready } = useTripData();
  const [queue, setQueue] = useState<Bill[]>([]);

  useEffect(() => {
    if (!ready || !user || !code) return;
    const me = user.name.trim().toLowerCase();
    const bills = state.bills ?? [];

    const unseen = bills.filter((b) => {
      const mine = b.items.some(
        (i) => i.eater.trim().toLowerCase() === me
      );
      if (!mine) return false;
      try {
        return !localStorage.getItem(`tripjoy-billseen-${b.id}`);
      } catch {
        return false;
      }
    });

    if (unseen.length) setQueue(unseen);
  }, [ready, user, code, state.bills]);

  const current = queue[0];
  if (!current || !user) return null;

  const me = user.name.trim().toLowerCase();
  const myItems = current.items.filter(
    (i) => i.eater.trim().toLowerCase() === me
  );
  const myTotal = myItems.reduce((s, i) => s + i.amount, 0);

  const dismiss = () => {
    try {
      localStorage.setItem(`tripjoy-billseen-${current.id}`, "1");
    } catch {}
    setQueue((q) => q.slice(1));
  };

  return (
    <Modal open onClose={dismiss} title="New bill for you! 🧾">
      <div className="space-y-4">
        <p className="text-center text-sm text-muted">
          <span className="font-bold text-ink">{current.createdBy}</span> split
          a bill — <span className="font-bold text-ink">{current.title}</span> —
          and you&apos;re on it:
        </p>

        <ul className="space-y-1 rounded-2xl bg-brand-cream/70 p-3 text-sm font-semibold">
          {myItems.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-ink">{i.name}</span>
              <span className="text-muted">{rupiah(i.amount)}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl bg-brand-soft/30 p-4 text-center">
          <p className="flex items-center justify-center gap-1 text-sm font-semibold text-muted">
            <ReceiptText className="h-4 w-4" /> You owe
          </p>
          <p className="font-heading text-3xl font-bold text-brand-sky">
            {rupiah(myTotal)}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">
            Transfer to {current.bankNumber} ({current.bankName})
          </p>
        </div>

        <Button onClick={dismiss} className="w-full">
          Got it — I&apos;ll pay! 💸
        </Button>
      </div>
    </Modal>
  );
}
