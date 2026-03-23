import { getWorkoutForUser } from "@/actions/workouts";
import { getExercises } from "@/actions/exercises";
import { notFound } from "next/navigation";
import { WorkoutDetailClient } from "@/app/(app)/workouts/[id]/workout-detail-client";

export default async function PublicWorkoutDetailPage({
    params,
}: {
    params: Promise<{ userId: string; workoutId: string }>;
}) {
    const { userId, workoutId } = await params;

    const [workout, exercises] = await Promise.all([
        getWorkoutForUser(workoutId, userId),
        getExercises(),
    ]);

    if (!workout) notFound();

    return (
        <WorkoutDetailClient
            workout={workout}
            exercises={exercises}
            suggestions={{ names: [], durations: [] }}
            readOnly
            backHref={`/profile/${userId}`}
        />
    );
}
