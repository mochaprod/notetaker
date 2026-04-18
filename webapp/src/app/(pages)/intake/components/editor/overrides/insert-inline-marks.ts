import { Editor, Range, Text, Transforms } from "slate";

type InlineMarkdownMark = "bold" | "italic";

type InlineMarkdownMatch = {
    mark: InlineMarkdownMark;
    openStart: number;
    closeStart: number;
    delimiterLength: number;
};

const getActiveTextEntry = (editor: Editor) => {
    if (!editor.selection || !Range.isCollapsed(editor.selection)) {
        return null;
    }

    const { path } = editor.selection.anchor;
    const node = Editor.node(editor, path);

    if (!Text.isText(node[0])) {
        return null;
    }

    return node as [Text, typeof path];
};

const getBoldMatch = (textBeforeCursor: string): InlineMarkdownMatch | null => {
    if (!textBeforeCursor.endsWith("**")) {
        return null;
    }

    const closingStart = textBeforeCursor.length - 2;
    const openingStart = textBeforeCursor.slice(0, closingStart).lastIndexOf("**");

    if (openingStart === -1 || openingStart === closingStart - 2) {
        return null;
    }

    const innerText = textBeforeCursor.slice(openingStart + 2, closingStart);

    if (!innerText || innerText.includes("**")) {
        return null;
    }

    return {
        mark: "bold",
        openStart: openingStart,
        closeStart: closingStart,
        delimiterLength: 2,
    };
};

const getItalicMatch = (textBeforeCursor: string): InlineMarkdownMatch | null => {
    if (!textBeforeCursor.endsWith("*") || textBeforeCursor.endsWith("**")) {
        return null;
    }

    const closingStart = textBeforeCursor.length - 1;

    for (let index = closingStart - 1; index >= 0; index -= 1) {
        if (textBeforeCursor[index] !== "*") {
            continue;
        }

        const previousCharacter = index > 0 ? textBeforeCursor[index - 1] : "";
        const nextCharacter = index + 1 < textBeforeCursor.length ? textBeforeCursor[index + 1] : "";

        if (previousCharacter === "*" || nextCharacter === "*") {
            continue;
        }

        const innerText = textBeforeCursor.slice(index + 1, closingStart);

        if (!innerText || innerText.includes("*")) {
            return null;
        }

        return {
            mark: "italic",
            openStart: index,
            closeStart: closingStart,
            delimiterLength: 1,
        };
    }

    return null;
};

const getInlineMarkdownMatch = (textBeforeCursor: string) => {
    return getBoldMatch(textBeforeCursor) ?? getItalicMatch(textBeforeCursor);
};

const applyInlineMarkdownMark = (
    editor: Editor,
    textPath: number[],
    match: InlineMarkdownMatch,
) => {
    const finalTextEnd = match.closeStart - match.delimiterLength;

    Editor.withoutNormalizing(editor, () => {
        Transforms.delete(editor, {
            at: {
                anchor: {
                    path: textPath,
                    offset: match.closeStart,
                },
                focus: {
                    path: textPath,
                    offset: match.closeStart + match.delimiterLength,
                },
            },
        });

        Transforms.delete(editor, {
            at: {
                anchor: {
                    path: textPath,
                    offset: match.openStart,
                },
                focus: {
                    path: textPath,
                    offset: match.openStart + match.delimiterLength,
                },
            },
        });

        const markLocation: Range = {
            anchor: {
                path: textPath,
                offset: match.openStart,
            },
            focus: {
                path: textPath,
                offset: finalTextEnd,
            },
        };

        const selectionRef = Editor.rangeRef(editor, markLocation);

        Transforms.setNodes(
            editor,
            { [match.mark]: true },
            {
                at: markLocation,
                match: Text.isText,
                split: true,
            },
        );

        const now = selectionRef.unref();

        if (now) {
            Transforms.select(editor, {
                anchor: now.focus,
                focus: now.focus,
            });
            Editor.removeMark(editor, "bold");
            Editor.removeMark(editor, "italic");
        }
    });

    console.log(editor.children);
};

export function installInlineMarkdownMarkOverride<T extends Editor>(
    editor: T,
    originalInsertText: T["insertText"],
) {
    editor.insertText = (text) => {
        originalInsertText(text);

        if (text !== "*") {
            return;
        }

        const activeTextEntry = getActiveTextEntry(editor);

        if (!activeTextEntry || !editor.selection) {
            return;
        }

        const [textNode, textPath] = activeTextEntry;
        const textBeforeCursor = textNode.text.slice(0, editor.selection.anchor.offset);
        const match = getInlineMarkdownMatch(textBeforeCursor);

        if (!match) {
            return;
        }

        applyInlineMarkdownMark(editor, textPath, match);
    };
}
