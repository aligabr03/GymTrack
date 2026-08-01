import { getExercises } from "@/actions/exercises";
import { getExerciseBestWeights } from "@/actions/exercises";
import { getMyWeightUnit } from "@/actions/social";
import { ExerciseLibrary } from "@/components/exercises/exercise-library";
import { Library } from "lucide-react";

export default async function ExercisesPage() {
    const [exercises, bestWeights, weightUnit] = await Promise.all([
        getExercises(),
        getExerciseBestWeights(),
        getMyWeightUnit(),
    ]);

    return (
        <div className="space-y-6">
            <div className="hidden md:flex items-center gap-3 animate-fade-in">
                <div className="p-2.5 rounded-xl glass glow-subtle">
                    <Library className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {exercises.length} exercises — add your own with the
                        button below
                    </p>
                </div>
            </div>

            <ExerciseLibrary exercises={exercises} bestWeights={bestWeights} weightUnit={weightUnit} />
        </div>
    );
}
