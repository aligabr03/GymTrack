import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatRelativeDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
}

export function getDayOfWeek(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
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
