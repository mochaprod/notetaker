"use client";

import { Badge } from "@/components/ui/badge";
import { AggregationCard } from "./aggregation-card";

const todoItem = {
    description: "Send schema update follow-up",
    timing: "Today, 4:00 PM",
    status: "Reminder",
};

export function TodoReminderAggregation() {
    return (
        <AggregationCard title="Reminder">
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3">
                    <Badge className="rounded-full">{todoItem.status}</Badge>
                    <p className="text-xs text-muted-foreground">{todoItem.timing}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{todoItem.description}</p>
            </div>
        </AggregationCard>
    );
}
