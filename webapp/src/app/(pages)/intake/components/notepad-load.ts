export const LOAD_NOTEPAD_ERROR_MESSAGE = "Failed to load notepad. Please try again.";

export function formatLoadNotepadErrorMessage(error: unknown) {
    if (process.env.NODE_ENV === "production") {
        return LOAD_NOTEPAD_ERROR_MESSAGE;
    }

    return `${LOAD_NOTEPAD_ERROR_MESSAGE}\n\n${getErrorDetails(error)}`;
}

function getErrorDetails(error: unknown) {
    if (error instanceof Error) {
        return error.stack ?? `${error.name}: ${error.message}`;
    }

    if (typeof error === "string") {
        return error;
    }

    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}
