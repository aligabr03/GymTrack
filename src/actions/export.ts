"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

function toDate(d: Date) {
    return d.toISOString().slice(0, 10);
}

function compact<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
    ) as Partial<T>;
}

export async function exportUserData() {
    const userId = await getUserId();

    const [profile, workouts, bodyMetrics, personalRecords, workoutTemplates, customExercises, seasons] =
        await Promise.all([
            prisma.userProfile.findUnique({ where: { userId } }),
            prisma.workout.findMany({
                where: { userId },
                orderBy: { date: "desc" },
                include: {
                    season: { select: { name: true } },
                    sets: {
                        include: { exercise: { select: { name: true } } },
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
                include: { exercise: { select: { name: true, category: true } } },
            }),
            prisma.workoutTemplate.findMany({
                where: { userId },
                include: {
                    exercises: {
                        include: { exercise: { select: { name: true, category: true, muscleGroups: true } } },
                        orderBy: { order: "asc" },
                    },
                },
            }),
            prisma.exercise.findMany({
                where: { userId, isCustom: true },
                select: { name: true, category: true, muscleGroups: true },
            }),
            prisma.season.findMany({
                where: { userId },
                orderBy: { startDate: "desc" },
                select: { name: true, description: true, startDate: true, endDate: true },
            }),
        ]);

    // Workouts: group sets by exercise name
    const formattedWorkouts = workouts.map((w) => {
        const byExercise: Record<string, { reps: number; kg: number; rpe?: number; notes?: string }[]> = {};
        for (const s of w.sets) {
            const name = s.exercise.name;
            if (!byExercise[name]) byExercise[name] = [];
            const entry: { reps: number; kg: number; rpe?: number; notes?: string } = {
                reps: s.reps ?? 0,
                kg: s.weightKg ?? 0,
            };
            if (s.rpe != null) entry.rpe = s.rpe;
            if (s.notes) entry.notes = s.notes;
            byExercise[name].push(entry);
        }
        return compact({
            date: toDate(w.date),
            name: w.name || undefined,
            season: w.season?.name || undefined,
            durationMins: w.durationMins || undefined,
            notes: w.notes || undefined,
            exercises: byExercise,
        });
    });

    // Body metrics: strip nulls and internal fields
    const formattedMetrics = bodyMetrics.map((m) =>
        compact({
            date: toDate(m.date),
            weightKg: m.weightKg,
            bodyFatPct: m.bodyFatPct,
            waistCm: m.waistCm,
            hipCm: m.hipCm,
            chestCm: m.chestCm,
            armCm: m.armCm,
            notes: m.notes,
        })
    );

    // Personal records: just the essentials
    const formattedPRs = personalRecords.map((pr) => ({
        exercise: pr.exercise.name,
        category: pr.exercise.category,
        weightKg: pr.weightKg,
        reps: pr.reps,
        est1RM: Math.round(pr.estimatedOneRM * 10) / 10,
        achievedAt: toDate(pr.achievedAt),
    }));

    // Templates: name + ordered exercise list with targets
    const formattedTemplates = workoutTemplates.map((t) => ({
        name: t.name,
        ...(t.description ? { description: t.description } : {}),
        exercises: t.exercises.map((te) =>
            compact({
                name: te.exercise.name,
                category: te.exercise.category,
                muscles: te.exercise.muscleGroups.length ? te.exercise.muscleGroups : undefined,
                targetSets: te.targetSets,
                targetReps: te.targetReps,
                targetWeightKg: te.targetWeight,
            })
        ),
    }));

    return {
        exportedAt: new Date().toISOString().slice(0, 10),
        profile: profile
            ? compact({ displayName: profile.displayName, bio: profile.bio })
            : null,
        workouts: formattedWorkouts,
        bodyMetrics: formattedMetrics,
        personalRecords: formattedPRs,
        templates: formattedTemplates,
        customExercises,
        seasons: seasons.map((s) =>
            compact({
                name: s.name,
                description: s.description,
                startDate: toDate(s.startDate),
                endDate: s.endDate ? toDate(s.endDate) : undefined,
            }),
        ),
    };
}
