"use client";

import { cn } from "@/lib/utils";
import { Editor, Element as SlateElement, Path } from "slate";
import { RenderElementProps, ReactEditor, useFocused, useSlate } from "slate-react";
import type { ReactNode } from "react";

type TopLevelBlockProps = Pick<RenderElementProps, "attributes" | "element"> & {
    children: ReactNode;
};

const findActiveTopLevelBlockPath = (editor: Editor) => {
    if (!editor.selection) {
        return null;
    }

    const activeBlock = Editor.above(editor, {
        at: editor.selection.anchor,
        match: (node, path) => {
            return path.length === 1 && SlateElement.isElement(node) && Editor.isBlock(editor, node);
        },
        mode: "lowest",
    });

    return activeBlock?.[1] ?? null;
};

export function TopLevelBlock({ attributes, children, element }: TopLevelBlockProps) {
    const editor = useSlate();
    const focused = useFocused();
    const blockPath = ReactEditor.findPath(editor, element);
    const activeTopLevelPath = findActiveTopLevelBlockPath(editor);
    const isActive = focused && !!activeTopLevelPath && Path.equals(blockPath, activeTopLevelPath);

    return (
        <div
            { ...attributes }
            className={cn(
                "relative px-1.5 py-1 rounded-md transition-colors",
                "hover:bg-neutral-100 dark:hover:bg-neutral-100",
                isActive && "border-neutral-300 bg-neutral-950/4 dark:border-white/15 dark:bg-white/6",
                "dark:hover:bg-white/20",
            )}
        >
            { children }
        </div>
    );
}
