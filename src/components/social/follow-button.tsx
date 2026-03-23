"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/actions/social";

export function FollowButton({
    targetUserId,
    initialIsFollowing,
}: {
    targetUserId: string;
    initialIsFollowing: boolean;
}) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, startTransition] = useTransition();

    function toggle() {
        startTransition(async () => {
            if (isFollowing) {
                await unfollowUser(targetUserId);
                setIsFollowing(false);
            } else {
                await followUser(targetUserId);
                setIsFollowing(true);
            }
        });
    }

    return (
        <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={toggle}
            disabled={isPending}
            className={isFollowing
                ? "border-[var(--border)] text-[var(--muted-foreground)] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
                : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_8px_var(--primary-glow)]"
            }
        >
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
}
