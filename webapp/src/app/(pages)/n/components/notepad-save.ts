import type { NotepadDocument, SaveNotepadByIdDocument, SaveNotepadDocument } from "@common/types/intake";

const SAVE_NOTEPAD_ERROR_MESSAGE = "Failed to save notepad. Please try again.";

type SaveNotepad = (payload: SaveNotepadDocument | SaveNotepadByIdDocument) => Promise<NotepadDocument | null>;
type ShowSaveError = (message: string) => void;

export function formatSaveNotepadErrorMessage(error: unknown) {
    if (process.env.NODE_ENV === "production") {
        return SAVE_NOTEPAD_ERROR_MESSAGE;
    }

    return `${SAVE_NOTEPAD_ERROR_MESSAGE}\n\n${getErrorDetails(error)}`;
}

export function createSaveNotepadMutationFn(
    saveNotepad: SaveNotepad,
) {
    return async (payload: SaveNotepadDocument | SaveNotepadByIdDocument) => saveNotepad(payload);
}

export function createSaveNotepadMutationOptions(
    saveNotepad: SaveNotepad,
    showError: ShowSaveError,
    onSuccess: (savedDocument: NotepadDocument | null) => void,
    onError?: (error: unknown) => void,
) {
    return {
        mutationFn: createSaveNotepadMutationFn(saveNotepad),
        retry: 3,
        retryDelay: saveNotepadRetryDelay,
        onSuccess,
        onError: (error: unknown) => {
            showError(formatSaveNotepadErrorMessage(error));
            onError?.(error);
        },
    };
}

export function saveNotepadRetryDelay(attemptIndex: number) {
    return Math.min(1000 * 2 ** attemptIndex, 8000);
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
