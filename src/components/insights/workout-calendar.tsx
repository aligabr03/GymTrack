"use client";

type Props = {
    year: number;
    /** Map of ISO date string (YYYY-MM-DD) → workout count */
    data: Record<string, number>;
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
    if (count === 1) return "bg-zinc-700";
    if (count === 2) return "bg-zinc-500";
    return "bg-[var(--foreground)]";
}

export function WorkoutCalendar({ year, data }: Props) {
    const map = data; // already a Record<string, number>

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

    return (
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
                            <div key={col} className="flex flex-col gap-[3px]">
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
                                    const iso = day.toISOString().split("T")[0];
                                    const count = map[iso] ?? 0;
                                    return (
                                        <div
                                            key={row}
                                            title={`${iso}: ${count} workout${count !== 1 ? "s" : ""}`}
                                            className={`rounded-[2px] ${intensity(count)} transition-opacity hover:opacity-80 cursor-default`}
                                            style={{ width: 12, height: 12 }}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 ml-8 text-[10px] text-[var(--muted-foreground)]">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-[2px] bg-[var(--secondary)]" />
                    <div className="w-3 h-3 rounded-[2px] bg-zinc-700" />
                    <div className="w-3 h-3 rounded-[2px] bg-zinc-500" />
                    <div className="w-3 h-3 rounded-[2px] bg-[var(--foreground)]" />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
