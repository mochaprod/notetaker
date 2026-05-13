import { describe, expect, it } from "vitest";
import {
    DailyNotepadDocumentSchema,
    NotepadDocumentSchema,
    PersistedNotepadDocumentSchema,
    SaveNotepadDocumentSchema,
    SlateDocumentSchema,
} from "./intake";

describe("SlateDocumentSchema", () => {
    it("parses a valid Slate document", () => {
        const result = SlateDocumentSchema.parse([
            {
                type: "heading-one",
                children: [{ text: "Daily notes", bold: true }],
            },
            {
                type: "paragraph",
                children: [{ text: "Follow up with the team." }],
            },
        ]);

        expect(result).toHaveLength(2);
    });

    it("rejects unsupported node types", () => {
        expect(() => SlateDocumentSchema.parse([
            {
                type: "unsupported",
                children: [{ text: "Bad node" }],
            },
        ])).toThrow();
    });
});

describe("notepad document schemas", () => {
    it("parses persisted notepads without daily identity", () => {
        const result = PersistedNotepadDocumentSchema.parse({
            id: "notepad-1",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "" }],
                },
            ],
            createdAt: "2026-05-03T10:00:00.000Z",
            updatedAt: "2026-05-03T10:01:00.000Z",
        });

        expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("parses daily notepad documents with a date key", () => {
        const result = DailyNotepadDocumentSchema.parse({
            id: "notepad-1",
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "" }],
                },
            ],
            createdAt: "2026-05-03T10:00:00.000Z",
            updatedAt: "2026-05-03T10:01:00.000Z",
        });

        expect(result.dateKey).toBe("2026-05-03");
        expect(NotepadDocumentSchema.parse(result).dateKey).toBe("2026-05-03");
    });

    it("validates save payloads", () => {
        const result = SaveNotepadDocumentSchema.parse({
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Draft" }],
                },
            ],
        });

        expect(result.dateKey).toBe("2026-05-03");
    });
});
