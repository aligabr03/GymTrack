import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function InsightsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="hidden md:block">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-64 mt-2" />
            </div>

            {/* AI Analysis skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                            <Skeleton className="h-3 w-3 shrink-0 mt-0.5 rounded-full" />
                            <Skeleton
                                className="h-4"
                                style={{ width: `${72 - i * 8}%` }}
                            />
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
                    <Skeleton className="h-28 w-full rounded-lg" />
                </CardContent>
            </Card>

            {/* Muscle balance skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-56" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-44 w-full rounded-lg" />
                </CardContent>
            </Card>

            {/* Body trends skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-28" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-44 w-full rounded-lg" />
                </CardContent>
            </Card>

            {/* Progression chart skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-44" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-44 w-full rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
}
