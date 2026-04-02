import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="hidden md:flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-4 w-56 mt-2" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Stats grid — 3 cols */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-7 w-8" />
                            <Skeleton className="h-3 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent workouts */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-56" />
                                </div>
                                <div className="text-right space-y-1.5">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: PRs + Body */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-28" />
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                        <Skeleton className="h-5 w-14" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-20" />
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
