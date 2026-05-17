"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AggregationCard } from "./aggregation-card";

const followUp = {
    name: "Maya Chen",
    initials: "MC",
    action: "Share the revised onboarding draft and request async feedback.",
    due: "By Friday",
};

export function ContactFollowUpAggregation() {
    return (
        <AggregationCard title="Contact Follow-Up">
            <div className="flex gap-3 pt-1">
                <Avatar className="mt-0.5 size-9">
                    <AvatarFallback>{followUp.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{followUp.name}</p>
                        <span className="text-xs text-muted-foreground">{followUp.due}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {followUp.action}
                    </p>
                </div>
            </div>
        </AggregationCard>
    );
}
