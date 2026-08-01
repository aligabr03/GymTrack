"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const metricSchema = z.object({
    date: z.string(),
    weightKg: z.number().positive().optional().nullable(),
    bodyFatPct: z.number().min(1).max(60).optional().nullable(),
    waistCm: z.number().positive().optional().nullable(),
    hipCm: z.number().positive().optional().nullable(),
    chestCm: z.number().positive().optional().nullable(),
    armCm: z.number().positive().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function createBodyMetric(data: z.infer<typeof metricSchema>) {
    try {
        const userId = await getUserId();

        const parsed = metricSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }

        const metric = await prisma.bodyMetric.create({
            data: {
                userId,
                date: new Date(parsed.data.date),
                weightKg: parsed.data.weightKg,
                bodyFatPct: parsed.data.bodyFatPct,
                waistCm: parsed.data.waistCm,
                hipCm: parsed.data.hipCm,
                chestCm: parsed.data.chestCm,
                armCm: parsed.data.armCm,
                notes: parsed.data.notes,
            },
        });

        revalidatePath("/body-metrics");
        revalidatePath("/dashboard");
        revalidatePath("/insights");

        return { success: true, data: metric };
    } catch (err) {
        console.error("[createBodyMetric]", err);
        return { success: false, error: "Failed to save body metric" };
    }
}

export async function deleteBodyMetric(id: string) {
    try {
        const userId = await getUserId();

        const metric = await prisma.bodyMetric.findUnique({ where: { id } });
        if (!metric || metric.userId !== userId) {
            return { success: false, error: "Not found" };
        }

        await prisma.bodyMetric.delete({ where: { id } });
        revalidatePath("/body-metrics");
        revalidatePath("/insights");

        return { success: true };
    } catch (err) {
        console.error("[deleteBodyMetric]", err);
        return { success: false, error: "Failed to delete body metric" };
    }
}

export async function getBodyMetrics(limit?: number) {
    const userId = await getUserId();

    return prisma.bodyMetric.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: limit,
    });
}
