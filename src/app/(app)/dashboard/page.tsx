import { getDashboardStats } from "@/actions/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations";
import { FORM_RATINGS } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dumbbell,
    TrendingUp,
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
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
                    <Button>
                        <Plus className="h-4 w-4" />
                        Log Workout
                    </Button>
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Dumbbell}
                    label="Total Workouts"
                    value={stats.totalWorkouts}
                    iconColor="text-[var(--primary)]"
                    iconBg="bg-[var(--primary)]/10"
                />
                <StatCard
                    icon={Flame}
                    label="This Week"
                    value={stats.workoutsThisWeek}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-400/10"
                />
                <StatCard
                    icon={CalendarDays}
                    label="This Month"
                    value={stats.workoutsThisMonth}
                    iconColor="text-blue-400"
                    iconBg="bg-blue-400/10"
                />
                <StatCard
                    icon={Trophy}
                    label="Personal Records"
                    value={stats.personalRecords.length}
                    iconColor="text-yellow-400"
                    iconBg="bg-yellow-400/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Workouts */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Recent Workouts
                        </h2>
                        <Link
                            href="/workouts"
                            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
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
                        <div className="space-y-3">
                            {stats.recentWorkouts.map((workout) => {
                                const volume = calculateVolume(workout.sets);
                                const exercises = [
                                    ...new Set(
                                        workout.sets.map(
                                            (s) => s.exercise.name,
                                        ),
                                    ),
                                ].slice(0, 3);
                                return (
                                    <Link
                                        key={workout.id}
                                        href={`/workouts/${workout.id}`}
                                    >
                                        <Card className="hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-medium">
                                                                {workout.name ??
                                                                    "Workout"}
                                                            </span>
                                                            <span className="text-xs text-[var(--muted-foreground)]">
                                                                {formatRelativeDate(
                                                                    workout.date,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {exercises.map(
                                                                (ex) => (
                                                                    <Badge
                                                                        key={ex}
                                                                        variant="secondary"
                                                                        className="text-xs"
                                                                    >
                                                                        {ex}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                            {workout.sets
                                                                .length > 3 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    +
                                                                    {
                                                                        workout.sets.filter(
                                                                            (
                                                                                s,
                                                                                i,
                                                                                arr,
                                                                            ) =>
                                                                                arr.findIndex(
                                                                                    (
                                                                                        x,
                                                                                    ) =>
                                                                                        x.exerciseId ===
                                                                                        s.exerciseId,
                                                                                ) !==
                                                                                i,
                                                                        ).length
                                                                    }{" "}
                                                                    more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-semibold">
                                                            {Math.round(
                                                                volume,
                                                            ).toLocaleString()}{" "}
                                                            kg
                                                        </p>
                                                        <p className="text-xs text-[var(--muted-foreground)]">
                                                            volume
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar: PRs + Body */}
                <div className="space-y-4">
                    {/* Personal Records */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Top Records
                            </h2>
                            <Link
                                href="/records"
                                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
                            >
                                View all <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {stats.personalRecords.length === 0 ? (
                            <Card>
                                <CardContent className="p-4 text-center text-sm text-[var(--muted-foreground)]">
                                    Log workouts to earn PRs
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    {stats.personalRecords
                                        .slice(0, 5)
                                        .map((pr, i) => (
                                            <div
                                                key={pr.id}
                                                className={`flex items-center justify-between px-4 py-3 ${
                                                    i !== 0
                                                        ? "border-t border-[var(--border)]"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Trophy className="h-4 w-4 shrink-0 text-yellow-400" />
                                                    <span className="text-sm font-medium truncate">
                                                        {pr.exercise.name}
                                                    </span>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <p className="text-sm font-semibold text-[var(--primary)]">
                                                        {pr.weightKg}kg ×{" "}
                                                        {pr.reps}
                                                    </p>
                                                    <p className="text-xs text-[var(--muted-foreground)]">
                                                        ~{pr.estimatedOneRM}kg
                                                        1RM
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Latest body metric */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Body Stats
                            </h2>
                            <Link
                                href="/body"
                                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
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

function StatCard({
    icon: Icon,
    label,
    value,
    iconColor,
    iconBg,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    iconColor: string;
    iconBg: string;
}) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                        {label}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function MetricItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
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
        <Card>
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-[var(--secondary)]">
                    <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
                <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                        {desc}
                    </p>
                </div>
                <Link href={href}>
                    <Button size="sm" variant="outline">
                        {cta}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
