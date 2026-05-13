import { NotepadDocumentSchema, SaveNotepadDocument, SlateDocumentSchema } from "@common/types/intake";
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
}
