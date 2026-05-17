import { Node, Text } from "slate";
import { describe, expect, it } from "vitest";
import { createMarkdownEditor, setCollapsedSelection } from "@/test/slate";

function getTextNodes(editor: ReturnType<typeof createMarkdownEditor>) {
    return Array.from(Node.texts(editor)).map(([node]) => node);
}

describe("inline markdown marks", () => {
    it("converts bold markdown and continues typing with plain text", () => {
        const editor = createMarkdownEditor([
            {
                type: "paragraph",
                children: [{ text: "" }],
            },
        ]);

        setCollapsedSelection(editor, [0, 0], 0);

        for (const character of "**bold**") {
            editor.insertText(character);
        }

        expect(Node.string(editor)).toBe("bold");
        expect(getTextNodes(editor)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    text: "bold",
                    bold: true,
                }),
            ]),
        );

        editor.insertText("!");

        expect(Node.string(editor)).toBe("bold!");
        expect(getTextNodes(editor)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    text: "!",
                }),
            ]),
        );
        expect(getTextNodes(editor).some((node) => Text.isText(node) && node.text === "!" && !node.bold && !node.italic)).toBe(true);
    });

    it("converts italic markdown", () => {
        const editor = createMarkdownEditor([
            {
                type: "paragraph",
                children: [{ text: "" }],
            },
        ]);

        setCollapsedSelection(editor, [0, 0], 0);

        for (const character of "*note*") {
            editor.insertText(character);
        }

        expect(Node.string(editor)).toBe("note");
        expect(getTextNodes(editor)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    text: "note",
                    italic: true,
                }),
            ]),
        );
    });
});
