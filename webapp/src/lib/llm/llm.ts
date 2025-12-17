import { z } from "zod";
import { Note } from "../db/db";

export const ThemesSchema = z.object({
	name: z.string(),
	notes: z.array(z.string()),
	description: z.string(),
});

export const TaskSchema = z.object({
    noteId: z.string().optional(),
    content: z.string(),
    theme: z.string().nullable(),
    datetime: z.iso.datetime().nullish(),
    important: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;

export const CorrectionSchema = z.object({
    noteId: z.string(),
    explanation: z.string(),
    confidence: z.number(),
});

export const SummaryResponseSchema = z.object({
    summary: z.string(),
    tasks: z.array(TaskSchema),
    followUps: z.array(z.string()),
    corrections: z.array(CorrectionSchema),
    themes: z.array(ThemesSchema),
});

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

export interface LLM {
    summarize(notes: Note[]): Promise<SummaryResponse>;
}
