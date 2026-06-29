"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WorkoutMetaSuggestions } from "@/types";
import { z } from "zod";
import { estimateOneRM } from "@/lib/calculations";

async function getUserId(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user.id;
}

const setSchema = z.object({
    exerciseId: z.string(),
    setNumber: z.number().int().positive(),
    weightKg: z.number().nonnegative(),
    reps: z.number().int().positive(),
    formRating: z.number().int().min(1).max(5).optional().nullable(),
    rpe: z.number().min(1).max(10).optional().nullable(),
    notes: z.string().optional().nullable(),
    isDropset: z.boolean().default(false),
    supersetId: z.string().optional().nullable(),
});

const workoutSchema = z.object({
    date: z.string(),
    seasonId: z.string().optional().nullable(),
    name: z.string().optional(),
    notes: z.string().optional(),
    durationMins: z.number().int().positive().optional().nullable(),
    sets: z.array(setSchema),
});

export async function createWorkout(data: z.infer<typeof workoutSchema>) {
    const userId = await getUserId();

    const parsed = workoutSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const workout = await prisma.workout.create({
        data: {
            userId,
            seasonId: parsed.data.seasonId ?? null,
            date: new Date(parsed.data.date),
            name: parsed.data.name,
            notes: parsed.data.notes,
            durationMins: parsed.data.durationMins,
            sets: {
                create: parsed.data.sets.map((s) => ({
                    exerciseId: s.exerciseId,
                    setNumber: s.setNumber,
                    weightKg: s.weightKg,
                    reps: s.reps,
                    formRating: s.formRating,
                    rpe: s.rpe,
                    notes: s.notes,
                    isDropset: s.isDropset,
                    supersetId: s.supersetId,
                })),
            },
        },
        include: { sets: true },
    });

    const newPRs = await syncPersonalRecordsForExercises(
        userId,
        parsed.data.sets.map((set) => set.exerciseId),
    );

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/insights");

    return { success: true as const, data: workout, newPRs };
}

export async function updateWorkout(
    id: string,
    data: z.infer<typeof workoutSchema>,
) {
    const userId = await getUserId();

    // Verify ownership
    const existing = await prisma.workout.findUnique({
        where: { id },
        include: {
            sets: {
                select: {
                    exerciseId: true,
                },
            },
        },
    });
    if (!existing || existing.userId !== userId) {
        return { success: false, error: "Not found" };
    }

    const parsed = workoutSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    await prisma.workoutSet.deleteMany({ where: { workoutId: id } });

    const workout = await prisma.workout.update({
        where: { id },
        data: {
            seasonId: parsed.data.seasonId ?? null,
            date: new Date(parsed.data.date),
            name: parsed.data.name,
            notes: parsed.data.notes,
            durationMins: parsed.data.durationMins,
            sets: {
                create: parsed.data.sets.map((s) => ({
                    exerciseId: s.exerciseId,
                    setNumber: s.setNumber,
                    weightKg: s.weightKg,
                    reps: s.reps,
                    formRating: s.formRating,
                    rpe: s.rpe,
                    notes: s.notes,
                    isDropset: s.isDropset,
                    supersetId: s.supersetId,
                })),
            },
        },
        include: { sets: true },
    });

    const newPRs = await syncPersonalRecordsForExercises(userId, [
        ...existing.sets.map((set) => set.exerciseId),
        ...parsed.data.sets.map((set) => set.exerciseId),
    ]);

    revalidatePath("/workouts");
    revalidatePath(`/workouts/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/insights");

    return { success: true as const, data: workout, newPRs };
}

export async function deleteWorkout(id: string) {
    const userId = await getUserId();

    const existing = await prisma.workout.findUnique({
        where: { id },
        include: {
            sets: {
                select: {
                    exerciseId: true,
                },
            },
        },
    });
    if (!existing || existing.userId !== userId) {
        return { success: false, error: "Not found" };
    }

    await prisma.workout.delete({ where: { id } });

    await syncPersonalRecordsForExercises(
        userId,
        existing.sets.map((set) => set.exerciseId),
    );

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/insights");

    return { success: true };
}

export async function getWorkouts(limit?: number) {
    const userId = await getUserId();

    const workouts = await prisma.workout.findMany({
        where: { userId },
        include: {
            season: { select: { id: true, name: true } },
            sets: {
                include: { exercise: true },
                orderBy: [{ id: "asc" }, { setNumber: "asc" }],
            },
        },
        orderBy: { date: "desc" },
        take: limit,
    });

    return workouts;
}

export async function getWorkoutMetaSuggestions(): Promise<WorkoutMetaSuggestions> {
    const userId = await getUserId();

    const workouts = await prisma.workout.findMany({
        where: { userId },
        select: {
            name: true,
            durationMins: true,
            date: true,
        },
        orderBy: { date: "desc" },
        take: 30,
    });

    const names = Array.from(
        new Set(
            workouts
                .map((workout) => workout.name?.trim())
                .filter((name): name is string => Boolean(name)),
        ),
    ).slice(0, 6);

    const durationRank = new Map<
        number,
        { count: number; lastUsedAt: number }
    >();
    workouts.forEach((workout, index) => {
        if (!workout.durationMins) return;
        const existing = durationRank.get(workout.durationMins);
        if (existing) {
            existing.count += 1;
            return;
        }
        durationRank.set(workout.durationMins, {
            count: 1,
            lastUsedAt: index,
        });
    });

    const durations = Array.from(durationRank.entries())
        .sort((a, b) => {
            if (b[1].count !== a[1].count) {
                return b[1].count - a[1].count;
            }
            return a[1].lastUsedAt - b[1].lastUsedAt;
        })
        .map(([duration]) => duration)
        .slice(0, 6);

    return { names, durations };
}

export async function getLastSetsForExercise(
    exerciseId: string,
    excludeWorkoutId?: string,
    seasonId?: string | null,
) {
    const userId = await getUserId();

    // Find the most recent workout that included this exercise
    const lastSet = await prisma.workoutSet.findFirst({
        where: {
            exerciseId,
            workout: {
                userId,
                ...(excludeWorkoutId ? { id: { not: excludeWorkoutId } } : {}),
                ...(seasonId != null ? { seasonId } : {}),
            },
        },
        orderBy: { workout: { date: "desc" } },
        select: { workoutId: true, workout: { select: { date: true, name: true } } },
    });
    if (!lastSet) return null;

    const sets = await prisma.workoutSet.findMany({
        where: { workoutId: lastSet.workoutId, exerciseId },
        orderBy: { setNumber: "asc" },
        select: {
            setNumber: true,
            weightKg: true,
            reps: true,
            formRating: true,
            notes: true,
            isDropset: true,
        },
    });

    return {
        date: lastSet.workout.date,
        workoutName: lastSet.workout.name,
        sets,
    };
}

/**
 * Batch version: returns the all-time best set (by estimated 1RM) for each
 * of the supplied exerciseIds in a single DB round-trip.
 * When editing a workout, pass its id as `excludeWorkoutId` so the
 * comparison is against historical data, not the sets being edited.
 */
export async function getBatchPreviousBestSets(
    exerciseIds: string[],
    excludeWorkoutId?: string,
    seasonId?: string | null,
): Promise<
    Record<string, { weightKg: number; reps: number; e1rm: number } | null>
> {
    if (exerciseIds.length === 0) return {};
    const userId = await getUserId();

    // Single query — all qualifying sets across the user's entire history
    const sets = await prisma.workoutSet.findMany({
        where: {
            exerciseId: { in: exerciseIds },
            workout: {
                userId,
                ...(excludeWorkoutId ? { id: { not: excludeWorkoutId } } : {}),
                ...(seasonId != null ? { seasonId } : {}),
            },
            weightKg: { not: null },
            reps: { not: null },
        },
        select: { exerciseId: true, weightKg: true, reps: true },
    });

    const result: Record<
        string,
        { weightKg: number; reps: number; e1rm: number } | null
    > = Object.fromEntries(exerciseIds.map((id) => [id, null]));

    for (const s of sets) {
        if (!s.weightKg || !s.reps) continue;
        const e1rm = estimateOneRM(s.weightKg, s.reps);
        const current = result[s.exerciseId];
        if (!current || e1rm > current.e1rm) {
            result[s.exerciseId] = { weightKg: s.weightKg, reps: s.reps, e1rm };
        }
    }

    return result;
}

/**
 * Returns the exercises (in original order) from the most recent workout
 * that matches the given name. Used to power sequential exercise suggestions
 * when a user picks a previously used workout name.
 */
export async function getExercisesForWorkoutName(
    workoutName: string,
) {
    const userId = await getUserId();

    const match = await prisma.workout.findFirst({
        where: {
            userId,
            name: { equals: workoutName, mode: "insensitive" },
        },
        orderBy: { date: "desc" },
        include: {
            sets: {
                include: { exercise: true },
                orderBy: [{ id: "asc" }, { setNumber: "asc" }],
            },
        },
    });

    if (!match) return [];

    // Deduplicate exercises preserving their first-occurrence order
    const seen = new Set<string>();
    const exercises: (typeof match.sets)[number]["exercise"][] = [];
    for (const s of match.sets) {
        if (!seen.has(s.exerciseId)) {
            seen.add(s.exerciseId);
            exercises.push(s.exercise);
        }
    }
    return exercises;
}

export async function getWorkout(id: string) {
    const userId = await getUserId();

    const workout = await prisma.workout.findUnique({
        where: { id },
        include: {
            season: true,
            sets: {
                include: { exercise: true },
                orderBy: [{ id: "asc" }, { setNumber: "asc" }],
            },
        },
    });

    if (!workout || workout.userId !== userId) return null;
    return workout;
}

export async function getWorkoutForUser(
    workoutId: string,
    ownerUserId: string,
) {
    const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
        include: {
            season: true,
            sets: {
                include: { exercise: true },
                orderBy: [{ id: "asc" }, { setNumber: "asc" }],
            },
        },
    });

    if (!workout || workout.userId !== ownerUserId) return null;
    return workout;
}

async function syncPersonalRecordsForExercises(
    userId: string,
    exerciseIds: string[],
): Promise<string[]> {
    const uniqueExerciseIds = [...new Set(exerciseIds)];
    if (uniqueExerciseIds.length === 0) return [];

    const newPRExerciseNames: string[] = [];

    for (const exerciseId of uniqueExerciseIds) {
        const [sets, existingPR] = await Promise.all([
            prisma.workoutSet.findMany({
                where: {
                    exerciseId,
                    workout: { userId },
                    weightKg: { not: null },
                    reps: { not: null },
                },
                select: {
                    weightKg: true,
                    reps: true,
                    workout: { select: { date: true } },
                    exercise: { select: { name: true } },
                },
            }),
            prisma.personalRecord.findUnique({
                where: { userId_exerciseId: { userId, exerciseId } },
                select: { estimatedOneRM: true },
            }),
        ]);

        let best: {
            weightKg: number;
            reps: number;
            estimatedOneRM: number;
            achievedAt: Date;
        } | null = null;
        let exerciseName = "";

        for (const set of sets) {
            if (set.weightKg == null || set.reps == null) continue;
            exerciseName = set.exercise.name;
            const estimatedOneRM = estimateOneRM(set.weightKg, set.reps);
            if (!best || estimatedOneRM > best.estimatedOneRM) {
                best = {
                    weightKg: set.weightKg,
                    reps: set.reps,
                    estimatedOneRM,
                    achievedAt: set.workout.date,
                };
            }
        }

        if (!best) {
            await prisma.personalRecord.deleteMany({
                where: { userId, exerciseId },
            });
            continue;
        }

        const prevBestE1rm = existingPR?.estimatedOneRM ?? 0;
        if (best.estimatedOneRM > prevBestE1rm && exerciseName) {
            newPRExerciseNames.push(exerciseName);
        }

        await prisma.personalRecord.upsert({
            where: { userId_exerciseId: { userId, exerciseId } },
            update: best,
            create: {
                userId,
                exerciseId,
                ...best,
            },
        });
    }

    return newPRExerciseNames;
}
