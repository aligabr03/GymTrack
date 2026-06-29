"use client";

import { useEffect, useState } from "react";
import type { Season } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getSeasons } from "@/actions/seasons";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export function SeasonSelector({
    value,
    onChange,
}: {
    value: string;
    onChange: (seasonId: string) => void;
}) {
    const [seasons, setSeasons] = useState<Season[]>([]);

    useEffect(() => {
        getSeasons().then(setSeasons).catch(() => setSeasons([]));
    }, []);

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
            <Select
                value={value}
                onValueChange={onChange}
            >
                <SelectTrigger className={seasons.length === 0 ? "text-[var(--muted-foreground)]" : ""}>
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-[var(--muted-foreground)]" />
                    <SelectValue placeholder="None (all-time)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">None (all-time)</SelectItem>
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
