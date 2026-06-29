"use client";

import type { Season } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

const NONE_VALUE = "__none__";

export function SeasonSelector({
    value,
    onChange,
    seasons = [],
}: {
    value: string;
    onChange: (seasonId: string) => void;
    seasons?: Season[];
}) {
    const selectValue = value || NONE_VALUE;

    function handleChange(v: string) {
        onChange(v === NONE_VALUE ? "" : v);
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--foreground)]">
                    Season
                </label>
                {seasons.length === 0 && (
                    <Link
                        href="/seasons"
                        className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        Create a season
                    </Link>
                )}
            </div>
            <Select value={selectValue} onValueChange={handleChange}>
                <SelectTrigger className={seasons.length === 0 ? "text-[var(--muted-foreground)]" : ""}>
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-[var(--muted-foreground)]" />
                    <SelectValue placeholder="None (all-time)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE_VALUE}>None (all-time)</SelectItem>
                    {seasons.map((season) => (
                        <SelectItem key={season.id} value={season.id}>
                            {season.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
