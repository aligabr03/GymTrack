"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/actions/social";
import { toast } from "@/components/ui/use-toast";

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
            const result = isFollowing
                ? await unfollowUser(targetUserId)
                : await followUser(targetUserId);
            if (!result.success) {
                toast({
                    title: result.error ?? "Action failed",
                    variant: "destructive",
                });
                return;
            }
            setIsFollowing(!isFollowing);
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
