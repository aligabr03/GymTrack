import { getPersonalRecords } from "@/actions/insights";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Personal Records — GymTrack" };

export default async function RecordsPage() {
    let records: Awaited<ReturnType<typeof getPersonalRecords>> = [];
    try {
        records = await getPersonalRecords();
    } catch {
        // user not authenticated or DB error
    }

    return (
        <div className="space-y-6">
            <div className="hidden md:block animate-fade-in">
                <h1 className="text-2xl font-bold">Personal Records</h1>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                    Your all-time bests, automatically tracked when you log
                    workouts.
                </p>
            </div>

            {records.length === 0 ? (
                <div className="text-center py-20 text-[var(--muted-foreground)] animate-fade-in">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No records yet — start logging workouts!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {records.map((pr, index) => (
                        <Card
                            key={pr.id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 60}ms` }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">
                                            {pr.exercise.name}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] mt-1"
                                        >
                                            {pr.exercise.category}
                                        </Badge>
                                    </div>
                                    <Trophy className="h-5 w-5 text-[var(--foreground)] flex-shrink-0 mt-0.5" />
                                </div>

                                <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--muted-foreground)]">
                                            Lifted
                                        </span>
                                        <span className="font-medium">
                                            {pr.weightKg} lbs × {pr.reps} reps
                                        </span>
                                    </div>
                                    {pr.estimatedOneRM && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--muted-foreground)]">
                                                Est. 1RM
                                            </span>
                                            <span className="font-semibold text-[var(--foreground)]">
                                                {pr.estimatedOneRM.toFixed(1)}{" "}
                                                lbs
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs text-[var(--muted-foreground)] pt-1">
                                        <span>Set on</span>
                                        <span>{formatDate(pr.achievedAt)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
