import { KeyboardEvent } from "react"
import { Editor, Element, Transforms } from "slate";
import { liftListItemUp } from "./break-handlers";

export const createKeyDownHandler = (editor: Editor) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
        event.preventDefault();

        if (event.shiftKey) {
            const { selection } = editor;

            if (!selection) {
                return;
            }

            liftListItemUp(editor, selection);
        } else {
            const [firstMatch] = Editor.nodes(editor, {
                match: n => Element.isElement(n) && n.type === "list-item",
            });

            if (firstMatch) {
                Transforms.wrapNodes(editor, {
                    type: "bulleted-list",
                    children: [],
                }, {
                    at: firstMatch[1],
                });
            }
        }
    } else if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();

        Editor.insertText(editor, "\n");
    }
}
