import { clsx, type ClassValue } from "clsx";
import { differenceInDays, differenceInMinutes, format, formatDistance, formatDistanceToNow, parse, startOfDay } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(from: Date, to: Date): string {
    const diffInMinutes = differenceInMinutes(to, from);
    if (diffInMinutes < 1) {
        return "just now";
    } else if (diffInMinutes < 60) {
        return formatDistance(from, to, { addSuffix: true });
    }

    return format(from, "p"); // e.g., 3:30 PM
}

/**
 * Formats a date into a human-readable, relative time string.
 *
 * By default, it provides a general time description:
 * - "Today" for the current day.
 * - "Yesterday" for the previous day.
 * - "x days ago" for dates within the last 5 days.
 * - "Month Day" (e.g., "Nov 24") for older dates.
 *
 * With the `fineGrained` option, it provides more specific times for recent dates:
 * - "x minutes ago" if less than an hour ago.
 * - A time format like "3:30 PM" if it's today but more than an hour ago.
 *
 * @param date The date to format.
 * @param fineGrained Whether to use more specific time formats for recent dates.
 * @returns A formatted string.
 */
export function formatRelativeDateTime(date: Date, fineGrained?: boolean): string {
    const now = new Date();
    const diffInDays = differenceInDays(startOfDay(now), startOfDay(date));

    if (diffInDays === 0) { // Today
        if (fineGrained) {
            const diffInMinutes = differenceInMinutes(now, date);
            if (diffInMinutes < 60) {
                return formatDistanceToNow(date, { addSuffix: true });
            }
            return format(date, "p"); // e.g., 3:30 PM
        }
        return `Today at ${format(date, "p")}`;
    }

    if (diffInDays === 1) {
        return `Yesterday at ${format(date, "p")}`;
    }

    if (diffInDays < 5) {
        return formatDistanceToNow(date, { addSuffix: true });
    }

    return format(date, "LLL d");
}

export function parseDate(dateStr: string | null): Date {
    if (dateStr) {
        const date = parse(dateStr, "yyyy-MM-dd", new Date());

        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    return startOfDay(new Date());
}
