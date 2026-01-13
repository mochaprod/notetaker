import { PrismaClient } from "@db/prisma/generated/prisma/client";
import { NoteRepository } from "../db";
import { Note } from "../../../../../packages/types/src/notes";

export class PostgresqlNoteRepository implements NoteRepository {
    constructor(private readonly prisma: PrismaClient) {
    }

    async getNotes(key: string, startDate?: Date, endDate?: Date): Promise<Note[]> {
        const notes = await this.prisma.note.findMany({
            where: {
                AND: [
                    {
                        userId: key,
                    },
                    {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                ],
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return notes.map(({
            id,
            message,
            createdAt,
            userId,
        }) => ({
            id,
            message,
            createdAt: createdAt.toISOString(),
            key: userId,
        } as Note));
    }

    async putNotes(key: string, value: string): Promise<Note> {
        const result = await this.prisma.note.create({
            data: {
                message: value,
                userId: key,
            },
        });

        return {
            id: result.id,
            message: result.message,
            createdAt: result.createdAt.toISOString(),
            key: result.userId,
        };
    }

    async updateNotes(key: string, value: string): Promise<void> {
        await this.prisma.note.update({
            where: {
                id: key,
            },
            data: {
                message: value,
            },
        });
    }

    async deleteNotes(key: string): Promise<void> {
        await this.prisma.note.delete({
            where: {
                id: key,
            },
        });
    }
}
