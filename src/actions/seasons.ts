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

const seasonSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(),
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
});

export async function getSeasons() {
    const userId = await getUserId();
    return prisma.season.findMany({
        where: { userId },
        include: {
            _count: { select: { workouts: true } },
        },
        orderBy: { startDate: "desc" },
    });
}

export async function createSeason(data: z.infer<typeof seasonSchema>) {
    const userId = await getUserId();

    const parsed = seasonSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const season = await prisma.season.create({
        data: {
            userId,
            name: parsed.data.name,
            description: parsed.data.description,
            startDate: new Date(parsed.data.startDate),
            endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        },
    });

    revalidatePath("/seasons");
    return { success: true, data: season };
}

export async function updateSeason(
    id: string,
    data: z.infer<typeof seasonSchema>,
) {
    const userId = await getUserId();

    const existing = await prisma.season.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
        return { success: false, error: "Not found" };
    }

    const parsed = seasonSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const season = await prisma.season.update({
        where: { id },
        data: {
            name: parsed.data.name,
            description: parsed.data.description,
            startDate: new Date(parsed.data.startDate),
            endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        },
    });

    revalidatePath("/seasons");
    return { success: true, data: season };
}

export async function deleteSeason(id: string) {
    const userId = await getUserId();

    const existing = await prisma.season.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
        return { success: false, error: "Not found" };
    }

    await prisma.season.delete({ where: { id } });

    revalidatePath("/seasons");
    return { success: true };
}
