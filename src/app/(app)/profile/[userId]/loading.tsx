import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
    return (
        <div className="space-y-6 max-w-2xl">
            {/* Profile header */}
            <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-56" />
                    <div className="flex items-center gap-4 mt-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>

            {/* Calendar card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-44" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-28 w-full rounded-lg" />
                </CardContent>
            </Card>

            {/* Recent workouts */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-36" />
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <div className="text-right space-y-1.5">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-4 w-4 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
