import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    getSession,
    headersMock,
    getByDateMock,
    saveByDateMock,
} = vi.hoisted(() => ({
    getSession: vi.fn(),
    headersMock: vi.fn(async () => new Headers()),
    getByDateMock: vi.fn(),
    saveByDateMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
    headers: headersMock,
}));

vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession,
        },
    },
}));

vi.mock("@/lib/db/db-instance", () => ({
    notepadRepository: {
        getByDate: getByDateMock,
        saveByDate: saveByDateMock,
    },
}));

import { getNotepad, saveNotepad } from "./notepad";

describe("notepad actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null for unauthenticated reads", async () => {
        getSession.mockResolvedValue(null);

        const result = await getNotepad("2026-05-03");

        expect(result).toBeNull();
        expect(getByDateMock).not.toHaveBeenCalled();
    });

    it("returns a default document when no daily notepad exists", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        getByDateMock.mockResolvedValue(null);

        const result = await getNotepad("2026-05-03");

        expect(headersMock).toHaveBeenCalled();
        expect(getByDateMock).toHaveBeenCalledWith("user-1", "2026-05-03");
        expect(result).toMatchObject({
            id: null,
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "" }],
                },
            ],
        });
    });

    it("saves valid notepad payloads for authenticated users", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        const payload = {
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Saved note" }],
                },
            ],
        };
        saveByDateMock.mockResolvedValue({
            id: "notepad-1",
            ...payload,
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        });

        const result = await saveNotepad(payload);

        expect(saveByDateMock).toHaveBeenCalledWith("user-1", payload);
        expect(result?.id).toBe("notepad-1");
    });

    it("does not persist unauthenticated saves", async () => {
        getSession.mockResolvedValue(null);

        const result = await saveNotepad({
            dateKey: "2026-05-03",
            title: "Untitled",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Ignored" }],
                },
            ],
        });

        expect(result).toBeNull();
        expect(saveByDateMock).not.toHaveBeenCalled();
    });
});
