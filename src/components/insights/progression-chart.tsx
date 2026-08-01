"use client";

import { useState, useTransition, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { getProgressionData } from "@/actions/insights";
import { estimateOneRM, kgToLbs } from "@/lib/calculations";
import type { WeightUnit } from "@/lib/calculations";
import type { Exercise, Season } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const NONE_VALUE = "__none__";

type Props = {
    exercises: Exercise[];
    weightUnit?: WeightUnit;
    seasons?: Season[];
};

type ChartPoint = {
    date: string;
    weight: number;
    estimatedOneRM: number | null;
};

export function ProgressionChart({ exercises, weightUnit = "KG", seasons = [] }: Props) {
    const [category, setCategory] = useState<string>("all");
    const [selected, setSelected] = useState<string>(exercises[0]?.id ?? "");
    const [data, setData] = useState<ChartPoint[]>([]);
    const [isPending, startTransition] = useTransition();
    const [loaded, setLoaded] = useState(false);
    const [seasonFilter, setSeasonFilter] = useState<string>("");

    const categories = [
        ...new Set(exercises.map((exercise) => exercise.category)),
    ].sort();
    const filteredExercises =
        category === "all"
            ? exercises
            : exercises.filter((exercise) => exercise.category === category);

    // Re-load on category or season change, keeping the current selection if valid
    useEffect(() => {
        const stillInList = filteredExercises.some((ex) => ex.id === selected);
        const exerciseId = stillInList ? selected : filteredExercises[0]?.id;
        if (exerciseId) load(exerciseId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, seasonFilter]);

    function load(exerciseId: string) {
        setSelected(exerciseId);
        startTransition(async () => {
            try {
                const raw = await getProgressionData(exerciseId, seasonFilter || null);

                // Per date: track max weight AND max e1rm independently
                const byDate: Record<string, ChartPoint> = {};
                const convert = (v: number) => weightUnit === "LBS" ? kgToLbs(v) : v;
                for (const s of raw) {
                    if (!s.weightKg || !s.reps) continue;
                    const e1rm = estimateOneRM(s.weightKg, s.reps);
                    const displayWeight = convert(s.weightKg);
                    const displayE1rm = Math.round(convert(e1rm) * 10) / 10;
                    const existing = byDate[s.date];
                    if (!existing) {
                        byDate[s.date] = {
                            date: s.date,
                            weight: displayWeight,
                            estimatedOneRM: displayE1rm,
                        };
                    } else {
                        if (displayWeight > existing.weight)
                            existing.weight = displayWeight;
                        if (displayE1rm > (existing.estimatedOneRM ?? 0))
                            existing.estimatedOneRM = displayE1rm;
                    }
                }

                setData(
                    Object.values(byDate).sort((a, b) =>
                        a.date.localeCompare(b.date),
                    ),
                );
            } catch {
                setData([]);
            }
            setLoaded(true);
        });
    }

    if (exercises.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)] text-sm">
                Log some workouts to see progression charts
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selected} onValueChange={load}>
                    <SelectTrigger className="w-full sm:max-w-xs">
                        <SelectValue placeholder="Select an exercise" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredExercises.map((ex) => (
                            <SelectItem key={ex.id} value={ex.id}>
                                {ex.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {seasons.length > 0 && (
                    <Select value={seasonFilter || NONE_VALUE} onValueChange={(v) => { setSeasonFilter(v === NONE_VALUE ? "" : v); setLoaded(false); }}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="All seasons" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE_VALUE}>All seasons</SelectItem>
                            {seasons.map((season) => (
                                <SelectItem key={season.id} value={season.id}>
                                    {season.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {filteredExercises.length === 0 && (
                <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)] text-sm">
                    No logged exercises in this category yet
                </div>
            )}

            {filteredExercises.length > 0 && (
                <>
                    {!loaded && (
                        <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)] text-sm">
                            Select an exercise above to view progression
                        </div>
                    )}

                    {loaded && !isPending && data.length === 0 && (
                        <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)] text-sm">
                            No data yet for this exercise
                        </div>
                    )}

                    {(loaded || isPending) && data.length > 0 && (
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart
                                data={data}
                                margin={{
                                    top: 4,
                                    right: 8,
                                    left: 0,
                                    bottom: 4,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.05)"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{
                                        fill: "var(--muted-foreground)",
                                        fontSize: 11,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{
                                        fill: "var(--muted-foreground)",
                                        fontSize: 11,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit={weightUnit === "LBS" ? " lbs" : " kg"}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        color: "var(--foreground)",
                                        fontSize: "12px",
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any, name: any) => [
                                        `${Number(value ?? 0)} ${weightUnit === "LBS" ? "lbs" : "kg"}`,
                                        name === "weight"
                                            ? "Top weight"
                                            : "Est. 1RM",
                                    ]}
                                />
                                <Legend
                                    formatter={(value) =>
                                        value === "weight"
                                            ? "Top weight"
                                            : "Est. 1RM"
                                    }
                                    wrapperStyle={{
                                        fontSize: "12px",
                                        color: "var(--muted-foreground)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="var(--foreground)"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: "var(--foreground)" }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="estimatedOneRM"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 2, fill: "#3b82f6" }}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </>
            )}
        </div>
    );
}
