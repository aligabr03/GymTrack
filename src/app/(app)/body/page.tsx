import { getBodyMetrics } from "@/actions/body-metrics";
import { BodyMetricsLogger } from "@/components/body/body-metrics-logger";

export const metadata = { title: "Body Metrics — GymTrack" };

export default async function BodyPage() {
  let metrics: Awaited<ReturnType<typeof getBodyMetrics>> = [];
  try {
    metrics = await getBodyMetrics(100);
  } catch {
    // user not logged in or DB error — middleware protects this route
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Body Metrics</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          Track your weight, body fat, and measurements over time.
        </p>
      </div>
      <BodyMetricsLogger metrics={metrics} />
    </div>
  );
}
