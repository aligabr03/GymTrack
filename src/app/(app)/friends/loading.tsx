import { Skeleton } from "@/components/ui/skeleton";

export default function FriendsLoading() {
    return (
        <div className="space-y-8">
            <div className="hidden md:flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-6 w-36" />
                <div className="rounded-xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-3"
                        >
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-44" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="rounded-xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-3"
                        >
                            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                            <Skeleton className="h-4 w-36 flex-1" />
                            <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
