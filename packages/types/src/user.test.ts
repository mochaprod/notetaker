import { describe, expect, it } from "vitest";
import { AICreditError, AICreditSchema } from "./user";

describe("AICreditSchema", () => {
    it("parses non-negative credits", () => {
        const result = AICreditSchema.parse({
            credits: 4,
            updatedAt: "2026-04-22T10:00:00.000Z",
        });

        expect(result.updatedAt).toBeInstanceOf(Date);
        expect(result.credits).toBe(4);
    });

    it("rejects negative credits", () => {
        expect(() => AICreditSchema.parse({
            credits: -1,
            updatedAt: "2026-04-22T10:00:00.000Z",
        })).toThrow();
    });
});

describe("AICreditError", () => {
    it("uses a stable error name", () => {
        const error = new AICreditError("No credits available");

        expect(error.name).toBe("AICreditError");
        expect(error.message).toBe("No credits available");
    });
});
