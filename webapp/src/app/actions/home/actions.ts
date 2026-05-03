"use server";

import { auth } from "@/lib/auth";
import { noteRepository } from "@/lib/db/db-instance";
import { Note } from "@common/types/notes";
import { headers } from "next/headers";

export async function addNote(data: string): Promise<Note | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !data || data.trim().length === 0) {
        return null;
    }

    const note = await noteRepository.putNotes(session.user.id, data.trim());

    return note;
}

export async function editNote(id: string, content: string): Promise<void> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !content || content.trim().length === 0) {
        return;
    }

    await noteRepository.updateNotes(id, content);
}

export async function deleteNote(id: string): Promise<void> {
    await noteRepository.deleteNotes(id);
}
