/**
 * Brzycki formula for estimated 1 Rep Max
 * weight × (36 / (37 - reps))
 */
export function estimateOneRM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  if (reps > 36) return weightKg; // formula breaks down at high reps
  return Math.round(weightKg * (36 / (37 - reps)) * 10) / 10;
}

/**
 * Calculate total volume for a session (sum of sets × reps × weight)
 */
export function calculateVolume(
  sets: { weightKg: number | null; reps: number | null }[]
): number {
  return sets.reduce((total, set) => {
    if (!set.weightKg || !set.reps) return total;
    return total + set.weightKg * set.reps;
  }, 0);
}

/**
 * Calculate Wilks score (strength relative to bodyweight)
 * a standardized measure for comparing strength across weight classes
 */
export function wilksScore(
  totalKg: number,
  bodyweightKg: number,
  isMale: boolean
): number {
  const a = isMale ? -216.0475144 : 594.31747775582;
  const b = isMale ? 16.2606339 : -27.23842536447;
  const c = isMale ? -0.002388645 : 0.82112226871;
  const d = isMale ? -0.00113732 : -0.00930733913;
  const e = isMale ? 7.01863e-6 : 4.731582e-5;
  const f = isMale ? -1.291e-8 : -9.054e-8;
  const bw = bodyweightKg;
  const coeff =
    500 / (a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5);
  return Math.round(coeff * totalKg * 100) / 100;
}

/**
 * Group workout sets by muscle category for volume analysis
 */
export function volumeByCategory(
  sets: { weightKg: number | null; reps: number | null; exercise: { category: string } }[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const set of sets) {
    if (!set.weightKg || !set.reps) continue;
    const cat = set.exercise.category;
    result[cat] = (result[cat] ?? 0) + set.weightKg * set.reps;
  }
  return result;
}

/**
 * Get the last N weeks date boundaries
 */
export function getWeekBoundaries(numWeeks: number): { start: Date; end: Date }[] {
  const weeks = [];
  const now = new Date();
  for (let i = numWeeks - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    weeks.push({ start, end });
  }
  return weeks;
}
