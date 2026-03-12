"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    createWorkout,
    updateWorkout,
    getLastSetsForExercise,
} from "@/actions/workouts";
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
            sets,
            collapsed: false,
            supersetGroupId: supersetMap.get(exerciseId) ?? null,
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

        // New exercise — close sheet immediately, then fetch last session in background
        setAddExOpen(false);
        setExerciseSearch("");
        setGroups((prev) => [
            ...prev,
            {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                sets: [makeSet(exercise.id, exercise.name, 1)],
                collapsed: false,
                supersetGroupId: null,
            },
        ]);

        // Pre-fill with last session data
        startTransition(async () => {
            try {
                const lastSets = await getLastSetsForExercise(exercise.id);
                if (lastSets.length === 0) return;
                setGroups((prev) =>
                    prev.map((g) =>
                        g.exerciseId === exercise.id
                            ? {
                                  ...g,
                                  sets: lastSets.map((s, i) => ({
                                      id: makeId(),
                                      exerciseId: exercise.id,
                                      exerciseName: exercise.name,
                                      setNumber: i + 1,
                                      weightKg: s.weightKg?.toString() ?? "",
                                      reps: s.reps?.toString() ?? "",
                                      formRating: s.formRating,
                                      rpe: s.rpe?.toString() ?? "",
                                      notes: "",
                                      isDropset: false,
                                  })),
                              }
                            : g,
                    ),
                );
            } catch {
                // ignore — blank sets are already showing
            }
        });
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
        const allSets = groups.flatMap((g) =>
            g.sets.map((s) => ({
                exerciseId: s.exerciseId,
                setNumber: s.setNumber,
                weightKg: s.weightKg ? parseFloat(s.weightKg) : null,
                reps: s.reps ? parseInt(s.reps, 10) : null,
                formRating: s.formRating,
                rpe: s.rpe ? parseFloat(s.rpe) : null,
                notes: s.notes || null,
                isDropset: s.isDropset,
                supersetId: g.supersetGroupId,
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
                            otherGroups={groups.filter(
                                (g) => g.exerciseId !== item.group.exerciseId,
                            )}
                            onAddSet={() => addSet(item.group.exerciseId)}
                            onAddDropSet={() =>
                                addDropSet(item.group.exerciseId)
                            }
                            onRemoveSet={(setId) =>
                                removeSet(item.group.exerciseId, setId)
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
                                        otherGroups={groups.filter(
                                            (g) =>
                                                g.exerciseId !==
                                                group.exerciseId,
                                        )}
                                        onAddSet={() =>
                                            addSet(group.exerciseId)
                                        }
                                        onAddDropSet={() =>
                                            addDropSet(group.exerciseId)
                                        }
                                        onRemoveSet={(setId) =>
                                            removeSet(group.exerciseId, setId)
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
    otherGroups,
    onAddSet,
    onAddDropSet,
    onRemoveSet,
    onRemoveExercise,
    onUpdateSet,
    onToggleCollapse,
    onToggleDropset,
    onLinkSuperset,
    onUnlinkSuperset,
}: {
    group: ExerciseGroup;
    otherGroups: ExerciseGroup[];
    onAddSet: () => void;
    onAddDropSet: () => void;
    onRemoveSet: (setId: string) => void;
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
}) {
    const [supersetPickerOpen, setSupersetPickerOpen] = useState(false);

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
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
                    {/* Header row - hidden on mobile, shown on md+ */}
                    <div className="hidden md:grid grid-cols-[2rem_1fr_1fr_1fr_1fr_2rem] gap-2 text-xs text-[var(--muted-foreground)] px-1 pb-1">
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
    onToggleDropset,
}: {
    set: SetRow;
    onUpdate: (field: keyof SetRow, value: string | number | null) => void;
    onRemove: () => void;
    onToggleDropset: () => void;
}) {
    const estimatedRM =
        set.weightKg && set.reps
            ? estimateOneRM(parseFloat(set.weightKg), parseInt(set.reps, 10))
            : null;

    return (
        <div className="space-y-1">
            {/* Desktop: single row grid */}
            <div
                className={`hidden md:grid grid-cols-[2rem_1fr_1fr_1fr_1fr_2rem] gap-2 items-center rounded-lg transition-colors ${set.isDropset ? "bg-[var(--secondary)]/60" : ""}`}
            >
                <button
                    onClick={onToggleDropset}
                    className={`text-xs text-center font-mono w-full h-8 rounded transition-colors ${set.isDropset ? "text-[var(--foreground)] font-bold" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                    title={
                        set.isDropset
                            ? "Click to unmark dropset"
                            : "Click to mark as dropset"
                    }
                >
                    {set.isDropset ? "↓" : set.setNumber}
                </button>
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

            {/* Mobile: compact card layout */}
            <div
                className={`md:hidden rounded-xl p-3 space-y-2 transition-colors ${set.isDropset ? "bg-[var(--secondary)]" : "bg-[var(--secondary)]/50"}`}
            >
                <div className="flex items-center justify-between">
                    <button
                        onClick={onToggleDropset}
                        className={`text-xs font-medium px-2 py-0.5 rounded-lg transition-colors ${set.isDropset ? "bg-[var(--border)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--border)]"}`}
                        title={
                            set.isDropset
                                ? "Tap to unmark dropset"
                                : "Tap to mark as dropset"
                        }
                    >
                        {set.isDropset ? `↓ Drop` : `Set ${set.setNumber}`}
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-1.5 -mr-1 rounded-lg hover:bg-red-900/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                        aria-label="Remove set"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                            Weight (lbs)
                        </label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={set.weightKg}
                            onChange={(e) =>
                                onUpdate("weightKg", e.target.value)
                            }
                            className="h-10 text-sm"
                            min={0}
                            step={0.5}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                            Reps
                        </label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={set.reps}
                            onChange={(e) => onUpdate("reps", e.target.value)}
                            className="h-10 text-sm"
                            min={1}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                            Form
                        </label>
                        <Select
                            value={set.formRating?.toString() ?? ""}
                            onValueChange={(v) =>
                                onUpdate(
                                    "formRating",
                                    v ? parseInt(v, 10) : null,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 text-xs">
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
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                            RPE
                        </label>
                        <Input
                            type="number"
                            placeholder="—"
                            value={set.rpe}
                            onChange={(e) => onUpdate("rpe", e.target.value)}
                            className="h-10 text-sm"
                            min={1}
                            max={10}
                            step={0.5}
                        />
                    </div>
                </div>
            </div>

            {estimatedRM && (
                <p className="text-xs text-[var(--muted-foreground)] pl-2 md:pl-10">
                    ~{estimatedRM} lbs est. 1RM
                </p>
            )}
        </div>
    );
}
