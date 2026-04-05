"use client";

import { ContactFollowUpAggregation } from "./aggregations/contact-follow-up-aggregation";
import { DecisionAggregation } from "./aggregations/decision-aggregation";
import { LinkPreviewAggregation } from "./aggregations/link-preview-aggregation";
import { MeetingBriefAggregation } from "./aggregations/meeting-brief-aggregation";
import { TodoReminderAggregation } from "./aggregations/todo-reminder-aggregation";

export function Aggregation() {
    return (
        <section className="flex h-full flex-col border-l border-b border-white/10 bg-white/5 p-4">
            <div className="flex h-full flex-col gap-3 overflow-auto pr-1">
                <TodoReminderAggregation />
                <LinkPreviewAggregation />
                <DecisionAggregation />
                <ContactFollowUpAggregation />
                <MeetingBriefAggregation />
            </div>
        </section>
    );
}
