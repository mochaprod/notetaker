import { Node } from "slate";
import { describe, expect, it } from "vitest";
import { createMarkdownEditor, setCollapsedSelection } from "@/test/slate";

describe("insert text markdown shortcuts", () => {
    it("converts a top-level heading shortcut and preserves the remaining text", () => {
        const editor = createMarkdownEditor([
            {
                type: "paragraph",
                children: [{ text: "###Roadmap" }],
            },
        ]);

        setCollapsedSelection(editor, [0, 0], "###Roadmap".length);
        editor.insertText(" ");

        expect(editor.children[0]).toMatchObject({
            type: "heading-three",
            children: [{ text: "Roadmap" }],
        });
        expect(editor.selection).toMatchObject({
            anchor: {
                path: [0, 0],
                offset: "Roadmap".length,
            },
        });
    });

    it("applies inline heading variants inside list items", () => {
        const editor = createMarkdownEditor([
            {
                type: "bulleted-list",
                children: [
                    {
                        type: "list-item",
                        children: [{ text: "##Agenda" }],
                    },
                ],
            },
        ]);

        setCollapsedSelection(editor, [0, 0, 0], "##Agenda".length);
        editor.insertText(" ");

        expect(editor.children[0]).toMatchObject({
            type: "bulleted-list",
            children: [
                {
                    type: "list-item",
                    variant: "heading-two",
                    children: [{ text: "Agenda" }],
                },
            ],
        });
    });

    it("falls back to a literal space for bullet shortcuts inside an existing list item", () => {
        const editor = createMarkdownEditor([
            {
                type: "bulleted-list",
                children: [
                    {
                        type: "list-item",
                        children: [{ text: "-Buy" }],
                    },
                ],
            },
        ]);

        setCollapsedSelection(editor, [0, 0, 0], "-Buy".length);
        editor.insertText(" ");

        expect(Node.string(editor)).toBe("-Buy ");
        expect(editor.children[0]).toMatchObject({
            type: "bulleted-list",
            children: [
                {
                    type: "list-item",
                    children: [{ text: "-Buy " }],
                },
            ],
        });
    });
});
