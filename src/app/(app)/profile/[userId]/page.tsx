import {
    getProfile,
    getFollowStatus,
    getOrCreateMyProfile,
} from "@/actions/social";
import { getWorkoutCalendar } from "@/actions/insights";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, ChevronRight } from "lucide-react";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import { calculateVolume, formatVolume } from "@/lib/calculations";
import { FollowButton } from "@/components/social/follow-button";
import { SetPageTitle } from "@/components/layout/page-title-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutCalendar } from "@/components/insights/workout-calendar";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // Ensure the logged-in viewer has a profile
    let viewerWeightUnit: "KG" | "LBS" = "KG";
    if (currentUserId) {
        const viewerProfile = await getOrCreateMyProfile();
        viewerWeightUnit = (viewerProfile.weightUnit as "KG" | "LBS") ?? "KG";
    }

    const profile = await getProfile(userId);
    if (!profile) notFound();

    const isOwnProfile = currentUserId === userId;

    const year = new Date().getFullYear();
    const [isFollowing, calendarData] = await Promise.all([
        currentUserId && !isOwnProfile
            ? getFollowStatus(userId)
            : Promise.resolve(false as const),
        getWorkoutCalendar(year, userId).catch(() => ({} as Record<string, { id: string; name: string | null }[]>)),
    ]);

    return (
        <div className="space-y-6 max-w-2xl">
            <SetPageTitle title="" />
            {/* Profile header */}
            <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 shrink-0">
                    <AvatarFallback className="text-lg bg-[var(--secondary)]">
                        {getInitials(profile.displayName)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl font-bold">
                            {profile.displayName}
                        </h1>
                        {isOwnProfile ? (
                            <Link href="/profile/edit">
                                <Button variant="outline" size="sm">
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit profile
                                </Button>
                            </Link>
                        ) : (
                            currentUserId && (
                                <FollowButton
                                    targetUserId={userId}
                                    initialIsFollowing={isFollowing}
                                />
                            )
                        )}
                    </div>
                    {profile.bio && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            {profile.bio}
                        </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>
                            <strong>{profile._count.followers}</strong>{" "}
                            <span className="text-[var(--muted-foreground)]">
                                followers
                            </span>
                        </span>
                        <span>
                            <strong>{profile._count.following}</strong>{" "}
                            <span className="text-[var(--muted-foreground)]">
                                following
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Workout Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        {year} Workout Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <WorkoutCalendar
                        year={year}
                        data={calendarData}
                        workoutPathPrefix={
                            isOwnProfile
                                ? "/workouts"
                                : `/profile/${userId}/workouts`
                        }
                    />
                </CardContent>
            </Card>

            {/* Recent Workouts */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Recent Workouts</h2>
                {profile.workouts.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">
                        No workouts logged yet.
                    </p>
                ) : (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                        {profile.workouts.map((workout) => {
                            const volume = calculateVolume(workout.sets);
                            const exercises = [
                                ...new Set(
                                    workout.sets.map((s) => s.exercise.name),
                                ),
                            ].slice(0, 3);
                            const extra =
                                [
                                    ...new Set(
                                        workout.sets.map((s) => s.exerciseId),
                                    ),
                                ].length - exercises.length;
                            const href = isOwnProfile
                                ? `/workouts/${workout.id}`
                                : `/profile/${userId}/workouts/${workout.id}`;
                            return (
                                <Link
                                    key={workout.id}
                                    href={href}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {workout.name ??
                                                formatDate(workout.date)}
                                        </p>
                                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                                            {formatRelativeDate(workout.date)}
                                            {exercises.length > 0 &&
                                                ` · ${exercises.join(", ")}${extra > 0 ? ` +${extra}` : ""}`}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-medium tabular-nums">
                                            {formatVolume(volume, viewerWeightUnit)}
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
        </div>
    );
}
