import { getActivityFeed } from "@/actions/social";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Dumbbell } from "lucide-react";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations";

const WORKOUT_GROUPS = [
    "Today",
    "Yesterday",
    "Last 3 Days",
    "Last 2 Weeks",
    "Last 3 Months",
    "Older",
] as const;

function utcDateStr(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-CA", { timeZone: "UTC" });
}

function getGroup(date: Date | string) {
    const workoutDay = new Date(utcDateStr(date) + "T00:00:00Z");
    const todayStr = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/New_York",
    });
    const today = new Date(todayStr + "T00:00:00Z");
    const diffDays = Math.round(
        (today.getTime() - workoutDay.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 3) return "Last 3 Days";
    if (diffDays <= 14) return "Last 2 Weeks";
    if (diffDays <= 90) return "Last 3 Months";
    return "Older";
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default async function FeedPage() {
    const feed = await getActivityFeed({ all: true });

    type FeedEntry = (typeof feed)[number];
    const grouped = feed.reduce(
        (acc, item) => {
            const group = getGroup(item.workout.date);
            acc[group] = [...(acc[group] ?? []), item];
            return acc;
        },
        {} as Record<string, FeedEntry[]>,
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/friends">
                    <Button variant="ghost" size="sm" className="-ml-2">
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Friend Activity</h1>
            </div>

            {feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
                    <div className="p-5 rounded-full bg-[var(--secondary)]">
                        <Dumbbell className="h-10 w-10 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">No activity yet</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            Follow some athletes to see their workouts here
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {WORKOUT_GROUPS.filter((g) => grouped[g]?.length).map(
                        (group) => (
                            <div key={group}>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                                        {group}
                                    </h2>
                                    <span className="text-[10px] tabular-nums text-[var(--muted-foreground)]/60">
                                        {grouped[group].length}
                                    </span>
                                    <div className="h-px flex-1 bg-[var(--border)]" />
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                                    {grouped[group].map(
                                        ({ workout, profile }, index) => {
                                            const volume = calculateVolume(
                                                workout.sets,
                                            );
                                            return (
                                                <Link
                                                    key={workout.id}
                                                    href={`/profile/${profile.userId}/workouts/${workout.id}`}
                                                    className="flex items-center gap-3 px-4 py-3 animate-fade-in-up hover:bg-[var(--muted)] transition-colors"
                                                    style={{
                                                        animationDelay: `${index * 50}ms`,
                                                    }}
                                                >
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarFallback className="text-xs bg-[var(--secondary)]">
                                                            {getInitials(
                                                                profile.displayName,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {profile.displayName}
                                                        </p>
                                                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                                                            {workout.name ??
                                                                formatDate(
                                                                    workout.date,
                                                                )}{" "}
                                                            &middot;{" "}
                                                            {formatRelativeDate(
                                                                workout.date,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-medium tabular-nums">
                                                            {Math.round(
                                                                volume,
                                                            ).toLocaleString()}{" "}
                                                            lbs
                                                        </p>
                                                        <p className="text-xs text-[var(--muted-foreground)]">
                                                            {workout.sets.length}{" "}
                                                            sets
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
