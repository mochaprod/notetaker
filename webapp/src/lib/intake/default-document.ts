import type { SlateDocument } from "@common/types/intake";

export const DEFAULT_NOTEPAD_TITLE = "Untitled";

export function createEmptySlateDocument(): SlateDocument {
    return [
        {
            type: "paragraph",
            children: [{ text: "" }],
        },
    ];
}
