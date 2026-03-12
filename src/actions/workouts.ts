"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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
    weightKg: z.number().nonnegative().optional().nullable(),
    reps: z.number().int().positive().optional().nullable(),
    formRating: z.number().int().min(1).max(5).optional().nullable(),
    rpe: z.number().min(1).max(10).optional().nullable(),
    notes: z.string().optional().nullable(),
    isDropset: z.boolean().default(false),
    supersetId: z.string().optional().nullable(),
});

const workoutSchema = z.object({
    date: z.string(),
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

    // Update personal records for each exercise
    await updatePersonalRecords(userId, parsed.data.sets);

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/insights");

    return { success: true, data: workout };
}

export async function updateWorkout(
    id: string,
    data: z.infer<typeof workoutSchema>,
) {
    const userId = await getUserId();

    // Verify ownership
    const existing = await prisma.workout.findUnique({ where: { id } });
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

    await updatePersonalRecords(userId, parsed.data.sets);

    revalidatePath("/workouts");
    revalidatePath(`/workouts/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/insights");

    return { success: true, data: workout };
}

export async function deleteWorkout(id: string) {
    const userId = await getUserId();

    const existing = await prisma.workout.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
        return { success: false, error: "Not found" };
    }

    await prisma.workout.delete({ where: { id } });

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
            sets: {
                include: { exercise: true },
                orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
            },
        },
        orderBy: { date: "desc" },
        take: limit,
    });

    return workouts;
}

export async function getLastSetsForExercise(exerciseId: string) {
    const userId = await getUserId();

    // Find the most recent workout that included this exercise
    const lastSet = await prisma.workoutSet.findFirst({
        where: { exerciseId, workout: { userId } },
        orderBy: { workout: { date: "desc" } },
        select: { workoutId: true },
    });
    if (!lastSet) return [];

    const sets = await prisma.workoutSet.findMany({
        where: { workoutId: lastSet.workoutId, exerciseId },
        orderBy: { setNumber: "asc" },
        select: {
            setNumber: true,
            weightKg: true,
            reps: true,
            formRating: true,
            rpe: true,
        },
    });

    return sets;
}

export async function getWorkout(id: string) {
    const userId = await getUserId();

    const workout = await prisma.workout.findUnique({
        where: { id },
        include: {
            sets: {
                include: { exercise: true },
                orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
            },
        },
    });

    if (!workout || workout.userId !== userId) return null;
    return workout;
}

async function updatePersonalRecords(
    userId: string,
    sets: z.infer<typeof setSchema>[],
) {
    const byExercise = sets.reduce(
        (acc, s) => {
            if (!s.weightKg || !s.reps) return acc;
            const existingBest = acc[s.exerciseId];
            const estimated = estimateOneRM(s.weightKg, s.reps);
            if (!existingBest || estimated > existingBest.estimatedOneRM) {
                acc[s.exerciseId] = {
                    weightKg: s.weightKg,
                    reps: s.reps,
                    estimatedOneRM: estimated,
                };
            }
            return acc;
        },
        {} as Record<
            string,
            { weightKg: number; reps: number; estimatedOneRM: number }
        >,
    );

    for (const [exerciseId, best] of Object.entries(byExercise)) {
        const existing = await prisma.personalRecord.findUnique({
            where: { userId_exerciseId: { userId, exerciseId } },
        });

        if (!existing || best.estimatedOneRM > existing.estimatedOneRM) {
            await prisma.personalRecord.upsert({
                where: { userId_exerciseId: { userId, exerciseId } },
                update: {
                    weightKg: best.weightKg,
                    reps: best.reps,
                    estimatedOneRM: best.estimatedOneRM,
                    achievedAt: new Date(),
                },
                create: {
                    userId,
                    exerciseId,
                    weightKg: best.weightKg,
                    reps: best.reps,
                    estimatedOneRM: best.estimatedOneRM,
                    achievedAt: new Date(),
                },
            });
        }
    }
}
