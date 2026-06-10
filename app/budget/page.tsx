"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, PartyPopper, Plus, Target, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Confetti } from "@/components/ui/Confetti";
import { InitialAvatar } from "@/components/ui/InitialAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTripData } from "@/components/trip/TripDataProvider";
import { budget } from "@/lib/data";
import { rupiah } from "@/lib/utils";

const categories = [
  { name: "Akomodasi", color: "#FF8FA3", emoji: "🏡" },
  { name: "Transportasi", color: "#6EC6FF", emoji: "🚗" },
  { name: "Makan", color: "#7BD389", emoji: "🍜" },
  { name: "Aktivitas", color: "#FFD166", emoji: "🎭" },
  { name: "Lainnya", color: "#B9E7FF", emoji: "✨" },
];

export default function BudgetPage() {
  const { guard } = useAuth();
  const { state, travelers, setExpenses, setSavings } = useTripData();
  const list = state.expenses;
  const savings = state.savings;
  const [open, setOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Makan",
    amount: "",
    paidBy: travelers[0]?.name ?? "",
  });

  const spent = useMemo(
    () => list.reduce((s, e) => s + e.amount, 0),
    [list]
  );
  const remaining = budget.total - spent;
  const pct = Math.min(100, Math.round((spent / budget.total) * 100));
  const overBudget = spent > budget.total;

  const chartData = categories
    .map((c) => ({
      name: c.name,
      color: c.color,
      value: list
        .filter((e) => e.category === c.name)
        .reduce((s, e) => s + e.amount, 0),
    }))
    .filter((c) => c.value > 0);

  const submit = () => {
    if (!form.title || !form.amount) return;
    const cat = categories.find((c) => c.name === form.category)!;
    setExpenses([
      {
        id: crypto.randomUUID(),
        title: form.title,
        category: form.category,
        amount: Number(form.amount),
        paidBy: form.paidBy,
        date: "Today",
        emoji: cat.emoji,
      },
      ...list,
    ]);
    setForm({ ...form, title: "", amount: "" });
    setOpen(false);
  };

  const payingTravelers = travelers.filter((t) => !!t.amountDue);
  const travelerDue = payingTravelers.reduce(
    (s, t) => s + (t.amountDue || 0),
    0
  );

  const savingsGoal = 3_000_000;
  const savePct = Math.min(100, Math.round((savings / savingsGoal) * 100));

  const addSavings = () => {
    const next = Math.min(savingsGoal, savings + 500_000);
    setSavings(next);
    if (next >= savingsGoal) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2600);
    }
  };

  return (
    <AppShell>
      <Confetti show={confetti} />
      <PageHeader
        emoji="💰"
        title="Budget"
        subtitle="Track every Rupiah and stay on plan."
        action={
          <Button onClick={() => guard(() => setOpen(true))}>
            <Plus className="h-5 w-5" strokeWidth={3} /> Add Expense
          </Button>
        }
      />

      {overBudget && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border-2 border-danger/30 bg-danger/10 px-4 py-3 font-semibold text-danger"
        >
          <AlertTriangle className="h-5 w-5" /> You&apos;re over budget by{" "}
          {rupiah(Math.abs(remaining))}!
        </motion.div>
      )}

      {/* planner cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Target Budget" value={rupiah(budget.total)} tint="text-ink" />
        <Stat label="Actual Spending" value={rupiah(spent)} tint="text-brand-pink" />
        <Stat
          label="Remaining"
          value={rupiah(remaining)}
          tint={overBudget ? "text-danger" : "text-success"}
        />
      </div>

      <div className="rounded-xl3 bg-white p-6 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span className="text-ink">Spending progress</span>
          <span className="text-muted">{pct}% used</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-brand-cream">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              overBudget
                ? "bg-danger"
                : "bg-gradient-to-r from-brand-sky to-brand-mint"
            }`}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* donut */}
        <section className="rounded-xl3 bg-white p-6 shadow-soft">
          <h3 className="font-heading text-xl font-bold text-ink">By Category</h3>
          <div className="relative mx-auto mt-2 h-52 w-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {chartData.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => rupiah(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-muted">Spent</span>
              <span className="font-heading text-lg font-bold text-ink">
                {rupiah(spent)}
              </span>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {chartData.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                <span className="flex-1 text-ink">{c.name}</span>
                <span className="text-muted">{rupiah(c.value)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* expenses list + split */}
        <section className="rounded-xl3 bg-white p-6 shadow-soft">
          <h3 className="font-heading text-xl font-bold text-ink">Expenses</h3>
          <ul className="mt-3 space-y-2">
            {list.map((e) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-cream text-xl">
                  {e.emoji}
                </span>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-ink">{e.title}</p>
                  <p className="text-xs text-muted">
                    {e.category} • paid by {e.paidBy} • {e.date}
                  </p>
                </div>
                <span className="font-heading font-bold text-ink">
                  {rupiah(e.amount)}
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-5 rounded-2xl bg-brand-soft/20 p-4">
            <p className="mb-2 font-heading font-bold text-ink">
              💸 Split Bill — {rupiah(Math.round(spent / travelers.length))} each
            </p>
            <div className="space-y-1.5">
              {travelers.map((t) => {
                const paid = list
                  .filter((e) => e.paidBy === t.name)
                  .reduce((s, e) => s + e.amount, 0);
                const share = spent / travelers.length;
                const balance = paid - share;
                return (
                  <div
                    key={t.name}
                    className="flex items-center justify-between text-sm font-semibold"
                  >
                    <span className="text-ink">{t.name}</span>
                    <span className={balance >= 0 ? "text-success" : "text-brand-pink"}>
                      {balance >= 0
                        ? `gets back ${rupiah(Math.round(balance))}`
                        : `owes ${rupiah(Math.round(-balance))}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* savings tracker */}
      <section className="relative overflow-hidden rounded-xl3 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
            <Target className="h-5 w-5 text-brand-mint" /> Savings Tracker
          </h3>
          <Button variant="outline" onClick={() => guard(addSavings)}>
            <Plus className="h-4 w-4" strokeWidth={3} /> Add {rupiah(500_000)}
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Goal: {rupiah(savingsGoal)} — saved {rupiah(savings)}
        </p>
        <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-brand-cream">
          <motion.div
            animate={{ width: `${savePct}%` }}
            transition={{ duration: 0.7 }}
            className="h-full rounded-full bg-gradient-to-r from-brand-yellow to-brand-mint"
          />
        </div>
        {savePct >= 100 && (
          <p className="mt-3 flex items-center gap-2 font-bold text-success">
            <PartyPopper className="h-5 w-5" /> Goal reached — time to book! 🎉
          </p>
        )}
      </section>

      {/* Traveler payments (from invites) */}
      <section className="rounded-xl3 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
            <Users className="h-5 w-5 text-brand-pink" /> Traveler Payments
          </h3>
          <span className="rounded-full bg-brand-soft/40 px-3 py-1 text-sm font-bold text-brand-sky">
            Expected: {rupiah(travelerDue)}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          Amounts each traveler needs to pay (set when inviting them).
        </p>

        {payingTravelers.length === 0 ? (
          <p className="mt-4 rounded-2xl border-2 border-dashed border-line py-8 text-center text-sm font-semibold text-muted">
            No traveler payments yet — invite someone with an amount on the
            Travelers page 👥
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {payingTravelers.map((t) => (
              <li
                key={t.name}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft"
              >
                <InitialAvatar name={t.name} className="h-10 w-10 text-lg" />
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
                <span className="rounded-full bg-brand-pink/15 px-2.5 py-1 text-xs font-bold text-brand-pink">
                  {t.status}
                </span>
                <span className="font-heading font-bold text-ink">
                  {rupiah(t.amountDue || 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Expense">
        <div className="space-y-3">
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Lunch at warung"
              className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
            />
          </Field>
          <Field label="Amount (Rp)">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="150000"
              className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-line px-3 py-2.5 font-semibold outline-none focus:border-brand-sky"
              >
                {categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Paid by">
              <select
                value={form.paidBy}
                onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                className="w-full rounded-2xl border border-line px-3 py-2.5 font-semibold outline-none focus:border-brand-sky"
              >
                {travelers.map((t) => (
                  <option key={t.name}>{t.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <button className="w-full rounded-2xl border-2 border-dashed border-line py-3 text-sm font-semibold text-muted transition hover:border-brand-sky hover:text-brand-sky">
            📎 Upload receipt (optional)
          </button>
          <Button onClick={submit} className="w-full">
            Save Expense
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-xl3 bg-white p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className={`mt-1 font-heading text-2xl font-bold ${tint}`}>{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}
