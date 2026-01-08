import { parseDate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

/**
 * Forces today's date if no date is set in the query params.
 * @returns a date.
 */
export function useSearchParamsDate(): [Date, string | null] {
    const params = useSearchParams();
    const dateStr = params.get("date");

    return [parseDate(dateStr), dateStr];
}
