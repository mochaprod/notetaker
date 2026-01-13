import { Note } from "../../../../packages/types/src/notes";
import { SummarySchema, TaskSchema } from "@common/types/summary";
import z from "zod";

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
}
