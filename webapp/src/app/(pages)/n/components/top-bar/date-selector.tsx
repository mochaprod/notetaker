"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNow } from "@/hooks/use-now";
import { formatDate, formatDateLabel } from "@/lib/date";
import { isBefore, isSameDay, subDays } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { NotepadReference } from "../notepad-reference";

type DateSelectorProps = {
    notepadReference: NotepadReference;
};

export function DateSelector({ notepadReference }: DateSelectorProps) {
    const router = useRouter();
    const now = useNow();
    const today = now.data;
    const currentDate = notepadReference.kind === "date"
        ? new Date(`${notepadReference.dateKey}T00:00:00`)
        : today;

    const selectDate = useCallback((date: Date) => {
        const dateToSet = isBefore(date, today) || isSameDay(date, today) ? date : currentDate;
        router.push(`/n/date/${formatDate(dateToSet)}`);
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
                align="end"
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
