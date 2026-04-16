import { Editor, Element as SlateElement, Node, Path, Range, Transforms } from "slate";

type ListContextSnapshot = {
    listItemPath: Path | null;
    bulletedListPath: Path | null;
};

type DeleteFragmentSnapshot = {
    leftListItemRef: ReturnType<typeof Editor.pathRef> | null;
    rightBulletedListRef: ReturnType<typeof Editor.pathRef> | null;
    shouldPreserveRightNestedList: boolean;
};

const findCurrentListItem = (editor: Editor) => Editor.above(editor, {
    at: editor.selection?.anchor,
    match: (node) => SlateElement.isElement(node) && node.type === "list-item",
    mode: "lowest",
});

const findListItemAt = (editor: Editor, at: Path | Range["anchor"]) => Editor.above(editor, {
    at,
    match: (node) => SlateElement.isElement(node) && node.type === "list-item",
    mode: "lowest",
});

const findBulletedListAt = (editor: Editor, at: Path | Range["anchor"]) => Editor.above(editor, {
    at,
    match: (node) => SlateElement.isElement(node) && node.type === "bulleted-list",
    mode: "lowest",
});

const getListContextAtPoint = (editor: Editor, at: Range["anchor"]): ListContextSnapshot => {
    const listItem = findListItemAt(editor, at);
    const bulletedList = findBulletedListAt(editor, at);

    return {
        listItemPath: listItem?.[1] ?? null,
        bulletedListPath: bulletedList?.[1] ?? null,
    };
};

const captureDeleteFragmentSnapshot = (editor: Editor, selection: Range): DeleteFragmentSnapshot => {
    const [start, end] = Editor.edges(editor, selection);
    const leftContext = getListContextAtPoint(editor, start);
    const rightContext = getListContextAtPoint(editor, end);

    const shouldPreserveRightNestedList = !!leftContext.bulletedListPath
        && !!rightContext.bulletedListPath
        && Path.isAncestor(leftContext.bulletedListPath, rightContext.bulletedListPath)
        && !Path.equals(leftContext.bulletedListPath, Path.parent(rightContext.bulletedListPath));

    return {
        leftListItemRef: leftContext.listItemPath
            ? Editor.pathRef(editor, leftContext.listItemPath, { affinity: "backward" })
            : null,
        rightBulletedListRef: shouldPreserveRightNestedList && rightContext.bulletedListPath
            ? Editor.pathRef(editor, rightContext.bulletedListPath, { affinity: "forward" })
            : null,
        shouldPreserveRightNestedList,
    };
};

const getSiblingBulletedListAfter = (editor: Editor, listItemPath: Path): Path | null => {
    const siblingPath = Path.next(listItemPath);

    if (!Node.has(editor, siblingPath)) {
        return null;
    }

    const [siblingNode] = Editor.node(editor, siblingPath);

    if (!SlateElement.isElement(siblingNode) || siblingNode.type !== "bulleted-list") {
        return null;
    }

    return siblingPath;
};

const moveNestedListUnderListItem = (editor: Editor, listItemPath: Path, nestedListPath: Path) => {
    const [listItemNode] = Editor.node(editor, listItemPath);

    if (!SlateElement.isElement(listItemNode) || listItemNode.type !== "list-item") {
        return;
    }

    const selectionRef = editor.selection
        ? Editor.rangeRef(editor, editor.selection, { affinity: "inward" })
        : null;
    const destination = listItemPath.concat(listItemNode.children.length);

    Editor.withoutNormalizing(editor, () => {
        Transforms.moveNodes(editor, {
            at: nestedListPath,
            to: destination,
        });
    });

    if (selectionRef?.current) {
        Transforms.select(editor, selectionRef.current);
    }

    selectionRef?.unref();
};

const reconcileNestedListAfterDeleteFragment = (editor: Editor, snapshot: DeleteFragmentSnapshot) => {
    if (!snapshot.shouldPreserveRightNestedList) {
        snapshot.leftListItemRef?.unref();
        snapshot.rightBulletedListRef?.unref();
        return;
    }

    const currentLeftListItemPath = snapshot.leftListItemRef?.current
        ?? (editor.selection?.anchor ? findCurrentListItem(editor)?.[1] ?? null : null);
    const trackedRightListPath = snapshot.rightBulletedListRef?.current;

    snapshot.leftListItemRef?.unref();
    snapshot.rightBulletedListRef?.unref();

    if (!currentLeftListItemPath) {
        return;
    }

    const siblingNestedListPath = getSiblingBulletedListAfter(editor, currentLeftListItemPath);
    const nestedListPath = siblingNestedListPath
        ?? (trackedRightListPath && Node.has(editor, trackedRightListPath) ? trackedRightListPath : null);

    if (!nestedListPath) {
        return;
    }

    if (Path.isAncestor(currentLeftListItemPath, nestedListPath)) {
        return;
    }

    const expectedSiblingParentPath = Path.parent(currentLeftListItemPath);

    if (!Path.equals(Path.parent(nestedListPath), expectedSiblingParentPath)) {
        return;
    }

    moveNestedListUnderListItem(editor, currentLeftListItemPath, nestedListPath);
};

/**
 * Finds overly nested lists and "lifts" them up to the nearest list or promote them
 * to a top level node.
 *
 * @param editor
 * @param originalDeleteFragment
 */
export function installDeleteFragmentOverride<T extends Editor>(
    editor: T,
    originalDeleteFragment: T["deleteFragment"],
) {
    editor.deleteFragment = () => {
        const { selection } = editor;

        if (!selection || Range.isCollapsed(selection)) {
            originalDeleteFragment();
            return;
        }

        const snapshot = captureDeleteFragmentSnapshot(editor, selection);

        originalDeleteFragment();

        reconcileNestedListAfterDeleteFragment(editor, snapshot);
    };
}
