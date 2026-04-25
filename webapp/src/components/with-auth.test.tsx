import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, redirectMock, headersMock } = vi.hoisted(() => ({
    getSessionMock: vi.fn(),
    redirectMock: vi.fn(),
    headersMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: getSessionMock,
        },
    },
}));

vi.mock("next/navigation", () => ({
    redirect: redirectMock,
}));

vi.mock("next/headers", () => ({
    headers: headersMock,
}));

import { withAuth } from "@/components/with-auth";

describe("withAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redirects protected routes when there is no session", async () => {
        headersMock.mockResolvedValue(new Headers());
        getSessionMock.mockResolvedValue(null);

        const Component = withAuth(() => React.createElement("div", null, "Protected"), {
            redirectTo: "/auth/sign-in",
        });

        await Component({});

        expect(redirectMock).toHaveBeenCalledWith("/auth/sign-in");
    });

    it("renders protected routes when there is a session", async () => {
        headersMock.mockResolvedValue(new Headers());
        getSessionMock.mockResolvedValue({
            session: {
                id: "session-1",
            },
            user: {
                id: "user-1",
            },
        });

        const Component = withAuth(() => React.createElement("div", null, "Protected"), {
            redirectTo: "/auth/sign-in",
        });

        const result = await Component({});

        expect(redirectMock).not.toHaveBeenCalled();
        expect(result).toBeTruthy();
    });

    it("redirects inverted routes when there is a session", async () => {
        headersMock.mockResolvedValue(new Headers());
        getSessionMock.mockResolvedValue({
            session: {
                id: "session-1",
            },
            user: {
                id: "user-1",
            },
        });

        const Component = withAuth(() => React.createElement("div", null, "Sign in"), {
            redirectTo: "/intake",
            invert: true,
        });

        await Component({});

        expect(redirectMock).toHaveBeenCalledWith("/intake");
    });

    it("does not redirect inverted routes when there is no session", async () => {
        headersMock.mockResolvedValue(new Headers());
        getSessionMock.mockResolvedValue(null);

        const Component = withAuth(() => React.createElement("div", null, "Sign in"), {
            redirectTo: "/intake",
            invert: true,
        });

        const result = await Component({});

        expect(redirectMock).not.toHaveBeenCalled();
        expect(result).toBeTruthy();
    });
});
