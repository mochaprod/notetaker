import { NotepadDocumentSchema, SaveNotepadDocument, SlateDocumentSchema } from "@common/types/intake";
import { PrismaClient } from "@db/prisma/generated/prisma/client";
import { NotepadRepository } from "../db";

export class PostgresqlNotepadRepository implements NotepadRepository {
    constructor(private readonly prisma: PrismaClient) {
    }

    async getByDate(userId: string, dateKey: string) {
        const notepad = await this.prisma.notepad.findUnique({
            where: {
                userId_dateKey: {
                    userId,
                    dateKey,
                },
            },
        });

        if (!notepad) {
            return null;
        }

        return NotepadDocumentSchema.parse(notepad);
    }

    async saveByDate(userId: string, input: SaveNotepadDocument) {
        const content = SlateDocumentSchema.parse(input.content);

        const notepad = await this.prisma.notepad.upsert({
            where: {
                userId_dateKey: {
                    userId,
                    dateKey: input.dateKey,
                },
            },
            update: {
                title: input.title,
                content,
            },
            create: {
                userId,
                dateKey: input.dateKey,
                title: input.title,
                content,
            },
        });

        return NotepadDocumentSchema.parse(notepad);
    }
}
