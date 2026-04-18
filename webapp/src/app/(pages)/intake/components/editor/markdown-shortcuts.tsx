"use client";

import { cn } from "@/lib/utils";
import type { Descendant, Editor } from "slate";
import { ReactEditor, useSlateStatic, type RenderElementProps, type RenderLeafProps } from "slate-react";
import { installDeleteBackwardOverride } from "./overrides/delete-backward";
import { installDeleteFragmentOverride } from "./overrides/delete-fragment";
import { installInsertBreakOverride } from "./overrides/insert-break";
import { installInlineMarkdownMarkOverride } from "./overrides/insert-inline-marks";
import { installInsertTextOverride } from "./overrides/insert-text";
import { TopLevelBlock } from "./top-level-block";
import type { ParagraphElement } from "./types";
import { installNormalizeNode } from "./overrides/normalize-node";
import clsx from "clsx";

const createParagraph = (): ParagraphElement => ({
    type: "paragraph",
    children: [{ text: "" }],
});

export const initialEditorValue: Descendant[] = [createParagraph()];

export function withMarkdownShortcuts<T extends Editor>(editor: T): T {
    const {
        insertText,
        insertBreak,
        deleteBackward,
        deleteFragment,
        normalizeNode,
    } = editor;

    installInsertTextOverride(editor, insertText);
    installInlineMarkdownMarkOverride(editor, editor.insertText);
    installInsertBreakOverride(editor, insertBreak);
    installDeleteBackwardOverride(editor, deleteBackward);
    installDeleteFragmentOverride(editor, deleteFragment);
    installNormalizeNode(editor, normalizeNode);

    return editor;
}

const LIST_STYLES = [
    "list-disc",
    "list-[square]",
    "list-[circle]",
];

function getListStyle(pathLength: number) {
    return LIST_STYLES[(pathLength - 1) % LIST_STYLES.length];
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
                    <ul className={ clsx("list-outside space-y-1 pl-6", getListStyle(elementPath.length)) }>
                        { children }
                    </ul>
                );
            case "numbered-list":
                return (
                    <ol className="list-outside list-decimal space-y-1 pl-6">
                        { children }
                    </ol>
                );
            case "list-item":
                return (
                    <li
                        { ...attributes }
                        className={cn(
                            "pl-1 whitespace-pre-wrap",
                            element.variant === "heading-one" && "text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50",
                            element.variant === "heading-two" && "text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100",
                            element.variant === "blockquote" && "border-l-2 border-neutral-300 pl-4 text-neutral-600 italic dark:border-neutral-700 dark:text-neutral-300",
                        )}
                    >
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

function MarkdownLeaf({ attributes, children, leaf }: RenderLeafProps) {
    let renderedChildren = children;

    if (leaf.bold) {
        renderedChildren = <strong>{ renderedChildren }</strong>;
    }

    if (leaf.italic) {
        renderedChildren = <em>{ renderedChildren }</em>;
    }

    return (
        <span { ...attributes }>
            { renderedChildren }
        </span>
    );
}

export function renderMarkdownLeaf(props: RenderLeafProps) {
    return <MarkdownLeaf { ...props } />;
}
