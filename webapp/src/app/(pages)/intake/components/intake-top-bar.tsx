"use client";

import { useSearchParamsDate } from "@/hooks/use-search-params-date";
import { formatDate } from "@/lib/date";
import { IntakeDateSelector } from "./intake-date-selector";
import { IntakeTitleEditor } from "./intake-title-editor";

export function IntakeTopBar() {
    const [currentDate] = useSearchParamsDate();
    const dateKey = formatDate(currentDate);

    return (
        <div className="flex h-12 items-center justify-between gap-3 border-b border-neutral-200/80 bg-white/80 px-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
            <IntakeTitleEditor dateKey={ dateKey } />
            <IntakeDateSelector />
        </div>
    );
}
