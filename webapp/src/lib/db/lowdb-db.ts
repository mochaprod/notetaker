import { v7 as uuidv7 } from "uuid";
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
            id: uuidv7(),
            key,
            createdAt: new Date().toISOString(),
            message: value,
        };

        this.db.update(({ chatMessages }) => {
            chatMessages.push(message);
        });

        return message;
    }

    async updateNotes(key: string, value: string): Promise<void> {
        this.db.read();

        if (this.db.data?.chatMessages) {
            const message = this.db.data.chatMessages
                .find(({ id: existingId }) => existingId === key);

            if (message) {
                message.message = value;
                this.db.write();
            }
        }
    }

    async deleteNotes(key: string): Promise<void> {
        this.db.read();
        const index = this.db.data?.chatMessages
            ?.findIndex(msg => msg.id === key);

        if (index !== -1) {
            this.db.data?.chatMessages?.splice(index, 1);
            this.db.write();
        }
    }
}
