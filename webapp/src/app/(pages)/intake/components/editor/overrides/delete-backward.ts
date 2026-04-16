import { Editor, Element, Node, Transforms } from "slate";

export function installDeleteBackwardOverride<T extends Editor>(
    editor: T,
    originalDeleteBackward: T["deleteBackward"],
) {
    editor.deleteBackward = (unit) => {
        originalDeleteBackward(unit);

        const { selection } = editor;

        if (!selection) {
            return;
        }
    };
}
