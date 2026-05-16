import { createEmptySlateDocument, DEFAULT_NOTEPAD_TITLE } from "@/lib/intake/default-document";
import type { DailyNotepadDocument, NotepadDocument } from "@common/types/intake";

export function getEditableTitle(document: NotepadDocument | null | undefined) {
    return document?.title || DEFAULT_NOTEPAD_TITLE;
}

export function getSaveDocument(dateKey: string, document: NotepadDocument | null | undefined): DailyNotepadDocument {
    if (document) {
        return {
            ...document,
            dateKey,
        };
    }

    return {
        id: null,
        dateKey,
        title: DEFAULT_NOTEPAD_TITLE,
        content: createEmptySlateDocument(),
        createdAt: null,
        updatedAt: null,
    };
}

export function normalizeTitle(title: string) {
    const trimmedTitle = title.trim();

    return trimmedTitle || DEFAULT_NOTEPAD_TITLE;
}
