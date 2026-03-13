import { getPersonalRecords } from "@/actions/insights";
import { Trophy } from "lucide-react";
import { RecordsShowcase } from "@/components/records/records-showcase";

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
                <RecordsShowcase records={records} />
            )}
        </div>
    );
}
