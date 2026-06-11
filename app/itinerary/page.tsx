"use client";

import { Reorder, motion } from "framer-motion";
import {
  Clock,
  GripVertical,
  Hourglass,
  Image as ImageIcon,
  Lock,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTripData } from "@/components/trip/TripDataProvider";
import { type Activity } from "@/lib/data";
import { cn } from "@/lib/utils";

const priorityStyle: Record<Activity["priority"], string> = {
  High: "bg-brand-pink/20 text-brand-pink",
  Medium: "bg-brand-yellow/30 text-warning",
  Low: "bg-brand-mint/25 text-success",
};

export default function ItineraryPage() {
  const { isAdmin, guard, openLogin } = useAuth();
  const { state, setDays } = useTripData();
  const days = state.days;

  const addDay = () => {
    const next = days.length + 1;
    setDays([
      ...days,
      {
        day: next,
        date: "New",
        title: "Untitled Day",
        icon: "🗓️",
        activities: [],
      },
    ]);
  };

  const setActivities = (dayIdx: number, acts: Activity[]) => {
    setDays((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, activities: acts } : d))
    );
  };

  const addActivity = (dayIdx: number) => {
    const act: Activity = {
      id: crypto.randomUUID(),
      time: "12:00",
      duration: "1 hour",
      title: "New activity",
      location: "Bali",
      transport: "🚗 Car",
      priority: "Medium",
    };
    setActivities(dayIdx, [...days[dayIdx].activities, act]);
  };

  const removeActivity = (dayIdx: number, id: string) => {
    setActivities(
      dayIdx,
      days[dayIdx].activities.filter((a) => a.id !== id)
    );
  };

  const setDayImage = (dayIdx: number, image: string | undefined) => {
    setDays((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, image } : d))
    );
  };

  const onPhotoPick = (dayIdx: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDayImage(dayIdx, reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateActivity = (
    dayIdx: number,
    id: string,
    patch: Partial<Activity>
  ) => {
    setActivities(
      dayIdx,
      days[dayIdx].activities.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  return (
    <AppShell>
      <PageHeader
        emoji="🗺️"
        title="Itinerary"
        subtitle={
          isAdmin
            ? "Drag activities to reorder your perfect day."
            : "Viewing in read-only mode."
        }
        action={
          <Button onClick={() => guard(addDay)}>
            <Plus className="h-5 w-5" strokeWidth={3} /> Add Day
          </Button>
        }
      />

      {!isAdmin && (
        <button
          onClick={openLogin}
          className="flex items-center gap-2 rounded-2xl border border-brand-yellow/60 bg-brand-yellow/15 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-brand-yellow/25"
        >
          <Lock className="h-4 w-4 text-warning" />
          You&apos;re viewing as a guest. Log in as admin to add, edit, drag or
          delete activities.
        </button>
      )}

      <div className="flex flex-col gap-6">
        {days.map((day, dayIdx) => (
          <motion.section
            key={day.day}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: dayIdx * 0.05 }}
            className="rounded-xl3 bg-white p-5 shadow-soft md:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-cream text-2xl">
                  {day.icon}
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-ink">
                    Day {day.day} — {day.title}
                  </h3>
                  <p className="text-sm font-semibold text-muted">{day.date}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => guard(() => addActivity(dayIdx))}
              >
                <Plus className="h-4 w-4" strokeWidth={3} /> Activity
              </Button>
            </div>

            {/* Day photo (polaroid) */}
            {day.image ? (
              <div className="group relative mb-4 overflow-hidden rounded-xl2">
                <img
                  src={day.image}
                  alt={`Day ${day.day}`}
                  className="h-44 w-full object-cover sm:h-56"
                />
                {isAdmin && (
                  <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <label className="cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow-soft transition hover:bg-white">
                      <ImageIcon className="mr-1 inline h-3.5 w-3.5" /> Change
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          onPhotoPick(dayIdx, e.target.files?.[0])
                        }
                      />
                    </label>
                    <button
                      onClick={() => setDayImage(dayIdx, undefined)}
                      className="rounded-full bg-white/90 p-1.5 text-brand-pink shadow-soft transition hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              isAdmin && (
                <label className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-brand-sky/40 bg-brand-soft/15 py-8 text-brand-sky transition hover:bg-brand-soft/30">
                  <ImageIcon className="h-7 w-7" />
                  <span className="text-sm font-bold">Add a photo for this day</span>
                  <span className="text-xs font-semibold text-muted">
                    Click to upload from your device
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPhotoPick(dayIdx, e.target.files?.[0])}
                  />
                </label>
              )
            )}

            {day.activities.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-line py-8 text-center text-sm font-semibold text-muted">
                No activities yet — add one to start planning ✨
              </p>
            ) : (
              <Reorder.Group
                axis="y"
                values={day.activities}
                onReorder={(v) => setActivities(dayIdx, v)}
                className="flex flex-col gap-3"
              >
                {day.activities.map((act) => (
                  <Reorder.Item
                    key={act.id}
                    value={act}
                    dragListener={isAdmin}
                    whileDrag={{ scale: 1.02, boxShadow: "0 18px 50px -18px rgba(45,45,45,0.35)" }}
                    className="flex flex-wrap items-start gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-soft sm:flex-nowrap"
                  >
                    <GripVertical
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-muted",
                        isAdmin
                          ? "cursor-grab active:cursor-grabbing"
                          : "opacity-30"
                      )}
                    />
                    <div className="flex w-[88px] shrink-0 flex-col gap-1">
                      <div className="flex items-center gap-1.5 rounded-xl bg-brand-soft/40 px-2.5 py-1 text-sm font-bold text-brand-sky">
                        <Clock className="h-3.5 w-3.5" />
                        {isAdmin ? (
                          <input
                            value={act.time}
                            onChange={(e) =>
                              updateActivity(dayIdx, act.id, {
                                time: e.target.value,
                              })
                            }
                            className="w-12 bg-transparent text-center outline-none"
                          />
                        ) : (
                          act.time
                        )}
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-brand-mint/15 px-2.5 py-1 text-xs font-bold text-success">
                        <Hourglass className="h-3 w-3" />
                        {isAdmin ? (
                          <input
                            value={act.duration}
                            placeholder="2 hours"
                            onChange={(e) =>
                              updateActivity(dayIdx, act.id, {
                                duration: e.target.value,
                              })
                            }
                            className="w-full bg-transparent text-center outline-none placeholder:text-success/50"
                          />
                        ) : (
                          act.duration
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      {isAdmin ? (
                        <input
                          value={act.title}
                          onChange={(e) =>
                            updateActivity(dayIdx, act.id, {
                              title: e.target.value,
                            })
                          }
                          className="w-full rounded-md bg-brand-cream/0 font-bold text-ink outline-none focus:bg-brand-cream"
                        />
                      ) : (
                        <p className="font-bold text-ink">{act.title}</p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-brand-pink" />
                          {isAdmin ? (
                            <input
                              value={act.location}
                              onChange={(e) =>
                                updateActivity(dayIdx, act.id, {
                                  location: e.target.value,
                                })
                              }
                              className="w-24 rounded bg-transparent outline-none focus:bg-brand-cream"
                            />
                          ) : (
                            act.location
                          )}
                        </span>
                        {isAdmin ? (
                          <input
                            value={act.transport}
                            placeholder="🚗 Car"
                            onChange={(e) =>
                              updateActivity(dayIdx, act.id, {
                                transport: e.target.value,
                              })
                            }
                            className="w-28 rounded bg-transparent outline-none focus:bg-brand-cream"
                          />
                        ) : (
                          <span>{act.transport}</span>
                        )}
                      </div>
                      {isAdmin ? (
                        <input
                          value={act.note ?? ""}
                          placeholder="📝 Add a note..."
                          onChange={(e) =>
                            updateActivity(dayIdx, act.id, {
                              note: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-lg bg-brand-cream px-2 py-1 text-xs text-ink outline-none"
                        />
                      ) : (
                        act.note && (
                          <p className="mt-1.5 rounded-lg bg-brand-cream px-2 py-1 text-xs text-ink">
                            📝 {act.note}
                          </p>
                        )
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                        priorityStyle[act.priority]
                      )}
                    >
                      {act.priority}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => removeActivity(dayIdx, act.id)}
                        className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-brand-pink/15 hover:text-brand-pink"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </motion.section>
        ))}
      </div>
    </AppShell>
  );
}
