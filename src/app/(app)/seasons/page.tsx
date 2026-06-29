import { getSeasons } from "@/actions/seasons";
import { SeasonsManager } from "./seasons-manager";

export const metadata = {
    title: "Seasons — GymTrack",
};

export default async function SeasonsPage() {
    const seasons = await getSeasons();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Seasons</h1>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Group your workouts into training seasons for focused comparisons.
                </p>
            </div>

            <SeasonsManager initialSeasons={seasons} />
        </div>
    );
}
