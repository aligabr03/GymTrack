import { getWorkout, deleteWorkout } from "@/actions/workouts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { calculateVolume, estimateOneRM } from "@/lib/calculations";
import { FORM_RATINGS } from "@/types";
import { ArrowLeft, Edit, Clock, Dumbbell } from "lucide-react";
import { DeleteWorkoutButton } from "@/components/workouts/delete-workout-button";

export default async function WorkoutDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const workout = await getWorkout(id);
    if (!workout) notFound();

    const volume = calculateVolume(workout.sets);

    // Group sets by exercise
    const byExercise = workout.sets.reduce(
        (acc, s) => {
            if (!acc[s.exerciseId])
                acc[s.exerciseId] = { exercise: s.exercise, sets: [] };
            acc[s.exerciseId].sets.push(s);
            return acc;
        },
        {} as Record<
            string,
            {
                exercise: (typeof workout.sets)[0]["exercise"];
                sets: typeof workout.sets;
            }
        >,
    );

    // Build superset grouping
    const supersetIdMap = new Map<string, string>();
    for (const s of workout.sets) {
        if (s.supersetId && !supersetIdMap.has(s.exerciseId)) {
            supersetIdMap.set(s.exerciseId, s.supersetId);
        }
    }
    type ExData = {
        exercise: (typeof workout.sets)[0]["exercise"];
        sets: typeof workout.sets;
        supersetGroupId: string | null;
    };
    const exerciseList: ExData[] = Object.values(byExercise).map(
        ({ exercise, sets }) => ({
            exercise,
            sets,
            supersetGroupId: supersetIdMap.get(exercise.id) ?? null,
        }),
    );
    type RenderItem =
        | { type: "single"; data: ExData }
        | { type: "superset"; ssId: string; exercises: ExData[] };
    const renderItems: RenderItem[] = [];
    const seenSS = new Set<string>();
    for (const data of exerciseList) {
        if (data.supersetGroupId) {
            if (!seenSS.has(data.supersetGroupId)) {
                seenSS.add(data.supersetGroupId);
                renderItems.push({
                    type: "superset",
                    ssId: data.supersetGroupId,
                    exercises: exerciseList.filter(
                        (d) => d.supersetGroupId === data.supersetGroupId,
                    ),
                });
            }
        } else {
            renderItems.push({ type: "single", data });
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/workouts">
                    <Button variant="ghost" size="icon-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold truncate">
                        {workout.name ?? "Workout"}
                    </h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDate(workout.date)}
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Link href={`/workouts/${id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <DeleteWorkoutButton id={id} />
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                    label="Volume"
                    value={`${Math.round(volume).toLocaleString()} lbs`}
                />
                <SummaryCard
                    label="Sets"
                    value={workout.sets.length.toString()}
                />
                <SummaryCard
                    label="Exercises"
                    value={Object.keys(byExercise).length.toString()}
                />
                {workout.durationMins && (
                    <SummaryCard
                        label="Duration"
                        value={`${workout.durationMins} min`}
                        icon={<Clock className="h-4 w-4" />}
                    />
                )}
            </div>

            {workout.notes && (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {workout.notes}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Exercises */}
            <div className="space-y-4">
                {renderItems.map((item) =>
                    item.type === "superset" ? (
                        <div key={item.ssId} className="space-y-2">
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-px flex-1 bg-[var(--border)]" />
                                <span className="text-[10px] font-bold tracking-widest text-[var(--muted-foreground)] uppercase">
                                    Superset
                                </span>
                                <div className="h-px flex-1 bg-[var(--border)]" />
                            </div>
                            <div className="pl-3 border-l-2 border-[var(--border)] space-y-2">
                                {item.exercises.map(({ exercise, sets }) => (
                                    <ExerciseCard
                                        key={exercise.id}
                                        exercise={exercise}
                                        sets={sets}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <ExerciseCard
                            key={item.data.exercise.id}
                            exercise={item.data.exercise}
                            sets={item.data.sets}
                        />
                    ),
                )}
            </div>
        </div>
    );
}

function ExerciseCard({
    exercise,
    sets,
}: {
    exercise: { id: string; name: string };
    sets: Array<{
        id: string;
        setNumber: number;
        weightKg: number | null;
        reps: number | null;
        formRating: number | null;
        rpe: number | null;
        isDropset: boolean;
    }>;
}) {
    const bestSet = sets.reduce(
        (best, s) => {
            if (!s.weightKg || !s.reps) return best;
            const e1rm = estimateOneRM(s.weightKg, s.reps);
            return !best || e1rm > (best.e1rm ?? 0) ? { ...s, e1rm } : best;
        },
        null as ((typeof sets)[0] & { e1rm?: number }) | null,
    );
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                        <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-[var(--foreground)]" />
                            {exercise.name}
                        </div>
                    </CardTitle>
                    {bestSet?.e1rm && (
                        <div className="text-right">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                                ~{bestSet.e1rm} lbs 1RM
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                                estimated
                            </p>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    <div className="grid grid-cols-[2rem_1fr_1fr_1fr_1fr] gap-2 text-xs text-[var(--muted-foreground)] px-1">
                        <span>#</span>
                        <span>Weight</span>
                        <span>Reps</span>
                        <span>Form</span>
                        <span>RPE</span>
                    </div>
                    {sets.map((s) => {
                        const formLabel = FORM_RATINGS.find(
                            (r) => r.value === s.formRating,
                        );
                        return (
                            <div
                                key={s.id}
                                className={`grid grid-cols-[2rem_1fr_1fr_1fr_1fr] gap-2 items-center px-1 py-1 rounded transition-colors text-sm ${
                                    s.isDropset
                                        ? "bg-[var(--secondary)]/60"
                                        : "hover:bg-[var(--secondary)]"
                                }`}
                            >
                                <span
                                    className="text-xs font-mono"
                                    title={s.isDropset ? "Drop set" : undefined}
                                >
                                    {s.isDropset ? (
                                        <span className="text-[var(--foreground)] font-bold">
                                            â†“
                                        </span>
                                    ) : (
                                        <span className="text-[var(--muted-foreground)]">
                                            {s.setNumber}
                                        </span>
                                    )}
                                </span>
                                <span>
                                    {s.weightKg ? `${s.weightKg} lbs` : "â€”"}
                                </span>
                                <span>{s.reps ?? "â€”"}</span>
                                <span>
                                    {formLabel ? (
                                        <Badge
                                            variant={
                                                s.formRating! >= 4
                                                    ? "success"
                                                    : s.formRating! >= 3
                                                      ? "secondary"
                                                      : "warning"
                                            }
                                            className="text-xs"
                                        >
                                            {formLabel.label}
                                        </Badge>
                                    ) : (
                                        <span className="text-[var(--muted-foreground)]">
                                            â€”
                                        </span>
                                    )}
                                </span>
                                <span className="text-[var(--muted-foreground)]">
                                    {s.rpe ?? "â€”"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function SummaryCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-xs text-[var(--muted-foreground)]">
                    {label}
                </p>
                <p className="text-xl font-bold mt-1 flex items-center gap-1">
                    {icon}
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}
