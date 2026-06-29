import {
    getMuscleGroupVolume,
    getWorkoutCalendar,
    getLoggedExercises,
} from "@/actions/insights";
import { getBodyMetrics } from "@/actions/body-metrics";
import { getMyWeightUnit, getMyBodyWeightUnit } from "@/actions/social";
import { getSeasons } from "@/actions/seasons";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressionChart } from "@/components/insights/progression-chart";
import { MuscleBalanceChart } from "@/components/insights/muscle-balance-chart";
import { WorkoutCalendar } from "@/components/insights/workout-calendar";
import { AiInsightSection } from "@/components/insights/ai-insight-section";
import { BodyTrendsChart } from "@/components/insights/body-trends-chart";
import { TrendingUp } from "lucide-react";

export const metadata = { title: "Insights — GymTrack" };
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
    const year = new Date().getFullYear();

    const [muscleData, calendarCounts, exercises, bodyMetrics, weightUnitResult, bodyWeightUnitResult, seasonsResult] =
        await Promise.allSettled([
            getMuscleGroupVolume(30),
            getWorkoutCalendar(year),
            getLoggedExercises(),
            getBodyMetrics(180),
            getMyWeightUnit(),
            getMyBodyWeightUnit(),
            getSeasons(),
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
    const weightUnit = (weightUnitResult as "KG" | "LBS" | null) ?? "KG";
    const bodyWeightUnit = (bodyWeightUnitResult as "KG" | "LBS" | null) ?? "KG";
    const seasonList =
        (seasonsResult as Awaited<ReturnType<typeof getSeasons>> | null) ?? [];

    return (
        <div className="space-y-6">
            <div className="hidden md:flex items-center gap-3 animate-fade-in">
                <div className="p-2.5 rounded-lg bg-[var(--secondary)]">
                    <TrendingUp className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Insights</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Analyze your training trends and progression.
                    </p>
                </div>
            </div>

            {/* AI Analysis — streams in independently */}
            <Suspense fallback={<AiInsightCardSkeleton />}>
                <AiInsightSection />
            </Suspense>

            {/* Workout calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        {year} Workout Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <WorkoutCalendar year={year} data={calendarData} />
                </CardContent>
            </Card>

            {/* Muscle balance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Muscle Group Balance (last 30 days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MuscleBalanceChart data={muscleGroupData} />
                </CardContent>
            </Card>

            {/* Body trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Body Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <BodyTrendsChart metrics={bodyData} weightUnit={bodyWeightUnit} />
                </CardContent>
            </Card>

            {/* Progression over time */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Exercise Progression
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressionChart exercises={exerciseList} weightUnit={weightUnit} seasons={seasonList} />
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
