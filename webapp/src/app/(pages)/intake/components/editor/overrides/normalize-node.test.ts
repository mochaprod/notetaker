import { Editor } from "slate";
import { describe, expect, it } from "vitest";
import { createMarkdownEditor } from "@/test/slate";

describe("list normalization", () => {
    it("unwraps directly nested list containers", () => {
        const editor = createMarkdownEditor([
            {
                type: "bulleted-list",
                children: [
                    {
                        type: "bulleted-list",
                        children: [
                            {
                                type: "bulleted-list",
                                children: [
                                    {
                                        type: "list-item",
                                        children: [{ text: "Nested item" }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]);

        Editor.normalize(editor, {
            force: true,
        });

        expect(editor.children[0]).toMatchObject({
            type: "bulleted-list",
            children: [
                {
                    type: "bulleted-list",
                    children: [
                        {
                            type: "list-item",
                            children: [{ text: "Nested item" }],
                        },
                    ],
                },
            ],
        });
    });
});
