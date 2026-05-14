"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNow } from "@/hooks/use-now";
import { useSearchParamsDate } from "@/hooks/use-search-params-date";
import { formatDate, formatDateLabel } from "@/lib/date";
import { isBefore, isSameDay, subDays } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function DateSelector() {
    const router = useRouter();
    const now = useNow();
    const [currentDate] = useSearchParamsDate();
    const today = now.data;

    const selectDate = useCallback((date: Date) => {
        const dateToSet = isBefore(date, today) || isSameDay(date, today) ? date : currentDate;
        router.push(`?date=${formatDate(dateToSet)}`);
    }, [currentDate, router, today]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 gap-2 px-3 text-sm font-medium"
                >
                    <CalendarIcon className="size-4" />
                    { formatDateLabel(currentDate, today) }
                    <ChevronDownIcon className="size-4 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-auto overflow-hidden p-0"
            >
                <div className="flex gap-1 p-3">
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={ () => selectDate(today) }
                    >
                        Today
                    </Button>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={ () => selectDate(subDays(today, 1)) }
                    >
                        Yesterday
                    </Button>
                </div>
                <Calendar
                    mode="single"
                    selected={ currentDate }
                    disabled={{ after: today }}
                    onSelect={ (date) => date && selectDate(date) }
                />
            </PopoverContent>
        </Popover>
    );
}
