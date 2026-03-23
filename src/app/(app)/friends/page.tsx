import { getOrCreateMyProfile, getActivityFeed, getAllUsers } from "@/actions/social";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, ChevronRight, Dumbbell } from "lucide-react";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations";
import { FollowButton } from "@/components/social/follow-button";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default async function FriendsPage() {
    await getOrCreateMyProfile();

    const [feed, users] = await Promise.all([
        getActivityFeed(),
        getAllUsers(),
    ]);

    return (
        <div className="space-y-8">
            {/* Desktop header */}
            <div className="hidden md:flex items-center gap-3 animate-fade-in">
                <div className="p-2.5 rounded-lg bg-[var(--secondary)]">
                    <Users className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Friends</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Activity &amp; people
                    </p>
                </div>
            </div>

            {/* Activity Feed — last 30 days */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Activity Feed</h2>
                    {feed.length > 0 && (
                        <Link
                            href="/friends/feed"
                            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
                        >
                            See all <ChevronRight className="h-3 w-3" />
                        </Link>
                    )}
                </div>

                {feed.length === 0 ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
                        <Dumbbell className="h-8 w-8 text-[var(--muted-foreground)]/40 mx-auto mb-3" />
                        <p className="text-sm font-medium">No activity yet</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            Follow some athletes below to see their workouts here
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                        {feed.map(({ workout, profile }) => {
                            const volume = calculateVolume(workout.sets);
                            return (
                                <Link
                                    key={workout.id}
                                    href={`/profile/${profile.userId}/workouts/${workout.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors"
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
                                                formatDate(workout.date)}{" "}
                                            &middot;{" "}
                                            {formatRelativeDate(workout.date)}
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
                                            {workout.sets.length} sets
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* All Users */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Athletes</h2>
                {users.length === 0 ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
                        <Users className="h-8 w-8 text-[var(--muted-foreground)]/40 mx-auto mb-3" />
                        <p className="text-sm font-medium">
                            No other athletes yet
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            Invite your gym buddies to join GymTrack
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                        {users.map((u) => (
                            <div
                                key={u.userId}
                                className="flex items-center gap-3 px-4 py-3"
                            >
                                <Link
                                    href={`/profile/${u.userId}`}
                                    className="flex items-center gap-3 flex-1 min-w-0"
                                >
                                    <Avatar className="h-9 w-9 shrink-0">
                                        <AvatarFallback className="text-xs bg-[var(--secondary)]">
                                            {getInitials(u.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium truncate">
                                        {u.displayName}
                                    </span>
                                </Link>
                                <FollowButton
                                    targetUserId={u.userId}
                                    initialIsFollowing={u.isFollowing}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
