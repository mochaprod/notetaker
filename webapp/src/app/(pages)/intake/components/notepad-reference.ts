export type NotepadReference =
    | {
        kind: "date";
        dateKey: string;
    }
    | {
        kind: "notepad";
        notepadId: string;
    };

export function getReferenceDateKey(reference: NotepadReference) {
    return reference.kind === "date" ? reference.dateKey : null;
}
