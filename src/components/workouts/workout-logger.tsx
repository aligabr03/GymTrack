"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    createWorkout,
    getBatchPreviousBestSets,
    updateWorkout,
} from "@/actions/workouts";
import { createExercise } from "@/actions/exercises";
import type {
    Exercise,
    WorkoutMetaSuggestions,
    WorkoutWithSets,
} from "@/types";
import { toStoredDateStr, todayEST } from "@/lib/utils";
import { EXERCISE_CATEGORIES, FORM_RATINGS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { estimateOneRM, kgToLbs, lbsToKg } from "@/lib/calculations";
import type { WeightUnit } from "@/lib/calculations";
import {
    Plus,
    Trash2,
    Copy,
    ChevronDown,
    ChevronUp,
    Loader2,
    Dumbbell,
    Link2,
    Unlink2,
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
    isDropset: boolean;
};

type ExerciseGroup = {
    exerciseId: string;
    exerciseName: string;
    sets: SetRow[];
    collapsed: boolean;
    supersetGroupId: string | null;
};

function makeId() {
    return Math.random().toString(36).slice(2);
}

function makeSet(
    exerciseId: string,
    exerciseName: string,
    setNumber: number,
    isDropset = false,
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
        isDropset,
    };
}

function getBestEstimatedOneRM(
    sets: Array<{
        weightKg: string | number | null;
        reps: string | number | null;
    }>,
): number | null {
    let best: number | null = null;
    for (const set of sets) {
        const weight = Number(set.weightKg ?? 0);
        const reps = Number(set.reps ?? 0);
        if (!Number.isFinite(weight) || !Number.isFinite(reps)) continue;
        if (weight <= 0 || reps <= 0) continue;
        const e1rm = estimateOneRM(weight, reps);
        if (best == null || e1rm > best) best = e1rm;
    }
    return best;
}

export function WorkoutLogger({
    exercises,
    existing,
    suggestions,
    onSuccess,
    onCancel,
    weightUnit = "KG",
}: {
    exercises: Exercise[];
    existing?: WorkoutWithSets;
    suggestions: WorkoutMetaSuggestions;
    onSuccess?: () => void;
    onCancel?: () => void;
    weightUnit?: WeightUnit;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [prCelebration, setPrCelebration] = useState<{ names: string[]; isExisting: boolean } | null>(null);

    function closePrCelebration() {
        setPrCelebration(null);
        if (onSuccess) {
            onSuccess();
        } else {
            router.push("/workouts");
        }
    }

    const [date, setDate] = useState(
        existing?.date ? toStoredDateStr(existing.date) : todayEST(),
    );
    const [workoutName, setWorkoutName] = useState(existing?.name ?? "");
    const [notes, setNotes] = useState(existing?.notes ?? "");
    const [durationMins, setDurationMins] = useState(
        existing?.durationMins?.toString() ?? "",
    );
    const [exerciseOptions, setExerciseOptions] = useState(exercises);
    const [createExerciseName, setCreateExerciseName] = useState("");
    const [createExerciseCategory, setCreateExerciseCategory] = useState<
        (typeof EXERCISE_CATEGORIES)[number]
    >(EXERCISE_CATEGORIES[0]);
    const [previousBestByExercise, setPreviousBestByExercise] = useState<
        Record<string, { weightKg: number; reps: number; e1rm: number } | null>
    >({});

    // Build groups from existing workout
    const [groups, setGroups] = useState<ExerciseGroup[]>(() => {
        if (!existing) return [];
        const byExercise = new Map<string, SetRow[]>();
        const supersetMap = new Map<string, string>(); // exerciseId -> supersetGroupId
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
                isDropset: s.isDropset ?? false,
            });
            if (s.supersetId && !supersetMap.has(s.exerciseId)) {
                supersetMap.set(s.exerciseId, s.supersetId);
            }
        }
        return Array.from(byExercise.entries()).map(([exerciseId, sets]) => ({
            exerciseId,
            exerciseName: sets[0].exerciseName,
            sets: sets.sort((a, b) => a.setNumber - b.setNumber),
            collapsed: Boolean(existing),
            supersetGroupId: supersetMap.get(exerciseId) ?? null,
        }));
    });

    const [addExOpen, setAddExOpen] = useState(false);
    const [exerciseSearch, setExerciseSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const categories = [
        ...new Set(exerciseOptions.map((e) => e.category)),
    ].sort();

    const filteredExercises = exerciseOptions.filter((e) => {
        const matchSearch = e.name
            .toLowerCase()
            .includes(exerciseSearch.toLowerCase());
        const matchCat =
            categoryFilter === "all" || e.category === categoryFilter;
        return matchSearch && matchCat;
    });

    async function loadPreviousBestForExercises(exerciseIds: string[]) {
        const missing = exerciseIds.filter(
            (id) => previousBestByExercise[id] === undefined,
        );
        if (missing.length === 0) return;
        try {
            const batch = await getBatchPreviousBestSets(missing, existing?.id);
            setPreviousBestByExercise((prev) => ({ ...prev, ...batch }));
        } catch {
            setPreviousBestByExercise((prev) => ({
                ...prev,
                ...Object.fromEntries(missing.map((id) => [id, null])),
            }));
        }
    }

    useEffect(() => {
        const missing = groups
            .map((g) => g.exerciseId)
            .filter((id) => previousBestByExercise[id] === undefined);
        if (missing.length > 0) void loadPreviousBestForExercises(missing);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups]);

    function addExercise(exercise: Exercise) {
        if (groups.some((g) => g.exerciseId === exercise.id)) {
            // Exercise already in workout — just add a blank set
            setGroups((prev) =>
                prev.map((g) =>
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
                ),
            );
            setAddExOpen(false);
            setExerciseSearch("");
            return;
        }

        // New exercise
        setAddExOpen(false);
        setExerciseSearch("");
        setGroups((prev) => [
            ...prev.map((g) => ({ ...g, collapsed: true })),
            {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                sets: [makeSet(exercise.id, exercise.name, 1)],
                collapsed: false,
                supersetGroupId: null,
            },
        ]);

        if (previousBestByExercise[exercise.id] === undefined) {
            void loadPreviousBestForExercises([exercise.id]);
        }
    }

    function handleCreateExercise() {
        const name = createExerciseName.trim();
        if (!name) return;

        startTransition(async () => {
            const result = await createExercise({
                name,
                category: createExerciseCategory,
                muscleGroups: [createExerciseCategory],
            });

            if (!result.success || !result.data) {
                toast({
                    title:
                        ("error" in result ? result.error : undefined) ??
                        "Could not create exercise",
                    variant: "destructive",
                });
                return;
            }

            const exercise = result.data;
            setExerciseOptions((prev) =>
                [...prev, exercise].sort(
                    (a, b) =>
                        a.category.localeCompare(b.category) ||
                        a.name.localeCompare(b.name),
                ),
            );
            setCreateExerciseName("");
            setCategoryFilter(exercise.category);
            addExercise(exercise);
            toast({ title: "Exercise created", variant: "success" });
        });
    }

    function addSet(exerciseId: string) {
        setGroups((prev) =>
            prev.map((g) => {
                if (g.exerciseId !== exerciseId) return g;
                const last = g.sets.at(-1);
                const next: SetRow = last
                    ? {
                          ...last,
                          id: makeId(),
                          setNumber: g.sets.length + 1,
                          notes: "",
                          isDropset: false,
                      }
                    : makeSet(exerciseId, g.exerciseName, g.sets.length + 1);
                return { ...g, sets: [...g.sets, next] };
            }),
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

    function toggleDropset(exerciseId: string, setId: string) {
        setGroups((prev) =>
            prev.map((g) =>
                g.exerciseId === exerciseId
                    ? {
                          ...g,
                          sets: g.sets.map((s) =>
                              s.id === setId
                                  ? { ...s, isDropset: !s.isDropset }
                                  : s,
                          ),
                      }
                    : g,
            ),
        );
    }

    function duplicateSet(exerciseId: string, setId: string) {
        setGroups((prev) =>
            prev.map((g) => {
                if (g.exerciseId !== exerciseId) return g;
                const idx = g.sets.findIndex((s) => s.id === setId);
                if (idx === -1) return g;
                const dup: SetRow = { ...g.sets[idx], id: makeId() };
                const newSets = [
                    ...g.sets.slice(0, idx + 1),
                    dup,
                    ...g.sets.slice(idx + 1),
                ].map((s, i) => ({ ...s, setNumber: i + 1 }));
                return { ...g, sets: newSets };
            }),
        );
    }

    function addDropSet(exerciseId: string) {
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
                                  true,
                              ),
                          ],
                      }
                    : g,
            ),
        );
    }

    function linkSuperset(exerciseId1: string, exerciseId2: string) {
        const g1 = groups.find((g) => g.exerciseId === exerciseId1);
        const g2 = groups.find((g) => g.exerciseId === exerciseId2);
        const supersetGroupId =
            g1?.supersetGroupId ?? g2?.supersetGroupId ?? makeId();
        setGroups((prev) =>
            prev.map((g) =>
                g.exerciseId === exerciseId1 || g.exerciseId === exerciseId2
                    ? { ...g, supersetGroupId }
                    : g,
            ),
        );
    }

    function unlinkSuperset(exerciseId: string) {
        const target = groups.find((g) => g.exerciseId === exerciseId);
        if (!target?.supersetGroupId) return;
        const ssId = target.supersetGroupId;
        const ssMembers = groups.filter((g) => g.supersetGroupId === ssId);
        setGroups((prev) =>
            prev.map((g) =>
                ssMembers.length <= 2
                    ? g.supersetGroupId === ssId
                        ? { ...g, supersetGroupId: null }
                        : g
                    : g.exerciseId === exerciseId
                      ? { ...g, supersetGroupId: null }
                      : g,
            ),
        );
    }

    function handleSave() {
        const setDrafts = groups.flatMap((group) =>
            group.sets.map((set) => ({
                exerciseId: set.exerciseId,
                exerciseName: group.exerciseName,
                setNumber: set.setNumber,
                weightKg: set.weightKg.trim(),
                reps: set.reps.trim(),
                formRating: set.formRating,
                rpe: set.rpe.trim(),
                notes: set.notes || null,
                isDropset: set.isDropset,
                supersetId: group.supersetGroupId,
            })),
        );

        if (setDrafts.length === 0) {
            toast({
                title: "Add at least one set to save",
                variant: "destructive",
            });
            return;
        }

        const incompleteSet = setDrafts.find(
            (set) => !set.weightKg || !set.reps,
        );

        if (incompleteSet) {
            toast({
                title: `Enter weight and reps for ${incompleteSet.exerciseName} set ${incompleteSet.setNumber}`,
                variant: "destructive",
            });
            return;
        }

        const allSets = setDrafts.map((set) => ({
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            weightKg: weightUnit === "LBS" ? lbsToKg(parseFloat(set.weightKg)) : parseFloat(set.weightKg),
            reps: parseInt(set.reps, 10),
            formRating: set.formRating,
            rpe: set.rpe ? parseFloat(set.rpe) : null,
            notes: set.notes,
            isDropset: set.isDropset,
            supersetId: set.supersetId,
        }));

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

            if (result.newPRs && result.newPRs.length > 0) {
                setPrCelebration({ names: result.newPRs, isExisting: !!existing });
            } else {
                toast({
                    title: existing ? "Workout updated" : "Workout saved! 💪",
                    variant: "success",
                });
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/workouts");
                }
            }
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

    const normalizedWorkoutName = workoutName.trim().toLowerCase();
    const filteredNameSuggestions = suggestions.names
        .filter((name) =>
            normalizedWorkoutName
                ? name.toLowerCase().includes(normalizedWorkoutName)
                : true,
        )
        .filter((name) => name.toLowerCase() !== normalizedWorkoutName)
        .slice(0, 4);
    const durationSuggestions = suggestions.durations
        .filter((duration) => duration.toString() !== durationMins)
        .slice(0, 4);

    return (
        <>
        <div className="space-y-6">
            {/* Workout meta */}
            <Card>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2 min-w-0">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full max-w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Workout Name</Label>
                        <Input
                            placeholder="e.g. Push Day, Leg Day…"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                        />
                        {filteredNameSuggestions.length > 0 && (
                            <SuggestionRow
                                label="Recent"
                                items={filteredNameSuggestions}
                                onSelect={setWorkoutName}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Duration (min)</Label>
                        <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="60"
                            value={durationMins}
                            onChange={(e) => setDurationMins(e.target.value)}
                        />
                        {durationSuggestions.length > 0 && (
                            <SuggestionRow
                                label="Quick picks"
                                items={durationSuggestions.map(
                                    (duration) => `${duration} min`,
                                )}
                                onSelect={(value) =>
                                    setDurationMins(value.replace(" min", ""))
                                }
                            />
                        )}
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
                            {Math.round(totalVolume).toLocaleString()} {weightUnit === "LBS" ? "lbs" : "kg"}
                        </strong>{" "}
                        volume
                    </span>
                </div>
            )}

            {/* Exercise groups — with superset visual grouping */}
            {(() => {
                type RenderItem =
                    | { type: "single"; group: ExerciseGroup }
                    | {
                          type: "superset";
                          ssId: string;
                          groups: ExerciseGroup[];
                      };
                const items: RenderItem[] = [];
                const seen = new Set<string>();
                for (const group of groups) {
                    if (group.supersetGroupId) {
                        if (!seen.has(group.supersetGroupId)) {
                            seen.add(group.supersetGroupId);
                            items.push({
                                type: "superset",
                                ssId: group.supersetGroupId,
                                groups: groups.filter(
                                    (g) =>
                                        g.supersetGroupId ===
                                        group.supersetGroupId,
                                ),
                            });
                        }
                    } else {
                        items.push({ type: "single", group });
                    }
                }

                return items.map((item) =>
                    item.type === "single" ? (
                        <ExerciseGroupCard
                            key={item.group.exerciseId}
                            group={item.group}
                            previousBest={
                                previousBestByExercise[item.group.exerciseId] ??
                                null
                            }
                            otherGroups={groups.filter(
                                (g) => g.exerciseId !== item.group.exerciseId,
                            )}
                            weightUnit={weightUnit}
                            onAddSet={() => addSet(item.group.exerciseId)}
                            onAddDropSet={() =>
                                addDropSet(item.group.exerciseId)
                            }
                            onRemoveSet={(setId) =>
                                removeSet(item.group.exerciseId, setId)
                            }
                            onDuplicateSet={(setId) =>
                                duplicateSet(item.group.exerciseId, setId)
                            }
                            onRemoveExercise={() =>
                                removeExercise(item.group.exerciseId)
                            }
                            onUpdateSet={(setId, field, value) =>
                                updateSet(
                                    item.group.exerciseId,
                                    setId,
                                    field,
                                    value,
                                )
                            }
                            onToggleCollapse={() =>
                                toggleCollapse(item.group.exerciseId)
                            }
                            onToggleDropset={(setId) =>
                                toggleDropset(item.group.exerciseId, setId)
                            }
                            onLinkSuperset={(targetId) =>
                                linkSuperset(item.group.exerciseId, targetId)
                            }
                            onUnlinkSuperset={() =>
                                unlinkSuperset(item.group.exerciseId)
                            }
                        />
                    ) : (
                        <div key={item.ssId} className="space-y-2">
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-px flex-1 bg-[var(--border)]" />
                                <span className="text-[10px] font-bold tracking-widest text-[var(--muted-foreground)] uppercase">
                                    Superset
                                </span>
                                <div className="h-px flex-1 bg-[var(--border)]" />
                            </div>
                            <div className="pl-3 border-l-2 border-[var(--border)] space-y-2">
                                {item.groups.map((group) => (
                                    <ExerciseGroupCard
                                        key={group.exerciseId}
                                        group={group}
                                        previousBest={
                                            previousBestByExercise[
                                                group.exerciseId
                                            ] ?? null
                                        }
                                        otherGroups={groups.filter(
                                            (g) =>
                                                g.exerciseId !==
                                                group.exerciseId,
                                        )}
                                        weightUnit={weightUnit}
                                        onAddSet={() =>
                                            addSet(group.exerciseId)
                                        }
                                        onAddDropSet={() =>
                                            addDropSet(group.exerciseId)
                                        }
                                        onRemoveSet={(setId) =>
                                            removeSet(group.exerciseId, setId)
                                        }
                                        onDuplicateSet={(setId) =>
                                            duplicateSet(
                                                group.exerciseId,
                                                setId,
                                            )
                                        }
                                        onRemoveExercise={() =>
                                            removeExercise(group.exerciseId)
                                        }
                                        onUpdateSet={(setId, field, value) =>
                                            updateSet(
                                                group.exerciseId,
                                                setId,
                                                field,
                                                value,
                                            )
                                        }
                                        onToggleCollapse={() =>
                                            toggleCollapse(group.exerciseId)
                                        }
                                        onToggleDropset={(setId) =>
                                            toggleDropset(
                                                group.exerciseId,
                                                setId,
                                            )
                                        }
                                        onLinkSuperset={(targetId) =>
                                            linkSuperset(
                                                group.exerciseId,
                                                targetId,
                                            )
                                        }
                                        onUnlinkSuperset={() =>
                                            unlinkSuperset(group.exerciseId)
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    ),
                );
            })()}

            {/* Add exercise button */}
            <Dialog open={addExOpen} onOpenChange={setAddExOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-dashed">
                        <Plus className="h-4 w-4" />
                        Add Exercise
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md flex flex-col min-h-[75dvh] md:min-h-0 md:max-h-[80vh]">
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
                        <div className="border-t border-[var(--border)] pt-3 space-y-2">
                            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                                Create new exercise
                            </p>
                            <Input
                                placeholder="Exercise name"
                                value={createExerciseName}
                                onChange={(e) =>
                                    setCreateExerciseName(e.target.value)
                                }
                            />
                            <Select
                                value={createExerciseCategory}
                                onValueChange={(value) =>
                                    setCreateExerciseCategory(
                                        value as (typeof EXERCISE_CATEGORIES)[number],
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXERCISE_CATEGORIES.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCreateExercise}
                                disabled={
                                    !createExerciseName.trim() || isPending
                                }
                                className="w-full"
                            >
                                <Plus className="h-4 w-4" />
                                Create & Add
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Save button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                    variant="outline"
                    onClick={() =>
                        onCancel ? onCancel() : router.push("/workouts")
                    }
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

        {/* PR Celebration Popup */}
        {prCelebration && (
            <Dialog open={true} onOpenChange={(open) => { if (!open) closePrCelebration(); }}>
                <DialogContent className="overflow-hidden border-amber-500/50 p-0 md:max-w-sm">
                    <div className="relative overflow-hidden rounded-xl">
                        <div className="animate-gold-shimmer p-8 pb-6 text-center relative overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                <div className="animate-shine-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12" />
                            </div>
                            <div className="relative">
                                <div className="text-5xl mb-3">🏆</div>
                                <h2 className="text-2xl font-bold text-amber-950">New PR!</h2>
                                <p className="text-amber-800 text-sm mt-1">Personal Record Achieved</p>
                            </div>
                        </div>
                        <div className="bg-[var(--card)] p-5 space-y-3">
                            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
                                {prCelebration.names.length === 1 ? "Exercise" : "Exercises"}
                            </p>
                            <ul className="space-y-2">
                                {prCelebration.names.map((name) => (
                                    <li key={name} className="flex items-center gap-2 text-sm font-medium">
                                        <span className="text-lg">🥇</span>
                                        {name}
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full mt-2" onClick={closePrCelebration}>
                                Let&apos;s go! 💪
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )}
        </>
    );
}

function SuggestionRow({
    label,
    items,
    onSelect,
}: {
    label: string;
    items: string[];
    onSelect: (value: string) => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[var(--muted-foreground)]">
                {label}
            </span>
            {items.map((item) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="rounded-full border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1 text-xs text-[var(--foreground)] transition-colors hover:border-[var(--ring)] hover:bg-[var(--accent)]"
                >
                    {item}
                </button>
            ))}
        </div>
    );
}

function ExerciseGroupCard({
    group,
    previousBest,
    otherGroups,
    onAddSet,
    onAddDropSet,
    onRemoveSet,
    onDuplicateSet,
    onRemoveExercise,
    onUpdateSet,
    onToggleCollapse,
    onToggleDropset,
    onLinkSuperset,
    onUnlinkSuperset,
    weightUnit = "KG",
}: {
    group: ExerciseGroup;
    previousBest: { weightKg: number; reps: number; e1rm: number } | null;
    otherGroups: ExerciseGroup[];
    onAddSet: () => void;
    onAddDropSet: () => void;
    onRemoveSet: (setId: string) => void;
    onDuplicateSet: (setId: string) => void;
    onRemoveExercise: () => void;
    onUpdateSet: (
        setId: string,
        field: keyof SetRow,
        value: string | number | null,
    ) => void;
    onToggleCollapse: () => void;
    onToggleDropset: (setId: string) => void;
    onLinkSuperset: (exerciseId: string) => void;
    onUnlinkSuperset: () => void;
    weightUnit?: WeightUnit;
}) {
    const [supersetPickerOpen, setSupersetPickerOpen] = useState(false);
    const currentBestE1rm = getBestEstimatedOneRM(group.sets);
    const delta =
        previousBest == null || currentBestE1rm == null
            ? null
            : currentBestE1rm - previousBest.e1rm;
    const trend =
        previousBest == null
            ? null
            : {
                  label: `${weightUnit === "LBS" ? kgToLbs(previousBest.weightKg) : previousBest.weightKg} ${weightUnit === "LBS" ? "lbs" : "kg"} × ${previousBest.reps}`,
                  className:
                      delta == null
                          ? "border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)]"
                          : delta > 0.15
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : delta < -0.15
                              ? "border-red-500/40 bg-red-500/10 text-red-300"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-300",
              };

    const linkableGroups = otherGroups.filter(
        (g) =>
            !g.supersetGroupId || g.supersetGroupId !== group.supersetGroupId,
    );

    return (
        <Card>
            <div
                className="flex items-center justify-between p-4 cursor-pointer select-none"
                onClick={onToggleCollapse}
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <Dumbbell className="h-4 w-4 text-[var(--foreground)] shrink-0" />
                    <span className="font-semibold">{group.exerciseName}</span>
                    <Badge variant="secondary" className="text-xs">
                        {group.sets.length} set
                        {group.sets.length !== 1 ? "s" : ""}
                    </Badge>
                    {group.sets.some((s) => s.isDropset) && (
                        <Badge variant="outline" className="text-xs">
                            ↓ drop
                        </Badge>
                    )}
                    {trend && (
                        <Badge className={`text-[10px] ${trend.className}`}>
                            {trend.label}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {/* Superset controls */}
                    {group.supersetGroupId ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnlinkSuperset();
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-[var(--secondary)] text-[var(--foreground)] hover:text-red-400 transition-colors"
                            title="Remove from superset"
                        >
                            <Unlink2 className="h-3 w-3" />
                            SS
                        </button>
                    ) : linkableGroups.length > 0 ? (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSupersetPickerOpen((v) => !v);
                                }}
                                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                                title="Link as superset"
                            >
                                <Link2 className="h-3.5 w-3.5" />
                            </button>
                            {supersetPickerOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setSupersetPickerOpen(false)
                                        }
                                    />
                                    <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-2 space-y-1 animate-scale-in">
                                        <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">
                                            Superset with…
                                        </p>
                                        {linkableGroups.map((g) => (
                                            <button
                                                key={g.exerciseId}
                                                onClick={() => {
                                                    onLinkSuperset(
                                                        g.exerciseId,
                                                    );
                                                    setSupersetPickerOpen(
                                                        false,
                                                    );
                                                }}
                                                className="w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-[var(--secondary)] transition-colors truncate"
                                            >
                                                {g.exerciseName}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (
                                confirm(
                                    `Remove ${group.exerciseName} from this workout?`,
                                )
                            ) {
                                onRemoveExercise();
                            }
                        }}
                        className="p-2 rounded-lg hover:bg-red-900/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                        aria-label="Remove exercise"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCollapse();
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        aria-label={
                            group.collapsed
                                ? "Expand exercise"
                                : "Collapse exercise"
                        }
                    >
                        {group.collapsed ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {!group.collapsed && (
                <CardContent className="p-4 pt-0 space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-[1.75rem_1fr_1fr_1fr_auto] gap-1.5 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] px-1 pb-1">
                        <span>#</span>
                        <span>{weightUnit === "LBS" ? "Lbs" : "Kg"}</span>
                        <span>Reps</span>
                        <span>Form</span>
                        <span />
                    </div>

                    {group.sets.map((set) => (
                        <SetRow
                            key={set.id}
                            set={set}
                            weightUnit={weightUnit}
                            onUpdate={(field, value) =>
                                onUpdateSet(set.id, field, value)
                            }
                            onRemove={() => onRemoveSet(set.id)}
                            onDuplicate={() => onDuplicateSet(set.id)}
                            onToggleDropset={() => onToggleDropset(set.id)}
                        />
                    ))}

                    <div className="flex gap-2 mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddSet}
                            className="flex-1 border border-dashed border-[var(--border)]"
                        >
                            <Plus className="h-3 w-3" />
                            Add Set
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddDropSet}
                            className="flex-1 border border-dashed border-[var(--border)] text-[var(--muted-foreground)]"
                        >
                            <ChevronDown className="h-3 w-3" />
                            Add Drop Set
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

function SetRow({
    set,
    onUpdate,
    onRemove,
    onDuplicate,
    onToggleDropset,
    weightUnit = "KG",
}: {
    set: SetRow;
    onUpdate: (field: keyof SetRow, value: string | number | null) => void;
    onRemove: () => void;
    onDuplicate: () => void;
    onToggleDropset: () => void;
    weightUnit?: WeightUnit;
}) {
    const estimatedRM =
        set.weightKg && set.reps
            ? estimateOneRM(parseFloat(set.weightKg), parseInt(set.reps, 10))
            : null;

    return (
        <div className="space-y-0.5">
            {/* Single row for all screen sizes */}
            <div
                className={`grid grid-cols-[1.75rem_1fr_1fr_1fr_auto] gap-1.5 items-center rounded-lg transition-colors ${set.isDropset ? "bg-[var(--secondary)]/60" : ""}`}
            >
                <button
                    onClick={onToggleDropset}
                    className={`text-xs text-center font-mono w-full h-9 rounded transition-colors ${set.isDropset ? "text-[var(--foreground)] font-bold" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                    title={
                        set.isDropset
                            ? "Tap to unmark dropset"
                            : "Tap to mark as dropset"
                    }
                >
                    {set.isDropset ? "↓" : set.setNumber}
                </button>
                <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.weightKg}
                    onChange={(e) => onUpdate("weightKg", e.target.value)}
                    className="h-9 text-sm px-2"
                    min={0}
                    step={0.5}
                />
                <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={set.reps}
                    onChange={(e) => onUpdate("reps", e.target.value)}
                    className="h-9 text-sm px-2"
                    min={1}
                />
                <Select
                    value={set.formRating?.toString() ?? ""}
                    onValueChange={(v) =>
                        onUpdate("formRating", v ? parseInt(v, 10) : null)
                    }
                >
                    <SelectTrigger className="h-9 text-xs px-2">
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
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={onDuplicate}
                        className="p-1 rounded hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        aria-label="Duplicate set"
                        title="Duplicate set"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-1 rounded hover:bg-red-900/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                        aria-label="Remove set"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {estimatedRM && (
                <p className="text-[10px] text-[var(--muted-foreground)] pl-8 pb-0.5">
                    ~{estimatedRM} {weightUnit === "LBS" ? "lbs" : "kg"} est. 1RM
                </p>
            )}
        </div>
    );
}
