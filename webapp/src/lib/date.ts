import { format, isSameDay, subDays } from "date-fns";

export function formatDate(date: Date) {
    try {
        return format(date, "yyyy-MM-dd");
    } catch (error) {
        return format(new Date(), "yyyy-MM-dd");
    }
}

export function formatDateLabel(date: Date, now = new Date()) {
    if (isSameDay(date, now)) {
        return "Today";
    }

    if (isSameDay(date, subDays(now, 1))) {
        return "Yesterday";
    }

    return format(date, "EEEE, MMMM d, yyyy");
}
