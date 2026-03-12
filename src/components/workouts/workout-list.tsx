"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                filtered.map((workout, index) => {
                    const volume = calculateVolume(workout.sets);
                    const exercises = [
                        ...new Set(workout.sets.map((s) => s.exercise.name)),
                    ];
                    return (
                        <Link key={workout.id} href={`/workouts/${workout.id}`}>
                            <Card
                                className="hover:border-[var(--primary)]/40 transition-all duration-200 cursor-pointer animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold">
                                                    {workout.name ??
                                                        formatDate(
                                                            workout.date,
                                                        )}
                                                </span>
                                                <span className="text-xs text-[var(--muted-foreground)]">
                                                    {formatRelativeDate(
                                                        workout.date,
                                                    )}
                                                </span>
                                                {workout.durationMins && (
                                                    <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {workout.durationMins}{" "}
                                                        min
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {exercises
                                                    .slice(0, 4)
                                                    .map((ex) => (
                                                        <Badge
                                                            key={ex}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {ex}
                                                        </Badge>
                                                    ))}
                                                {exercises.length > 4 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        +{exercises.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0 text-right">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {Math.round(
                                                        volume,
                                                    ).toLocaleString()}{" "}
                                                    lbs
                                                </p>
                                                <p className="text-xs text-[var(--muted-foreground)]">
                                                    {workout.sets.length} sets
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
