import { Skeleton } from "@/components/ui/skeleton";

export default function ExercisesLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-lg" />
                    <div>
                        <Skeleton className="h-7 w-36" />
                        <Skeleton className="h-4 w-24 mt-1" />
                    </div>
                </div>
            </div>

            {/* Toolbar skeleton */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-11 flex-1 rounded-xl" />
                <Skeleton className="h-11 w-full sm:w-48 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Category groups skeleton */}
            <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <div className="flex items-center gap-2.5 mb-2 px-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-4" />
                            <div className="h-px flex-1 bg-[var(--border)]" />
                        </div>
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="flex items-center gap-3 px-4 py-3"
                                >
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
