import z from "zod";

export const NoteSchema = z.object({
    id: z.string(),
    key: z.string(),
    message: z.string(),
    createdAt: z.iso.datetime(),
});

export type Note = z.infer<typeof NoteSchema>;

export interface NoteRepository {
    putNotes: (key: string, value: string) => Promise<Note>;
    getNotes: (key: string, startDate?: Date, endDate?: Date) => Promise<Note[]>;
    updateNotes: (key: string, value: string) => Promise<void>;
    deleteNotes: (key: string) => Promise<void>;
}

export interface DigestRepository {
}
