"use server";

import { auth } from "@/lib/auth";
import { noteRepository } from "@/lib/db/db-instance";
import { pineconeDB } from "@/lib/vector/pinecone";
import { Note } from "../../../../../packages/types/src/notes";
import { headers } from "next/headers";

export async function addNote(data: string): Promise<Note | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !data || data.trim().length === 0) {
        return null;
    }

    const note = await noteRepository.putNotes(session.user.id, data.trim());

    await pineconeDB.upsert([{
        id: note.id,
        text: data.trim(),
        userId: session.user.id,
    }]);

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
    await pineconeDB.upsert([{
        id,
        text: content,
        userId: session?.user.id,
    }]);
}

export async function deleteNote(id: string): Promise<void> {
    await noteRepository.deleteNotes(id);
    await pineconeDB.delete([id]);
}
