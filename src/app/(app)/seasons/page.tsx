import { getSeasons } from "@/actions/seasons";
import { SeasonsManager } from "./seasons-manager";
import { CalendarDays } from "lucide-react";

export const metadata = {
    title: "Seasons — GymTrack",
};

export default async function SeasonsPage() {
    const seasons = await getSeasons();

    return (
        <div className="space-y-6">
            <div className="hidden md:flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[var(--secondary)]">
                        <CalendarDays className="h-6 w-6 text-[var(--foreground)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Seasons</h1>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {seasons.length} season{seasons.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            <SeasonsManager initialSeasons={seasons} />
        </div>
    );
}
