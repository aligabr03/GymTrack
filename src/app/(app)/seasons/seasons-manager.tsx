"use client";

import { useState, useTransition } from "react";
import type { Season } from "@/types";
import { createSeason, updateSeason, deleteSeason } from "@/actions/seasons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Loader2, CalendarDays, Dumbbell } from "lucide-react";
import { toESTDateStr, toStoredDateStr, formatDate } from "@/lib/utils";

type SeasonWithCount = Season & { _count: { workouts: number } };

export function SeasonsManager({
    initialSeasons,
}: {
    initialSeasons: SeasonWithCount[];
}) {
    const [seasons, setSeasons] = useState<SeasonWithCount[]>(initialSeasons);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState<SeasonWithCount | null>(null);
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    function openCreate() {
        setEditingSeason(null);
        setName("");
        setDescription("");
        setStartDate(toESTDateStr(new Date()));
        setEndDate("");
        setDialogOpen(true);
    }

    function openEdit(season: SeasonWithCount) {
        setEditingSeason(season);
        setName(season.name);
        setDescription(season.description ?? "");
        setStartDate(toStoredDateStr(season.startDate));
        setEndDate(season.endDate ? toStoredDateStr(season.endDate) : "");
        setDialogOpen(true);
    }

    function handleSave() {
        if (!name.trim()) return;

        startTransition(async () => {
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                startDate,
                endDate: endDate || null,
            };

            const result = editingSeason
                ? await updateSeason(editingSeason.id, payload)
                : await createSeason(payload);

            if (!result.success) {
                toast({
                    title: result.error ?? "Failed to save season",
                    variant: "destructive",
                });
                return;
            }

            if (editingSeason) {
                setSeasons((prev) =>
                    prev.map((s) =>
                        s.id === editingSeason.id
                            ? { ...s, ...result.data!, _count: s._count }
                            : s,
                    ),
                );
            } else {
                setSeasons((prev) => [
                    {
                        ...result.data!,
                        _count: { workouts: 0 },
                    },
                    ...prev,
                ]);
            }

            setDialogOpen(false);
            toast({
                title: editingSeason ? "Season updated" : "Season created",
                variant: "success",
            });
        });
    }

    function handleDelete(season: SeasonWithCount) {
        if (!confirm(`Delete "${season.name}"? Workouts assigned to it will become unassigned.`)) return;

        startTransition(async () => {
            const result = await deleteSeason(season.id);
            if (!result.success) {
                toast({
                    title: result.error ?? "Failed to delete season",
                    variant: "destructive",
                });
                return;
            }

            setSeasons((prev) => prev.filter((s) => s.id !== season.id));
            toast({ title: "Season deleted", variant: "success" });
        });
    }

    return (
        <div className="space-y-6">
            {/* Desktop header */}
            <div className="hidden md:flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white/[0.06]">
                        <CalendarDays className="h-6 w-6 text-[var(--foreground)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Seasons</h1>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {seasons.length} season{seasons.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Create Season
                </Button>
            </div>

            {/* Mobile create button */}
            <Button onClick={openCreate} className="w-full md:hidden">
                <Plus className="h-4 w-4" />
                Create Season
            </Button>

            {seasons.length === 0 ? (
                <div className="glass rounded-2xl flex flex-col items-center justify-center text-center py-16 gap-3">
                    <CalendarDays className="h-8 w-8 text-[var(--muted-foreground)] opacity-40" />
                    <p className="text-sm text-[var(--muted-foreground)]">
                        No seasons yet. Create one to group workouts for focused comparisons.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {seasons.map((season) => (
                        <Card key={season.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold truncate">
                                                {season.name}
                                            </h3>
                                            <Badge variant="secondary" className="text-xs">
                                                <Dumbbell className="h-3 w-3 mr-1" />
                                                {season._count.workouts} workout
                                                {season._count.workouts !== 1 ? "s" : ""}
                                            </Badge>
                                        </div>
                                        {season.description && (
                                            <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                                                {season.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-[var(--muted-foreground)]">
                                            {formatDate(season.startDate)}
                                            {season.endDate
                                                ? ` — ${formatDate(season.endDate)}`
                                                : " — ongoing"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => openEdit(season)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleDelete(season)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingSeason ? "Edit Season" : "Create Season"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="e.g. Summer 2026 Cut"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Input
                                placeholder="Brief description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Start date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full max-w-full min-w-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End date (optional)</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full max-w-full min-w-0"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!name.trim() || !startDate || isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving…
                                    </>
                                ) : editingSeason ? (
                                    "Save Changes"
                                ) : (
                                    "Create Season"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
