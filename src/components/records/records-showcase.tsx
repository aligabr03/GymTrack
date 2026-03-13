"use client";

import { useMemo, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

type RecordItem = {
    id: string;
    weightKg: number;
    reps: number;
    estimatedOneRM: number;
    achievedAt: Date;
    exercise: {
        name: string;
        category: string;
    };
};

export function RecordsShowcase({ records }: { records: RecordItem[] }) {
    const [category, setCategory] = useState("all");
    const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(
        null,
    );

    const categories = useMemo(
        () =>
            [
                ...new Set(records.map((record) => record.exercise.category)),
            ].sort(),
        [records],
    );

    const filtered = useMemo(
        () =>
            category === "all"
                ? records
                : records.filter(
                      (record) => record.exercise.category === category,
                  ),
        [category, records],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                    Trophy Case
                </p>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-14 text-[var(--muted-foreground)]">
                    No records in this category yet.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((record, index) => {
                        const topRank = index + 1;
                        const isTop3 = topRank <= 3;

                        return (
                            <button
                                key={record.id}
                                type="button"
                                onClick={() => setSelectedRecord(record)}
                                className="text-left"
                            >
                                <Card
                                    className={`relative overflow-hidden aspect-square animate-fade-in-up cursor-pointer transition-transform hover:scale-[1.01] ${
                                        isTop3 ? "border-amber-400/40" : ""
                                    }`}
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    {isTop3 && (
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine-sweep" />
                                    )}
                                    <CardContent className="p-4 h-full flex flex-col justify-between">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate">
                                                    {record.exercise.name}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] mt-1"
                                                >
                                                    {record.exercise.category}
                                                </Badge>
                                            </div>
                                            {isTop3 ? (
                                                <Medal className="h-5 w-5 text-amber-300 shrink-0" />
                                            ) : (
                                                <Trophy className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
                                            )}
                                        </div>

                                        <div className="space-y-1 mt-2">
                                            <p className="text-lg font-bold tabular-nums">
                                                {record.estimatedOneRM.toFixed(
                                                    1,
                                                )}{" "}
                                                lbs
                                            </p>
                                            <p className="text-xs text-[var(--muted-foreground)]">
                                                Est. 1RM
                                            </p>
                                            <p className="text-xs text-[var(--muted-foreground)]">
                                                {record.weightKg} lbs x{" "}
                                                {record.reps} reps
                                            </p>
                                            <p className="text-[10px] text-[var(--muted-foreground)] pt-1 uppercase tracking-wider">
                                                {formatDate(record.achievedAt)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </button>
                        );
                    })}
                </div>
            )}

            <Dialog
                open={Boolean(selectedRecord)}
                onOpenChange={(open) => {
                    if (!open) setSelectedRecord(null);
                }}
            >
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
                    <DialogPrimitive.Content
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-10 duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 outline-none"
                        onClick={() => setSelectedRecord(null)}
                    >
                        <DialogTitle className="sr-only">
                            Record details
                        </DialogTitle>
                        {selectedRecord && (
                            <Card className="relative w-full max-w-xl border-amber-400/40 overflow-hidden">
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shine-sweep z-0" />
                                <CardContent className="p-8 md:p-10 space-y-6 relative z-10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-2xl md:text-3xl font-bold">
                                                {selectedRecord.exercise.name}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="mt-2"
                                            >
                                                {selectedRecord.exercise.category}
                                            </Badge>
                                        </div>
                                        <Trophy className="h-10 w-10 text-amber-300 shrink-0" />
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-4xl md:text-5xl font-bold tabular-nums leading-none">
                                            {selectedRecord.estimatedOneRM.toFixed(1)}
                                            <span className="text-xl md:text-2xl ml-2 text-[var(--muted-foreground)]">
                                                lbs
                                            </span>
                                        </p>
                                        <p className="text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
                                            Estimated 1RM
                                        </p>
                                        <p className="text-lg text-[var(--muted-foreground)]">
                                            {selectedRecord.weightKg} lbs &times;{" "}
                                            {selectedRecord.reps} reps
                                        </p>
                                        <p className="text-sm text-[var(--muted-foreground)]">
                                            Achieved on{" "}
                                            <strong className="text-[var(--foreground)]">
                                                {formatDate(selectedRecord.achievedAt)}
                                            </strong>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </Dialog>
        </div>
    );
}
