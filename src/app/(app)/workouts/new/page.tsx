import { getExercises } from "@/actions/exercises";
import { getWorkoutMetaSuggestions } from "@/actions/workouts";
import { getMyWeightUnit } from "@/actions/social";
import { getSeasons } from "@/actions/seasons";
import { WorkoutLogger } from "@/components/workouts/workout-logger";
import { ClipboardList } from "lucide-react";

export default async function NewWorkoutPage() {
    const [exercises, suggestions, weightUnit, seasons] = await Promise.all([
        getExercises(),
        getWorkoutMetaSuggestions(),
        getMyWeightUnit(),
        getSeasons(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl glass glow-subtle">
                    <ClipboardList className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Log Workout</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Record your exercises, sets, and reps
                    </p>
                </div>
            </div>

            <WorkoutLogger exercises={exercises} suggestions={suggestions} weightUnit={weightUnit} seasons={seasons} />
        </div>
    );
}
