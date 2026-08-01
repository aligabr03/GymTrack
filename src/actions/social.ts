"use server";

import { prisma } from "@/lib/prisma";
import { getUserId, getUserMeta } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
    displayName: z.string().trim().min(2).max(50).optional(),
    bio: z.string().trim().max(200).optional(),
    weightUnit: z.enum(["KG", "LBS"]).optional(),
    bodyWeightUnit: z.enum(["KG", "LBS"]).optional(),
});

/** Upserts the current user's profile on first use. */
export async function getOrCreateMyProfile() {
    const { id, name } = await getUserMeta();
    return prisma.userProfile.upsert({
        where: { userId: id },
        update: {},
        create: { userId: id, displayName: name },
    });
}

export async function getMyProfile() {
    const userId = await getUserId();
    return prisma.userProfile.findUnique({ where: { userId } });
}

export async function getMyWeightUnit(): Promise<"KG" | "LBS"> {
    const userId = await getUserId();
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { weightUnit: true },
    });
    const unit = profile?.weightUnit;
    return unit === "LBS" ? "LBS" : "KG";
}

export async function getMyBodyWeightUnit(): Promise<"KG" | "LBS"> {
    const userId = await getUserId();
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { bodyWeightUnit: true },
    });
    const unit = profile?.bodyWeightUnit;
    return unit === "LBS" ? "LBS" : "KG";
}

export async function updateProfile(data: {
    displayName?: string;
    bio?: string;
    weightUnit?: "KG" | "LBS";
    bodyWeightUnit?: "KG" | "LBS";
}) {
    const parsed = updateProfileSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, name } = await getUserMeta();
    const profile = await prisma.userProfile.upsert({
        where: { userId: id },
        update: { ...parsed.data },
        create: {
            userId: id,
            displayName: parsed.data.displayName ?? name,
            bio: parsed.data.bio,
            weightUnit: parsed.data.weightUnit ?? "KG",
            bodyWeightUnit: parsed.data.bodyWeightUnit ?? "KG",
        },
    });
    revalidatePath(`/profile/${id}`);
    revalidatePath("/friends");
    return { success: true, data: profile };
}

export async function getProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
        include: {
            _count: { select: { followers: true, following: true } },
        },
    });
    if (!profile) return null;

    const workouts = await prisma.workout.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 10,
        select: {
            id: true,
            name: true,
            date: true,
            durationMins: true,
            sets: {
                select: {
                    exerciseId: true,
                    exercise: { select: { name: true } },
                    weightKg: true,
                    reps: true,
                },
            },
        },
    });

    return { ...profile, workouts };
}

export async function getAllUsers() {
    const userId = await getUserId();
    const [profiles, myFollowing] = await Promise.all([
        prisma.userProfile.findMany({
            where: { userId: { not: userId } },
            orderBy: { displayName: "asc" },
        }),
        prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        }),
    ]);
    const followingSet = new Set(myFollowing.map((f) => f.followingId));
    return profiles.map((p) => ({
        ...p,
        isFollowing: followingSet.has(p.userId),
    }));
}

export async function followUser(targetUserId: string) {
    const userId = await getUserId();
    if (userId === targetUserId) return { success: false, error: "Cannot follow yourself" };

    const target = await prisma.userProfile.findUnique({
        where: { userId: targetUserId },
        select: { userId: true },
    });
    if (!target) return { success: false, error: "User not found" };

    try {
        await prisma.follow.create({
            data: { followerId: userId, followingId: targetUserId },
        });
        revalidatePath("/friends");
        revalidatePath(`/profile/${targetUserId}`);
        return { success: true };
    } catch (err) {
        console.error("[followUser]", err);
        return { success: false, error: "Failed to follow user" };
    }
}

export async function unfollowUser(targetUserId: string) {
    const userId = await getUserId();
    try {
        await prisma.follow.deleteMany({
            where: { followerId: userId, followingId: targetUserId },
        });
        revalidatePath("/friends");
        revalidatePath(`/profile/${targetUserId}`);
        return { success: true };
    } catch (err) {
        console.error("[unfollowUser]", err);
        return { success: false, error: "Failed to unfollow user" };
    }
}

export async function getFollowStatus(targetUserId: string): Promise<boolean> {
    const userId = await getUserId();
    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: targetUserId,
            },
        },
    });
    return !!follow;
}

export type FeedItem = {
    workout: {
        id: string;
        userId: string;
        name: string | null;
        date: Date;
        durationMins: number | null;
        sets: Array<{
            exerciseId: string;
            exercise: { name: string };
            weightKg: number | null;
            reps: number | null;
        }>;
    };
    profile: {
        userId: string;
        displayName: string;
        bio: string | null;
    };
};

/**
 * Returns workouts from followed users.
 * By default, limited to the last 30 days.
 * Pass `all: true` to get all time (for the "see all" page).
 */
export async function getActivityFeed(options?: {
    all?: boolean;
}): Promise<FeedItem[]> {
    const userId = await getUserId();

    const followRows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });
    const followingIds = followRows.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts = await prisma.workout.findMany({
        where: {
            userId: { in: followingIds },
            ...(options?.all ? {} : { date: { gte: thirtyDaysAgo } }),
        },
        orderBy: { date: "desc" },
        select: {
            id: true,
            userId: true,
            name: true,
            date: true,
            durationMins: true,
            sets: {
                select: {
                    exerciseId: true,
                    exercise: { select: { name: true } },
                    weightKg: true,
                    reps: true,
                },
            },
        },
    });

    const profiles = await prisma.userProfile.findMany({
        where: { userId: { in: followingIds } },
    });
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    return workouts.map((w) => ({
        workout: w,
        profile: profileMap.get(w.userId) ?? {
            userId: w.userId,
            displayName: "Unknown",
            bio: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    }));
}
