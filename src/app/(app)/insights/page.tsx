import {
    getMuscleGroupVolume,
    getWorkoutCalendar,
    getLoggedExercises,
    getAiInsight,
} from "@/actions/insights";
import { getBodyMetrics } from "@/actions/body-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressionChart } from "@/components/insights/progression-chart";
import { MuscleBalanceChart } from "@/components/insights/muscle-balance-chart";
import { WorkoutCalendar } from "@/components/insights/workout-calendar";
import { AiAnalysisCard } from "@/components/insights/ai-analysis";
import { BodyTrendsChart } from "@/components/insights/body-trends-chart";

export const metadata = { title: "Insights — GymTrack" };
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
    const year = new Date().getFullYear();

    const [muscleData, calendarCounts, exercises, aiInsight, bodyMetrics] =
        await Promise.allSettled([
            getMuscleGroupVolume(30),
            getWorkoutCalendar(year),
            getLoggedExercises(),
            getAiInsight(),
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
    const aiData =
        (aiInsight as Awaited<ReturnType<typeof getAiInsight>> | null) ?? null;
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

            {/* AI Analysis */}
            {aiData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <span>AI Training Analysis</span>
                            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--muted-foreground)] tracking-wide uppercase">
                                GPT-4o mini
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AiAnalysisCard initial={aiData} />
                    </CardContent>
                </Card>
            )}

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
                    <BodyTrendsChart metrics={bodyData} />
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
                    <ProgressionChart exercises={exerciseList} />
                </CardContent>
            </Card>
        </div>
    );
}
