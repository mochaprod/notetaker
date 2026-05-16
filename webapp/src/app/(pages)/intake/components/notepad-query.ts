import type { NotepadReference } from "./notepad-reference";

export const notepadQueryKey = (reference: NotepadReference) => [
    "notepad",
    reference.kind,
    reference.kind === "date" ? reference.dateKey : reference.notepadId,
];
