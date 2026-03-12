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

    await prisma.exercise.delete({ where: { id } });
    revalidatePath("/exercises");
    return { success: true };
}
