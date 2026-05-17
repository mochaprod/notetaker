import { describe, expect, it, vi } from "vitest";
import { PostgresqlNotepadsRepository } from "./notepads-repo";

const notepadFindMany = vi.fn();

const prisma = {
    notepad: {
        findMany: notepadFindMany,
    },
};

describe("PostgresqlNotepadsRepository", () => {
    it("loads the most recent notepads when no cursor is provided", async () => {
        const repo = new PostgresqlNotepadsRepository(prisma as any);
        notepadFindMany.mockResolvedValue([
            {
                id: "notepad-1",
                title: "Planning",
                createdAt: new Date("2026-05-16T10:00:00.000Z"),
                updatedAt: new Date("2026-05-16T10:05:00.000Z"),
                daily: {
                    dateKey: "2026-05-16",
                },
            },
        ]);

        const result = await repo.getNotepads("user-1");

        expect(notepadFindMany).toHaveBeenCalledWith({
            where: {
                userId: "user-1",
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],
            take: 26,
            include: {
                daily: {
                    select: {
                        dateKey: true,
                    },
                },
            },
        });
        expect(result).toEqual({
            items: [
                {
                    id: "notepad-1",
                    title: "Planning",
                    dateKey: "2026-05-16",
                    createdAt: new Date("2026-05-16T10:00:00.000Z"),
                    updatedAt: new Date("2026-05-16T10:05:00.000Z"),
                },
            ],
            nextCursor: null,
        });
    });

    it("loads the next page after the provided cursor", async () => {
        const repo = new PostgresqlNotepadsRepository(prisma as any);
        notepadFindMany.mockResolvedValue([]);

        await repo.getNotepads("user-1", {
            cursor: {
                createdAt: "2026-05-16T10:00:00.000Z",
                id: "notepad-10",
            },
        });

        expect(notepadFindMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                userId: "user-1",
                OR: [
                    {
                        createdAt: {
                            lt: new Date("2026-05-16T10:00:00.000Z"),
                        },
                    },
                    {
                        createdAt: new Date("2026-05-16T10:00:00.000Z"),
                        id: {
                            lt: "notepad-10",
                        },
                    },
                ],
            },
        }));
    });

    it("returns a next cursor when more than 25 rows are available", async () => {
        const repo = new PostgresqlNotepadsRepository(prisma as any);
        notepadFindMany.mockResolvedValue(Array.from({ length: 26 }, (_, index) => ({
            id: `notepad-${index + 1}`,
            title: `Notepad ${index + 1}`,
            createdAt: new Date(`2026-05-${String(26 - index).padStart(2, "0")}T10:00:00.000Z`),
            updatedAt: new Date(`2026-05-${String(26 - index).padStart(2, "0")}T10:05:00.000Z`),
            daily: null,
        })));

        const result = await repo.getNotepads("user-1");

        expect(result.items).toHaveLength(25);
        expect(result.nextCursor).toEqual({
            createdAt: "2026-05-02T10:00:00.000Z",
            id: "notepad-25",
        });
    });
});
