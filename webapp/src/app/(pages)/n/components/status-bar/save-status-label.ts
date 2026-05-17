import { formatRelativeTime } from "@/lib/utils";

export type SaveStatus = {
    hasError?: boolean;
    isLoading: boolean;
    loadingState?: "initial-load" | "saving";
    lastSavedAt: Date | null;
};

export type SaveStatusIcon = "error" | "success" | "loading";

type SaveStatusLabelInput = SaveStatus & {
    now?: Date;
};

export function getSaveStatusLabel({
    hasError,
    isLoading,
    loadingState,
    lastSavedAt,
    now = new Date(),
}: SaveStatusLabelInput) {
    if (hasError) {
        return "Unable to sync";
    }

    if (isLoading) {
        return loadingState === "saving" ? "Saving..." : "Loading...";
    }

    if (!lastSavedAt) {
        return "Not saved yet";
    }

    const relativeTime = formatRelativeTime(lastSavedAt, now);

    if (relativeTime === "just now") {
        return "Saved just now";
    }

    if (relativeTime.endsWith("ago")) {
        return `Saved ${relativeTime}`;
    }

    if (/^\d/.test(relativeTime)) {
        return `Saved at ${relativeTime}`;
    }

    return `Saved ${relativeTime}`;
}

export function getSaveStatusIcon({
    hasError,
    isLoading,
    lastSavedAt,
}: Pick<SaveStatus, "hasError" | "isLoading" | "lastSavedAt">): SaveStatusIcon | null {
    if (hasError) {
        return "error";
    }

    if (isLoading) {
        return "loading";
    }

    return lastSavedAt ? "success" : null;
}

export function getSaveStatusTextColor({
    hasError,
}: Pick<SaveStatus, "hasError">) {
    return hasError ? "text-red-600 dark:text-red-400" : "text-neutral-400 dark:text-neutral-400";
}
