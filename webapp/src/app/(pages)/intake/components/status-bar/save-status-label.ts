import { formatRelativeTime } from "@/lib/utils";

export type SaveStatus = {
    isLoading: boolean;
    lastSavedAt: Date | null;
};

type SaveStatusLabelInput = SaveStatus & {
    now?: Date;
};

export function getSaveStatusLabel({
    isLoading,
    lastSavedAt,
    now = new Date(),
}: SaveStatusLabelInput) {
    if (isLoading) {
        return lastSavedAt ? "Saving..." : "Loading...";
    }

    if (!lastSavedAt) {
        return "Not saved yet";
    }

    const relativeTime = formatRelativeTime(lastSavedAt, now);

    if (relativeTime === "just now") {
        return "Saved just now";
    }

    if (/^\d/.test(relativeTime)) {
        return `Saved at ${relativeTime}`;
    }

    return `Saved ${relativeTime}`;
}
