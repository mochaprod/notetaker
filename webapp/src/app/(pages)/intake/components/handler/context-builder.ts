import { BaseEditor, Descendant, Editor, Element, Node, NodeEntry } from "slate";

export type BuildNoteContextFromCurrentSelectionReturn = {
    text: string;
    primary?: boolean;
};

export type BuildNoteContextFromCurrentSelectionOptions = {
    captureBlocksBefore: number;
    captureBlocksAfter: number;
};

const DEFAULT_BUILD_NOTE_CONTEXT_FROM_CURRENT_SELECTION_OPTIONS: BuildNoteContextFromCurrentSelectionOptions = {
    captureBlocksBefore: 3,
    captureBlocksAfter: 3,
};

/**
 * Builds a context based on the current selection on the editor.
 * @param editor
 */
export function buildNoteContextFromCurrentSelection(editor: BaseEditor, options?: BuildNoteContextFromCurrentSelectionOptions): BuildNoteContextFromCurrentSelectionReturn[] {
    const {
        captureBlocksBefore,
        captureBlocksAfter,
    } = { ...DEFAULT_BUILD_NOTE_CONTEXT_FROM_CURRENT_SELECTION_OPTIONS, ...options };

    const { selection } = editor;

    if (!selection) {
        return [];
    }

    const currentBlock = Editor.above(editor, {
        at: selection.anchor,
        match: (node, path) => {
            return path.length === 1 && Element.isElement(node) && Editor.isBlock(editor, node);
        },
        mode: "lowest",
    });

    if (!currentBlock) {
        return [];
    }

    const precedingBlocks: NodeEntry<Node>[] = [];
    let currentPrecedingBlock: NodeEntry = currentBlock;

    for (let i = 0; i < captureBlocksBefore; i++) {
        const block = Editor.previous(editor, {
            at: currentPrecedingBlock[1],
            match: (node, path) => {
                return path.length === 1 && Element.isElement(node) && Editor.isBlock(editor, node);
            },
            mode: "lowest",
        });

        if (!block) {
            break;
        }

        precedingBlocks.unshift(block);
        currentPrecedingBlock = block;
    }

    const succeedingBlocks: NodeEntry<Descendant>[] = [];
    let currentSucceedingBlock: NodeEntry = currentBlock;

    for (let i = 0; i < captureBlocksAfter; i++) {
        const block = Editor.next(editor, {
            at: currentSucceedingBlock[1],
            match: (node, path) => {
                return path.length === 1 && Element.isElement(node) && Editor.isBlock(editor, node);
            },
            mode: "lowest",
        });

        if (!block) {
            break;
        }

        succeedingBlocks.push(block);
        currentSucceedingBlock = block;
    }

    return [
        ...precedingBlocks.map((block) => ({ text: Node.string(block[0]) })),
        {
            text: Node.string(currentBlock[0]),
            primary: true,
        },
        ...succeedingBlocks.map((block) => ({ text: Node.string(block[0]) })),
    ];
}
