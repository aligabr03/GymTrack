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
        >
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
}
