import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RecordsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-lg" />
                <div>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-24 mt-1" />
                </div>
            </div>

            {/* Records list skeleton */}
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-36" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                                <div className="text-right space-y-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
