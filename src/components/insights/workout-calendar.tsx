"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

type WorkoutEntry = { id: string; name: string | null };

type Props = {
    year: number;
    /** Map of ISO date string (YYYY-MM-DD) → list of workouts */
    data: Record<string, WorkoutEntry[]>;
    /** Optional override for the href of each workout in the day-detail dialog.
     *  Defaults to the owner's own workout route `/workouts/:id`. */
    getWorkoutHref?: (workoutId: string) => string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function intensity(count: number): string {
    if (count === 0) return "bg-[var(--secondary)]";
    return "bg-[var(--foreground)]";
}

export function WorkoutCalendar({ year, data, getWorkoutHref }: Props) {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const resolveHref = getWorkoutHref ?? ((id: string) => `/workouts/${id}`);

    // Build week grid starting from Jan 1 of year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Extend startDate back to the nearest Sunday
    const grid: (Date | null)[][] = [];
    const cursor = new Date(startDate);
    cursor.setDate(cursor.getDate() - cursor.getDay());

    while (cursor <= endDate) {
        const week: (Date | null)[] = [];
        for (let d = 0; d < 7; d++) {
            const day = new Date(cursor);
            week.push(day.getFullYear() === year ? day : null);
            cursor.setDate(cursor.getDate() + 1);
        }
        grid.push(week);
    }

    // Month labels
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    grid.forEach((week, col) => {
        const firstReal = week.find((d) => d !== null);
        if (firstReal && firstReal.getMonth() !== lastMonth) {
            monthLabels.push({ label: MONTHS[firstReal.getMonth()], col });
            lastMonth = firstReal.getMonth();
        }
    });

    const selectedWorkouts = selectedDay ? (data[selectedDay] ?? []) : [];

    return (
        <>
            <div className="overflow-x-auto pb-2">
                <div className="inline-block">
                    {/* Month labels */}
                    <div className="flex mb-1 ml-8" style={{ gap: "3px" }}>
                        {grid.map((_, col) => {
                            const ml = monthLabels.find((m) => m.col === col);
                            return (
                                <div
                                    key={col}
                                    className="text-[10px] text-[var(--muted-foreground)]"
                                    style={{ width: 12 }}
                                >
                                    {ml ? ml.label : ""}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-1">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[3px] mr-1">
                            {DAYS.map((d, i) => (
                                <div
                                    key={d}
                                    className="text-[10px] text-[var(--muted-foreground)] leading-none flex items-center"
                                    style={{
                                        height: 12,
                                        visibility:
                                            i % 2 === 0 ? "visible" : "hidden",
                                    }}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex gap-[3px]">
                            {grid.map((week, col) => (
                                <div
                                    key={col}
                                    className="flex flex-col gap-[3px]"
                                >
                                    {week.map((day, row) => {
                                        if (!day) {
                                            return (
                                                <div
                                                    key={row}
                                                    style={{
                                                        width: 12,
                                                        height: 12,
                                                    }}
                                                />
                                            );
                                        }
                                        const iso =
                                            day.toISOString().split("T")[0];
                                        const count =
                                            data[iso]?.length ?? 0;
                                        return (
                                            <div
                                                key={row}
                                                title={`${iso}: ${count} workout${count !== 1 ? "s" : ""}`}
                                                className={`rounded-[2px] ${intensity(count)} transition-opacity hover:opacity-80 ${count > 0 ? "cursor-pointer" : "cursor-default"}`}
                                                style={{ width: 12, height: 12 }}
                                                onClick={() =>
                                                    count > 0 &&
                                                    setSelectedDay(iso)
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={!!selectedDay}
                onOpenChange={(open) => !open && setSelectedDay(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedDay}</DialogTitle>
                    </DialogHeader>
                    <ul className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden mt-2">
                        {selectedWorkouts.map((w) => (
                            <li key={w.id}>
                                <Link
                                    href={resolveHref(w.id)}
                                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--secondary)]/40"
                                    onClick={() => setSelectedDay(null)}
                                >
                                    <span className="flex-1 text-sm font-medium truncate">
                                        {w.name ?? "Unnamed workout"}
                                    </span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </DialogContent>
            </Dialog>
        </>
    );
}
