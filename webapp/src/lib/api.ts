import z from "zod";
import { Note, NoteSchema } from "./db/db";

export const NotesResponseSchema = z.object({
    notes: z.array(NoteSchema),
});

export async function fetchNotesByDate(date: Date): Promise<Note[]> {
    const response = await fetch(`/api/notes?date=${date.toISOString()}`);
    const notesResponse = NotesResponseSchema.parse(await response.json());

    return notesResponse.notes;
}
