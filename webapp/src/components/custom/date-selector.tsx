import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNow } from "@/hooks/use-now";
import clsx from "clsx";
import { format, isToday, subDays } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from "lucide-react";

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
            className="flex items-center"
        >
            <h1
                className="text-2xl font-bold flex-nowrap text-nowrap"
            >
                { format(currentDate, "LLLL d") }
            </h1>
            <div
                className="flex justify-end gap-1 w-full"
            >
                <Button
                    variant="outline"
                    size="icon"
                    onClick={ () => addDaysToDate(-1) }
                >
                    <ArrowLeftIcon />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={ isToday(currentDate) }
                    onClick={ () => addDaysToDate(1) }
                >
                    <ArrowRightIcon />
                </Button>
                <div
                    className="flex gap-1"
                >
                    <Popover>
                        <PopoverTrigger
                            asChild
                        >
                            <Button
                                variant="outline"
                                size="icon"
                            >
                                <CalendarIcon />
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
            </div>
        </div>
    );
}
