import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-lg" />
                    <div>
                        <Skeleton className="h-7 w-28" />
                        <Skeleton className="h-4 w-20 mt-1" />
                    </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Search bar skeleton */}
            <Skeleton className="h-11 w-full rounded-xl" />

            {/* Workout list skeleton */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                    >
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-28" />
                            <div className="flex gap-2 mt-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}
