"use client";

import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function AccountControl() {
  const { isAdmin, logout, openLogin, ready } = useAuth();

  if (!ready) return null;

  return isAdmin ? (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-brand-mint/40 bg-brand-mint/10 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-bold text-success">
        <ShieldCheck className="h-4 w-4" /> Admin mode
      </span>
      <button
        onClick={logout}
        title="Log out"
        className="rounded-lg p-1.5 text-muted transition hover:bg-white hover:text-ink"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  ) : (
    <button
      onClick={openLogin}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-sky/50 py-2.5 text-sm font-bold text-brand-sky transition hover:bg-brand-soft/30"
    >
      <LogIn className="h-4 w-4" /> Admin Login
    </button>
  );
}
