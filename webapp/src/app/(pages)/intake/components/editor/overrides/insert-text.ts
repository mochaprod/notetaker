import { Editor, Element as SlateElement, Node, Path, Range, Text, Transforms } from "slate";
import type {
    BulletedListElement,
    BlockquoteElement,
    CustomElement,
    HeadingOneElement,
    HeadingTwoElement,
    ListItemVariant,
    ParagraphElement,
} from "../types";

type MarkdownShortcut = "heading-one" | "heading-two" | "blockquote" | "bulleted-list";

type MarkdownShortcutTarget =
    | { kind: "top-level"; path: Path }
    | { kind: "list-item"; path: Path };

const MARKDOWN_SHORTCUTS: Record<string, MarkdownShortcut> = {
    "#": "heading-one",
    "##": "heading-two",
    ">": "blockquote",
    "-": "bulleted-list",
    "*": "bulleted-list",
};

const findTopLevelBlock = (editor: Editor) => Editor.above(editor, {
    at: editor.selection?.anchor,
    match: (node, path) => path.length === 1 && SlateElement.isElement(node)
        && Editor.isBlock(editor, node),
    mode: "lowest",
});

const findCurrentListItem = (editor: Editor) => Editor.above(editor, {
    at: editor.selection?.anchor,
    match: (node) => SlateElement.isElement(node) && node.type === "list-item",
    mode: "lowest",
});

const findMarkdownShortcutTarget = (editor: Editor): MarkdownShortcutTarget | null => {
    const listItem = findCurrentListItem(editor);

    if (listItem) {
        return {
            kind: "list-item",
            path: listItem[1],
        };
    }

    const topLevelBlock = findTopLevelBlock(editor);

    if (topLevelBlock) {
        return {
            kind: "top-level",
            path: topLevelBlock[1],
        };
    }

    return null;
};

const createParagraph = (): ParagraphElement => ({
    type: "paragraph",
    children: [{ text: "" }],
});

const createElementFromShortcut = (shortcut: MarkdownShortcut): CustomElement => {
    switch (shortcut) {
        case "heading-one":
            return {
                type: "heading-one",
                children: [{ text: "" }],
            } satisfies HeadingOneElement;
        case "heading-two":
            return {
                type: "heading-two",
                children: [{ text: "" }],
            } satisfies HeadingTwoElement;
        case "blockquote":
            return {
                type: "blockquote",
                children: [{ text: "" }],
            } satisfies BlockquoteElement;
        case "bulleted-list":
            return {
                type: "bulleted-list",
                children: [
                    {
                        type: "list-item",
                        children: [{ text: "" }],
                    },
                ],
            } satisfies BulletedListElement;
        default:
            return createParagraph();
    }
};

const createCollapsedSelection = (path: Path) => ({
    anchor: {
        path,
        offset: 0,
    },
    focus: {
        path,
        offset: 0,
    },
});

const getActiveTextPathWithinListItem = (editor: Editor, listItemPath: Path): Path | null => {
    const anchorPath = editor.selection?.anchor.path;

    if (anchorPath && Path.isDescendant(anchorPath, listItemPath)) {
        const [anchorNode] = Editor.node(editor, anchorPath);

        if (Text.isText(anchorNode)) {
            return anchorPath;
        }
    }

    const textNode = Editor.nodes(editor, {
        at: listItemPath,
        match: Text.isText,
        mode: "all",
    }).next().value;

    return textNode?.[1] ?? null;
};

const getListItemShortcutText = (editor: Editor, listItemPath: Path): string | null => {
    const textPath = getActiveTextPathWithinListItem(editor, listItemPath);

    if (!textPath) {
        return null;
    }

    const textNode = Node.get(editor, textPath);

    if (!Text.isText(textNode)) {
        return null;
    }

    return textNode.text;
};

const applyTopLevelMarkdownShortcut = (
    editor: Editor,
    path: Path,
    shortcut: MarkdownShortcut,
) => {
    Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: path });
        Transforms.insertNodes(editor, createElementFromShortcut(shortcut), { at: path });

        const selectionPath = shortcut === "bulleted-list"
            ? path.concat([0, 0])
            : path.concat([0]);

        Transforms.select(editor, createCollapsedSelection(selectionPath));
    });
};

const getListItemVariantFromShortcut = (shortcut: MarkdownShortcut): ListItemVariant | null => {
    switch (shortcut) {
        case "heading-one":
            return "heading-one";
        case "heading-two":
            return "heading-two";
        case "blockquote":
            return "blockquote";
        default:
            return null;
    }
};

const applyListItemMarkdownShortcut = (
    editor: Editor,
    path: Path,
    shortcut: MarkdownShortcut,
    insertLiteralText: (text: string) => void,
) => {
    const variant = getListItemVariantFromShortcut(shortcut);
    const textPath = getActiveTextPathWithinListItem(editor, path);

    if (!variant || !textPath) {
        insertLiteralText(" ");
        return;
    }

    Editor.withoutNormalizing(editor, () => {
        Transforms.delete(editor, {
            at: {
                anchor: {
                    path: textPath,
                    offset: 0,
                },
                focus: {
                    path: textPath,
                    offset: shortcut.length,
                },
            },
        });

        Transforms.setNodes(editor, {
            variant,
        }, {
            at: path,
        });

        Transforms.select(editor, createCollapsedSelection(textPath));
    });
};

export function installInsertTextOverride<T extends Editor>(
    editor: T,
    originalInsertText: T["insertText"],
) {
    editor.insertText = (text) => {
        if (text !== " ") {
            originalInsertText(text);
            return;
        }

        if (!editor.selection || !Range.isCollapsed(editor.selection)) {
            originalInsertText(text);
            return;
        }

        const shortcutTarget = findMarkdownShortcutTarget(editor);

        if (!shortcutTarget) {
            originalInsertText(text);
            return;
        }

        const { path } = shortcutTarget;
        const shortcutText = shortcutTarget.kind === "list-item"
            ? getListItemShortcutText(editor, path)
            : Editor.string(editor, path);
        const shortcut = shortcutText ? MARKDOWN_SHORTCUTS[shortcutText] : undefined;

        if (!shortcut) {
            originalInsertText(text);
            return;
        }

        if (shortcutTarget.kind === "list-item") {
            applyListItemMarkdownShortcut(editor, path, shortcut, originalInsertText);
            return;
        }

        applyTopLevelMarkdownShortcut(editor, path, shortcut);
    };
}
