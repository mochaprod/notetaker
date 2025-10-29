import crypto from "crypto";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { Note, DB } from "./db";

const DEFAULT_DATA = {
    chatMessages: [] as Note[],
};

export class LowDBDB implements DB {
    private db: LowSync<typeof DEFAULT_DATA>;

    constructor(file: string) {
        this.db = new LowSync(new JSONFileSync(file), DEFAULT_DATA);
    }

    async getNotes(key: string): Promise<Note[]> {
        this.db.read();
        const data = this.db.data?.chatMessages
            .filter(msg => msg.key === key)
            .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt)) || [];

        return data;
    }

    async putNotes(key: string, value: string): Promise<Note> {
        const message = {
            id: crypto.randomUUID(),
            key,
            createdAt: new Date().toISOString(),
            message: value,
        };

        this.db.update(({ chatMessages }) => {
            chatMessages.push(message);
        });

        return message;
    }
}
