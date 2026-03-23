import {
    getMuscleGroupVolume,
    getWorkoutCalendar,
    getLoggedExercises,
} from "@/actions/insights";
import { getBodyMetrics } from "@/actions/body-metrics";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressionChart } from "@/components/insights/progression-chart";
import { MuscleBalanceChart } from "@/components/insights/muscle-balance-chart";
import { WorkoutCalendar } from "@/components/insights/workout-calendar";
import { AiInsightSection } from "@/components/insights/ai-insight-section";
import { BodyTrendsChart } from "@/components/insights/body-trends-chart";
import { BarChart2, Calendar, Activity, TrendingUp, Dumbbell } from "lucide-react";

export const metadata = { title: "Insights — GymTrack" };
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
    const year = new Date().getFullYear();

    const [muscleData, calendarCounts, exercises, bodyMetrics] =
        await Promise.allSettled([
            getMuscleGroupVolume(30),
            getWorkoutCalendar(year),
            getLoggedExercises(),
            getBodyMetrics(180),
        ]).then((results) =>
            results.map((r) => (r.status === "fulfilled" ? r.value : null)),
        );

    const muscleGroupData =
        (muscleData as Awaited<
            ReturnType<typeof getMuscleGroupVolume>
        > | null) ?? [];
    const calendarData =
        (calendarCounts as Awaited<
            ReturnType<typeof getWorkoutCalendar>
        > | null) ?? {};
    const exerciseList =
        (exercises as Awaited<ReturnType<typeof getLoggedExercises>> | null) ??
        [];
    const bodyData =
        (bodyMetrics as Awaited<ReturnType<typeof getBodyMetrics>> | null) ??
        [];

    return (
        <div className="space-y-6">
            <div className="hidden md:block animate-fade-in">
                <h1 className="text-2xl font-bold">Insights</h1>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                    Analyze your training trends and progression.
                </p>
            </div>

            {/* AI Analysis — streams in independently */}
            <Suspense fallback={<AiInsightCardSkeleton />}>
                <AiInsightSection />
            </Suspense>

            {/* Workout calendar */}
            <Card className="border-[var(--border)] rounded-2xl overflow-hidden">
                <CardHeader className="bg-[var(--secondary)]/30 border-b border-[var(--border)]">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[var(--primary)]" />
                        {year} Workout Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <WorkoutCalendar year={year} data={calendarData} />
                </CardContent>
            </Card>

            {/* Muscle balance */}
            <Card className="border-[var(--border)] rounded-2xl overflow-hidden">
                <CardHeader className="bg-[var(--secondary)]/30 border-b border-[var(--border)]">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-[var(--primary)]" />
                        Muscle Group Balance (last 30 days)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <MuscleBalanceChart data={muscleGroupData} />
                </CardContent>
            </Card>

            {/* Body trends */}
            <Card className="border-[var(--border)] rounded-2xl overflow-hidden">
                <CardHeader className="bg-[var(--secondary)]/30 border-b border-[var(--border)]">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[var(--primary)]" />
                        Body Trends
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <BodyTrendsChart metrics={bodyData} />
                </CardContent>
            </Card>

            {/* Progression over time */}
            <Card className="border-[var(--border)] rounded-2xl overflow-hidden">
                <CardHeader className="bg-[var(--secondary)]/30 border-b border-[var(--border)]">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
                        Exercise Progression
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ProgressionChart exercises={exerciseList} />
                </CardContent>
            </Card>
        </div>
    );
}

function AiInsightCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                        <Skeleton className="h-3 w-3 shrink-0 mt-0.5 rounded-full" />
                        <Skeleton
                            className="h-4"
                            style={{ width: `${72 - i * 8}%` }}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
