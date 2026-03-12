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
        name: "Incline Barbell Bench Press",
        category: "Chest",
        muscleGroups: ["Upper Chest", "Triceps"],
    },
    {
        name: "Decline Barbell Bench Press",
        category: "Chest",
        muscleGroups: ["Lower Chest", "Triceps"],
    },
    {
        name: "Dumbbell Bench Press",
        category: "Chest",
        muscleGroups: ["Chest", "Triceps"],
    },
    {
        name: "Incline Dumbbell Press",
        category: "Chest",
        muscleGroups: ["Upper Chest", "Front Delts"],
    },
    { name: "Cable Chest Fly", category: "Chest", muscleGroups: ["Chest"] },
    { name: "Dumbbell Fly", category: "Chest", muscleGroups: ["Chest"] },
    {
        name: "Push-Up",
        category: "Chest",
        muscleGroups: ["Chest", "Triceps", "Front Delts"],
    },
    {
        name: "Chest Dip",
        category: "Chest",
        muscleGroups: ["Lower Chest", "Triceps"],
    },
    { name: "Pec Deck Machine", category: "Chest", muscleGroups: ["Chest"] },

    // Back
    {
        name: "Conventional Deadlift",
        category: "Back",
        muscleGroups: ["Lower Back", "Glutes", "Hamstrings", "Traps"],
    },
    {
        name: "Barbell Row",
        category: "Back",
        muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    },
    {
        name: "Pendlay Row",
        category: "Back",
        muscleGroups: ["Lats", "Rhomboids", "Rear Delts"],
    },
    {
        name: "Pull-Up",
        category: "Back",
        muscleGroups: ["Lats", "Biceps", "Rear Delts"],
    },
    { name: "Chin-Up", category: "Back", muscleGroups: ["Lats", "Biceps"] },
    {
        name: "Lat Pulldown",
        category: "Back",
        muscleGroups: ["Lats", "Biceps"],
    },
    {
        name: "Cable Row",
        category: "Back",
        muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    },
    {
        name: "Dumbbell Row",
        category: "Back",
        muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    },
    {
        name: "T-Bar Row",
        category: "Back",
        muscleGroups: ["Lats", "Rhomboids"],
    },
    {
        name: "Face Pull",
        category: "Back",
        muscleGroups: ["Rear Delts", "Rhomboids", "Traps"],
    },

    // Legs
    {
        name: "Back Squat",
        category: "Legs",
        muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    { name: "Front Squat", category: "Legs", muscleGroups: ["Quads", "Core"] },
    { name: "Leg Press", category: "Legs", muscleGroups: ["Quads", "Glutes"] },
    {
        name: "Romanian Deadlift",
        category: "Legs",
        muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    },
    { name: "Leg Curl", category: "Legs", muscleGroups: ["Hamstrings"] },
    { name: "Leg Extension", category: "Legs", muscleGroups: ["Quads"] },
    {
        name: "Bulgarian Split Squat",
        category: "Legs",
        muscleGroups: ["Quads", "Glutes"],
    },
    {
        name: "Walking Lunge",
        category: "Legs",
        muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    {
        name: "Hip Thrust",
        category: "Legs",
        muscleGroups: ["Glutes", "Hamstrings"],
    },
    { name: "Calf Raise", category: "Legs", muscleGroups: ["Calves"] },

    // Shoulders
    {
        name: "Overhead Press",
        category: "Shoulders",
        muscleGroups: ["Front Delts", "Triceps", "Upper Traps"],
    },
    {
        name: "Seated Dumbbell Press",
        category: "Shoulders",
        muscleGroups: ["Front Delts", "Lateral Delts"],
    },
    {
        name: "Lateral Raise",
        category: "Shoulders",
        muscleGroups: ["Lateral Delts"],
    },
    {
        name: "Front Raise",
        category: "Shoulders",
        muscleGroups: ["Front Delts"],
    },
    {
        name: "Arnold Press",
        category: "Shoulders",
        muscleGroups: ["Front Delts", "Lateral Delts"],
    },
    {
        name: "Rear Delt Fly",
        category: "Shoulders",
        muscleGroups: ["Rear Delts"],
    },
    {
        name: "Cable Lateral Raise",
        category: "Shoulders",
        muscleGroups: ["Lateral Delts"],
    },
    {
        name: "Upright Row",
        category: "Shoulders",
        muscleGroups: ["Lateral Delts", "Traps"],
    },

    // Arms
    { name: "Barbell Curl", category: "Arms", muscleGroups: ["Biceps"] },
    { name: "Dumbbell Curl", category: "Arms", muscleGroups: ["Biceps"] },
    {
        name: "Hammer Curl",
        category: "Arms",
        muscleGroups: ["Biceps", "Brachialis"],
    },
    { name: "Preacher Curl", category: "Arms", muscleGroups: ["Biceps"] },
    { name: "Cable Curl", category: "Arms", muscleGroups: ["Biceps"] },
    { name: "Tricep Pushdown", category: "Arms", muscleGroups: ["Triceps"] },
    { name: "Skull Crusher", category: "Arms", muscleGroups: ["Triceps"] },
    {
        name: "Overhead Tricep Extension",
        category: "Arms",
        muscleGroups: ["Triceps"],
    },
    {
        name: "Diamond Push-Up",
        category: "Arms",
        muscleGroups: ["Triceps", "Chest"],
    },
    {
        name: "Close-Grip Bench Press",
        category: "Arms",
        muscleGroups: ["Triceps", "Chest"],
    },

    // Core
    { name: "Plank", category: "Core", muscleGroups: ["Core", "Abs"] },
    { name: "Crunch", category: "Core", muscleGroups: ["Abs"] },
    { name: "Dead Bug", category: "Core", muscleGroups: ["Core", "Abs"] },
    {
        name: "Ab Rollout",
        category: "Core",
        muscleGroups: ["Core", "Abs", "Lats"],
    },
    { name: "Russian Twist", category: "Core", muscleGroups: ["Obliques"] },
    { name: "Leg Raise", category: "Core", muscleGroups: ["Lower Abs"] },
    { name: "Cable Crunch", category: "Core", muscleGroups: ["Abs"] },

    // Cardio
    {
        name: "Treadmill Run",
        category: "Cardio",
        muscleGroups: ["Legs", "Cardiovascular"],
    },
    {
        name: "Stationary Bike",
        category: "Cardio",
        muscleGroups: ["Legs", "Cardiovascular"],
    },
    {
        name: "Rowing Machine",
        category: "Cardio",
        muscleGroups: ["Back", "Legs", "Cardiovascular"],
    },
    {
        name: "Jump Rope",
        category: "Cardio",
        muscleGroups: ["Calves", "Cardiovascular"],
    },
    {
        name: "Burpee",
        category: "Cardio",
        muscleGroups: ["Full Body", "Cardiovascular"],
    },

    // Olympic
    {
        name: "Power Clean",
        category: "Olympic",
        muscleGroups: ["Full Body", "Traps", "Glutes"],
    },
    {
        name: "Hang Clean",
        category: "Olympic",
        muscleGroups: ["Full Body", "Traps"],
    },
    {
        name: "Snatch",
        category: "Olympic",
        muscleGroups: ["Full Body", "Shoulders"],
    },
    {
        name: "Clean and Jerk",
        category: "Olympic",
        muscleGroups: ["Full Body", "Shoulders", "Glutes"],
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
