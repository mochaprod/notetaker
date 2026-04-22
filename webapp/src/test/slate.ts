import { createEditor, type Descendant, type Editor } from "slate";
import { installInsertTextOverride } from "@/app/(pages)/intake/components/editor/overrides/insert-text";
import { installInlineMarkdownMarkOverride } from "@/app/(pages)/intake/components/editor/overrides/insert-inline-marks";
import { installInsertBreakOverride } from "@/app/(pages)/intake/components/editor/overrides/insert-break";
import { installDeleteBackwardOverride } from "@/app/(pages)/intake/components/editor/overrides/delete-backward";
import { installDeleteFragmentOverride } from "@/app/(pages)/intake/components/editor/overrides/delete-fragment";
import { installNormalizeNode } from "@/app/(pages)/intake/components/editor/overrides/normalize-node";

export function createMarkdownEditor(children: Descendant[]): Editor {
    const editor = createEditor();
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

    editor.children = structuredClone(children);

    return editor;
}

export function setCollapsedSelection(editor: Editor, path: number[], offset: number) {
    editor.selection = {
        anchor: {
            path,
            offset,
        },
        focus: {
            path,
            offset,
        },
    };
}
