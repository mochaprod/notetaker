import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    getSession,
    headersMock,
    getNotepadsMock,
} = vi.hoisted(() => ({
    getSession: vi.fn(),
    headersMock: vi.fn(async () => new Headers()),
    getNotepadsMock: vi.fn(),
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
    notepadsRepository: {
        getNotepads: getNotepadsMock,
    },
}));

import { getNotepads } from "./get-notepads";

describe("getNotepads", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns an empty page when unauthenticated", async () => {
        getSession.mockResolvedValue(null);

        const result = await getNotepads();

        expect(result).toEqual({
            items: [],
            nextCursor: null,
        });
        expect(getNotepadsMock).not.toHaveBeenCalled();
    });

    it("loads notepads for the authenticated user", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        getNotepadsMock.mockResolvedValue({
            items: [],
            nextCursor: null,
        });

        const result = await getNotepads({
            cursor: {
                createdAt: "2026-05-16T10:00:00.000Z",
                id: "notepad-1",
            },
        });

        expect(headersMock).toHaveBeenCalled();
        expect(getNotepadsMock).toHaveBeenCalledWith("user-1", {
            cursor: {
                createdAt: "2026-05-16T10:00:00.000Z",
                id: "notepad-1",
            },
        });
        expect(result).toEqual({
            items: [],
            nextCursor: null,
        });
    });
});
