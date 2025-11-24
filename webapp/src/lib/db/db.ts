export interface Note {
    id: string;
    key: string;
    message: string;
    createdAt: string;
}

export interface DB {
    putNotes: (key: string, value: string) => Promise<Note>;
    getNotes: (key: string) => Promise<Note[]>;
    updateNotes: (key: string, value: string) => Promise<void>;
    deleteNotes: (key: string) => Promise<void>;
}
