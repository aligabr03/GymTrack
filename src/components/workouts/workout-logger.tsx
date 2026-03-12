"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createWorkout, updateWorkout } from "@/actions/workouts";
import type { Exercise, WorkoutWithSets } from "@/types";
import { FORM_RATINGS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { estimateOneRM } from "@/lib/calculations";
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Loader2,
    Search,
    Dumbbell,
    Star,
} from "lucide-react";

type SetRow = {
    id: string;
    exerciseId: string;
    exerciseName: string;
    setNumber: number;
    weightKg: string;
    reps: string;
    formRating: number | null;
    rpe: string;
    notes: string;
};

type ExerciseGroup = {
    exerciseId: string;
    exerciseName: string;
    sets: SetRow[];
    collapsed: boolean;
};

function makeId() {
    return Math.random().toString(36).slice(2);
}

function makeSet(
    exerciseId: string,
    exerciseName: string,
    setNumber: number,
): SetRow {
    return {
        id: makeId(),
        exerciseId,
        exerciseName,
        setNumber,
        weightKg: "",
        reps: "",
        formRating: null,
        rpe: "",
        notes: "",
    };
}

export function WorkoutLogger({
    exercises,
    existing,
}: {
    exercises: Exercise[];
    existing?: WorkoutWithSets;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [date, setDate] = useState(
        existing?.date
            ? new Date(existing.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
    );
    const [workoutName, setWorkoutName] = useState(existing?.name ?? "");
    const [notes, setNotes] = useState(existing?.notes ?? "");
    const [durationMins, setDurationMins] = useState(
        existing?.durationMins?.toString() ?? "",
    );

    // Build groups from existing workout
    const [groups, setGroups] = useState<ExerciseGroup[]>(() => {
        if (!existing) return [];
        const byExercise = new Map<string, SetRow[]>();
        for (const s of existing.sets) {
            if (!byExercise.has(s.exerciseId)) byExercise.set(s.exerciseId, []);
            byExercise.get(s.exerciseId)!.push({
                id: s.id,
                exerciseId: s.exerciseId,
                exerciseName: s.exercise.name,
                setNumber: s.setNumber,
                weightKg: s.weightKg?.toString() ?? "",
                reps: s.reps?.toString() ?? "",
                formRating: s.formRating,
                rpe: s.rpe?.toString() ?? "",
                notes: s.notes ?? "",
            });
        }
        return Array.from(byExercise.entries()).map(([exerciseId, sets]) => ({
            exerciseId,
            exerciseName: sets[0].exerciseName,
            sets,
            collapsed: false,
        }));
    });

    const [addExOpen, setAddExOpen] = useState(false);
    const [exerciseSearch, setExerciseSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const categories = [...new Set(exercises.map((e) => e.category))].sort();

    const filteredExercises = exercises.filter((e) => {
        const matchSearch = e.name
            .toLowerCase()
            .includes(exerciseSearch.toLowerCase());
        const matchCat =
            categoryFilter === "all" || e.category === categoryFilter;
        return matchSearch && matchCat;
    });

    function addExercise(exercise: Exercise) {
        setGroups((prev) => {
            if (prev.some((g) => g.exerciseId === exercise.id)) {
                // Add set to existing group
                return prev.map((g) =>
                    g.exerciseId === exercise.id
                        ? {
                              ...g,
                              sets: [
                                  ...g.sets,
                                  makeSet(
                                      exercise.id,
                                      exercise.name,
                                      g.sets.length + 1,
                                  ),
                              ],
                          }
                        : g,
                );
            }
            return [
                ...prev,
                {
                    exerciseId: exercise.id,
                    exerciseName: exercise.name,
                    sets: [makeSet(exercise.id, exercise.name, 1)],
                    collapsed: false,
                },
            ];
        });
        setAddExOpen(false);
        setExerciseSearch("");
    }

    function addSet(exerciseId: string) {
        setGroups((prev) =>
            prev.map((g) =>
                g.exerciseId === exerciseId
                    ? {
                          ...g,
                          sets: [
                              ...g.sets,
                              makeSet(
                                  exerciseId,
                                  g.exerciseName,
                                  g.sets.length + 1,
                              ),
                          ],
                      }
                    : g,
            ),
        );
    }

    function removeSet(exerciseId: string, setId: string) {
        setGroups((prev) =>
            prev
                .map((g) =>
                    g.exerciseId === exerciseId
                        ? {
                              ...g,
                              sets: g.sets
                                  .filter((s) => s.id !== setId)
                                  .map((s, i) => ({ ...s, setNumber: i + 1 })),
                          }
                        : g,
                )
                .filter((g) => g.sets.length > 0),
        );
    }

    function removeExercise(exerciseId: string) {
        setGroups((prev) => prev.filter((g) => g.exerciseId !== exerciseId));
    }

    function updateSet(
        exerciseId: string,
        setId: string,
        field: keyof SetRow,
        value: string | number | null,
    ) {
        setGroups((prev) =>
            prev.map((g) =>
                g.exerciseId === exerciseId
                    ? {
                          ...g,
                          sets: g.sets.map((s) =>
                              s.id === setId ? { ...s, [field]: value } : s,
                          ),
                      }
                    : g,
            ),
        );
    }

    function toggleCollapse(exerciseId: string) {
        setGroups((prev) =>
            prev.map((g) =>
                g.exerciseId === exerciseId
                    ? { ...g, collapsed: !g.collapsed }
                    : g,
            ),
        );
    }

    function handleSave() {
        const allSets = groups.flatMap((g) =>
            g.sets.map((s) => ({
                exerciseId: s.exerciseId,
                setNumber: s.setNumber,
                weightKg: s.weightKg ? parseFloat(s.weightKg) : null,
                reps: s.reps ? parseInt(s.reps, 10) : null,
                formRating: s.formRating,
                rpe: s.rpe ? parseFloat(s.rpe) : null,
                notes: s.notes || null,
            })),
        );

        if (allSets.length === 0) {
            toast({
                title: "Add at least one set to save",
                variant: "destructive",
            });
            return;
        }

        const payload = {
            date,
            name: workoutName || undefined,
            notes: notes || undefined,
            durationMins: durationMins ? parseInt(durationMins, 10) : null,
            sets: allSets,
        };

        startTransition(async () => {
            const result = existing
                ? await updateWorkout(existing.id, payload)
                : await createWorkout(payload);

            if (!result.success) {
                toast({
                    title: result.error ?? "Save failed",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: existing ? "Workout updated" : "Workout saved! 💪",
                variant: "success",
            });
            router.push("/workouts");
        });
    }

    const totalSets = groups.reduce((s, g) => s + g.sets.length, 0);
    const totalVolume = groups.reduce(
        (total, g) =>
            total +
            g.sets.reduce((s, set) => {
                const w = parseFloat(set.weightKg) || 0;
                const r = parseInt(set.reps, 10) || 0;
                return s + w * r;
            }, 0),
        0,
    );

    return (
        <div className="space-y-6">
            {/* Workout meta */}
            <Card>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Workout Name</Label>
                        <Input
                            placeholder="e.g. Push Day, Leg Day…"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Duration (min)</Label>
                        <Input
                            type="number"
                            placeholder="60"
                            value={durationMins}
                            onChange={(e) => setDurationMins(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input
                            placeholder="How did it go?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stats bar */}
            {groups.length > 0 && (
                <div className="flex items-center gap-6 px-1 text-sm text-[var(--muted-foreground)]">
                    <span>
                        <strong className="text-[var(--foreground)]">
                            {groups.length}
                        </strong>{" "}
                        exercises
                    </span>
                    <span>
                        <strong className="text-[var(--foreground)]">
                            {totalSets}
                        </strong>{" "}
                        sets
                    </span>
                    <span>
                        <strong className="text-[var(--foreground)]">
                            {Math.round(totalVolume).toLocaleString()} lbs
                        </strong>{" "}
                        volume
                    </span>
                </div>
            )}

            {/* Exercise groups */}
            {groups.map((group) => (
                <ExerciseGroupCard
                    key={group.exerciseId}
                    group={group}
                    onAddSet={() => addSet(group.exerciseId)}
                    onRemoveSet={(setId) => removeSet(group.exerciseId, setId)}
                    onRemoveExercise={() => removeExercise(group.exerciseId)}
                    onUpdateSet={(setId, field, value) =>
                        updateSet(group.exerciseId, setId, field, value)
                    }
                    onToggleCollapse={() => toggleCollapse(group.exerciseId)}
                />
            ))}

            {/* Add exercise button */}
            <Dialog open={addExOpen} onOpenChange={setAddExOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-dashed">
                        <Plus className="h-4 w-4" />
                        Add Exercise
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Select Exercise</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 flex flex-col flex-1 min-h-0">
                        <Input
                            placeholder="Search exercises…"
                            value={exerciseSearch}
                            onChange={(e) => setExerciseSearch(e.target.value)}
                            autoFocus
                        />
                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All categories
                                </SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                            {filteredExercises.length === 0 ? (
                                <p className="text-center py-8 text-sm text-[var(--muted-foreground)]">
                                    No exercises found
                                </p>
                            ) : (
                                filteredExercises.map((ex) => (
                                    <button
                                        key={ex.id}
                                        onClick={() => addExercise(ex)}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors flex items-center justify-between group"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {ex.name}
                                            </p>
                                            <p className="text-xs text-[var(--muted-foreground)]">
                                                {ex.category}
                                            </p>
                                        </div>
                                        <Plus className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Save button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                    variant="outline"
                    onClick={() => router.push("/workouts")}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isPending || groups.length === 0}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                        </>
                    ) : existing ? (
                        "Update Workout"
                    ) : (
                        "Save Workout"
                    )}
                </Button>
            </div>
        </div>
    );
}

function ExerciseGroupCard({
    group,
    onAddSet,
    onRemoveSet,
    onRemoveExercise,
    onUpdateSet,
    onToggleCollapse,
}: {
    group: ExerciseGroup;
    onAddSet: () => void;
    onRemoveSet: (setId: string) => void;
    onRemoveExercise: () => void;
    onUpdateSet: (
        setId: string,
        field: keyof SetRow,
        value: string | number | null,
    ) => void;
    onToggleCollapse: () => void;
}) {
    return (
        <Card>
            <div
                className="flex items-center justify-between p-4 cursor-pointer select-none"
                onClick={onToggleCollapse}
            >
                <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-[var(--primary)]" />
                    <span className="font-semibold">{group.exerciseName}</span>
                    <Badge variant="secondary" className="text-xs">
                        {group.sets.length} set
                        {group.sets.length !== 1 ? "s" : ""}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveExercise();
                        }}
                        className="p-1.5 rounded hover:bg-red-900/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                        aria-label="Remove exercise"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    {group.collapsed ? (
                        <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                    )}
                </div>
            </div>

            {!group.collapsed && (
                <CardContent className="p-4 pt-0 space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-[2rem_1fr_1fr_1fr_1fr_2rem] gap-2 text-xs text-[var(--muted-foreground)] px-1 pb-1">
                        <span>#</span>
                        <span>Weight (lbs)</span>
                        <span>Reps</span>
                        <span>Form</span>
                        <span>RPE</span>
                        <span />
                    </div>

                    {group.sets.map((set) => (
                        <SetRow
                            key={set.id}
                            set={set}
                            onUpdate={(field, value) =>
                                onUpdateSet(set.id, field, value)
                            }
                            onRemove={() => onRemoveSet(set.id)}
                        />
                    ))}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAddSet}
                        className="w-full mt-2 border border-dashed border-[var(--border)]"
                    >
                        <Plus className="h-3 w-3" />
                        Add Set
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}

function SetRow({
    set,
    onUpdate,
    onRemove,
}: {
    set: SetRow;
    onUpdate: (field: keyof SetRow, value: string | number | null) => void;
    onRemove: () => void;
}) {
    const estimatedRM =
        set.weightKg && set.reps
            ? estimateOneRM(parseFloat(set.weightKg), parseInt(set.reps, 10))
            : null;

    return (
        <div className="space-y-1">
            <div className="grid grid-cols-[2rem_1fr_1fr_1fr_1fr_2rem] gap-2 items-center">
                <span className="text-xs text-[var(--muted-foreground)] text-center font-mono">
                    {set.setNumber}
                </span>
                <Input
                    type="number"
                    placeholder="0"
                    value={set.weightKg}
                    onChange={(e) => onUpdate("weightKg", e.target.value)}
                    className="h-8 text-sm"
                    min={0}
                    step={0.5}
                />
                <Input
                    type="number"
                    placeholder="0"
                    value={set.reps}
                    onChange={(e) => onUpdate("reps", e.target.value)}
                    className="h-8 text-sm"
                    min={1}
                />
                {/* Form rating */}
                <Select
                    value={set.formRating?.toString() ?? ""}
                    onValueChange={(v) =>
                        onUpdate("formRating", v ? parseInt(v, 10) : null)
                    }
                >
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                        {FORM_RATINGS.map((r) => (
                            <SelectItem
                                key={r.value}
                                value={r.value.toString()}
                            >
                                {r.value} – {r.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    placeholder="—"
                    value={set.rpe}
                    onChange={(e) => onUpdate("rpe", e.target.value)}
                    className="h-8 text-sm"
                    min={1}
                    max={10}
                    step={0.5}
                />
                <button
                    onClick={onRemove}
                    className="p-1 rounded hover:bg-red-900/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors flex items-center justify-center"
                    aria-label="Remove set"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
            {estimatedRM && (
                <p className="text-xs text-[var(--muted-foreground)] pl-10">
                    ~{estimatedRM} lbs est. 1RM
                </p>
            )}
        </div>
    );
}
