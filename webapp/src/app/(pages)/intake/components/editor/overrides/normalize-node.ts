import { Editor, Element, Node, Transforms } from "slate";
import { isListType } from "../types";

export function installNormalizeNode<T extends Editor>(editor: T,
    originalNormalizeNode: T["normalizeNode"]) {
    editor.normalizeNode = (entry, options) => {
        const [node, path] = entry;

        if (Element.isElement(node) && isListType(node.type)) {
            const children = Node.children(editor, path);

            for (const [childNode, childPath] of children) {
                if (Element.isElement(childNode)
                    && isListType(childNode.type)
                    && childNode.children.length === 1
                    && Element.isElement(childNode.children[0])
                    && isListType(childNode.children[0].type)
                ) {
                    Transforms.unwrapNodes(editor, { at: childPath });
                    return;
                }
            }
        }

        originalNormalizeNode(entry, options);
    };
}
