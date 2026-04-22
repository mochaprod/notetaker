import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    getSession,
    headersMock,
    getTodosMock,
    setTodoStatusMock,
} = vi.hoisted(() => ({
    getSession: vi.fn(),
    headersMock: vi.fn(async () => new Headers()),
    getTodosMock: vi.fn(),
    setTodoStatusMock: vi.fn(),
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
    todoRepository: {
        getTodos: getTodosMock,
        setTodoStatus: setTodoStatusMock,
    },
}));

import { getTodos, setTodoStatus } from "./get-todos";

describe("todo actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns an empty array for unauthenticated users", async () => {
        getSession.mockResolvedValue(null);

        const result = await getTodos();

        expect(result).toEqual([]);
        expect(getTodosMock).not.toHaveBeenCalled();
    });

    it("loads todos for the current user", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        getTodosMock.mockResolvedValue([
            {
                id: "todo-1",
                content: "Ship tests",
            },
        ]);

        const result = await getTodos();

        expect(headersMock).toHaveBeenCalled();
        expect(getTodosMock).toHaveBeenCalledWith("user-1");
        expect(result).toEqual([
            {
                id: "todo-1",
                content: "Ship tests",
            },
        ]);
    });

    it("updates todo status for authenticated users only", async () => {
        getSession.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });
        setTodoStatusMock.mockResolvedValue({
            id: "todo-1",
            done: true,
        });

        const result = await setTodoStatus("todo-1", true);

        expect(setTodoStatusMock).toHaveBeenCalledWith("user-1", "todo-1", true);
        expect(result).toEqual({
            id: "todo-1",
            done: true,
        });
    });
});
