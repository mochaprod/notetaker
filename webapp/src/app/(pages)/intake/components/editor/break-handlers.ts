import { Editor, Element as SlateElement, Path, Range, Transforms } from "slate";

type BreakElementType = "paragraph" | "heading-one" | "heading-two" | "blockquote" | "list-item" | "bulleted-list";

type BreakTarget = {
    type: BreakElementType;
    path: Path;
};

type BreakHandler = (editor: Editor, targetPath: Path, originalInsertBreak: () => void) => void;

const findTopLevelBlock = (editor: Editor) => Editor.above(editor, {
    at: editor.selection?.anchor,
    match: (node, path) => {
        return path.length === 1 && SlateElement.isElement(node) && Editor.isBlock(editor, node);
    },
    mode: "lowest",
});

const findCurrentListItem = (editor: Editor) => Editor.above(editor, {
    at: editor.selection?.anchor,
    match: (node) => {
        return SlateElement.isElement(node) && node.type === "list-item";
    },
    mode: "lowest",
});

const findBreakTarget = (editor: Editor): BreakTarget | null => {
    const listItem = findCurrentListItem(editor);

    if (listItem && SlateElement.isElement(listItem[0])) {
        return {
            type: listItem[0].type as BreakElementType,
            path: listItem[1],
        };
    }

    const topLevelBlock = findTopLevelBlock(editor);

    if (topLevelBlock && SlateElement.isElement(topLevelBlock[0])) {
        return {
            type: topLevelBlock[0].type as BreakElementType,
            path: topLevelBlock[1],
        };
    }

    return null;
};

const handleParagraphBreak: BreakHandler = (_, __, originalInsertBreak) => {
    originalInsertBreak();
};

const handleResettingBlockBreak: BreakHandler = (editor, targetPath) => {
    const selection = editor.selection;

    if (!selection || !Range.isRange(selection)) {
        return;
    }

    Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor, {
            at: selection,
            match: (_, path) => Path.equals(path, targetPath),
            always: true,
        });

        Transforms.setNodes(editor, {
            type: "paragraph",
        }, {
            at: Path.next(targetPath),
        });
    });
};

export const liftListItemUp = (editor: Editor, selection: Range) => {
    Editor.withoutNormalizing(editor, () => {
        Transforms.unwrapNodes(editor, {
            at: selection,
            match: (node) => SlateElement.isElement(node) && node.type === "bulleted-list",
            split: true,
        });

        const liftedItem = Editor.above(editor, {
            at: editor.selection?.anchor,
            match: (node) => SlateElement.isElement(node) && node.type === "list-item",
            mode: "lowest",
        });

        if (!liftedItem) {
            return;
        }

        if (liftedItem[1].length <= 1) {
            Transforms.setNodes(editor, {
                type: "paragraph",
            }, {
                at: liftedItem[1],
            });
        }
    });
};

const handleListItemBreak: BreakHandler = (editor, targetPath, originalInsertBreak) => {
    const { selection } = editor;
    const [listItemNode] = Editor.node(editor, targetPath);
    const currentText = Editor.string(editor, targetPath).trim();

    if (!SlateElement.isElement(listItemNode) || listItemNode.type !== "list-item") {
        originalInsertBreak();
        return;
    }

    if (currentText.length > 0) {
        originalInsertBreak();
        return;
    }

    if (!selection || !Range.isRange(selection)) {
        originalInsertBreak();
        return;
    }

    liftListItemUp(editor, selection);
};

const BREAK_HANDLERS: Partial<Record<BreakElementType, BreakHandler>> = {
    paragraph: handleParagraphBreak,
    "heading-one": handleResettingBlockBreak,
    "heading-two": handleResettingBlockBreak,
    blockquote: handleResettingBlockBreak,
    "list-item": handleListItemBreak,
};

export function handleEditorInsertBreak(editor: Editor, originalInsertBreak: () => void) {
    if (!editor.selection) {
        originalInsertBreak();
        return;
    }

    const target = findBreakTarget(editor);

    if (!target) {
        originalInsertBreak();
        return;
    }

    const handler = BREAK_HANDLERS[target.type];

    if (!handler) {
        originalInsertBreak();
        return;
    }

    handler(editor, target.path, originalInsertBreak);
}
