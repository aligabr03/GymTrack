"use client";

import { useState, useTransition } from "react";
import { createExercise, deleteExercise } from "@/actions/exercises";
import type { Exercise } from "@/types";
import { EXERCISE_CATEGORIES } from "@/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";

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

export function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // New exercise form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

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
                        <Button>
                            <Plus className="h-4 w-4" />
                            Add Exercise
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create Custom Exercise</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
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
                                className="w-full"
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

            {/* Exercise list grouped by category */}
            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-16 text-[var(--muted-foreground)]">
                    No exercises found. Add your own with the &quot;Add
                    Exercise&quot; button above.
                </div>
            ) : (
                Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([cat, exs]) => (
                        <div key={cat}>
                            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                                {cat}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {exs.map((ex) => (
                                    <Card
                                        key={ex.id}
                                        className={`group ${ex.isCustom ? "border-[var(--primary)]/40 bg-[var(--primary)]/5" : ""}`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {ex.name}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {ex.muscleGroups
                                                            .slice(0, 3)
                                                            .map((m) => (
                                                                <Badge
                                                                    key={m}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {m}
                                                                </Badge>
                                                            ))}
                                                    </div>
                                                </div>
                                                {ex.isCustom && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                ex.id,
                                                                ex.name,
                                                            )
                                                        }
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-900/40 text-[var(--muted-foreground)] hover:text-red-400 transition-all"
                                                        aria-label="Delete exercise"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {ex.isCustom && (
                                                <Badge
                                                    variant="outline"
                                                    className="mt-2 text-xs"
                                                >
                                                    Custom
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}
