import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import clsx from "clsx";
import { format, isToday, startOfDay, subDays } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

interface DateSelectorProps {
    currentDate: Date;
    addDaysToDate: (offsetInDays: number) => void;
    selectDate: (date: Date) => void;
}

export function DateSelector({
    currentDate,
    addDaysToDate,
    selectDate,
}: DateSelectorProps) {
    const today = startOfDay(new Date());

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
            <Popover>
                <PopoverTrigger
                    asChild
                >
                    <Button
                        variant="outline"
                    >
                        { format(currentDate, "PP") }
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
                            onClick={ () => selectDate(today) }
                        >
                            Today
                        </Button>
                        <Button
                            size="xs"
                            variant="outline"
                            onClick={ () => selectDate(subDays(today, 2)) }
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
