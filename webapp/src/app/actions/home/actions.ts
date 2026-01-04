"use server";

import { auth } from "@/lib/auth";
import { noteRepository } from "@/lib/db/db-instance";
import { createEmbeddingsClient } from "@/lib/embeddings/factory";
import { LOGGER } from "@/lib/logger";
import { createVectorDBClient } from "@/lib/vector/client";
import { Note } from "@common/types/notes";
import { headers } from "next/headers";

export async function addNote(data: string): Promise<Note | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !data || data.trim().length === 0) {
        return null;
    }

    const embeddingsClient = createEmbeddingsClient();
    const vectorDBClient = await createVectorDBClient();

    const note = await noteRepository.putNotes(session.user.id, data.trim());
    const embeddings = await embeddingsClient.generateEmbeddings(note.message);

    LOGGER.info(embeddings, "Generated embeddings");

    await vectorDBClient.add([{
        id: note.id,
        embedding: embeddings,
    }]);

    return note;
}

export async function editNote(id: string, content: string): Promise<void> {
    const embeddingsClient = createEmbeddingsClient();
    const vectorDBClient = await createVectorDBClient();

    await noteRepository.updateNotes(id, content);
    const embeddings = await embeddingsClient.generateEmbeddings(content);
    await vectorDBClient.upsert([{
        id,
        embedding: embeddings,
    }]);
}

export async function deleteNote(id: string): Promise<void> {
    const vectorDBClient = await createVectorDBClient();

    await noteRepository.deleteNotes(id);
    await vectorDBClient.delete([id]);
}
