import { Note } from "@common/types/notes";
import { NotepadDocument, SaveNotepadByIdDocument, SaveNotepadDocument } from "@common/types/intake";
import { Summary } from "@common/types/summary";
import { Todo, TodoData } from "@common/types/todo";
import { AICredit } from "@common/types/user";

export interface UserRepository {
    getAICredits: (userId: string) => Promise<AICredit | null>;
    upsertAICredits: (userId: string, credits: number) => Promise<void>;
}

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

export interface TodoRepository {
    addTodo: (userId: string, todo: Todo) => Promise<TodoData>;
    getTodos: (userId: string) => Promise<Todo[]>;
    updateTodo: (userId: string, todoId: string, todo: TodoData) => Promise<void>;
    setTodoStatus: (userId: string, todoId: string, done: boolean) => Promise<void>;
    deleteTodo: (userId: string, todoId: string) => Promise<void>;
}

export interface NotepadRepository {
    getByDateKey: (userId: string, dateKey: string) => Promise<NotepadDocument | null>;
    getById: (userId: string, notepadId: string) => Promise<NotepadDocument | null>;
    saveByDateKey: (userId: string, input: SaveNotepadDocument) => Promise<NotepadDocument>;
    saveById: (userId: string, input: SaveNotepadByIdDocument) => Promise<NotepadDocument>;
}
