"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  AlertTriangle,
  PartyPopper,
  Plus,
  ReceiptText,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Confetti } from "@/components/ui/Confetti";
import { InitialAvatar } from "@/components/ui/InitialAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { useTripData } from "@/components/trip/TripDataProvider";
import { expenseCategories, type Bill, type BillItem } from "@/lib/data";
import { rupiah } from "@/lib/utils";

const categories = expenseCategories;

/** Compact, branded tooltip for the category donut. */
function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; payload?: { color?: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3 py-2 text-sm font-bold shadow-float">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: p.payload?.color }}
      />
      <span className="text-ink">{p.name}</span>
      <span className="text-muted">{rupiah(p.value ?? 0)}</span>
    </div>
  );
}

export default function BudgetPage() {
  const { isAdmin, guard } = useAuth();
  const { user } = useSession();
  const {
    state,
    travelers,
    setExpenses,
    setBills,
    setSavings,
    setBudgetTotal,
    setSavingsGoal,
  } = useTripData();
  const list = state.expenses;
  const bills = state.bills ?? [];
  const savings = state.savings;
  const budgetTotal = state.budgetTotal;
  const savingsGoal = state.savingsGoal;
  const [open, setOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [addAmt, setAddAmt] = useState("");

  // Split bill form
  const [billForm, setBillForm] = useState({
    title: "",
    bankNumber: "",
    bankName: "",
  });
  const emptyItem = (): BillItem => ({
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    eater: travelers[0]?.name ?? "",
  });
  const [billItems, setBillItems] = useState<BillItem[]>([emptyItem()]);

  const submitBill = () => {
    const items = billItems.filter((i) => i.name.trim() && i.amount > 0);
    if (!billForm.bankNumber.trim() || !billForm.bankName.trim() || !items.length)
      return;
    const bill: Bill = {
      id: crypto.randomUUID(),
      title: billForm.title.trim() || "Split Bill",
      bankNumber: billForm.bankNumber.trim(),
      bankName: billForm.bankName.trim(),
      createdBy: user?.name ?? "Admin",
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      items,
    };
    setBills([bill, ...bills]);
    setBillForm({ title: "", bankNumber: "", bankName: "" });
    setBillItems([emptyItem()]);
    setBillOpen(false);
  };

  const updateBillItem = (id: string, patch: Partial<BillItem>) =>
    setBillItems((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeBill = (id: string) =>
    setBills((l) => l.filter((b) => b.id !== id));

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
  const remaining = budgetTotal - spent;
  const pct =
    budgetTotal > 0 ? Math.min(100, Math.round((spent / budgetTotal) * 100)) : 0;
  const overBudget = spent > budgetTotal;

  const updateExpense = (id: string, patch: Partial<(typeof list)[number]>) =>
    setExpenses((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeExpense = (id: string) =>
    setExpenses((l) => l.filter((e) => e.id !== id));

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

  const payingTravelers = travelers.filter(
    (t) => !!t.amountDue && t.status !== "Organizer" && t.status !== "You"
  );
  const travelerDue = payingTravelers.reduce(
    (s, t) => s + (t.amountDue || 0),
    0
  );

  const savePct =
    savingsGoal > 0
      ? Math.min(100, Math.round((savings / savingsGoal) * 100))
      : 0;

  const addSavings = (amt: number) => {
    if (!amt) return;
    const next = savings + amt;
    setSavings(next);
    setAddAmt("");
    if (savingsGoal > 0 && next >= savingsGoal && savings < savingsGoal) {
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
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => guard(() => setOpen(true))}>
              <Plus className="h-5 w-5" strokeWidth={3} /> Add Expense
            </Button>
            <Button
              variant="outline"
              onClick={() => guard(() => setBillOpen(true))}
            >
              <ReceiptText className="h-5 w-5" /> Split Bill
            </Button>
          </div>
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
        <div className="rounded-xl3 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Target Budget {isAdmin && <span className="text-brand-sky">✎</span>}
          </p>
          {isAdmin ? (
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-heading text-2xl font-bold text-ink">Rp</span>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value) || 0)}
                className="w-full rounded-lg font-heading text-2xl font-bold text-ink outline-none focus:bg-brand-cream"
              />
            </div>
          ) : (
            <p className="mt-1 font-heading text-2xl font-bold text-ink">
              {rupiah(budgetTotal)}
            </p>
          )}
        </div>
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
                <Tooltip
                  content={<CategoryTooltip />}
                  cursor={{ fill: "transparent" }}
                  position={{ y: -14 }}
                  wrapperStyle={{ outline: "none", zIndex: 30 }}
                />
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
          {list.length === 0 && (
            <p className="mt-3 rounded-2xl border-2 border-dashed border-line py-6 text-center text-sm font-semibold text-muted">
              No expenses yet — add one to start tracking 💸
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {list.map((e) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-cream text-xl">
                  {e.emoji}
                </span>
                {isAdmin ? (
                  <div className="flex-1 leading-tight">
                    <input
                      value={e.title}
                      onChange={(ev) =>
                        updateExpense(e.id, { title: ev.target.value })
                      }
                      className="w-full rounded font-bold text-ink outline-none focus:bg-brand-cream"
                    />
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <select
                        value={e.category}
                        onChange={(ev) =>
                          updateExpense(e.id, {
                            category: ev.target.value,
                            emoji:
                              categories.find((c) => c.name === ev.target.value)
                                ?.emoji ?? e.emoji,
                          })
                        }
                        className="rounded bg-transparent font-semibold outline-none focus:bg-brand-cream"
                      >
                        {categories.map((c) => (
                          <option key={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <span>•</span>
                      <select
                        value={e.paidBy}
                        onChange={(ev) =>
                          updateExpense(e.id, { paidBy: ev.target.value })
                        }
                        className="rounded bg-transparent font-semibold outline-none focus:bg-brand-cream"
                      >
                        {travelers.map((t) => (
                          <option key={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 leading-tight">
                    <p className="text-sm font-bold text-ink">{e.title}</p>
                    <p className="text-xs text-muted">
                      {e.category} • paid by {e.paidBy} • {e.date}
                    </p>
                  </div>
                )}
                {isAdmin ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={e.amount}
                      onChange={(ev) =>
                        updateExpense(e.id, {
                          amount: Number(ev.target.value) || 0,
                        })
                      }
                      className="w-24 rounded text-right font-heading font-bold text-ink outline-none focus:bg-brand-cream"
                    />
                    <button
                      onClick={() => removeExpense(e.id)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-brand-pink/15 hover:text-brand-pink"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="font-heading font-bold text-ink">
                    {rupiah(e.amount)}
                  </span>
                )}
              </motion.li>
            ))}
          </ul>

        </section>
      </div>

      {/* Split bills */}
      <section className="rounded-xl3 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
            <ReceiptText className="h-5 w-5 text-brand-coral" /> Split Bills
          </h3>
          <Button variant="outline" onClick={() => guard(() => setBillOpen(true))}>
            <Plus className="h-4 w-4" strokeWidth={3} /> Split Bill
          </Button>
        </div>

        {bills.length === 0 ? (
          <p className="mt-4 rounded-2xl border-2 border-dashed border-line py-8 text-center text-sm font-semibold text-muted">
            No bills yet — split a meal or activity and everyone on it gets
            notified 🔔
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {bills.map((b) => {
              const total = b.items.reduce((s, i) => s + i.amount, 0);
              const perPerson = new Map<string, number>();
              b.items.forEach((i) =>
                perPerson.set(i.eater, (perPerson.get(i.eater) || 0) + i.amount)
              );
              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-line bg-brand-card2 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading font-bold text-ink">
                        🧾 {b.title}
                      </p>
                      <p className="text-xs text-muted">
                        by {b.createdBy} • {b.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-ink">
                        {rupiah(total)}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => removeBill(b.id)}
                          className="rounded-lg p-1.5 text-muted transition hover:bg-brand-pink/15 hover:text-brand-pink"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 text-sm font-semibold">
                    {b.items.map((i) => (
                      <li key={i.id} className="flex justify-between gap-2">
                        <span className="text-ink">
                          {i.name}{" "}
                          <span className="text-muted">— {i.eater}</span>
                        </span>
                        <span className="text-muted">{rupiah(i.amount)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 rounded-xl bg-brand-soft/30 p-2.5 text-xs font-semibold">
                    {[...perPerson.entries()].map(([who, amt]) => (
                      <div key={who} className="flex justify-between">
                        <span className="text-ink">{who} owes</span>
                        <span className="text-brand-sky">{rupiah(amt)}</span>
                      </div>
                    ))}
                    <p className="mt-1.5 border-t border-line pt-1.5 text-muted">
                      Transfer to {b.bankNumber} ({b.bankName})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* savings tracker */}
      <section className="relative overflow-hidden rounded-xl3 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-ink">
            <Target className="h-5 w-5 text-brand-mint" /> Savings Tracker
          </h3>
        </div>

        <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted">
          Goal:{" "}
          {isAdmin ? (
            <>
              <span className="font-bold text-ink">Rp</span>
              <input
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(Number(e.target.value) || 0)}
                className="w-28 rounded font-bold text-ink outline-none focus:bg-brand-cream"
              />
            </>
          ) : (
            <span className="font-bold text-ink">{rupiah(savingsGoal)}</span>
          )}{" "}
          — saved{" "}
          {isAdmin ? (
            <>
              <span className="font-bold text-success">Rp</span>
              <input
                type="number"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value) || 0)}
                className="w-28 rounded font-bold text-success outline-none focus:bg-brand-cream"
              />
            </>
          ) : (
            <span className="font-bold text-success">{rupiah(savings)}</span>
          )}
        </p>

        <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-brand-cream">
          <motion.div
            animate={{ width: `${savePct}%` }}
            transition={{ duration: 0.7 }}
            className="h-full rounded-full bg-gradient-to-r from-brand-yellow to-brand-mint"
          />
        </div>

        {/* Add a custom amount to savings */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-line px-3 focus-within:border-brand-mint">
            <span className="font-bold text-muted">Rp</span>
            <input
              type="number"
              value={addAmt}
              onChange={(e) => setAddAmt(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && guard(() => addSavings(Number(addAmt)))
              }
              placeholder="500.000"
              className="w-32 bg-transparent py-2.5 font-semibold outline-none"
            />
          </div>
          <Button onClick={() => guard(() => addSavings(Number(addAmt)))}>
            <Plus className="h-4 w-4" strokeWidth={3} /> Add to savings
          </Button>
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

      {/* Split Bill modal */}
      <Modal
        open={billOpen}
        onClose={() => setBillOpen(false)}
        title="Split a Bill 🧾"
      >
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <Field label="Bill title">
            <input
              value={billForm.title}
              onChange={(e) =>
                setBillForm({ ...billForm, title: e.target.value })
              }
              placeholder="e.g. Dinner at warung"
              className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="M-banking number">
              <input
                value={billForm.bankNumber}
                onChange={(e) =>
                  setBillForm({ ...billForm, bankNumber: e.target.value })
                }
                placeholder="e.g. 1234567890"
                className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
              />
            </Field>
            <Field label="Account name">
              <input
                value={billForm.bankName}
                onChange={(e) =>
                  setBillForm({ ...billForm, bankName: e.target.value })
                }
                placeholder="e.g. Luwis H"
                className="w-full rounded-2xl border border-line px-4 py-2.5 font-semibold outline-none focus:border-brand-sky"
              />
            </Field>
          </div>

          <div>
            <span className="mb-1 block text-sm font-bold text-ink">
              Items — who ate / drank what?
            </span>
            <div className="space-y-2">
              {billItems.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-line p-2"
                >
                  <input
                    value={i.name}
                    onChange={(e) =>
                      updateBillItem(i.id, { name: e.target.value })
                    }
                    placeholder="🍜 Food / drink"
                    className="min-w-0 flex-1 rounded-xl px-2 py-1.5 font-semibold outline-none focus:bg-brand-cream"
                  />
                  <input
                    type="number"
                    value={i.amount || ""}
                    onChange={(e) =>
                      updateBillItem(i.id, {
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="Rp"
                    className="w-24 rounded-xl px-2 py-1.5 font-semibold outline-none focus:bg-brand-cream"
                  />
                  <select
                    value={i.eater}
                    onChange={(e) =>
                      updateBillItem(i.id, { eater: e.target.value })
                    }
                    className="rounded-xl bg-brand-cream px-2 py-1.5 text-sm font-semibold outline-none"
                  >
                    {travelers.map((t) => (
                      <option key={t.name}>{t.name}</option>
                    ))}
                  </select>
                  {billItems.length > 1 && (
                    <button
                      onClick={() =>
                        setBillItems((l) => l.filter((x) => x.id !== i.id))
                      }
                      className="rounded-lg p-1 text-muted hover:text-brand-pink"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setBillItems((l) => [...l, emptyItem()])}
              className="mt-2 w-full rounded-2xl border-2 border-dashed border-brand-sky/40 py-2 text-sm font-bold text-brand-sky transition hover:bg-brand-soft/30"
            >
              + Add item
            </button>
          </div>

          <div className="rounded-2xl bg-brand-soft/25 px-4 py-2.5 text-center text-sm font-bold text-ink">
            Total:{" "}
            {rupiah(billItems.reduce((s, i) => s + (i.amount || 0), 0))}
          </div>

          <Button onClick={submitBill} className="w-full">
            <ReceiptText className="h-4 w-4" /> Create bill & notify everyone
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
