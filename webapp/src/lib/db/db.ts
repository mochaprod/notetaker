import { Note } from "@common/types/notes";
import { Summary } from "@common/types/summary";

export interface NoteRepository {
    putNotes: (key: string, value: string) => Promise<Note>;
    getNotes: (key: string, startDate?: Date, endDate?: Date) => Promise<Note[]>;
    updateNotes: (key: string, value: string) => Promise<void>;
    deleteNotes: (key: string) => Promise<void>;
}

export interface DigestRepository {
    putSummary: (userId: string, startDateKey: string, endDateKey: string, summary: Omit<Summary, "id" | "startDate" | "endDate">) => Promise<Summary>;
    getSummary: (userId: string, startDateKey: string, endDateKey: string) => Promise<Summary | null>;
}
