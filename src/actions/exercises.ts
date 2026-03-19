"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getUserId(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user.id;
}

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
}

export async function deleteExercise(id: string) {
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
}

export async function updateExercise(
    id: string,
    data: { name: string; muscleGroups: string[] },
) {
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
