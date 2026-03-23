import { getExercises } from "@/actions/exercises";
import { getExerciseBestWeights } from "@/actions/exercises";
import { ExerciseLibrary } from "@/components/exercises/exercise-library";
import { Library } from "lucide-react";

export default async function ExercisesPage() {
    const [exercises, bestWeights] = await Promise.all([
        getExercises(),
        getExerciseBestWeights(),
    ]);

    return (
        <div className="space-y-6">
            <div className="hidden md:flex items-center gap-3 animate-fade-in">
                <div className="p-2.5 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    <Library className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Exercise Library</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {exercises.length} exercises — add your own with the
                        button below
                    </p>
                </div>
            </div>

            <ExerciseLibrary exercises={exercises} bestWeights={bestWeights} />
        </div>
    );
}
