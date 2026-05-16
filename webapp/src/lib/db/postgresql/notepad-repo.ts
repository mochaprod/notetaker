import { NotepadDocumentSchema, SaveNotepadByIdDocument, SaveNotepadDocument, SlateDocumentSchema } from "@common/types/intake";
import { NotepadRepository } from "../db";
import { Prisma, PrismaClient } from "@db/prisma";

export class PostgresqlNotepadRepository implements NotepadRepository {
    constructor(private readonly prisma: PrismaClient) {
    }

    async getByDateKey(userId: string, dateKey: string) {
        const dailyNotepad = await this.prisma.dailyNotepad.findUnique({
            where: {
                userId_dateKey: {
                    userId,
                    dateKey,
                },
            },
            include: {
                notepad: true,
            },
        });

        if (!dailyNotepad) {
            return null;
        }

        return NotepadDocumentSchema.parse({
            ...dailyNotepad.notepad,
            dateKey: dailyNotepad.dateKey,
        });
    }

    async getById(userId: string, notepadId: string) {
        const notepad = await this.prisma.notepad.findFirst({
            where: {
                id: notepadId,
                userId,
            },
            include: {
                daily: true,
            },
        });

        if (!notepad) {
            return null;
        }

        return NotepadDocumentSchema.parse({
            ...notepad,
            dateKey: notepad.daily?.dateKey ?? null,
        });
    }

    async saveByDateKey(userId: string, input: SaveNotepadDocument) {
        const content = SlateDocumentSchema.parse(input.content) as Prisma.JsonArray;

        const dailyNotepad = await this.prisma.dailyNotepad.upsert({
            where: {
                userId_dateKey: {
                    userId,
                    dateKey: input.dateKey,
                },
            },
            update: {
                notepad: {
                    update: {
                        title: input.title,
                        content,
                    },
                },
            },
            create: {
                dateKey: input.dateKey,
                notepad: {
                    create: {
                        title: input.title,
                        content,
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
            include: {
                notepad: true,
            },
        });

        return NotepadDocumentSchema.parse({
            ...dailyNotepad.notepad,
            dateKey: dailyNotepad.dateKey,
        });
    }

    async saveById(userId: string, input: SaveNotepadByIdDocument) {
        const content = SlateDocumentSchema.parse(input.content) as Prisma.JsonArray;

        const notepad = await this.prisma.notepad.update({
            where: {
                id: input.notepadId,
                userId,
            },
            data: {
                title: input.title,
                content,
            },
            include: {
                daily: true,
            },
        });

        return NotepadDocumentSchema.parse({
            ...notepad,
            dateKey: notepad.daily?.dateKey ?? null,
        });
    }
}
