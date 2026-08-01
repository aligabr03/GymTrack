export type WeightUnit = "KG" | "LBS";

const KG_TO_LBS = 2.20462;

export function kgToLbs(kg: number): number {
    return Math.round(kg * KG_TO_LBS);
}

export function lbsToKg(lbs: number): number {
    return Math.round((lbs / KG_TO_LBS) * 10) / 10;
}

/**
 * Format a value stored in KG for display, converting to LBS if requested.
 * Returns e.g. "102.1 kg" or "225 lbs"
 */
export function formatWeight(valueKg: number, unit: WeightUnit): string {
    if (unit === "LBS") {
        return `${kgToLbs(valueKg).toLocaleString()} lbs`;
    }
    const rounded = Math.round(valueKg * 10) / 10;
    return `${rounded.toLocaleString()} kg`;
}

/**
 * Format a volume total (stored in KG) for display.
 * Rounds to nearest integer for readability.
 */
export function formatVolume(volumeKg: number, unit: WeightUnit): string {
    if (unit === "LBS") {
        return `${Math.round(volumeKg * KG_TO_LBS).toLocaleString()} lbs`;
    }
    return `${Math.round(volumeKg).toLocaleString()} kg`;
}

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
    sets: { weightKg: number | null; reps: number | null }[],
): number {
    return sets.reduce((total, set) => {
        if (!set.weightKg || !set.reps) return total;
        return total + set.weightKg * set.reps;
    }, 0);
}
