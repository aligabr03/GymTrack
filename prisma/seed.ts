import { config } from "dotenv";
import { resolve } from "path";
// Load .env.local first (Next.js convention), then fall back to .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const exercises = [
    // Chest
    {
        name: "Barbell Bench Press",
        category: "Chest",
        muscleGroups: ["Chest", "Triceps", "Front Delts"],
    },
    {
        name: "Push-Up",
        category: "Chest",
        muscleGroups: ["Chest", "Triceps", "Front Delts"],
    },

    // Back
    {
        name: "Conventional Deadlift",
        category: "Back",
        muscleGroups: ["Lower Back", "Glutes", "Hamstrings", "Traps"],
    },
    {
        name: "Pull-Up",
        category: "Back",
        muscleGroups: ["Lats", "Biceps", "Rear Delts"],
    },
    {
        name: "Barbell Row",
        category: "Back",
        muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    },

    // Legs
    {
        name: "Back Squat",
        category: "Legs",
        muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    {
        name: "Romanian Deadlift",
        category: "Legs",
        muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    },

    // Shoulders
    {
        name: "Overhead Press",
        category: "Shoulders",
        muscleGroups: ["Front Delts", "Triceps", "Upper Traps"],
    },
    {
        name: "Lateral Raise",
        category: "Shoulders",
        muscleGroups: ["Lateral Delts"],
    },

    // Arms
    { name: "Barbell Curl", category: "Arms", muscleGroups: ["Biceps"] },
    { name: "Tricep Pushdown", category: "Arms", muscleGroups: ["Triceps"] },

    // Core
    { name: "Plank", category: "Core", muscleGroups: ["Core", "Abs"] },

    // Cardio
    {
        name: "Treadmill Run",
        category: "Cardio",
        muscleGroups: ["Legs", "Cardiovascular"],
    },
];

async function main() {
    console.log("Seeding exercises...");

    let created = 0;
    let skipped = 0;

    for (const ex of exercises) {
        const existing = await prisma.exercise.findFirst({
            where: { name: ex.name, isCustom: false },
        });

        if (existing) {
            skipped++;
            continue;
        }

        await prisma.exercise.create({
            data: {
                name: ex.name,
                category: ex.category,
                muscleGroups: ex.muscleGroups,
                isCustom: false,
            },
        });
        created++;
    }

    console.log(
        `Done. Created: ${created}, Skipped (already exists): ${skipped}`,
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
