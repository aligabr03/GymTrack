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
    "#f97316",
    "#60a5fa",
    "#34d399",
    "#a78bfa",
    "#fbbf24",
    "#f472b6",
    "#38bdf8",
    "#4ade80",
    "#fb923c",
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
