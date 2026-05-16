"use server";

import { auth } from "@/lib/auth";
import { notepadRepository } from "@/lib/db/db-instance";
import { createEmptySlateDocument, DEFAULT_NOTEPAD_TITLE } from "@/lib/intake/default-document";
import { NotepadDocument, SaveNotepadByIdDocumentSchema, SaveNotepadDocumentSchema } from "@common/types/intake";
import { headers } from "next/headers";

export async function createDefaultNotepadDocument(dateKey: string): Promise<NotepadDocument> {
    return {
        id: null,
        dateKey,
        title: DEFAULT_NOTEPAD_TITLE,
        content: createEmptySlateDocument(),
        createdAt: null,
        updatedAt: null,
    };
}

async function getSessionUserId() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return session?.user?.id ?? null;
}

export async function getDailyNotepad(dateKey: string): Promise<NotepadDocument | null> {
    const userId = await getSessionUserId();

    if (!userId) {
        return null;
    }

    return await notepadRepository.getByDateKey(userId, dateKey)
        ?? createDefaultNotepadDocument(dateKey);
}

export async function getNotepadById(notepadId: string): Promise<NotepadDocument | null> {
    const userId = await getSessionUserId();

    if (!userId) {
        return null;
    }

    const notepad = await notepadRepository.getById(userId, notepadId);

    if (!notepad) {
        throw new Error("Notepad not found");
    }

    return notepad;
}

export async function saveDailyNotepad(input: unknown): Promise<NotepadDocument | null> {
    const userId = await getSessionUserId();

    if (!userId) {
        return null;
    }

    const parsedInput = SaveNotepadDocumentSchema.parse(input);

    return await notepadRepository.saveByDateKey(userId, parsedInput);
}

export async function saveNotepadById(input: unknown): Promise<NotepadDocument | null> {
    const userId = await getSessionUserId();

    if (!userId) {
        return null;
    }

    const parsedInput = SaveNotepadByIdDocumentSchema.parse(input);

    return await notepadRepository.saveById(userId, parsedInput);
}
