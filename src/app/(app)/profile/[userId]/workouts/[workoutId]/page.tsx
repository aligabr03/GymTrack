import { getWorkoutForUser } from "@/actions/workouts";
import { getProfile } from "@/actions/social";
import { getExercises } from "@/actions/exercises";
import { notFound } from "next/navigation";
import { WorkoutDetailClient } from "@/app/(app)/workouts/[id]/workout-detail-client";
import { SetPageTitle } from "@/components/layout/page-title-context";

export default async function PublicWorkoutDetailPage({
    params,
}: {
    params: Promise<{ userId: string; workoutId: string }>;
}) {
    const { userId, workoutId } = await params;

    const [workout, exercises, profile] = await Promise.all([
        getWorkoutForUser(workoutId, userId),
        getExercises(),
        getProfile(userId),
    ]);

    if (!workout) notFound();

    return (
        <>
            {profile && <SetPageTitle title={profile.displayName} />}
            <WorkoutDetailClient
                workout={workout}
                exercises={exercises}
                suggestions={{ names: [], durations: [] }}
                readOnly
                backHref={`/profile/${userId}`}
            />
        </>
    );
}
