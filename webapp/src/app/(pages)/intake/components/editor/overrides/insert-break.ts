import { Editor } from "slate";
import { handleEditorInsertBreak } from "../break-handlers";

export function installInsertBreakOverride<T extends Editor>(
    editor: T,
    originalInsertBreak: T["insertBreak"],
) {
    editor.insertBreak = () => {
        handleEditorInsertBreak(editor, originalInsertBreak);
    };
}
