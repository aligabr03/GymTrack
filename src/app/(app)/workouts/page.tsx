import { getWorkouts } from "@/actions/workouts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Dumbbell } from "lucide-react";
import { WorkoutList } from "@/components/workouts/workout-list";

export default async function WorkoutsPage() {
    const workouts = await getWorkouts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[var(--secondary)]">
                        <ClipboardList className="h-6 w-6 text-[var(--foreground)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Workouts</h1>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {workouts.length} logged
                        </p>
                    </div>
                </div>
                <Link href="/workouts/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        Log Workout
                    </Button>
                </Link>
            </div>

            {workouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
                    <div className="p-5 rounded-full bg-[var(--secondary)]">
                        <Dumbbell className="h-10 w-10 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">No workouts yet</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            Start logging to track your progress
                        </p>
                    </div>
                    <Link href="/workouts/new">
                        <Button>Log your first workout</Button>
                    </Link>
                </div>
            ) : (
                <WorkoutList workouts={workouts} />
            )}
        </div>
    );
}
