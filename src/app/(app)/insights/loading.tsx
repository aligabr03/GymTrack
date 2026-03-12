import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function InsightsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div>
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-64 mt-2" />
            </div>

            {/* AI Analysis card skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-2.5">
                            <Skeleton className="h-4 w-2 shrink-0" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Calendar skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full rounded-lg" />
                </CardContent>
            </Card>

            {/* Muscle balance skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-56" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
}
