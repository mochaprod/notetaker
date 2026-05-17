import { describe, expect, it } from "vitest";
import {
    getEditableTitle,
    getSaveDocument,
    normalizeTitle,
} from "./title-editor-helpers";

describe("title editor helpers", () => {
    it("uses the persisted document title when one exists", () => {
        expect(getEditableTitle({
            id: "notepad-1",
            dateKey: "2026-05-03",
            title: "Planning notes",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Existing note" }],
                },
            ],
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        })).toBe("Planning notes");
    });

    it("falls back to Untitled for missing or blank titles", () => {
        expect(getEditableTitle(null)).toBe("Untitled");
        expect(getEditableTitle({
            id: "notepad-1",
            dateKey: "2026-05-03",
            title: "",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "" }],
                },
            ],
            createdAt: null,
            updatedAt: null,
        })).toBe("Untitled");
    });

    it("trims saved titles and falls back to Untitled when blank", () => {
        expect(normalizeTitle("  Roadmap  ")).toBe("Roadmap");
        expect(normalizeTitle("   ")).toBe("Untitled");
    });

    it("preserves existing document content for title saves", () => {
        const document = {
            id: "notepad-1",
            dateKey: "2026-05-03",
            title: "Planning notes",
            content: [
                {
                    type: "paragraph" as const,
                    children: [{ text: "Existing note" }],
                },
            ],
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        };

        expect(getSaveDocument("2026-05-03", document)).toEqual(document);
    });

    it("creates an empty default document for title saves before persistence exists", () => {
        expect(getSaveDocument("2026-05-03", null)).toMatchObject({
            id: null,
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "" }],
                },
            ],
            createdAt: null,
            updatedAt: null,
        });
    });
});
