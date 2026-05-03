import { Note, NoteSchema } from "../../../packages/types/src/notes";
import z from "zod/v4";

export const NotesResponseSchema = z.object({
    notes: z.array(NoteSchema),
});

export async function fetchNotesByDate(date: Date): Promise<Note[]> {
    const response = await fetch(`/api/notes?date=${date.toISOString()}`);
    const notesResponse = NotesResponseSchema.parse(await response.json());

    return notesResponse.notes;
}
