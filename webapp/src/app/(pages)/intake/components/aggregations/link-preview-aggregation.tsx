"use client";

import { Badge } from "@/components/ui/badge";
import { AggregationCard } from "./aggregation-card";

const link = {
    domain: "better-auth.com",
    description: "Reference docs for session setup, handlers, and auth integration patterns.",
    url: "https://www.better-auth.com/docs",
};

export function LinkPreviewAggregation() {
    return (
        <AggregationCard title="Link Preview">
            <div className="space-y-3 pt-1">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-muted-foreground">{link.domain}</p>
                    <Badge variant="secondary" className="rounded-full">
                        URL
                    </Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{link.description}</p>
                <p className="truncate text-xs text-foreground/80">{link.url}</p>
            </div>
        </AggregationCard>
    );
}
