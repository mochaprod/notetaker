import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("better-auth/react", () => ({
    createAuthClient: vi.fn(() => ({})),
}));

import {
    authClientEmailSignInAdapter,
    authClientEmailSignUpAdapter,
} from "@/lib/auth-client";

describe("auth-client credential adapters", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("posts sign-up requests to the credential endpoint", async () => {
        const fetchMock = vi.mocked(fetch);

        fetchMock.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                redirect: false,
                token: "token-1",
                user: {
                    id: "user-1",
                    name: "Test User",
                    email: "test@example.com",
                    emailVerified: false,
                    image: null,
                    createdAt: "2026-04-22T10:00:00.000Z",
                    updatedAt: "2026-04-22T10:00:00.000Z",
                },
            }),
        } as Response);

        await authClientEmailSignUpAdapter({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
        });

        expect(fetchMock).toHaveBeenCalledWith("/api/auth/sign-up/credentials", {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            }),
        });
    });

    it("throws the parsed server payload on sign-in failure", async () => {
        const fetchMock = vi.mocked(fetch);

        fetchMock.mockResolvedValue({
            ok: false,
            json: vi.fn().mockResolvedValue({
                code: "INVALID_EMAIL_OR_PASSWORD",
            }),
        } as Response);

        await expect(authClientEmailSignInAdapter({
            email: "test@example.com",
            password: "wrong-password",
        })).rejects.toEqual({
            code: "INVALID_EMAIL_OR_PASSWORD",
        });
    });
});
