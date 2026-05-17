"use client";

import { Badge } from "@/components/ui/badge";
import { AggregationCard } from "./aggregation-card";

const decision = {
    confidence: "High confidence",
    note: "The current writing flow benefits from a persistent summary pane rather than a separate review step.",
};

export function DecisionAggregation() {
    return (
        <AggregationCard title="Decision Capture">
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="rounded-full">
                        {decision.confidence}
                    </Badge>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Decision
                    </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{decision.note}</p>
            </div>
        </AggregationCard>
    );
}
