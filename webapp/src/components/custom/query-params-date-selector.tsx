"use client";

import { formatDate } from "@/lib/llm/tools";
import { parseDate } from "@/lib/utils";
import { addDays, isBefore, isSameDay } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DateSelector } from "./date-selector";

export function QueryParamsDateSelector() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentDate = parseDate(searchParams.get("date"));

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
        />
    );
}
