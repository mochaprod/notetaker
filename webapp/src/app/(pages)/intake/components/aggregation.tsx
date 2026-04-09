"use client";

import { ContactFollowUpAggregation } from "./aggregations/contact-follow-up-aggregation";
import { DecisionAggregation } from "./aggregations/decision-aggregation";
import { LinkPreviewAggregation } from "./aggregations/link-preview-aggregation";
import { MeetingBriefAggregation } from "./aggregations/meeting-brief-aggregation";
import { TodoReminderAggregation } from "./aggregations/todo-reminder-aggregation";

export function Aggregation() {
    return (
        <section className="flex h-full flex-col border-l border-b border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-white/10 dark:bg-white/5">
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
