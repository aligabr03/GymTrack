import { getAiInsight } from "@/actions/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiAnalysisCard } from "@/components/insights/ai-analysis";

export async function AiInsightSection() {
    const aiData = await getAiInsight();
    if (!aiData) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <span>AI Training Analysis</span>
                    <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--muted-foreground)] tracking-wide uppercase">
                        GPT-4o mini
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AiAnalysisCard initial={aiData} />
            </CardContent>
        </Card>
    );
}
