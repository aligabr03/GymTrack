import { getWorkout, getWorkoutMetaSuggestions } from "@/actions/workouts";
import { getExercises } from "@/actions/exercises";
import { getMyWeightUnit } from "@/actions/social";
import { notFound } from "next/navigation";
import { WorkoutDetailClient } from "./workout-detail-client";

export default async function WorkoutDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [workout, exercises, suggestions, weightUnit] = await Promise.all([
        getWorkout(id),
        getExercises(),
        getWorkoutMetaSuggestions(),
        getMyWeightUnit(),
    ]);
    if (!workout) notFound();

    return (
        <WorkoutDetailClient
            workout={workout}
            exercises={exercises}
            suggestions={suggestions}
            weightUnit={weightUnit}
        />
    );
}
