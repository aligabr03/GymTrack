"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
    try {
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
    } catch (err) {
        console.error("[createSeason]", err);
        return { success: false, error: "Failed to create season" };
    }
}

export async function updateSeason(
    id: string,
    data: z.infer<typeof seasonSchema>,
) {
    try {
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
    } catch (err) {
        console.error("[updateSeason]", err);
        return { success: false, error: "Failed to update season" };
    }
}

export async function deleteSeason(id: string) {
    try {
        const userId = await getUserId();

        const existing = await prisma.season.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return { success: false, error: "Not found" };
        }

        await prisma.season.delete({ where: { id } });

        revalidatePath("/seasons");
        return { success: true };
    } catch (err) {
        console.error("[deleteSeason]", err);
        return { success: false, error: "Failed to delete season" };
    }
}
