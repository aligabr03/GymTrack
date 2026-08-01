"use server";

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { estimateOneRM, kgToLbs } from "@/lib/calculations";
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
        personalRecordsCount,
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
            orderBy: { estimatedOneRM: "desc" },
            take: 5,
        }),
        prisma.personalRecord.count({ where: { userId } }),
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
        personalRecordsCount,
        latestMetric,
    };
}

export async function getProgressionData(exerciseId: string, seasonId?: string | null) {
    const userId = await getUserId();

    const sets = await prisma.workoutSet.findMany({
        where: {
            exerciseId,
            workout: {
                userId,
                ...(seasonId != null ? { seasonId } : {}),
            },
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

export async function getPersonalRecords() {
    const userId = await getUserId();

    return prisma.personalRecord.findMany({
        where: { userId },
        include: { exercise: true },
        orderBy: { estimatedOneRM: "desc" },
    });
}

export async function getMuscleGroupSets(days = 30) {
    const userId = await getUserId();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sets = await prisma.workoutSet.findMany({
        where: { workout: { userId, date: { gte: since } } },
        select: { exercise: { select: { category: true } } },
    });

    const countByCategory: Record<string, number> = {};
    for (const s of sets) {
        const cat = s.exercise.category;
        countByCategory[cat] = (countByCategory[cat] ?? 0) + 1;
    }

    return Object.entries(countByCategory)
        .map(([category, volume]) => ({ category, volume }))
        .sort((a, b) => b.volume - a.volume);
}

export async function getLoggedExercises(seasonId?: string | null) {
    const userId = await getUserId();

    const rows = await prisma.workoutSet.findMany({
        where: {
            workout: {
                userId,
                ...(seasonId != null ? { seasonId } : {}),
            },
        },
        select: { exerciseId: true },
        distinct: ["exerciseId"],
    });

    const ids = rows.map((r) => r.exerciseId);
    if (ids.length === 0) return [];

    return prisma.exercise.findMany({
        where: { id: { in: ids } },
        orderBy: { name: "asc" },
    });
}

export async function getWorkoutCalendar(year: number, targetUserId?: string) {
    const userId = targetUserId ?? await getUserId();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const workouts = await prisma.workout.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { id: true, name: true, date: true },
    });

    const result: Record<string, { id: string; name: string | null }[]> = {};
    for (const w of workouts) {
        const key = w.date.toISOString().split("T")[0];
        if (!result[key]) result[key] = [];
        result[key].push({ id: w.id, name: w.name });
    }

    return result;
}

// ---------------------------------------------------------------------------
// AI Insight
// ---------------------------------------------------------------------------

type InsightSnapshot = {
    weeklyWorkouts: number[];
    weeklyWorkoutTrend: "increasing" | "decreasing" | "stable";
    avgWorkoutsPerWeek: number;
    topExercises: {
        exercise: string;
        sessions: number;
        est1RM_recent: number | null;
        est1RM_prev: number | null;
        delta: number | null;
    }[];
    muscleBalance: Record<string, number>;
    underTrainedGroups: string[];
    bodyWeight: {
        current: number | null;
        previous: number | null;
        delta: number | null;
    } | null;
    recentPRs: string[];
};

async function buildInsightSnapshot(
    userId: string,
    weightUnit: "KG" | "LBS" = "KG",
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

    const byEx: Record<string, { name: string; days: Map<string, number> }> =
        {};
    for (const s of sets) {
        if (!s.weightKg || !s.reps) continue;
        const rm = estimateOneRM(s.weightKg, s.reps);
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
                      .map(
                          ([k, v]) =>
                              [k, Math.round((v / totalVol) * 100)] as [
                                  string,
                                  number,
                              ],
                      )
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
            ? {
                  current: bm[0].weightKg,
                  previous: bm[1]?.weightKg ?? null,
                  delta:
                      bm[0].weightKg != null && bm[1]?.weightKg != null
                          ? Math.round((bm[0].weightKg - bm[1].weightKg) * 10) / 10
                          : null,
              }
            : null;

    // Computed trends
    const firstHalf = weeklyWorkouts.slice(0, 4);
    const secondHalf = weeklyWorkouts.slice(4, 8);
    const firstAvg =
        firstHalf.reduce((s, v) => s + v, 0) / (firstHalf.length || 1);
    const secondAvg =
        secondHalf.reduce((s, v) => s + v, 0) / (secondHalf.length || 1);
    const weeklyWorkoutTrend: "increasing" | "decreasing" | "stable" =
        secondAvg - firstAvg > 0.5
            ? "increasing"
            : firstAvg - secondAvg > 0.5
              ? "decreasing"
              : "stable";
    const avgWorkoutsPerWeek = Math.round(
        (weeklyWorkouts.reduce((s, v) => s + v, 0) / weeklyWorkouts.length) *
            10,
    ) / 10;

    const exercisesWithDelta = topExercises.map((e) => ({
        ...e,
        delta:
            e.est1RM_recent != null && e.est1RM_prev != null
                ? Math.round((e.est1RM_recent - e.est1RM_prev) * 10) / 10
                : null,
    }));

    const underTrainedGroups = Object.entries(muscleBalance)
        .filter(([, pct]) => pct < 15)
        .map(([group]) => group);

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
    const recentPRs = prs.map((p) => {
        const display = weightUnit === "LBS"
            ? `${kgToLbs(p.estimatedOneRM)} lbs`
            : `${Math.round(p.estimatedOneRM)} kg`;
        return `${p.exercise.name} ~${display}`;
    });

    return {
        weeklyWorkouts,
        weeklyWorkoutTrend,
        avgWorkoutsPerWeek,
        topExercises: exercisesWithDelta,
        muscleBalance,
        underTrainedGroups,
        bodyWeight,
        recentPRs,
    };
}

async function callOpenAI(
    snapshot: InsightSnapshot,
    weightUnit: "KG" | "LBS" = "KG",
    userContext?: string,
): Promise<string> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not configured");

    const unit = weightUnit === "LBS" ? "lbs" : "kg";

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
                        `You are a concise, no-nonsense strength coach. Output exactly 4 bullet points starting with \u2022. Use these sections:\n` +
                        `1. Consistency — comment on weekly workout frequency. Is it increasing, decreasing, or stable? Note the avg per week.\n` +
                        `2. Strength — call out the 1-2 exercises with the biggest improvement or decline using the exact delta numbers. Highlight recent PRs.\n` +
                        `3. Balance — flag any muscle groups getting under 15% of total volume. Mention if a certain group is dominating.\n` +
                        `4. Advice — give ONE specific, actionable recommendation based on the data (e.g. add a second leg day, increase frequency, push for a new PR on a specific lift).\n\n` +
                        `Rules: Use exact numbers only. All weights are in ${unit}. Be direct and specific — name exercises, percentages, and deltas. No filler, no congratulations, no motivational fluff. Keep each bullet to 1-2 sentences.`,
                },
                {
                    role: "user",
                    content: userContext?.trim()
                        ? `Snapshot: ${JSON.stringify(snapshot)}\n\nExtra context from user: ${userContext.trim()}`
                        : JSON.stringify(snapshot),
                },
            ],
            max_tokens: 600,
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
    return resolveInsight();
}

export async function refreshAiInsight(userContext?: string): Promise<{
    analysis: string;
    updatedAt: string;
} | null> {
    return resolveInsight(true, userContext);
}

async function resolveInsight(force = false, userContext?: string): Promise<{
    analysis: string;
    updatedAt: string;
} | null> {
    try {
        const userId = await getUserId();
        const profile = await prisma.userProfile.findUnique({ where: { userId }, select: { weightUnit: true } });
        const weightUnit: "KG" | "LBS" = profile?.weightUnit === "LBS" ? "LBS" : "KG";
        const snapshot = await buildInsightSnapshot(userId, weightUnit);

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

        if (!force) {
            const cached = await prisma.aiInsight.findUnique({
                where: { userId },
            });
            if (cached?.dataHash === hash) {
                return {
                    analysis: cached.analysis,
                    updatedAt: cached.updatedAt.toISOString(),
                };
            }
        }

        const analysis = await callOpenAI(snapshot, weightUnit, userContext);

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
        console.error("[resolveInsight]", err);
        return null;
    }
}
