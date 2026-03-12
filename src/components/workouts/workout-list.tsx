"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations";
import { Clock, ChevronRight, Search, Dumbbell } from "lucide-react";

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

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                    placeholder="Search by name or exercise…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
                    <Dumbbell className="h-8 w-8 text-[var(--muted-foreground)] opacity-40" />
                    <p className="text-sm text-[var(--muted-foreground)]">
                        No workouts match &ldquo;{search}&rdquo;
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                    {filtered.map((workout, index) => {
                        const volume = calculateVolume(workout.sets);
                        const exercises = [
                            ...new Set(workout.sets.map((s) => s.exercise.name)),
                        ];
                        const exerciseSummary =
                            exercises.slice(0, 3).join(" · ") +
                            (exercises.length > 3
                                ? ` · +${exercises.length - 3}`
                                : "");

                        return (
                            <Link
                                key={workout.id}
                                href={`/workouts/${workout.id}`}
                                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--secondary)]/40 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-sm font-medium truncate">
                                            {workout.name ?? formatDate(workout.date)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                                        {formatRelativeDate(workout.date)}
                                        {workout.durationMins
                                            ? ` · ${workout.durationMins} min`
                                            : ""}
                                        {exerciseSummary
                                            ? ` · ${exerciseSummary}`
                                            : ""}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-medium tabular-nums">
                                        {Math.round(volume).toLocaleString()} lbs
                                    </p>
                                    <p className="text-xs text-[var(--muted-foreground)]">
                                        {workout.sets.length} sets
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
