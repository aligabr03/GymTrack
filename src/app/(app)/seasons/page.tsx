import { getSeasons } from "@/actions/seasons";
import { SeasonsManager } from "./seasons-manager";
import { SetPageTitle } from "@/components/layout/page-title-context";

export const metadata = {
    title: "Seasons — GymTrack",
};

export default async function SeasonsPage() {
    const seasons = await getSeasons();

    return (
        <>
            <SetPageTitle title="Seasons" />
            <SeasonsManager initialSeasons={seasons} />
        </>
    );
}
