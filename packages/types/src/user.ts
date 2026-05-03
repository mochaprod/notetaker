import { z } from "zod/v4";

export const AICreditSchema = z.object({
    credits: z.number().min(0),
    updatedAt: z.coerce.date(),
});

export type AICredit = z.infer<typeof AICreditSchema>;

export class AICreditError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AICreditError";
    }
}
