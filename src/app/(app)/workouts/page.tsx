import { getWorkouts } from "@/actions/workouts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Dumbbell } from "lucide-react";
import { WorkoutList } from "@/components/workouts/workout-list";

export default async function WorkoutsPage() {
    const workouts = await getWorkouts();

    return (
        <div className="space-y-6">
            <div className="hidden md:flex items-center justify-between animate-fade-in">
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
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_12px_var(--primary-glow)]">
                        <Plus className="h-4 w-4" />
                        Log Workout
                    </Button>
                </Link>
            </div>
            <Link href="/workouts/new" className="block md:hidden mb-2">
                <Button className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_12px_var(--primary-glow)]">
                    <Plus className="h-4 w-4" />
                    Log Workout
                </Button>
            </Link>

            {workouts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-center py-20 gap-4">
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
                        <Button variant="outline" className="border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/60">
                            Log your first workout
                        </Button>
                    </Link>
                </div>
            ) : (
                <WorkoutList workouts={workouts} />
            )}
        </div>
    );
}
