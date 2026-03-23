import { getDashboardStats } from "@/actions/insights";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dumbbell,
    Trophy,
    CalendarDays,
    Scale,
    Plus,
    ChevronRight,
    Flame,
} from "lucide-react";

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-6">
            {/* Desktop header */}
            <div className="hidden md:flex items-center justify-between animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <Link href="/workouts/new">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_12px_var(--primary-glow)] gap-2">
                        <Plus className="h-4 w-4" />
                        Log Workout
                    </Button>
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard
                    icon={Dumbbell}
                    label="Total"
                    value={stats.totalWorkouts}
                    accent="lime"
                    index={0}
                />
                <StatCard
                    icon={Flame}
                    label="This Week"
                    value={stats.workoutsThisWeek}
                    accent="cyan"
                    index={1}
                />
                <StatCard
                    icon={CalendarDays}
                    label="This Month"
                    value={stats.workoutsThisMonth}
                    accent="violet"
                    index={2}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Workouts */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">Recent Workouts</h2>
                        <Link
                            href="/workouts"
                            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
                        >
                            View all <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {stats.recentWorkouts.length === 0 ? (
                        <EmptyCard
                            icon={Dumbbell}
                            title="No workouts yet"
                            desc="Start logging to see your history here."
                            href="/workouts/new"
                            cta="Log your first workout"
                        />
                    ) : (
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                            {stats.recentWorkouts.map((workout) => {
                                const volume = calculateVolume(workout.sets);
                                const exercises = [
                                    ...new Set(
                                        workout.sets.map((s) => s.exercise.name),
                                    ),
                                ].slice(0, 2);
                                const extraExercises =
                                    [
                                        ...new Set(
                                            workout.sets.map((s) => s.exerciseId),
                                        ),
                                    ].length - exercises.length;
                                return (
                                    <Link
                                        key={workout.id}
                                        href={`/workouts/${workout.id}`}
                                        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--primary)]/5"
                                    >
                                        <div className="p-2 rounded-xl bg-[var(--secondary)] group-hover:bg-[var(--primary)]/15 transition-colors shrink-0">
                                            <Dumbbell className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-sm font-semibold truncate">
                                                    {workout.name ?? "Workout"}
                                                </span>
                                                {exercises.length > 0 && (
                                                    <span className="hidden sm:block text-xs text-[var(--muted-foreground)] truncate">
                                                        Â· {exercises.join(", ")}{extraExercises > 0 ? ` +${extraExercises}` : ""}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                                {formatRelativeDate(workout.date)}
                                                <span className="sm:hidden">
                                                    {exercises.length > 0 && ` Â· ${exercises.slice(0,1).join(", ")}${extraExercises + (exercises.length > 1 ? exercises.length - 1 : 0) > 0 ? ` +${extraExercises + (exercises.length > 1 ? exercises.length - 1 : 0)}` : ""}`}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-bold tabular-nums text-[var(--primary)]">
                                                {Math.round(volume).toLocaleString()}
                                                <span className="text-xs font-normal text-[var(--muted-foreground)]"> lbs</span>
                                            </p>
                                            <p className="text-xs text-[var(--muted-foreground)]">
                                                {workout.sets.length} sets
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar: Top Records + Body */}
                <div className="space-y-5">
                    {/* Top Records */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">Top Records</h2>
                            <Trophy className="h-4 w-4 text-[var(--primary)]" />
                        </div>

                        {stats.personalRecords.length === 0 ? (
                            <EmptyCard
                                icon={Trophy}
                                title="No records yet"
                                desc="Complete workouts to set personal records."
                                href="/workouts/new"
                                cta="Log a workout"
                            />
                        ) : (
                            <Card className="overflow-hidden">
                                <CardContent className="p-0 divide-y divide-[var(--border)]">
                                    {stats.personalRecords.map((pr) => (
                                        <div
                                            key={pr.id}
                                            className="flex items-center justify-between gap-3 px-4 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {pr.exercise.name}
                                                </p>
                                                <p className="text-xs text-[var(--muted-foreground)]">
                                                    {pr.weightKg} lbs &times; {pr.reps} reps
                                                </p>
                                            </div>
                                            <Badge className="bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30 font-bold text-xs shrink-0">
                                                {pr.estimatedOneRM.toFixed(0)} lbs
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Latest body metric */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">Body Stats</h2>
                            <Link
                                href="/body"
                                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
                            >
                                Log <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {!stats.latestMetric ? (
                            <EmptyCard
                                icon={Scale}
                                title="No metrics yet"
                                desc="Start tracking body composition."
                                href="/body"
                                cta="Log metrics"
                            />
                        ) : (
                            <Card>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-xs text-[var(--muted-foreground)]">
                                        {formatDate(stats.latestMetric.date)}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {stats.latestMetric.weightKg && (
                                            <MetricItem
                                                label="Weight"
                                                value={`${stats.latestMetric.weightKg} kg`}
                                            />
                                        )}
                                        {stats.latestMetric.bodyFatPct && (
                                            <MetricItem
                                                label="Body Fat"
                                                value={`${stats.latestMetric.bodyFatPct}%`}
                                            />
                                        )}
                                        {stats.latestMetric.waistCm && (
                                            <MetricItem
                                                label="Waist"
                                                value={`${stats.latestMetric.waistCm} cm`}
                                            />
                                        )}
                                        {stats.latestMetric.chestCm && (
                                            <MetricItem
                                                label="Chest"
                                                value={`${stats.latestMetric.chestCm} cm`}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

type AccentColor = "lime" | "cyan" | "violet";

const accentMap: Record<AccentColor, { bg: string; text: string; iconBg: string; iconText: string }> = {
    lime: {
        bg: "bg-[var(--primary)]/8 border-[var(--primary)]/20",
        text: "text-[var(--primary)]",
        iconBg: "bg-[var(--primary)]/15",
        iconText: "text-[var(--primary)]",
    },
    cyan: {
        bg: "bg-cyan-400/8 border-cyan-400/20",
        text: "text-cyan-400",
        iconBg: "bg-cyan-400/15",
        iconText: "text-cyan-400",
    },
    violet: {
        bg: "bg-violet-400/8 border-violet-400/20",
        text: "text-violet-400",
        iconBg: "bg-violet-400/15",
        iconText: "text-violet-400",
    },
};

function StatCard({
    icon: Icon,
    label,
    value,
    accent = "lime",
    index = 0,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    accent?: AccentColor;
    index?: number;
}) {
    const colors = accentMap[accent];
    return (
        <Card
            className={`animate-fade-in-up border ${colors.bg}`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <CardContent className="p-3 md:p-4 flex flex-col items-center text-center gap-1.5">
                <div className={`p-2 rounded-xl ${colors.iconBg}`}>
                    <Icon className={`h-4 w-4 md:h-5 md:w-5 ${colors.iconText}`} />
                </div>
                <p className={`text-xl md:text-2xl font-bold ${colors.text}`}>{value}</p>
                <p className="text-[9px] md:text-[10px] text-[var(--muted-foreground)] leading-tight font-medium uppercase tracking-wide">
                    {label}
                </p>
            </CardContent>
        </Card>
    );
}

function MetricItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    );
}

function EmptyCard({
    icon: Icon,
    title,
    desc,
    href,
    cta,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    href: string;
    cta: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-full bg-[var(--secondary)]">
                <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>
            <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {desc}
                </p>
            </div>
            <Link href={href}>
                <Button size="sm" variant="outline" className="border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50">
                    {cta}
                </Button>
            </Link>
        </div>
    );
}
