import { getVolumeByWeek, getMuscleGroupVolume, getWorkoutCalendar } from "@/actions/insights";
import { getExercises } from "@/actions/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VolumeChart } from "@/components/insights/volume-chart";
import { ProgressionChart } from "@/components/insights/progression-chart";
import { MuscleBalanceChart } from "@/components/insights/muscle-balance-chart";
import { WorkoutCalendar } from "@/components/insights/workout-calendar";

export const metadata = { title: "Insights — GymTrack" };

export default async function InsightsPage() {
  const year = new Date().getFullYear();

  const [weeklyVolume, muscleData, calendarCounts, exercises] = await Promise.allSettled([
    getVolumeByWeek(12),
    getMuscleGroupVolume(30),
    getWorkoutCalendar(year),
    getExercises(),
  ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : null)));

  const volumeData = (weeklyVolume as Awaited<ReturnType<typeof getVolumeByWeek>> | null) ?? [];
  const muscleGroupData =
    (muscleData as Awaited<ReturnType<typeof getMuscleGroupVolume>> | null) ?? [];
  const calendarData =
    (calendarCounts as Awaited<ReturnType<typeof getWorkoutCalendar>> | null) ?? {};
  const exerciseList =
    (exercises as Awaited<ReturnType<typeof getExercises>> | null) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          Analyze your training trends and progression.
        </p>
      </div>

      {/* Workout calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{year} Workout Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutCalendar year={year} data={calendarData} />
        </CardContent>
      </Card>

      {/* Volume + Muscle balance side-by-side on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Volume (last 12 weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeChart data={volumeData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Muscle Group Balance (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleBalanceChart data={muscleGroupData} />
          </CardContent>
        </Card>
      </div>

      {/* Progression over time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exercise Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressionChart exercises={exerciseList} />
        </CardContent>
      </Card>
    </div>
  );
}
