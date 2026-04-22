import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    createCredentialUser,
    verifyCredentialUserPassword,
    setSessionCookie,
} = vi.hoisted(() => ({
    createCredentialUser: vi.fn(),
    verifyCredentialUserPassword: vi.fn(),
    setSessionCookie: vi.fn(),
}));

vi.mock("@/lib/auth/credentials", () => ({
    createCredentialUser,
    verifyCredentialUserPassword,
}));

vi.mock("better-auth/cookies", () => ({
    setSessionCookie,
}));

vi.mock("better-auth/api", () => ({
    formCsrfMiddleware: Symbol("formCsrfMiddleware"),
    APIError: {
        from: (_status: string, details: Record<string, unknown>) =>
            Object.assign(new Error(String(details.message ?? "API error")), details),
    },
    createAuthEndpoint: (
        path: string,
        options: Record<string, unknown>,
        handler: (ctx: Record<string, unknown>) => unknown,
    ) => ({
        path,
        options,
        handler,
    }),
}));

import { credentialsAuth } from "@/lib/auth/credentials-plugin";

function createTestContext(body: Record<string, unknown>) {
    return {
        body,
        context: {
            internalAdapter: {
                createSession: vi.fn().mockResolvedValue({
                    token: "session-token",
                }),
            },
        },
        json: vi.fn((payload) => payload),
    };
}

describe("credentialsAuth plugin", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a session and cookie after successful sign-up", async () => {
        const user = {
            id: "user-1",
            name: "Test User",
            email: "user@example.com",
            emailVerified: false,
            image: null,
            createdAt: new Date("2026-04-22T10:00:00.000Z"),
            updatedAt: new Date("2026-04-22T10:00:00.000Z"),
        };
        const plugin = credentialsAuth();
        const ctx = createTestContext({
            name: "Test User",
            email: "user@example.com",
            password: "password123",
            rememberMe: true,
        });

        createCredentialUser.mockResolvedValue(user);

        const result = await plugin.endpoints.signUpCredentials.handler(ctx);

        expect(createCredentialUser).toHaveBeenCalledWith(ctx.body);
        expect(ctx.context.internalAdapter.createSession).toHaveBeenCalledWith("user-1", false);
        expect(setSessionCookie).toHaveBeenCalledWith(ctx, {
            session: {
                token: "session-token",
            },
            user,
        }, false);
        expect(result).toEqual({
            redirect: false,
            token: "session-token",
            user,
        });
    });

    it("maps duplicate users to a stable API error", async () => {
        const plugin = credentialsAuth();
        const ctx = createTestContext({
            name: "Test User",
            email: "user@example.com",
            password: "password123",
        });

        createCredentialUser.mockRejectedValue(new Error("USER_ALREADY_EXISTS"));

        await expect(plugin.endpoints.signUpCredentials.handler(ctx)).rejects.toMatchObject({
            code: "USER_ALREADY_EXISTS",
        });
    });

    it("rejects invalid sign-in attempts", async () => {
        const plugin = credentialsAuth();
        const ctx = createTestContext({
            email: "user@example.com",
            password: "wrong-password",
        });

        verifyCredentialUserPassword.mockResolvedValue(null);

        await expect(plugin.endpoints.signInCredentials.handler(ctx)).rejects.toMatchObject({
            code: "INVALID_EMAIL_OR_PASSWORD",
        });
    });
});
