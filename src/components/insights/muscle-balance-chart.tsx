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
    "#fbbf24",
    "#f59e0b",
    "#d97706",
    "#b45309",
    "#fcd34d",
    "#eab308",
    "#ca8a04",
    "#92400e",
    "#fde68a",
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
                margin={{ top: 4, right: 8, left: 12, bottom: 4 }}
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
                    tickFormatter={(v) => `${v}`}
                />
                <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                />
                <Tooltip
                    contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                        fontSize: "12px",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [
                        `${Number(value ?? 0)} sets`,
                        "Sets",
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
