import z from "zod";

export const ThemesSchema = z.object({
	name: z.string(),
	noteIds: z.array(z.string()),
	description: z.string(),
});

export const TaskSchema = z.object({
    noteIds: z.array(z.string()),
    content: z.string(),
    theme: z.string().nullable(),
    datetime: z.coerce.date().nullable(),
    important: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;

export const CorrectionSchema = z.object({
    noteId: z.string(),
    explanation: z.string(),
    confidence: z.number(),
});

export const SummarySchema = z.object({
    id: z.uuid(),
    startDate: z.string(),
    endDate: z.string(),
    summary: z.string(),
    tasks: z.array(TaskSchema),
    followUps: z.array(z.string()),
    corrections: z.array(CorrectionSchema),
    themes: z.array(ThemesSchema),
});

export type Summary = z.infer<typeof SummarySchema>;
