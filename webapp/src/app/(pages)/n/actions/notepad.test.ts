import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    getSession,
    headersMock,
    getByDateKeyMock,
    getByIdMock,
    saveByDateKeyMock,
    saveByIdMock,
} = vi.hoisted(() => ({
    getSession: vi.fn(),
    headersMock: vi.fn(async () => new Headers()),
    getByDateKeyMock: vi.fn(),
    getByIdMock: vi.fn(),
    saveByDateKeyMock: vi.fn(),
    saveByIdMock: vi.fn(),
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
        getByDateKey: getByDateKeyMock,
        getById: getByIdMock,
        saveByDateKey: saveByDateKeyMock,
        saveById: saveByIdMock,
    },
}));

import { getDailyNotepad, getNotepadById, saveDailyNotepad, saveNotepadById } from "./notepad";

describe("notepad actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null for unauthenticated reads", async () => {
        getSession.mockResolvedValue(null);

        const result = await getDailyNotepad("2026-05-03");

        expect(result).toBeNull();
        expect(getByDateKeyMock).not.toHaveBeenCalled();
    });

    it("returns a default document when no daily notepad exists", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        getByDateKeyMock.mockResolvedValue(null);

        const result = await getDailyNotepad("2026-05-03");

        expect(headersMock).toHaveBeenCalled();
        expect(getByDateKeyMock).toHaveBeenCalledWith("user-1", "2026-05-03");
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
        saveByDateKeyMock.mockResolvedValue({
            id: "notepad-1",
            ...payload,
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        });

        const result = await saveDailyNotepad(payload);

        expect(saveByDateKeyMock).toHaveBeenCalledWith("user-1", payload);
        expect(result?.id).toBe("notepad-1");
    });

    it("does not persist unauthenticated saves", async () => {
        getSession.mockResolvedValue(null);

        const result = await saveDailyNotepad({
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
        expect(saveByDateKeyMock).not.toHaveBeenCalled();
    });

    it("saves exact notepad payloads by id for authenticated users", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        const payload = {
            notepadId: "notepad-1",
            title: "Renamed",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Saved note" }],
                },
            ],
        };
        saveByIdMock.mockResolvedValue({
            id: "notepad-1",
            dateKey: null,
            title: payload.title,
            content: payload.content,
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        });

        const result = await saveNotepadById(payload);

        expect(saveByIdMock).toHaveBeenCalledWith("user-1", payload);
        expect(result?.id).toBe("notepad-1");
    });
});
    it("loads an exact notepad by id for authenticated users", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        getByIdMock.mockResolvedValue({
            id: "notepad-1",
            dateKey: null,
            title: "Meeting notes",
            content: [
                {
                    type: "paragraph",
                    children: [{ text: "Existing note" }],
                },
            ],
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
        });

        const result = await getNotepadById("notepad-1");

        expect(getByIdMock).toHaveBeenCalledWith("user-1", "notepad-1");
        expect(result?.id).toBe("notepad-1");
    });

    it("throws when an exact notepad does not exist for the user", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        getByIdMock.mockResolvedValue(null);

        await expect(getNotepadById("notepad-1")).rejects.toThrow("Notepad not found");
    });
