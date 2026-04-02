import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BodyLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton — hidden on mobile, matches hidden md:block */}
            <div className="hidden md:block">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-72 mt-2" />
            </div>

            {/* Log entry toggle button */}
            <Skeleton className="h-10 w-36 rounded-xl" />

            {/* History card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-xl bg-[var(--secondary)]/50"
                            >
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
