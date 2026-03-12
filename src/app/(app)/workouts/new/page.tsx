import { getExercises } from "@/actions/exercises";
import { getWorkoutMetaSuggestions } from "@/actions/workouts";
import { WorkoutLogger } from "@/components/workouts/workout-logger";
import { ClipboardList } from "lucide-react";

export default async function NewWorkoutPage() {
    const [exercises, suggestions] = await Promise.all([
        getExercises(),
        getWorkoutMetaSuggestions(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[var(--secondary)]">
                    <ClipboardList className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Log Workout</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Record your exercises, sets, and reps
                    </p>
                </div>
            </div>

            <WorkoutLogger exercises={exercises} suggestions={suggestions} />
        </div>
    );
}
