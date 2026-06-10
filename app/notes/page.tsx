"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTripData } from "@/components/trip/TripDataProvider";
import { type Note } from "@/lib/data";

const palette = ["#D7B35B", "#DFA4AF", "#93B29B", "#7CB7E8", "#DCEBF5"];

export default function NotesPage() {
  const { isAdmin, guard } = useAuth();
  const { state, setNotes } = useTripData();
  const list = state.notes;

  const add = () => {
    setNotes([
      {
        id: crypto.randomUUID(),
        title: "New note ✏️",
        body: "Tap to edit me...",
        color: palette[list.length % palette.length],
        rotate: (Math.random() - 0.5) * 6,
      },
      ...list,
    ]);
  };

  const update = (id: string, patch: Partial<Note>) =>
    setNotes((l) => l.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const remove = (id: string) => setNotes((l) => l.filter((n) => n.id !== id));

  return (
    <AppShell>
      <PageHeader
        emoji="📝"
        title="Notes"
        subtitle="Sticky reminders for your trip."
        action={
          <Button onClick={() => guard(add)}>
            <Plus className="h-5 w-5" strokeWidth={3} /> New Note
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {list.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, rotate: n.rotate }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ rotate: 0, scale: 1.03 }}
              style={{ background: n.color }}
              className="group relative rounded-2xl p-5 shadow-float"
            >
              <span className="absolute left-1/2 top-0 h-4 w-16 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white/50" />
              {isAdmin && (
                <button
                  onClick={() => remove(n.id)}
                  className="absolute right-2 top-2 rounded-full bg-white/40 p-1 opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-ink" />
                </button>
              )}
              <input
                value={n.title}
                readOnly={!isAdmin}
                onChange={(e) => update(n.id, { title: e.target.value })}
                className="w-full bg-transparent font-heading text-lg font-bold text-ink outline-none"
              />
              <textarea
                value={n.body}
                readOnly={!isAdmin}
                onChange={(e) => update(n.id, { body: e.target.value })}
                rows={4}
                className="mt-2 w-full resize-none bg-transparent text-sm font-semibold text-ink/80 outline-none"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
