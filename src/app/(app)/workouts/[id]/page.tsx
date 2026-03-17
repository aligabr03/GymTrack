import { getWorkout, getWorkoutMetaSuggestions } from "@/actions/workouts";
import { getExercises } from "@/actions/exercises";
import { notFound } from "next/navigation";
import { WorkoutDetailClient } from "./workout-detail-client";

export default async function WorkoutDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [workout, exercises, suggestions] = await Promise.all([
        getWorkout(id),
        getExercises(),
        getWorkoutMetaSuggestions(),
    ]);
    if (!workout) notFound();

    return (
        <WorkoutDetailClient
            workout={workout}
            exercises={exercises}
            suggestions={suggestions}
        />
    );
}
