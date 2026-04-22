import { describe, expect, it } from "vitest";
import { TodoDataSchema, TodoSchema } from "./todo";

describe("TodoSchema", () => {
    it("parses a valid todo payload", () => {
        const result = TodoSchema.parse({
            content: "Follow up with client",
            done: false,
            datetime: "2026-04-20T10:00:00.000Z",
            important: true,
        });

        expect(result.datetime).toBeInstanceOf(Date);
        expect(result.important).toBe(true);
    });

    it("rejects invalid todo payloads", () => {
        expect(() => TodoSchema.parse({
            content: "Missing state",
            important: false,
        })).toThrow();
    });
});

describe("TodoDataSchema", () => {
    it("parses persisted todo records", () => {
        const result = TodoDataSchema.parse({
            id: "todo-1",
            content: "Ship tests",
            done: true,
            datetime: null,
            important: false,
            createdAt: "2026-04-20T09:00:00.000Z",
            updatedAt: "2026-04-20T09:30:00.000Z",
        });

        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
    });
});
