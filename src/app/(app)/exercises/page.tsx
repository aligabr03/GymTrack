import { getExercises } from "@/actions/exercises";
import { ExerciseLibrary } from "@/components/exercises/exercise-library";
import { Library } from "lucide-react";

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-[var(--primary)]/10">
          <Library className="h-6 w-6 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {exercises.length} exercises available
          </p>
        </div>
      </div>

      <ExerciseLibrary exercises={exercises} />
    </div>
  );
}
