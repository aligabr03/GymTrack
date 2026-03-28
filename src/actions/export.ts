"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUserId(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user.id;
}

export async function exportUserData() {
    const userId = await getUserId();

    const [profile, workouts, bodyMetrics, personalRecords, workoutTemplates, customExercises] =
        await Promise.all([
            prisma.userProfile.findUnique({
                where: { userId },
            }),
            prisma.workout.findMany({
                where: { userId },
                orderBy: { date: "desc" },
                include: {
                    sets: {
                        include: {
                            exercise: {
                                select: {
                                    id: true,
                                    name: true,
                                    category: true,
                                    muscleGroups: true,
                                },
                            },
                        },
                        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
                    },
                },
            }),
            prisma.bodyMetric.findMany({
                where: { userId },
                orderBy: { date: "desc" },
            }),
            prisma.personalRecord.findMany({
                where: { userId },
                include: {
                    exercise: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        },
                    },
                },
            }),
            prisma.workoutTemplate.findMany({
                where: { userId },
                include: {
                    exercises: {
                        include: {
                            exercise: {
                                select: {
                                    id: true,
                                    name: true,
                                    category: true,
                                    muscleGroups: true,
                                },
                            },
                        },
                        orderBy: { order: "asc" },
                    },
                },
            }),
            prisma.exercise.findMany({
                where: { userId, isCustom: true },
            }),
        ]);

    return {
        exportedAt: new Date().toISOString(),
        profile,
        workouts,
        bodyMetrics,
        personalRecords,
        workoutTemplates,
        customExercises,
    };
}
