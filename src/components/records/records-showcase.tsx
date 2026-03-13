"use client";

import { useMemo, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                            <Card
                                key={record.id}
                                className={`relative overflow-hidden aspect-square animate-fade-in-up ${
                                    isTop3 ? "border-amber-400/40" : ""
                                }`}
                                style={{ animationDelay: `${index * 50}ms` }}
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
                                            {record.estimatedOneRM.toFixed(1)}{" "}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}
