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
  const checked = useRef(false);

  useEffect(() => {
    if (!ready || !code || !user || checked.current) return;
    checked.current = true;

    const meName = user.name.trim().toLowerCase();
    const me = state.travelers.find(
      (t) => t.name.trim().toLowerCase() === meName
    );
    if (!me) return;

    // If the invite link carried a ?pay= amount and my entry doesn't have one
    // yet, store it on my traveler entry so it syncs for everyone.
    let due = me.amountDue || 0;
    try {
      const urlPay = Number(
        new URLSearchParams(window.location.search).get("pay") || 0
      );
      if (urlPay > 0 && !due) {
        due = urlPay;
        setTravelers((l) =>
          l.map((t) =>
            t.name.trim().toLowerCase() === meName
              ? { ...t, amountDue: urlPay }
              : t
          )
        );
      }
    } catch {}

    if (!due || me.status === "Paid" || me.status === "Organizer") return;

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
          <p className="flex items-center justify-center gap-1 text-sm font-semibold text-muted">
            <Wallet className="h-4 w-4" /> Amount to pay
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
