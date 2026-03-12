"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from "recharts";

type Props = {
    data: { category: string; volume: number }[];
};

const COLORS = [
    "#fafafa",
    "#a1a1aa",
    "#71717a",
    "#52525b",
    "#3f3f46",
    "#27272a",
    "#d4d4d8",
    "#e4e4e7",
    "#18181b",
];

export function MuscleBalanceChart({ data }: Props) {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)] text-sm">
                No data in the last 30 days
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 60, bottom: 4 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    horizontal={false}
                />
                <XAxis
                    type="number"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
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
                    formatter={(value: any) => [
                        `${Number(value ?? 0).toLocaleString()} lbs`,
                        "Volume",
                    ]}
                />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
