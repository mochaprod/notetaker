"use client";

import { Editor, Element as SlateElement, Range, Transforms } from "slate";
import type { BaseEditor, Descendant } from "slate";
import { ReactEditor, useSlateStatic, type RenderElementProps } from "slate-react";
import { handleEditorInsertBreak } from "./break-handlers";
import { TopLevelBlock } from "./top-level-block";

export type CustomText = {
    text: string;
};

export type ParagraphElement = {
    type: "paragraph";
    children: CustomText[];
};

export type HeadingOneElement = {
    type: "heading-one";
    children: CustomText[];
};

export type HeadingTwoElement = {
    type: "heading-two";
    children: CustomText[];
};

export type BlockquoteElement = {
    type: "blockquote";
    children: CustomText[];
};

export type ListItemElement = {
    type: "list-item";
    children: CustomText[];
};

export type BulletedListElement = {
    type: "bulleted-list";
    children: ListItemElement[];
};

export type CustomElement =
    | ParagraphElement
    | HeadingOneElement
    | HeadingTwoElement
    | BlockquoteElement
    | ListItemElement
    | BulletedListElement;

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

type MarkdownShortcut = "heading-one" | "heading-two" | "blockquote" | "bulleted-list";
const MARKDOWN_SHORTCUTS: Record<string, MarkdownShortcut> = {
    "#": "heading-one",
    "##": "heading-two",
    ">": "blockquote",
    "-": "bulleted-list",
    "*": "bulleted-list",
};

const createParagraph = (): ParagraphElement => ({
    type: "paragraph",
    children: [{ text: "" }],
});

const findTopLevelBlock = (editor: Editor) => Editor.above(editor, {
    at: editor.selection?.anchor,
    match: (node, path) => path.length === 1 && SlateElement.isElement(node)
        && Editor.isBlock(editor, node),
    mode: "lowest",
});

const createElementFromShortcut = (shortcut: MarkdownShortcut): CustomElement => {
    switch (shortcut) {
        case "heading-one":
            return {
                type: "heading-one",
                children: [{ text: "" }],
            };
        case "heading-two":
            return {
                type: "heading-two",
                children: [{ text: "" }],
            };
        case "blockquote":
            return {
                type: "blockquote",
                children: [{ text: "" }],
            };
        case "bulleted-list":
            return {
                type: "bulleted-list",
                children: [
                    {
                        type: "list-item",
                        children: [{ text: "" }],
                    },
                ],
            };
        default:
            return createParagraph();
    }
};

export const initialEditorValue: Descendant[] = [createParagraph()];

export function withMarkdownShortcuts<T extends Editor>(editor: T): T {
    const { insertText, insertBreak } = editor;

    editor.insertText = (text) => {
        if (text !== " ") {
            insertText(text);
            return;
        }

        if (!editor.selection || !Range.isCollapsed(editor.selection)) {
            insertText(text);
            return;
        }

        const topLevelBlock = findTopLevelBlock(editor);

        if (!topLevelBlock) {
            insertText(text);
            return;
        }

        const [, path] = topLevelBlock;
        const shortcut = MARKDOWN_SHORTCUTS[Editor.string(editor, path)];

        if (!shortcut) {
            insertText(text);
            return;
        }

        Editor.withoutNormalizing(editor, () => {
            Transforms.removeNodes(editor, { at: path });
            Transforms.insertNodes(editor, createElementFromShortcut(shortcut), { at: path });

            const selectionPath = shortcut === "bulleted-list"
                ? path.concat([0, 0])
                : path.concat([0]);

            Transforms.select(editor, {
                anchor: {
                    path: selectionPath,
                    offset: 0,
                },
                focus: {
                    path: selectionPath,
                    offset: 0,
                },
            });
        });
    };

    editor.insertBreak = () => {
        handleEditorInsertBreak(editor, insertBreak);
    };

    return editor;
}

function MarkdownElement(props: RenderElementProps) {
    const editor = useSlateStatic();
    const { attributes, children, element } = props;
    const elementPath = ReactEditor.findPath(editor, element);
    const isTopLevelBlock = elementPath.length === 1;

    const renderedElement = (() => {
        switch (element.type) {
            case "heading-one":
                return (
                    <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                        { children }
                    </h1>
                );
            case "heading-two":
                return (
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        { children }
                    </h2>
                );
            case "blockquote":
                return (
                    <blockquote className="border-l-2 border-neutral-300 pl-4 text-neutral-600 italic dark:border-neutral-700 dark:text-neutral-300">
                        { children }
                    </blockquote>
                );
            case "bulleted-list":
                return (
                    <ul className="list-outside list-disc space-y-1 pl-6">
                        { children }
                    </ul>
                );
            case "list-item":
                return (
                    <li { ...attributes } className="pl-1 whitespace-pre-wrap">
                        { children }
                    </li>
                );
            case "paragraph":
            default:
                return (
                    <p>
                        { children }
                    </p>
                );
        }
    })();

    if (!isTopLevelBlock) {
        return renderedElement;
    }

    return (
        <TopLevelBlock attributes={ attributes } element={ element }>
            { renderedElement }
        </TopLevelBlock>
    );
}

export function renderMarkdownElement(props: RenderElementProps) {
    return <MarkdownElement { ...props } />;
}
