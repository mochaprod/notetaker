import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostgresqlNotepadRepository } from "./notepad-repo";
import type { SaveNotepadDocument } from "@common/types/intake";

const dailyNotepadFindUnique = vi.fn();
const dailyNotepadUpsert = vi.fn();
const notepadFindFirst = vi.fn();
const notepadUpdate = vi.fn();

const prisma = {
    dailyNotepad: {
        findUnique: dailyNotepadFindUnique,
        upsert: dailyNotepadUpsert,
    },
    notepad: {
        findFirst: notepadFindFirst,
        update: notepadUpdate,
    },
};

describe("PostgresqlNotepadRepository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads a daily notepad by user and date", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        dailyNotepadFindUnique.mockResolvedValue({
            userId: "user-1",
            dateKey: "2026-05-03",
            notepadId: "notepad-1",
            notepad: {
                id: "notepad-1",
                userId: "user-1",
                title: "Untitled",
                content: [
                    {
                        type: "paragraph",
                        children: [{ text: "Existing note" }],
                    },
                ],
                createdAt: new Date("2026-05-03T10:00:00.000Z"),
                updatedAt: new Date("2026-05-03T10:00:00.000Z"),
            },
        });

        const result = await repo.getByDateKey("user-1", "2026-05-03");

        expect(dailyNotepadFindUnique).toHaveBeenCalledWith({
            where: {
                userId_dateKey: {
                    userId: "user-1",
                    dateKey: "2026-05-03",
                },
            },
            include: {
                notepad: true,
            },
        });
        expect(result?.dateKey).toBe("2026-05-03");
        expect(result?.content[0]).toMatchObject({
            type: "paragraph",
        });
    });

    it("returns null when no daily notepad exists", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        dailyNotepadFindUnique.mockResolvedValue(null);

        const result = await repo.getByDateKey("user-1", "2026-05-03");

        expect(result).toBeNull();
    });

    it("loads an exact notepad by id and user", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        notepadFindFirst.mockResolvedValue({
            id: "notepad-1",
            userId: "user-1",
            title: "Meeting notes",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Existing note" }],
                },
            ],
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
            daily: null,
        });

        const result = await repo.getById("user-1", "notepad-1");

        expect(notepadFindFirst).toHaveBeenCalledWith({
            where: {
                id: "notepad-1",
                userId: "user-1",
            },
            include: {
                daily: true,
            },
        });
        expect(result).toMatchObject({
            id: "notepad-1",
            dateKey: null,
            title: "Meeting notes",
        });
    });

    it("returns null when no exact notepad exists for the user", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        notepadFindFirst.mockResolvedValue(null);

        const result = await repo.getById("user-1", "notepad-1");

        expect(result).toBeNull();
    });

    it("creates a general notepad and daily mapping on first daily save", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        const input: SaveNotepadDocument = {
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Saved note" }],
                },
            ],
        };
        dailyNotepadUpsert.mockResolvedValue({
            userId: "user-1",
            dateKey: "2026-05-03",
            notepadId: "notepad-1",
            notepad: {
                id: "notepad-1",
                userId: "user-1",
                title: input.title,
                content: input.content,
                createdAt: new Date("2026-05-03T10:00:00.000Z"),
                updatedAt: new Date("2026-05-03T10:00:00.000Z"),
            },
        });

        const result = await repo.saveByDateKey("user-1", input);

        expect(dailyNotepadUpsert).toHaveBeenCalledWith({
            where: {
                userId_dateKey: {
                    userId: "user-1",
                    dateKey: "2026-05-03",
                },
            },
            update: {
                notepad: {
                    update: {
                        title: "Untitled",
                        content: input.content,
                    },
                },
            },
            create: {
                dateKey: "2026-05-03",
                notepad: {
                    create: {
                        title: "Untitled",
                        content: input.content,
                        user: {
                            connect: {
                                id: "user-1",
                            },
                        },
                    },
                },
                user: {
                    connect: {
                        id: "user-1",
                    },
                },
            },
            include: {
                notepad: true,
            },
        });
        expect(result).toMatchObject({
            id: "notepad-1",
            dateKey: "2026-05-03",
        });
    });

    it("updates the mapped notepad on later daily saves", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        const input: SaveNotepadDocument = {
            dateKey: "2026-05-03",
            title: "Renamed",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Updated note" }],
                },
            ],
        };
        dailyNotepadUpsert.mockResolvedValue({
            userId: "user-1",
            dateKey: "2026-05-03",
            notepadId: "notepad-1",
            notepad: {
                id: "notepad-1",
                userId: "user-1",
                title: input.title,
                content: input.content,
                createdAt: new Date("2026-05-03T10:00:00.000Z"),
                updatedAt: new Date("2026-05-03T10:01:00.000Z"),
            },
        });

        const result = await repo.saveByDateKey("user-1", input);

        expect(dailyNotepadUpsert).toHaveBeenCalledWith({
            where: {
                userId_dateKey: {
                    userId: "user-1",
                    dateKey: "2026-05-03",
                },
            },
            update: {
                notepad: {
                    update: {
                        title: "Renamed",
                        content: input.content,
                    },
                },
            },
            create: {
                dateKey: "2026-05-03",
                notepad: {
                    create: {
                        title: "Renamed",
                        content: input.content,
                        user: {
                            connect: {
                                id: "user-1",
                            },
                        },
                    },
                },
                user: {
                    connect: {
                        id: "user-1",
                    },
                },
            },
            include: {
                notepad: true,
            },
        });
        expect(result).toMatchObject({
            id: "notepad-1",
            dateKey: "2026-05-03",
        });
    });

    it("updates an exact notepad by id and user", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        const input = {
            notepadId: "notepad-1",
            title: "Renamed",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Updated note" }],
                },
            ],
        };
        notepadUpdate.mockResolvedValue({
            id: "notepad-1",
            userId: "user-1",
            title: input.title,
            content: input.content,
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:01:00.000Z"),
            daily: null,
        });

        const result = await repo.saveById("user-1", input);

        expect(notepadUpdate).toHaveBeenCalledWith({
            where: {
                id: "notepad-1",
                userId: "user-1",
            },
            data: {
                title: "Renamed",
                content: input.content,
            },
            include: {
                daily: true,
            },
        });
        expect(result).toMatchObject({
            id: "notepad-1",
            dateKey: null,
        });
    });
});
