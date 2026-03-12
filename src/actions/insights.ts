"use server";

import { createHash } from "crypto";
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

// ---------------------------------------------------------------------------
// AI Insight
// ---------------------------------------------------------------------------

type InsightSnapshot = {
    weeklyWorkouts: number[];
    topExercises: {
        exercise: string;
        sessions: number;
        est1RM_recent: number | null;
        est1RM_prev: number | null;
    }[];
    muscleBalance: Record<string, number>;
    bodyWeight: { current: number | null; previous: number | null } | null;
    recentPRs: string[];
};

async function buildInsightSnapshot(
    userId: string,
): Promise<InsightSnapshot | null> {
    const now = new Date();
    const ms = (days: number) => days * 24 * 60 * 60 * 1000;
    const cutoff8w = new Date(now.getTime() - ms(56));
    const cutoff16w = new Date(now.getTime() - ms(112));
    const cutoff30d = new Date(now.getTime() - ms(30));

    // Weekly workout counts (8 weeks, oldest → newest)
    const recentWorkouts = await prisma.workout.findMany({
        where: { userId, date: { gte: cutoff8w } },
        select: { date: true },
    });
    const weeklyWorkouts = Array.from({ length: 8 }, (_, i) => {
        const start = new Date(now.getTime() - ms(7 * (8 - i)));
        const end = new Date(now.getTime() - ms(7 * (7 - i)));
        return recentWorkouts.filter((w) => w.date >= start && w.date < end)
            .length;
    });

    if (weeklyWorkouts.reduce((s, v) => s + v, 0) < 3) return null;

    // Exercise progression (last 16 weeks, top 6 by session count)
    const sets = await prisma.workoutSet.findMany({
        where: {
            workout: { userId, date: { gte: cutoff16w } },
            weightKg: { not: null },
            reps: { not: null },
        },
        select: {
            exerciseId: true,
            weightKg: true,
            reps: true,
            workout: { select: { date: true } },
            exercise: { select: { name: true } },
        },
        orderBy: { workout: { date: "asc" } },
    });

    const byEx: Record<
        string,
        { name: string; days: Map<string, number> }
    > = {};
    for (const s of sets) {
        if (!s.weightKg || !s.reps) continue;
        const rm = Math.round(s.weightKg * (1 + s.reps / 30));
        const day = s.workout.date.toISOString().slice(0, 10);
        if (!byEx[s.exerciseId])
            byEx[s.exerciseId] = { name: s.exercise.name, days: new Map() };
        const prev = byEx[s.exerciseId].days.get(day) ?? 0;
        if (rm > prev) byEx[s.exerciseId].days.set(day, rm);
    }

    const avg = (arr: number[]) =>
        arr.length
            ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
            : null;

    const topExercises = Object.values(byEx)
        .filter((e) => e.days.size >= 2)
        .sort((a, b) => b.days.size - a.days.size)
        .slice(0, 6)
        .map((e) => {
            const sorted = [...e.days.entries()].sort((a, b) =>
                a[0].localeCompare(b[0]),
            );
            const recent = sorted.slice(-4).map((d) => d[1]);
            const older = sorted.slice(-8, -4).map((d) => d[1]);
            return {
                exercise: e.name,
                sessions: e.days.size,
                est1RM_recent: avg(recent),
                est1RM_prev: avg(older),
            };
        });

    // Muscle balance (% volume by category, last 30 days)
    const recentSets = await prisma.workoutSet.findMany({
        where: {
            workout: { userId, date: { gte: cutoff30d } },
            weightKg: { not: null },
            reps: { not: null },
        },
        select: {
            weightKg: true,
            reps: true,
            exercise: { select: { category: true } },
        },
    });
    const catVol: Record<string, number> = {};
    let totalVol = 0;
    for (const s of recentSets) {
        const v = (s.weightKg ?? 0) * (s.reps ?? 0);
        catVol[s.exercise.category] = (catVol[s.exercise.category] ?? 0) + v;
        totalVol += v;
    }
    const muscleBalance: Record<string, number> =
        totalVol > 0
            ? Object.fromEntries(
                  Object.entries(catVol)
                      .map(([k, v]) => [k, Math.round((v / totalVol) * 100)] as [string, number])
                      .sort((a, b) => b[1] - a[1]),
              )
            : {};

    // Body weight trend
    const bm = await prisma.bodyMetric.findMany({
        where: { userId, weightKg: { not: null } },
        orderBy: { date: "desc" },
        take: 2,
        select: { weightKg: true },
    });
    const bodyWeight =
        bm.length >= 1
            ? { current: bm[0].weightKg, previous: bm[1]?.weightKg ?? null }
            : null;

    // Recent PRs
    const prs = await prisma.personalRecord.findMany({
        where: { userId },
        select: {
            estimatedOneRM: true,
            exercise: { select: { name: true } },
        },
        orderBy: { achievedAt: "desc" },
        take: 3,
    });
    const recentPRs = prs.map(
        (p) => `${p.exercise.name} ~${Math.round(p.estimatedOneRM)} lbs`,
    );

    return { weeklyWorkouts, topExercises, muscleBalance, bodyWeight, recentPRs };
}

async function callOpenAI(snapshot: InsightSnapshot): Promise<string> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not configured");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a concise fitness coach AI. Given a user's training snapshot (est1RM in lbs, weekly workout counts oldest→newest, muscle volume %, body weight in lbs), output exactly 4-5 bullet points each starting with •. Cover: consistency trend, strength progress or plateau per key exercise (plateau = est1RM_recent ≤ est1RM_prev), muscle balance gaps, body composition change, and one specific actionable recommendation. Reference actual numbers from the data. Max 220 words.",
                },
                {
                    role: "user",
                    content: JSON.stringify(snapshot),
                },
            ],
            max_tokens: 380,
            temperature: 0.3,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI ${res.status}: ${text.slice(0, 150)}`);
    }

    const data = (await res.json()) as {
        choices: { message: { content: string } }[];
    };
    return data.choices[0]?.message?.content?.trim() ?? "";
}

export async function getAiInsight(): Promise<{
    analysis: string;
    updatedAt: string;
} | null> {
    try {
        const userId = await getUserId();
        const snapshot = await buildInsightSnapshot(userId);

        if (!snapshot) {
            return {
                analysis:
                    "Log at least 3 workouts to unlock your AI training analysis.",
                updatedAt: new Date().toISOString(),
            };
        }

        const hash = createHash("sha256")
            .update(JSON.stringify(snapshot))
            .digest("hex")
            .slice(0, 32);

        // Return cached result if data hasn't changed
        const cached = await prisma.aiInsight.findUnique({
            where: { userId },
        });
        if (cached?.dataHash === hash) {
            return {
                analysis: cached.analysis,
                updatedAt: cached.updatedAt.toISOString(),
            };
        }

        const analysis = await callOpenAI(snapshot);

        const row = await prisma.aiInsight.upsert({
            where: { userId },
            update: { dataHash: hash, analysis },
            create: { userId, dataHash: hash, analysis },
        });

        return {
            analysis: row.analysis,
            updatedAt: row.updatedAt.toISOString(),
        };
    } catch (err) {
        console.error("[getAiInsight]", err);
        return null;
    }
}

export async function refreshAiInsight(): Promise<{
    analysis: string;
    updatedAt: string;
} | null> {
    try {
        const userId = await getUserId();
        const snapshot = await buildInsightSnapshot(userId);

        if (!snapshot) {
            return {
                analysis:
                    "Log at least 3 workouts to unlock your AI training analysis.",
                updatedAt: new Date().toISOString(),
            };
        }

        const hash = createHash("sha256")
            .update(JSON.stringify(snapshot))
            .digest("hex")
            .slice(0, 32);

        const analysis = await callOpenAI(snapshot);

        const row = await prisma.aiInsight.upsert({
            where: { userId },
            update: { dataHash: hash, analysis },
            create: { userId, dataHash: hash, analysis },
        });

        return {
            analysis: row.analysis,
            updatedAt: row.updatedAt.toISOString(),
        };
    } catch (err) {
        console.error("[refreshAiInsight]", err);
        return null;
    }
}
