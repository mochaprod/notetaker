"use server";

import { Note } from "@/lib/db/db";
import { db } from "@/lib/db/db-instance";
import { createEmbeddingsClient } from "@/lib/embeddings/factory";
import { createVectorDBClient } from "@/lib/vector/client";

export async function addNote(data: string): Promise<Note | null> {
    if (!data || data.trim().length === 0) {
        return null;
    }

    const embeddingsClient = createEmbeddingsClient();
    const vectorDBClient = await createVectorDBClient();

    const note = await db.putNotes("default", data.trim());
    const embeddings = await embeddingsClient.generateEmbeddings(note.message);

    console.log("Generated embeddings:", embeddings);

    await vectorDBClient.add([{
        id: note.id,
        embedding: embeddings,
    }]);

    return note;
}

export async function editNote(id: string, content: string): Promise<void> {
    const embeddingsClient = createEmbeddingsClient();
    const vectorDBClient = await createVectorDBClient();

    await db.updateNotes(id, content);
    const embeddings = await embeddingsClient.generateEmbeddings(content);
    await vectorDBClient.upsert([{
        id,
        embedding: embeddings,
    }]);
}

export async function deleteNote(id: string): Promise<void> {
    const vectorDBClient = await createVectorDBClient();

    await db.deleteNotes(id);
    await vectorDBClient.delete([id]);
}
