import { z } from "zod";

export const TodoSchema = z.object({
    content: z.string(),
    done: z.boolean(),
    datetime: z.coerce.date().nullable(),
    important: z.boolean(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const TodoDataSchema = TodoSchema.extend({
    id: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export type TodoData = z.infer<typeof TodoDataSchema>;
