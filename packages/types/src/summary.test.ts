import { describe, expect, it } from "vitest";
import { SummarySchema } from "./summary";

describe("SummarySchema", () => {
    it("parses a valid summary payload", () => {
        const result = SummarySchema.parse({
            id: "550e8400-e29b-41d4-a716-446655440000",
            startDate: "2026-04-20",
            endDate: "2026-04-20",
            summary: "A productive day.",
            tasks: [
                {
                    noteIds: ["note-1"],
                    content: "Email the team",
                    theme: null,
                    datetime: "2026-04-21T12:00:00.000Z",
                    important: true,
                },
            ],
            followUps: ["Should this become a recurring task?"],
            corrections: [
                {
                    noteId: "note-1",
                    explanation: "Adjusted the task owner.",
                    confidence: 0.9,
                },
            ],
            themes: [
                {
                    name: "Planning",
                    noteIds: ["note-1"],
                    description: "Planning and follow-up work.",
                },
            ],
        });

        expect(result.tasks[0].datetime).toBeInstanceOf(Date);
        expect(result.themes[0].name).toBe("Planning");
    });

    it("rejects invalid summary identifiers", () => {
        expect(() => SummarySchema.parse({
            id: "not-a-uuid",
            startDate: "2026-04-20",
            endDate: "2026-04-20",
            summary: "Bad identifier",
            tasks: [],
            followUps: [],
            corrections: [],
            themes: [],
        })).toThrow();
    });
});
