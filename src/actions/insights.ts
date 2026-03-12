"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getWeekBoundaries } from "@/lib/calculations";

async function getUserId(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user.id;
}

export async function getDashboardStats() {
    const userId = await getUserId();
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [
        totalWorkouts,
        workoutsThisWeek,
        workoutsThisMonth,
        recentWorkouts,
        personalRecords,
        latestMetric,
    ] = await Promise.all([
        prisma.workout.count({ where: { userId } }),
        prisma.workout.count({ where: { userId, date: { gte: oneWeekAgo } } }),
        prisma.workout.count({ where: { userId, date: { gte: oneMonthAgo } } }),
        prisma.workout.findMany({
            where: { userId },
            include: {
                sets: { include: { exercise: true } },
            },
            orderBy: { date: "desc" },
            take: 5,
        }),
        prisma.personalRecord.findMany({
            where: { userId },
            include: { exercise: true },
            orderBy: { achievedAt: "desc" },
            take: 5,
        }),
        prisma.bodyMetric.findFirst({
            where: { userId },
            orderBy: { date: "desc" },
        }),
    ]);

    return {
        totalWorkouts,
        workoutsThisWeek,
        workoutsThisMonth,
        recentWorkouts,
        personalRecords,
        latestMetric,
    };
}

export async function getProgressionData(exerciseId: string) {
    const userId = await getUserId();

    const sets = await prisma.workoutSet.findMany({
        where: {
            exerciseId,
            workout: { userId },
            weightKg: { not: null },
            reps: { not: null },
        },
        include: { workout: { select: { date: true } } },
        orderBy: { workout: { date: "asc" } },
    });

    return sets.map((s) => ({
        date: s.workout.date.toISOString().split("T")[0],
        weightKg: s.weightKg,
        reps: s.reps,
        setNumber: s.setNumber,
    }));
}

export async function getVolumeByWeek(weeks = 12) {
    const userId = await getUserId();
    const boundaries = getWeekBoundaries(weeks);

    const result = await Promise.all(
        boundaries.map(async ({ start, end }) => {
            const sets = await prisma.workoutSet.findMany({
                where: {
                    workout: { userId, date: { gte: start, lte: end } },
                    weightKg: { not: null },
                    reps: { not: null },
                },
            });

            const volume = sets.reduce((sum, s) => {
                if (!s.weightKg || !s.reps) return sum;
                return sum + s.weightKg * s.reps;
            }, 0);

            return {
                week: start.toISOString().split("T")[0],
                volume: Math.round(volume),
                sets: sets.length,
            };
        }),
    );

    return result;
}

export async function getPersonalRecords() {
    const userId = await getUserId();

    return prisma.personalRecord.findMany({
        where: { userId },
        include: { exercise: true },
        orderBy: { estimatedOneRM: "desc" },
    });
}

export async function getMuscleGroupVolume(days = 30) {
    const userId = await getUserId();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sets = await prisma.workoutSet.findMany({
        where: {
            workout: { userId, date: { gte: since } },
            weightKg: { not: null },
            reps: { not: null },
        },
        include: { exercise: { select: { category: true } } },
    });

    const volumeByCategory: Record<string, number> = {};
    for (const s of sets) {
        if (!s.weightKg || !s.reps) continue;
        const cat = s.exercise.category;
        volumeByCategory[cat] =
            (volumeByCategory[cat] ?? 0) + s.weightKg * s.reps;
    }

    return Object.entries(volumeByCategory)
        .map(([category, volume]) => ({ category, volume: Math.round(volume) }))
        .sort((a, b) => b.volume - a.volume);
}

export async function getLoggedExercises() {
    const userId = await getUserId();

    const rows = await prisma.workoutSet.findMany({
        where: { workout: { userId } },
        select: { exercise: true },
        distinct: ["exerciseId"],
        orderBy: { exercise: { name: "asc" } },
    });

    return rows.map((r) => r.exercise);
}

export async function getWorkoutCalendar(year: number) {
    const userId = await getUserId();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const workouts = await prisma.workout.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { date: true },
    });

    const counts: Record<string, number> = {};
    for (const w of workouts) {
        const key = w.date.toISOString().split("T")[0];
        counts[key] = (counts[key] ?? 0) + 1;
    }

    return counts;
}
