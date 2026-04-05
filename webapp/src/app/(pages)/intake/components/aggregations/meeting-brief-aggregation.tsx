"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AggregationCard } from "./aggregation-card";

const meetingBrief = {
    summary: "Short placeholder brief combining several notes into one readable status snapshot.",
    takeaways: [
        "Onboarding friction is still the strongest repeated theme.",
        "The summary pane should turn raw notes into visible next actions.",
        "Design wants clearer constraints before refining the sidebar behavior.",
    ],
};

export function MeetingBriefAggregation() {
    return (
        <AggregationCard title="Meeting Brief">
            <div className="space-y-3 pt-1">
                <div className="flex items-start justify-end gap-3">
                    <Badge variant="outline" className="rounded-full">
                        3 takeaways
                    </Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                    {meetingBrief.summary}
                </p>
                <Separator />
                <div className="space-y-3">
                    {meetingBrief.takeaways.map((takeaway) => (
                        <div key={takeaway} className="flex gap-2">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/70" />
                            <p className="text-sm leading-6 text-muted-foreground">{takeaway}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AggregationCard>
    );
}
