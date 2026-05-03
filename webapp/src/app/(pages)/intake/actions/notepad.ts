"use server";

import { auth } from "@/lib/auth";
import { notepadRepository } from "@/lib/db/db-instance";
import { createEmptySlateDocument, DEFAULT_NOTEPAD_TITLE } from "@/lib/intake/default-document";
import { NotepadDocument, SaveNotepadDocumentSchema } from "@common/types/intake";
import { headers } from "next/headers";

export function createDefaultNotepadDocument(dateKey: string): NotepadDocument {
    return {
        id: null,
        dateKey,
        title: DEFAULT_NOTEPAD_TITLE,
        content: createEmptySlateDocument(),
        createdAt: null,
        updatedAt: null,
    };
}

export async function getNotepad(dateKey: string): Promise<NotepadDocument | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    return await notepadRepository.getByDate(session.user.id, dateKey)
        ?? createDefaultNotepadDocument(dateKey);
}

export async function saveNotepad(input: unknown): Promise<NotepadDocument | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const parsedInput = SaveNotepadDocumentSchema.parse(input);

    return await notepadRepository.saveByDate(session.user.id, parsedInput);
}
