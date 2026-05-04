import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostgresqlNotepadRepository } from "./notepad-repo";
import type { SaveNotepadDocument } from "@common/types/intake";

const notepadFindUnique = vi.fn();
const notepadUpsert = vi.fn();

const prisma = {
    notepad: {
        findUnique: notepadFindUnique,
        upsert: notepadUpsert,
    },
};

describe("PostgresqlNotepadRepository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads a notepad by user and date", async () => {
        const repo = new PostgresqlNotepadRepository(prisma as any);
        notepadFindUnique.mockResolvedValue({
            id: "notepad-1",
            userId: "user-1",
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Existing note" }],
                },
            ],
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        });

        const result = await repo.getByDate("user-1", "2026-05-03");

        expect(notepadFindUnique).toHaveBeenCalledWith({
            where: {
                userId_dateKey: {
                    userId: "user-1",
                    dateKey: "2026-05-03",
                },
            },
        });
        expect(result?.content[0]).toMatchObject({
            type: "paragraph",
        });
    });

    it("upserts a notepad by user and date", async () => {
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
        notepadUpsert.mockResolvedValue({
            id: "notepad-1",
            userId: "user-1",
            ...input,
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        });

        const result = await repo.saveByDate("user-1", input);

        expect(notepadUpsert).toHaveBeenCalledWith({
            where: {
                userId_dateKey: {
                    userId: "user-1",
                    dateKey: "2026-05-03",
                },
            },
            update: {
                title: "Untitled",
                content: input.content,
            },
            create: {
                userId: "user-1",
                dateKey: "2026-05-03",
                title: "Untitled",
                content: input.content,
            },
        });
        expect(result?.id).toBe("notepad-1");
    });
});
