import { describe, expect, it } from "vitest";
import { createMarkdownEditor, setCollapsedSelection } from "@/test/slate";

describe("insert break behavior", () => {
    it("resets headings back to paragraphs on the next line", () => {
        const editor = createMarkdownEditor([
            {
                type: "heading-one",
                children: [{ text: "Title" }],
            },
        ]);

        setCollapsedSelection(editor, [0, 0], "Title".length);
        editor.insertBreak();

        expect(editor.children).toMatchObject([
            {
                type: "heading-one",
                children: [{ text: "Title" }],
            },
            {
                type: "paragraph",
            },
        ]);
    });

    it("creates a default list item after a styled list item", () => {
        const editor = createMarkdownEditor([
            {
                type: "bulleted-list",
                children: [
                    {
                        type: "list-item",
                        variant: "heading-two",
                        children: [{ text: "Agenda" }],
                    },
                ],
            },
        ]);

        setCollapsedSelection(editor, [0, 0, 0], "Agenda".length);
        editor.insertBreak();

        expect(editor.children[0]).toMatchObject({
            type: "bulleted-list",
            children: [
                {
                    type: "list-item",
                    variant: "heading-two",
                    children: [{ text: "Agenda" }],
                },
                {
                    type: "list-item",
                    variant: "default",
                },
            ],
        });
    });
});
