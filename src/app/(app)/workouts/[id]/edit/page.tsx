import { getWorkout, getWorkoutMetaSuggestions } from "@/actions/workouts";
import { getExercises } from "@/actions/exercises";
import { WorkoutLogger } from "@/components/workouts/workout-logger";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default async function EditWorkoutPage({
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
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[var(--secondary)]">
                    <ClipboardList className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Edit Workout</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Update your workout log
                    </p>
                </div>
            </div>

            <WorkoutLogger
                exercises={exercises}
                existing={workout}
                suggestions={suggestions}
            />
        </div>
    );
}
