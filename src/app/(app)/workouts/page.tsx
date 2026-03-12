import { getWorkouts } from "@/actions/workouts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations";
import {
    Plus,
    ClipboardList,
    Clock,
    Dumbbell,
    ChevronRight,
} from "lucide-react";

export default async function WorkoutsPage() {
    const workouts = await getWorkouts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[var(--primary)]/10">
                        <ClipboardList className="h-6 w-6 text-[var(--primary)]" />
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
                <div className="space-y-3">
                    {workouts.map((workout, index) => {
                        const volume = calculateVolume(workout.sets);
                        const exercises = [
                            ...new Set(
                                workout.sets.map((s) => s.exercise.name),
                            ),
                        ];
                        return (
                            <Link
                                key={workout.id}
                                href={`/workouts/${workout.id}`}
                            >
                                <Card
                                    className="hover:border-[var(--primary)]/40 transition-all duration-200 cursor-pointer animate-fade-in-up"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold">
                                                        {workout.name ??
                                                            formatDate(
                                                                workout.date,
                                                            )}
                                                    </span>
                                                    <span className="text-xs text-[var(--muted-foreground)]">
                                                        {formatRelativeDate(
                                                            workout.date,
                                                        )}
                                                    </span>
                                                    {workout.durationMins && (
                                                        <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-0.5">
                                                            <Clock className="h-3 w-3" />
                                                            {
                                                                workout.durationMins
                                                            }{" "}
                                                            min
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {exercises
                                                        .slice(0, 4)
                                                        .map((ex) => (
                                                            <Badge
                                                                key={ex}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {ex}
                                                            </Badge>
                                                        ))}
                                                    {exercises.length > 4 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            +
                                                            {exercises.length -
                                                                4}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0 text-right">
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {Math.round(
                                                            volume,
                                                        ).toLocaleString()}{" "}
                                                        lbs
                                                    </p>
                                                    <p className="text-xs text-[var(--muted-foreground)]">
                                                        {workout.sets.length}{" "}
                                                        sets
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
