import { getBodyMetrics } from "@/actions/body-metrics";
import { getMyBodyWeightUnit } from "@/actions/social";
import { BodyMetricsLogger } from "@/components/body/body-metrics-logger";
import { Scale } from "lucide-react";

export const metadata = { title: "Body Metrics — GymTrack" };
export const dynamic = "force-dynamic";

export default async function BodyPage() {
    let metrics: Awaited<ReturnType<typeof getBodyMetrics>> = [];
    try {
        metrics = await getBodyMetrics(100);
    } catch (err) {
        console.error("[BodyPage]", err);
    }
    const weightUnit = await getMyBodyWeightUnit().catch(() => "KG" as const);

    return (
        <div className="space-y-6">
            <div className="hidden md:flex items-center gap-3 animate-fade-in">
                <div className="p-2.5 rounded-lg bg-white/[0.06]">
                    <Scale className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Body Metrics</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Track your weight, body fat, and measurements over time.
                    </p>
                </div>
            </div>
            <BodyMetricsLogger metrics={metrics} weightUnit={weightUnit} />
        </div>
    );
}
