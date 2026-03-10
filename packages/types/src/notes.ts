import { z } from "zod";

export const NoteSchema = z.object({
    id: z.string(),
    key: z.string(),
    message: z.string(),
    createdAt: z.coerce.date(),
});

export type Note = z.infer<typeof NoteSchema>;
