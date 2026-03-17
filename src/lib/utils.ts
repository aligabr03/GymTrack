import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// All stored dates are persisted as UTC midnight representing the user-entered
// calendar date. Display them with timeZone:"UTC" so the calendar date is never
// shifted by the viewer's local offset.
const EST = "America/New_York";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Returns the YYYY-MM-DD string for `date` in America/New_York.
 * Use this for default values of <input type="date"> fields.
 */
export function toESTDateStr(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-CA", { timeZone: EST });
}

/** Today's date as YYYY-MM-DD in America/New_York. */
export function todayEST(): string {
    return toESTDateStr(new Date());
}

export function formatDate(date: Date | string): string {
    // timeZone:"UTC" keeps the calendar date identical to what was stored.
    return new Date(date).toLocaleDateString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatRelativeDate(date: Date | string): string {
    // Extract the stored UTC calendar-date string (YYYY-MM-DD).
    const storedStr = new Date(date).toLocaleDateString("en-CA", {
        timeZone: "UTC",
    });
    // Today in EST so "today" tracks the user's wall clock, not the server's.
    const todayStr = todayEST();

    // Build two midnight-UTC dates for a clean integer-day diff.
    const storedDay = new Date(storedStr + "T00:00:00Z");
    const todayDay = new Date(todayStr + "T00:00:00Z");
    const diffDays = Math.round(
        (todayDay.getTime() - storedDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
}

export function getDayOfWeek(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        timeZone: "UTC",
        weekday: "long",
    });
}

export function groupBy<T>(
    arr: T[],
    key: (item: T) => string,
): Record<string, T[]> {
    return arr.reduce(
        (groups, item) => {
            const group = key(item);
            groups[group] = [...(groups[group] ?? []), item];
            return groups;
        },
        {} as Record<string, T[]>,
    );
}
