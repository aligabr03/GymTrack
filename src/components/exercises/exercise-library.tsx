"use client";

import { useState, useTransition } from "react";
import { createExercise, deleteExercise, updateExercise } from "@/actions/exercises";
import type { Exercise } from "@/types";
import { EXERCISE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, Search, Loader2, Sparkles, Pencil } from "lucide-react";

const MUSCLE_GROUPS = [
    "Chest",
    "Upper Back",
    "Lats",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
    "Quads",
    "Hamstrings",
    "Glutes",
    "Calves",
    "Core",
    "Traps",
];

export function ExerciseLibrary({
    exercises,
    bestWeights = {},
}: {
    exercises: Exercise[];
    bestWeights?: Record<string, { weightKg: number; reps: number } | null>;
}) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // New exercise form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

    // Edit exercise state
    const [editTarget, setEditTarget] = useState<Exercise | null>(null);
    const [editName, setEditName] = useState("");
    const [editMuscles, setEditMuscles] = useState<string[]>([]);
    const [editError, setEditError] = useState<string | null>(null);

    function openEdit(ex: Exercise) {
        setEditTarget(ex);
        setEditName(ex.name);
        setEditMuscles(ex.muscleGroups);
        setEditError(null);
    }

    function toggleEditMuscle(muscle: string) {
        setEditMuscles((prev) =>
            prev.includes(muscle)
                ? prev.filter((m) => m !== muscle)
                : [...prev, muscle],
        );
    }

    function handleEdit() {
        setEditError(null);
        if (!editTarget) return;
        if (!editName.trim()) return setEditError("Name is required");
        if (editMuscles.length === 0)
            return setEditError("Select at least one muscle group");

        startTransition(async () => {
            const result = await updateExercise(editTarget.id, {
                name: editName.trim(),
                muscleGroups: editMuscles,
            });
            if (!result.success) {
                setEditError(result.error ?? "Update failed");
                return;
            }
            toast({ title: "Exercise updated", variant: "success" });
            setEditTarget(null);
        });
    }

    const filtered = exercises.filter((e) => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
        const matchCat =
            categoryFilter === "all" || e.category === categoryFilter;
        return matchSearch && matchCat;
    });

    const grouped = filtered.reduce(
        (acc, ex) => {
            acc[ex.category] = [...(acc[ex.category] ?? []), ex];
            return acc;
        },
        {} as Record<string, Exercise[]>,
    );

    function toggleMuscle(muscle: string) {
        setSelectedMuscles((prev) =>
            prev.includes(muscle)
                ? prev.filter((m) => m !== muscle)
                : [...prev, muscle],
        );
    }

    function handleCreate() {
        setFormError(null);
        if (!name.trim()) return setFormError("Name is required");
        if (!category) return setFormError("Category is required");
        if (selectedMuscles.length === 0)
            return setFormError("Select at least one muscle group");

        startTransition(async () => {
            const result = await createExercise({
                name: name.trim(),
                category,
                muscleGroups: selectedMuscles,
            });
            if (!result.success) {
                setFormError(result.error !== undefined ? result.error : null);
                return;
            }
            toast({ title: "Exercise created", variant: "success" });
            setName("");
            setCategory("");
            setSelectedMuscles([]);
            setOpen(false);
        });
    }

    function handleDelete(id: string, name: string) {
        startTransition(async () => {
            const result = await deleteExercise(id);
            if (!result.success) {
                toast({
                    title: result.error ?? "Delete failed",
                    variant: "destructive",
                });
                return;
            }
            toast({ title: `"${name}" removed` });
        });
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input
                        placeholder="Search exercises…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {EXERCISE_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_12px_var(--primary-glow)]">
                            <Plus className="h-4 w-4" />
                            Add Exercise
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md flex flex-col min-h-[75dvh] md:min-h-0 md:max-h-[85vh]">
                        <DialogHeader>
                            <DialogTitle>Create Custom Exercise</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                            {formError && (
                                <p className="text-sm text-red-400">
                                    {formError}
                                </p>
                            )}
                            <div className="space-y-2">
                                <Label>Exercise Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Bulgarian Split Squat"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={category}
                                    onValueChange={setCategory}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXERCISE_CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Muscle Groups</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {MUSCLE_GROUPS.map((muscle) => (
                                        <div
                                            key={muscle}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={muscle}
                                                checked={selectedMuscles.includes(
                                                    muscle,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleMuscle(muscle)
                                                }
                                            />
                                            <label
                                                htmlFor={muscle}
                                                className="text-sm cursor-pointer"
                                            >
                                                {muscle}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={handleCreate}
                                disabled={isPending}
                                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Create Exercise"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Exercise grid grouped by category */}
            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-20 text-[var(--muted-foreground)]">
                    No exercises found. Add your own with the &quot;Add
                    Exercise&quot; button above.
                </div>
            ) : (
                <div className="space-y-10">
                    {Object.entries(grouped)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([cat, exs]) => (
                            <div key={cat}>
                                {/* Category header */}
                        <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                                    <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--muted-foreground)]">
                                        {cat}
                                    </span>
                                    <span className="inline-flex items-center justify-center h-4 min-w-4 px-1.5 rounded-full bg-[var(--secondary)] text-[10px] tabular-nums text-[var(--muted-foreground)]">
                                        {exs.length}
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
                                </div>

                                {/* Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                    {exs.map((ex) => (
                                        <div
                                            key={ex.id}
                                            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3.5 gap-2 transition-all duration-200 hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/25 hover:shadow-lg hover:shadow-black/20"
                                        >
                                            {/* Custom exercise actions */}
                                            {ex.isCustom && (
                                                <div className="absolute top-2 right-2 flex items-center gap-0.5 z-10">
                                                    <button
                                                        onClick={() => openEdit(ex)}
                                                        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/10 transition-colors"
                                                        aria-label="Edit exercise"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ex.id, ex.name)}
                                                        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        aria-label="Delete exercise"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Name */}
                                            <div className={`flex items-start gap-1 ${ex.isCustom ? "pr-14" : ""}`}>
                                                <p className="text-[13px] sm:text-sm font-semibold leading-snug text-[var(--foreground)] line-clamp-2">
                                                    {ex.name}
                                                </p>
                                                {ex.isCustom && (
                                                    <Sparkles className="h-2.5 w-2.5 shrink-0 mt-0.5 text-[var(--muted-foreground)]" />
                                                )}
                                            </div>

                                            {/* Muscle group pills */}
                                            <div className="flex flex-wrap gap-1">
                                                {ex.muscleGroups.slice(0, 3).map((m) => (
                                                    <span
                                                        key={m}
                                                        className="inline-block px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.07] text-[10px] text-[var(--muted-foreground)] leading-none"
                                                    >
                                                        {m}
                                                    </span>
                                                ))}
                                                {ex.muscleGroups.length > 3 && (
                                                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.07] text-[10px] text-[var(--muted-foreground)] leading-none">
                                                        +{ex.muscleGroups.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Best set */}
                                            {bestWeights[ex.id] && (
                                                <div className="mt-auto flex items-center gap-1.5 pt-2 border-t border-[var(--border)]">
                                                    <span className="text-[var(--primary)] text-[10px]">★</span>
                                                    <span className="text-[11px] font-medium text-[var(--primary)] tabular-nums">
                                                        {bestWeights[ex.id]!.weightKg} lbs × {bestWeights[ex.id]!.reps}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Edit exercise dialog */}
            <Dialog
                open={editTarget !== null}
                onOpenChange={(open) => !open && setEditTarget(null)}
            >
                <DialogContent className="max-w-md flex flex-col min-h-[75dvh] md:min-h-0 md:max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Exercise</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                        {editError && (
                            <p className="text-sm text-red-400">{editError}</p>
                        )}
                        <div className="space-y-2">
                            <Label>Exercise Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="e.g. Bulgarian Split Squat"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Muscle Groups</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                {MUSCLE_GROUPS.map((muscle) => (
                                    <div
                                        key={muscle}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            id={`edit-${muscle}`}
                                            checked={editMuscles.includes(
                                                muscle,
                                            )}
                                            onCheckedChange={() =>
                                                toggleEditMuscle(muscle)
                                            }
                                        />
                                        <label
                                            htmlFor={`edit-${muscle}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {muscle}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                            onClick={handleEdit}
                            disabled={isPending}
                            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
