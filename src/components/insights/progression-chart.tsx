"use client";

import { useState, useTransition } from "react";
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
import { Button } from "@/components/ui/button";

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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {exercises.slice(0, 20).map((ex) => (
                    <Button
                        key={ex.id}
                        size="sm"
                        variant={selected === ex.id ? "default" : "outline"}
                        onClick={() => load(ex.id)}
                    >
                        {ex.name}
                    </Button>
                ))}
            </div>

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
                            unit=" kg"
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
                                `${Number(value ?? 0)} kg`,
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
                            stroke="var(--primary)"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "var(--primary)" }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="estimatedOneRM"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 2, fill: "#60a5fa" }}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
