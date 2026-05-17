import { ListedNotepadSchema, NotepadsCursor, PaginatedNotepadsSchema } from "@common/types/intake";
import { PrismaClient } from "@db/prisma/generated/prisma/client";
import { NotepadsRepository } from "../db";

const NOTEPADS_PAGE_SIZE = 25;

export class PostgresqlNotepadsRepository implements NotepadsRepository {
    constructor(private readonly prisma: PrismaClient) {
    }

    async getNotepads(
        userId: string,
        input: {
            cursor?: NotepadsCursor;
        } = {},
    ) {
        const cursorDate = input.cursor ? new Date(input.cursor.createdAt) : null;
        const rows = await this.prisma.notepad.findMany({
            where: input.cursor && cursorDate ? {
                userId,
                OR: [
                    {
                        createdAt: {
                            lt: cursorDate,
                        },
                    },
                    {
                        createdAt: cursorDate,
                        id: {
                            lt: input.cursor.id,
                        },
                    },
                ],
            } : {
                userId,
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],
            take: NOTEPADS_PAGE_SIZE + 1,
            include: {
                daily: {
                    select: {
                        dateKey: true,
                    },
                },
            },
        });

        const pageRows = rows.slice(0, NOTEPADS_PAGE_SIZE);
        const items = pageRows.map((row) => ListedNotepadSchema.parse({
            id: row.id,
            title: row.title,
            dateKey: row.daily?.dateKey ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
        const lastItem = items.at(-1);

        return PaginatedNotepadsSchema.parse({
            items,
            nextCursor: rows.length > NOTEPADS_PAGE_SIZE && lastItem ? {
                createdAt: lastItem.createdAt.toISOString(),
                id: lastItem.id,
            } : null,
        });
    }
}
