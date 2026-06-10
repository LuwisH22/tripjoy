"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Lock, ShieldCheck, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthProvider";

export function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (login(id, pass)) {
      setError(false);
      setId("");
      setPass("");
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Admin Login">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl bg-brand-soft/30 p-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-sky text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-muted">
            Editing trips, expenses &amp; notes requires admin access.
          </p>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink">ID</span>
          <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
            <User className="h-4 w-4 text-muted" />
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Enter admin ID"
              className="w-full bg-transparent py-2.5 font-semibold outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink">Password</span>
          <div className="flex items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-brand-sky">
            <KeyRound className="h-4 w-4 text-muted" />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Enter password"
              className="w-full bg-transparent py-2.5 font-semibold outline-none"
            />
          </div>
        </label>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 0] }}
            className="flex items-center gap-2 text-sm font-bold text-danger"
          >
            <Lock className="h-4 w-4" /> Wrong ID or password. Try again!
          </motion.p>
        )}

        <Button onClick={submit} className="w-full">
          Unlock Editing 🔓
        </Button>
      </div>
    </Modal>
  );
}
