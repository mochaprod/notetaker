import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNow } from "@/hooks/use-now";
import clsx from "clsx";
import { format, isToday, subDays } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

interface DateSelectorProps {
    currentDate: Date;
    addDaysToDate: (offsetInDays: number) => void;
    selectDate: (date: Date) => void;
    action?: React.ReactNode;
}

export function DateSelector({
    currentDate,
    addDaysToDate,
    selectDate,
    action,
}: DateSelectorProps) {
    const now = useNow();

    return (
        <div
            className="flex justify-between w-full"
        >
            <Button
                variant="ghost"
                onClick={ () => addDaysToDate(-1) }
            >
                <ArrowLeftIcon />
            </Button>
            <div
                className="flex gap-2"
            >
                <Popover>
                    <PopoverTrigger
                        asChild
                    >
                        <Button
                            variant="outline"
                        >
                            { format(currentDate, "LLL d") }
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                    >
                        <div
                            className="flex gap-1 p-3"
                        >
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={ () => selectDate(now.data) }
                            >
                                Today
                            </Button>
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={ () => selectDate(subDays(now.data, 1)) }
                            >
                                Yesterday
                            </Button>
                        </div>
                        <Calendar
                            mode="single"
                            selected={ currentDate }
                            disabled={{ after: new Date() }}
                            onSelect={ (date) => date && selectDate(date) }
                        />
                    </PopoverContent>
                </Popover>
                { action }
            </div>
            <Button
                variant="ghost"
                className={ clsx(isToday(currentDate) && "invisible") }
                onClick={ () => addDaysToDate(1) }
            >
                <ArrowRightIcon />
            </Button>
        </div>
    );
}
