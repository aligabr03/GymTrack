"use client";

import { useMemo, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { BodyMetric } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type MetricKey =
    | "weightKg"
    | "bodyFatPct"
    | "waistCm"
    | "hipCm"
    | "chestCm"
    | "armCm";

type MetricOption = {
    key: MetricKey;
    label: string;
    unit: string;
};

const METRIC_OPTIONS: MetricOption[] = [
    { key: "weightKg", label: "Weight", unit: "kg" },
    { key: "bodyFatPct", label: "Body Fat", unit: "%" },
    { key: "waistCm", label: "Waist", unit: "cm" },
    { key: "hipCm", label: "Hip", unit: "cm" },
    { key: "chestCm", label: "Chest", unit: "cm" },
    { key: "armCm", label: "Arm", unit: "cm" },
];

type ChartPoint = {
    date: string;
    value: number | null;
};

export function BodyTrendsChart({ metrics }: { metrics: BodyMetric[] }) {
    const [selectedMetric, setSelectedMetric] =
        useState<MetricKey>("weightKg");

    const selected =
        METRIC_OPTIONS.find((option) => option.key === selectedMetric) ??
        METRIC_OPTIONS[0];

    const data = useMemo<ChartPoint[]>(() => {
        return [...metrics]
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .map((m) => ({
                date: new Date(m.date).toISOString().split("T")[0],
                value: m[selectedMetric],
            }));
    }, [metrics, selectedMetric]);

    const hasAnyData = data.some((point) => point.value != null);

    if (!metrics.length) {
        return (
            <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)] text-sm">
                Log body metrics to see trends
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-[var(--muted-foreground)]">
                    Track changes over time by metric.
                </p>
                <Select
                    value={selectedMetric}
                    onValueChange={(value) => setSelectedMetric(value as MetricKey)}
                >
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                        {METRIC_OPTIONS.map((option) => (
                            <SelectItem key={option.key} value={option.key}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!hasAnyData ? (
                <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)] text-sm">
                    No {selected.label.toLowerCase()} entries yet
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
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
                            formatter={(value: any) =>
                                value == null
                                    ? ["-", selected.label]
                                    : [`${Number(value).toFixed(1)} ${selected.unit}`, selected.label]
                            }
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="var(--foreground)"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "var(--foreground)" }}
                            activeDot={{ r: 5 }}
                            connectNulls={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
