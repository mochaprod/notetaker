import { addDays, Day, nextDay } from "date-fns";

export function findDateRelative(now: string, day: Day) {
    return nextDay(new Date(now), day);
}

export function findDateOffset(now: string, offset: number) {
    return addDays(new Date(now), offset);
}
