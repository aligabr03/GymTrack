/**
 * One-time migration: existing weight data was entered as lbs values but stored
 * in "weightKg" fields. This script divides all weight values by 2.20462 to
 * make them correct kg values, and sets every user's weightUnit to "LBS" so
 * they continue to see lbs in the UI.
 *
 * Run with:
 *   npx tsx prisma/migrate-lbs-to-kg.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const KG_TO_LBS = 2.20462;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting lbs → kg migration...\n");

    // 1. WorkoutSet.weightKg (nullable)
    const sets = await prisma.workoutSet.findMany({
        where: { weightKg: { not: null } },
        select: { id: true, weightKg: true },
    });
    console.log(`Converting ${sets.length} workout sets...`);
    for (const set of sets) {
        await prisma.workoutSet.update({
            where: { id: set.id },
            data: { weightKg: Math.round((set.weightKg! / KG_TO_LBS) * 10) / 10 },
        });
    }

    // 2. PersonalRecord.weightKg and estimatedOneRM
    const prs = await prisma.personalRecord.findMany({
        select: { id: true, weightKg: true, estimatedOneRM: true },
    });
    console.log(`Converting ${prs.length} personal records...`);
    for (const pr of prs) {
        await prisma.personalRecord.update({
            where: { id: pr.id },
            data: {
                weightKg: Math.round((pr.weightKg / KG_TO_LBS) * 10) / 10,
                estimatedOneRM: Math.round((pr.estimatedOneRM / KG_TO_LBS) * 10) / 10,
            },
        });
    }

    // 3. BodyMetric.weightKg (nullable — body weight logged by users)
    const metrics = await prisma.bodyMetric.findMany({
        where: { weightKg: { not: null } },
        select: { id: true, weightKg: true },
    });
    console.log(`Converting ${metrics.length} body metrics...`);
    for (const m of metrics) {
        await prisma.bodyMetric.update({
            where: { id: m.id },
            data: { weightKg: Math.round((m.weightKg! / KG_TO_LBS) * 10) / 10 },
        });
    }

    // 4. Set all user profiles to weightUnit = "LBS"
    const result = await prisma.userProfile.updateMany({
        data: { weightUnit: "LBS" },
    });
    console.log(`Set weightUnit = LBS for ${result.count} user profile(s).`);

    console.log("\nMigration complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
