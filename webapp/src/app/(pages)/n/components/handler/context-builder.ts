import { Editor, Element, Node, Path } from "slate";

export type BuildNoteContextFromCurrentSelectionReturn = {
    text: string;
    primary?: boolean;
};

export type VisibleLineSnapshot = {
    index: number;
    path: Path;
    text: string;
    node: Node;
};

export type BuildNoteContextFromCurrentSelectionOptions = {
    captureBlocksBefore: number;
    captureBlocksAfter: number;
};

const DEFAULT_BUILD_NOTE_CONTEXT_FROM_CURRENT_SELECTION_OPTIONS: BuildNoteContextFromCurrentSelectionOptions = {
    captureBlocksBefore: 3,
    captureBlocksAfter: 3,
};

const isListItem = (node: Node): boolean => {
    return Element.isElement(node) && "type" in node && node.type === "list-item";
};

const isBulletedList = (node: Node): boolean => {
    return Element.isElement(node) && "type" in node && node.type === "bulleted-list";
};

const isVisibleLineNode = (editor: Editor, node: Node, path: Path): boolean => {
    if (!Element.isElement(node) || !Editor.isBlock(editor, node)) {
        return false;
    }

    if (isListItem(node)) {
        return true;
    }

    return path.length === 1 && !isBulletedList(node);
};

export function getVisibleLineSnapshots(editor: Editor): VisibleLineSnapshot[] {
    return Array.from(Editor.nodes(editor, {
        at: [],
        match: (node, path) => isVisibleLineNode(editor, node, path),
    })).map(([node, path], index) => ({
        index,
        path,
        text: Node.string(node),
        node,
    }));
}

/**
 * Builds a context based on the current selection on the editor.
 * @param editor
 */
export function buildNoteContextFromCurrentSelection(editor: Editor, options?: BuildNoteContextFromCurrentSelectionOptions): BuildNoteContextFromCurrentSelectionReturn[] {
    const {
        captureBlocksBefore,
        captureBlocksAfter,
    } = { ...DEFAULT_BUILD_NOTE_CONTEXT_FROM_CURRENT_SELECTION_OPTIONS, ...options };

    const { selection } = editor;

    if (!selection) {
        return [];
    }

    const currentLine = Editor.above(editor, {
        at: selection.anchor,
        match: (node, path) => {
            return isVisibleLineNode(editor, node, path);
        },
        mode: "lowest",
    });

    if (!currentLine) {
        return [];
    }

    const visibleLines = getVisibleLineSnapshots(editor);
    const currentLineIndex = visibleLines.findIndex((line) => Path.equals(line.path, currentLine[1]));

    if (currentLineIndex === -1) {
        return [];
    }

    const precedingLines = visibleLines.slice(Math.max(0, currentLineIndex - captureBlocksBefore), currentLineIndex);
    const succeedingLines = visibleLines.slice(currentLineIndex + 1, currentLineIndex + 1 + captureBlocksAfter);

    return [
        ...precedingLines.map((line) => ({ text: line.text })),
        {
            text: visibleLines[currentLineIndex].text,
            primary: true,
        },
        ...succeedingLines.map((line) => ({ text: line.text })),
    ];
}
