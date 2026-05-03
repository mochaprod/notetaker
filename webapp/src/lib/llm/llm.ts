import type { Note } from "@common/types/notes";
import { SummarySchema, TaskSchema } from "@common/types/summary";
import z from "zod/v4";

export const LLMSummarySchema = SummarySchema.extend({
    tasks: z.array(TaskSchema.extend({
        datetime: z.iso.datetime().nullable(),
    })),
})
.omit({
    id: true,
    startDate: true,
    endDate: true,
});

export type LLMSummary = z.infer<typeof LLMSummarySchema>;

export interface LLM {
    summarize(notes: Note[]): Promise<LLMSummary>;
    call<R>(prompt: string, responseSchema: z.ZodSchema<R>, model: string): Promise<R>;
}
