import type {
  Exercise,
  Workout,
  WorkoutSet,
  BodyMetric,
  PersonalRecord,
  WorkoutTemplate,
  TemplateExercise,
} from "@/generated/prisma/client";

export type {
  Exercise,
  Workout,
  WorkoutSet,
  BodyMetric,
  PersonalRecord,
  WorkoutTemplate,
  TemplateExercise,
};

export type WorkoutWithSets = Workout & {
  sets: (WorkoutSet & { exercise: Exercise })[];
};

export type TemplateWithExercises = WorkoutTemplate & {
  exercises: (TemplateExercise & { exercise: Exercise })[];
};

export const EXERCISE_CATEGORIES = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Full Body",
  "Olympic",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const FORM_RATINGS = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Good" },
  { value: 4, label: "Great" },
  { value: 5, label: "Perfect" },
] as const;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
