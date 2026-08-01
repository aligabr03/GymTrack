"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const exerciseSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    category: z.string(),
    muscleGroups: z
        .array(z.string())
        .min(1, "Select at least one muscle group"),
});

export async function getExercises() {
    const userId = await getUserId();

    return prisma.exercise.findMany({
        where: {
            OR: [{ isCustom: false }, { userId }],
        },
        orderBy: [{ isCustom: "asc" }, { category: "asc" }, { name: "asc" }],
    });
}

export async function createExercise(data: z.infer<typeof exerciseSchema>) {
    try {
        const userId = await getUserId();

        const parsed = exerciseSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }

        const exercise = await prisma.exercise.create({
            data: {
                ...parsed.data,
                isCustom: true,
                userId,
            },
        });

        revalidatePath("/exercises");
        return { success: true, data: exercise };
    } catch (err) {
        console.error("[createExercise]", err);
        return { success: false, error: "Failed to create exercise" };
    }
}

export async function deleteExercise(id: string) {
    try {
        const userId = await getUserId();

        const exercise = await prisma.exercise.findUnique({ where: { id } });
        if (!exercise || !exercise.isCustom || exercise.userId !== userId) {
            return { success: false, error: "Cannot delete this exercise" };
        }

        const usedInWorkout = await prisma.workoutSet.findFirst({
            where: { exerciseId: id },
            select: { id: true },
        });
        if (usedInWorkout) {
            return {
                success: false,
                error: `"${exercise.name}" is used in one or more workouts and cannot be deleted.`,
            };
        }

        await prisma.exercise.delete({ where: { id } });
        revalidatePath("/exercises");
        return { success: true };
    } catch (err) {
        console.error("[deleteExercise]", err);
        return { success: false, error: "Failed to delete exercise" };
    }
}

export async function updateExercise(
    id: string,
    data: { name: string; muscleGroups: string[] },
) {
    try {
        const userId = await getUserId();

        const exercise = await prisma.exercise.findUnique({ where: { id } });
        if (!exercise || !exercise.isCustom || exercise.userId !== userId) {
            return { success: false, error: "Cannot edit this exercise" };
        }

        const parsed = z
            .object({
                name: z.string().min(2, "Name must be at least 2 characters"),
                muscleGroups: z
                    .array(z.string())
                    .min(1, "Select at least one muscle group"),
            })
            .safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }

        const updated = await prisma.exercise.update({
            where: { id },
            data: { name: parsed.data.name, muscleGroups: parsed.data.muscleGroups },
        });

        revalidatePath("/exercises");
        return { success: true, data: updated };
    } catch (err) {
        console.error("[updateExercise]", err);
        return { success: false, error: "Failed to update exercise" };
    }
}

export async function getExerciseBestWeights(): Promise<
    Record<string, { weightKg: number; reps: number } | null>
> {
    const userId = await getUserId();
    const records = await prisma.personalRecord.findMany({
        where: { userId },
        select: { exerciseId: true, weightKg: true, reps: true },
    });
    return Object.fromEntries(
        records.map((r) => [r.exerciseId, { weightKg: r.weightKg, reps: r.reps }]),
    );
}
