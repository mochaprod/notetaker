import { describe, expect, it } from "vitest";
import { NotepadDocumentSchema, SaveNotepadDocumentSchema, SlateDocumentSchema } from "./intake";

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
    it("parses persisted documents", () => {
        const result = NotepadDocumentSchema.parse({
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

        expect(result.createdAt).toBeInstanceOf(Date);
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
