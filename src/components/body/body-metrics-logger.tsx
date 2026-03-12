"use client";

import { useState, useTransition } from "react";
import { createBodyMetric, deleteBodyMetric } from "@/actions/body-metrics";
import type { BodyMetric } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { formatRelativeDate } from "@/lib/utils";
import {
    Plus,
    Trash2,
    Loader2,
    Scale,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

type FormData = {
    date: string;
    weightKg: string;
    bodyFatPct: string;
    waistCm: string;
    hipCm: string;
    chestCm: string;
    armCm: string;
    notes: string;
};

const initialForm: FormData = {
    date: new Date().toISOString().split("T")[0],
    weightKg: "",
    bodyFatPct: "",
    waistCm: "",
    hipCm: "",
    chestCm: "",
    armCm: "",
    notes: "",
};

export function BodyMetricsLogger({ metrics }: { metrics: BodyMetric[] }) {
    const [form, setForm] = useState<FormData>(initialForm);
    const [showForm, setShowForm] = useState(metrics.length === 0);
    const [isPending, startTransition] = useTransition();

    function field(key: keyof FormData) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value }));
    }

    function handleSave() {
        const data = {
            date: form.date,
            weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
            bodyFatPct: form.bodyFatPct ? parseFloat(form.bodyFatPct) : null,
            waistCm: form.waistCm ? parseFloat(form.waistCm) : null,
            hipCm: form.hipCm ? parseFloat(form.hipCm) : null,
            chestCm: form.chestCm ? parseFloat(form.chestCm) : null,
            armCm: form.armCm ? parseFloat(form.armCm) : null,
            notes: form.notes || null,
        };

        const hasData = Object.entries(data).some(
            ([k, v]) => k !== "date" && k !== "notes" && v !== null,
        );

        if (!hasData) {
            toast({
                title: "Enter at least one measurement",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const result = await createBodyMetric(data);
            if (!result.success) {
                toast({
                    title: result.error ?? "Save failed",
                    variant: "destructive",
                });
                return;
            }
            toast({ title: "Metrics saved!", variant: "success" });
            setForm(initialForm);
            setShowForm(false);
        });
    }

    function handleDelete(id: string) {
        if (!confirm("Delete this entry?")) return;
        startTransition(async () => {
            const result = await deleteBodyMetric(id);
            if (!result.success) {
                toast({
                    title: result.error ?? "Delete failed",
                    variant: "destructive",
                });
            } else {
                toast({ title: "Entry deleted" });
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Log button / form */}
            <div>
                {!showForm ? (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4" />
                        Log Body Metrics
                    </Button>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                New Entry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={form.date}
                                        onChange={field("date")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weight (kg)</Label>
                                    <Input
                                        type="number"
                                        placeholder="75.5"
                                        value={form.weightKg}
                                        onChange={field("weightKg")}
                                        step={0.1}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Body Fat (%)</Label>
                                    <Input
                                        type="number"
                                        placeholder="15.0"
                                        value={form.bodyFatPct}
                                        onChange={field("bodyFatPct")}
                                        step={0.1}
                                        min={1}
                                        max={70}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Waist (cm)</Label>
                                    <Input
                                        type="number"
                                        placeholder="80"
                                        value={form.waistCm}
                                        onChange={field("waistCm")}
                                        step={0.5}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hip (cm)</Label>
                                    <Input
                                        type="number"
                                        placeholder="95"
                                        value={form.hipCm}
                                        onChange={field("hipCm")}
                                        step={0.5}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Chest (cm)</Label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={form.chestCm}
                                        onChange={field("chestCm")}
                                        step={0.5}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Arm (cm)</Label>
                                    <Input
                                        type="number"
                                        placeholder="38"
                                        value={form.armCm}
                                        onChange={field("armCm")}
                                        step={0.5}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Notes</Label>
                                    <Input
                                        placeholder="Feeling lean today…"
                                        value={form.notes}
                                        onChange={field("notes")}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setForm(initialForm);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* History table */}
            {metrics.length === 0 ? (
                <div className="text-center py-16 text-[var(--muted-foreground)]">
                    <Scale className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No body metrics logged yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">History</h2>
                    {metrics.map((m) => (
                        <Card key={m.id} className="group">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {formatRelativeDate(m.date)}
                                        </p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            {m.weightKg && (
                                                <MetricPill
                                                    label="Weight"
                                                    value={`${m.weightKg} kg`}
                                                />
                                            )}
                                            {m.bodyFatPct && (
                                                <MetricPill
                                                    label="BF%"
                                                    value={`${m.bodyFatPct}%`}
                                                />
                                            )}
                                            {m.waistCm && (
                                                <MetricPill
                                                    label="Waist"
                                                    value={`${m.waistCm} cm`}
                                                />
                                            )}
                                            {m.hipCm && (
                                                <MetricPill
                                                    label="Hip"
                                                    value={`${m.hipCm} cm`}
                                                />
                                            )}
                                            {m.chestCm && (
                                                <MetricPill
                                                    label="Chest"
                                                    value={`${m.chestCm} cm`}
                                                />
                                            )}
                                            {m.armCm && (
                                                <MetricPill
                                                    label="Arm"
                                                    value={`${m.armCm} cm`}
                                                />
                                            )}
                                        </div>
                                        {m.notes && (
                                            <p className="text-xs text-[var(--muted-foreground)] mt-2">
                                                {m.notes}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(m.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-900/40 text-[var(--muted-foreground)] hover:text-red-400 transition-all"
                                        aria-label="Delete entry"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function MetricPill({ label, value }: { label: string; value: string }) {
    return (
        <span className="text-xs">
            <span className="text-[var(--muted-foreground)]">{label}: </span>
            <span className="font-semibold">{value}</span>
        </span>
    );
}
