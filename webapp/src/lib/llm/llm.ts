import { z } from "zod";

export const ThemesSchema = z.object({
	name: z.string(),
	notes: z.array(z.string()),
	description: z.string(),
});

export const TaskSchema = z.object({
    noteId: z.string().optional(),
    content: z.string(),
});

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
    summarize(content: string): Promise<SummaryResponse | undefined>;
}
