"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshAiInsight } from "@/actions/insights";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    initial: { analysis: string; updatedAt: string } | null;
};

function formatRelative(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function AiAnalysisCard({ initial }: Props) {
    const [data, setData] = useState(initial);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [contextInput, setContextInput] = useState("");

    function handleRefresh() {
        setError(null);
        startTransition(async () => {
            try {
                const result = await refreshAiInsight(contextInput);
                if (result) setData(result);
            } catch {
                setError("Failed to generate analysis. Check your API key.");
            }
        });
    }

    // Parse bullet points from the analysis text
    const bullets =
        data?.analysis
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.startsWith("•") || l.startsWith("-"))
            .map((l) => l.replace(/^[•\-]\s*/, "")) ?? [];

    const isPlaceholder = data?.analysis.startsWith("Log at least") ?? false;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                    Optional context
                </p>
                <Textarea
                    placeholder="e.g. Deload week, shoulder pain, sleep has been low, cutting calories..."
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    className="min-h-20"
                />
            </div>
            {data && !isPlaceholder ? (
                <>
                    {bullets.length > 0 ? (
                        <ul className="space-y-3">
                            {bullets.map((b, i) => (
                                <li key={i} className="flex gap-2.5 text-sm">
                                    <span className="text-[var(--foreground)] shrink-0 mt-0.5">
                                        •
                                    </span>
                                    <span className="text-[var(--muted-foreground)] leading-relaxed">
                                        {b}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-line leading-relaxed">
                            {data.analysis}
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Generated {formatRelative(data.updatedAt)}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isPending}
                            className="text-xs gap-1.5"
                        >
                            <RefreshCw
                                className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`}
                            />
                            {isPending ? "Analyzing…" : "Regenerate"}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-6 space-y-3">
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {isPending
                            ? "Analyzing your training data…"
                            : (data?.analysis ??
                              "Generate an AI analysis of your training trends.")}
                    </p>
                    {!isPlaceholder && (
                        <Button
                            onClick={handleRefresh}
                            disabled={isPending}
                            size="sm"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`}
                            />
                            {isPending ? "Analyzing…" : "Generate Analysis"}
                        </Button>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
