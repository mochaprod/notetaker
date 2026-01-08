"use client";

import { useSearchParamsDate } from "@/hooks/use-search-params-date";
import { formatDate } from "@/lib/llm/tools";
import { addDays, isBefore, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { DateSelector } from "./date-selector";

type QueryParamsDateSelectorProps = {
    action?: React.ReactNode;
};

export function QueryParamsDateSelector({ action }: QueryParamsDateSelectorProps) {
    const router = useRouter();
    const [currentDate, _] = useSearchParamsDate();

    const addDaysToDate = useCallback((offset: number) => {
        const nextDate = addDays(currentDate, offset);
        const today = new Date();
        const dateToSet = isBefore(nextDate, today) || isSameDay(nextDate, today) ? nextDate : currentDate;
        router.push(`?date=${formatDate(dateToSet)}`);
    }, [currentDate, router]);

    const selectDate = useCallback((date: Date) => {
        try {
            router.push(`?date=${formatDate(date)}`);
        } catch (e) {
            console.error("Selected date is not formatted correctly.");
            router.push("/");
        }
    }, [router]);

    return (
        <DateSelector
            currentDate={ currentDate }
            addDaysToDate={ addDaysToDate }
            selectDate={ selectDate }
            action={ action }
        />
    );
}
