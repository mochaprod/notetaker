"use client";

import { useSearchParamsDate } from "@/hooks/use-search-params-date";
import { formatDate } from "@/lib/date";
import { DateSelector } from "./date-selector";
import { TitleEditor } from "./title-editor";

export function TopBar() {
    const [currentDate] = useSearchParamsDate();
    const dateKey = formatDate(currentDate);

    return (
        <div className="flex h-12 items-center justify-between gap-3 border-b border-neutral-200/80 bg-white/80 px-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
            <TitleEditor dateKey={ dateKey } />
            <DateSelector />
        </div>
    );
}
