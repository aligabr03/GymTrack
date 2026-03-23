"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations";
import { ChevronRight, Search, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

type Workout = {
    id: string;
    name: string | null;
    date: Date;
    durationMins: number | null;
    sets: Array<{
        exerciseId: string;
        exercise: { name: string };
        weightKg: number | null;
        reps: number | null;
    }>;
};

const WORKOUT_GROUPS = [
    "Today",
    "Yesterday",
    "Last 3 Days",
    "Last 2 Weeks",
    "Last 3 Months",
    "Older",
] as const;

function utcDateStr(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-CA", { timeZone: "UTC" });
}

function getWorkoutGroup(date: Date | string) {
    const workoutDay = new Date(utcDateStr(date) + "T00:00:00Z");
    const todayStr = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/New_York",
    });
    const today = new Date(todayStr + "T00:00:00Z");
    const diffDays = Math.round(
        (today.getTime() - workoutDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 3) return "Last 3 Days";
    if (diffDays <= 14) return "Last 2 Weeks";
    if (diffDays <= 90) return "Last 3 Months";
    return "Older";
}

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
    const [search, setSearch] = useState("");

    const filtered = search.trim()
        ? workouts.filter((w) => {
              const q = search.toLowerCase();
              const nameMatch = (w.name ?? "").toLowerCase().includes(q);
              const dateMatch = formatDate(w.date).toLowerCase().includes(q);
              const exerciseMatch = w.sets.some((s) =>
                  s.exercise.name.toLowerCase().includes(q),
              );
              return nameMatch || dateMatch || exerciseMatch;
          })
        : workouts;

    const grouped = filtered.reduce(
        (acc, workout) => {
            const group = getWorkoutGroup(workout.date);
            acc[group] = [...(acc[group] ?? []), workout];
            return acc;
        },
        {} as Record<string, Workout[]>,
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                    placeholder="Search by name or exerciseâ€¦"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-[var(--secondary)] border-[var(--border)] focus:border-[var(--primary)]/50 focus:ring-[var(--primary)]/20 h-10"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
                    <div className="p-4 rounded-full bg-[var(--secondary)]">
                        <Dumbbell className="h-7 w-7 text-[var(--muted-foreground)]" />
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        No workouts match &ldquo;{search}&rdquo;
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {WORKOUT_GROUPS.filter(
                        (group) => grouped[group]?.length,
                    ).map((group) => (
                        <div key={group}>
                            <div className="flex items-center gap-2.5 mb-2.5 px-1">
                                <h2 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest whitespace-nowrap">
                                    {group}
                                </h2>
                                <span className="px-1.5 py-0.5 rounded-full bg-[var(--secondary)] text-[9px] font-bold text-[var(--muted-foreground)] tabular-nums">
                                    {grouped[group].length}
                                </span>
                                <div className="h-px flex-1 bg-[var(--border)]" />
                            </div>
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                                {grouped[group].map((workout, index) => {
                                    const volume = calculateVolume(workout.sets);
                                    const exercises = [...new Set(workout.sets.map(s => s.exercise.name))].slice(0, 2);
                                    const extra = [...new Set(workout.sets.map(s => s.exerciseId))].length - exercises.length;

                                    return (
                                        <Link
                                            key={workout.id}
                                            href={`/workouts/${workout.id}`}
                                            className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--primary)]/5 animate-fade-in-up"
                                            style={{ animationDelay: `${index * 40}ms` }}
                                        >
                                            <div className="p-2 rounded-xl bg-[var(--secondary)] group-hover:bg-[var(--primary)]/15 transition-colors shrink-0">
                                                <Dumbbell className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-sm font-semibold truncate">
                                                    {workout.name ?? formatDate(workout.date)}
                                                </span>
                                                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                                                    {formatRelativeDate(workout.date)}
                                                    {workout.durationMins ? ` Â· ${workout.durationMins} min` : ""}
                                                    {exercises.length > 0 && ` Â· ${exercises.join(", ")}${extra > 0 ? ` +${extra}` : ""}`}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className={cn("text-sm font-bold tabular-nums", "text-[var(--primary)]")}>
                                                    {Math.round(volume).toLocaleString()}
                                                    <span className="text-xs font-normal text-[var(--muted-foreground)]"> lbs</span>
                                                </p>
                                                <p className="text-xs text-[var(--muted-foreground)]">
                                                    {workout.sets.length} sets
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
