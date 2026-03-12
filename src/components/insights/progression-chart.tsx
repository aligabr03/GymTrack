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
import { estimateOneRM } from "@/lib/calculations";
import type { Exercise } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    exercises: Exercise[];
};

type ChartPoint = {
    date: string;
    weight: number;
    estimatedOneRM: number | null;
};

export function ProgressionChart({ exercises }: Props) {
    const [selected, setSelected] = useState<string>(exercises[0]?.id ?? "");
    const [data, setData] = useState<ChartPoint[]>([]);
    const [isPending, startTransition] = useTransition();
    const [loaded, setLoaded] = useState(false);

    // Auto-load the first exercise on mount
    useEffect(() => {
        if (exercises[0]?.id) load(exercises[0].id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function load(exerciseId: string) {
        setSelected(exerciseId);
        startTransition(async () => {
            try {
                const raw = await getProgressionData(exerciseId);

                // Group by date; keep the set with the highest estimated 1RM per session
                const byDate: Record<string, ChartPoint> = {};
                for (const s of raw) {
                    if (!s.weightKg || !s.reps) continue;
                    const e1rm = estimateOneRM(s.weightKg, s.reps);
                    const existing = byDate[s.date];
                    if (!existing || e1rm > (existing.estimatedOneRM ?? 0)) {
                        byDate[s.date] = {
                            date: s.date,
                            weight: s.weightKg,
                            estimatedOneRM: Math.round(e1rm * 10) / 10,
                        };
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
            <Select value={selected} onValueChange={load}>
                <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                    {exercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                            {ex.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

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
                        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
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
                            unit=" lbs"
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
                                `${Number(value ?? 0)} lbs`,
                                name === "weight" ? "Top weight" : "Est. 1RM",
                            ]}
                        />
                        <Legend
                            formatter={(value) =>
                                value === "weight" ? "Top weight" : "Est. 1RM"
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
                            stroke="#71717a"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 2, fill: "#71717a" }}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
