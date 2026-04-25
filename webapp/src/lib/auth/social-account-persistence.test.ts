import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HookEndpointContext } from "better-auth";

const { prismaMock, getAccountCookieMock } = vi.hoisted(() => ({
    prismaMock: {
        $transaction: vi.fn(),
        account: {
            findUnique: vi.fn(),
        },
    },
    getAccountCookieMock: vi.fn(),
}));

vi.mock("@db/prisma", () => ({
    prisma: prismaMock,
}));

vi.mock("better-auth/cookies", () => ({
    getAccountCookie: getAccountCookieMock,
}));

import {
    persistSocialAccount,
    persistSocialAccountData,
    socialAccountPersistenceInternals,
} from "@/lib/auth/social-account-persistence";

type PersistSocialAccountContext = Parameters<typeof persistSocialAccountData>[0];
type PersistSocialAccountUser = NonNullable<PersistSocialAccountContext["context"]["newSession"]>["user"];

function createSessionUser(overrides: Partial<PersistSocialAccountUser> = {}) {
    return {
        id: "session-user-1",
        createdAt: new Date("2026-04-22T10:00:00.000Z"),
        updatedAt: new Date("2026-04-22T10:00:00.000Z"),
        email: "user@example.com",
        emailVerified: true,
        image: null,
        name: "Test User",
        ...overrides,
    };
}

describe("social account persistence", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("reassembles chunked account cookies", () => {
        const encoded = socialAccountPersistenceInternals.joinCookieChunks("test.account_data", [
            "test.account_data.1=def; Path=/; HttpOnly",
            "other=value; Path=/",
            "test.account_data.0=abc; Path=/; HttpOnly",
        ]);

        expect(encoded).toBe("abcdef");
    });

    it("upserts the user and creates a provider account from the account cookie", async () => {
        const tx = {
            user: {
                upsert: vi.fn().mockResolvedValue({
                    id: "app-user-1",
                }),
            },
            account: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn(),
                update: vi.fn(),
            },
        };

        getAccountCookieMock.mockResolvedValue({
            providerId: "google",
            accountId: "google-user-1",
            accessToken: "access-token",
            refreshToken: "refresh-token",
            idToken: "id-token",
            scope: "openid,email,profile",
            accessTokenExpiresAt: "2026-04-22T20:00:00.000Z",
        });
        prismaMock.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => {
            return await callback(tx);
        });
        prismaMock.account.findUnique.mockResolvedValue({
            accountId: "google-user-1",
            providerId: "google",
            userId: "app-user-1",
        });

        await persistSocialAccountData({
            context: {
                authCookies: {
                    accountData: {
                        name: "test.account_data",
                        attributes: {},
                    },
                },
                newSession: {
                    user: createSessionUser({
                        email: " USER@example.com ",
                        image: "https://example.com/avatar.png",
                    }),
                },
            },
        } as PersistSocialAccountContext);

        expect(getAccountCookieMock).toHaveBeenCalled();
        expect(tx.user.upsert).toHaveBeenCalledWith({
            where: {
                email: "user@example.com",
            },
            update: {
                emailVerified: true,
                image: "https://example.com/avatar.png",
                name: "Test User",
            },
            create: {
                id: expect.any(String),
                email: "user@example.com",
                emailVerified: true,
                image: "https://example.com/avatar.png",
                name: "Test User",
            },
        });
        expect(tx.account.findFirst).toHaveBeenCalledWith({
            where: {
                accountId: "google-user-1",
                providerId: "google",
            },
            select: {
                id: true,
            },
        });
        expect(tx.account.create).toHaveBeenCalledWith({
            data: {
                id: expect.any(String),
                accountId: "google-user-1",
                providerId: "google",
                accessToken: "access-token",
                refreshToken: "refresh-token",
                idToken: "id-token",
                scope: "openid,email,profile",
                accessTokenExpiresAt: new Date("2026-04-22T20:00:00.000Z"),
                refreshTokenExpiresAt: null,
                userId: "app-user-1",
            },
        });
        expect(tx.account.update).not.toHaveBeenCalled();
        expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
            where: {
                providerId_accountId: {
                    providerId: "google",
                    accountId: "google-user-1",
                },
            },
            select: {
                accountId: true,
                providerId: true,
                userId: true,
            },
        });
    });

    it("delegates stored account loading to Better Auth's getAccountCookie", async () => {
        const ctx = {
            getCookie: vi.fn(),
            context: {
                newSession: {
                    user: createSessionUser(),
                },
            },
        } as unknown as PersistSocialAccountContext;
        const storedAccount = {
            providerId: "google",
            accountId: "google-user-1",
        };

        getAccountCookieMock.mockResolvedValue(storedAccount);

        await expect(socialAccountPersistenceInternals.readStoredAccount(ctx)).resolves.toEqual(storedAccount);
        expect(getAccountCookieMock).toHaveBeenCalledWith(ctx);
    });

    it("registers an after hook plugin for OAuth callbacks with new sessions", () => {
        const plugin = persistSocialAccount("google");

        expect(plugin.id).toBe("persist-social-account-google");
        expect(plugin.hooks.after).toHaveLength(1);
        expect(plugin.hooks.after[0].matcher({
            path: "/callback/google",
            params: {
                id: "google",
            },
            context: {
                returned: new Response(null, {
                    status: 302,
                }),
                newSession: {
                    user: createSessionUser(),
                },
            },
        } as HookEndpointContext)).toBe(true);
        expect(plugin.hooks.after[0].matcher({
            path: "/callback/github",
            params: {
                id: "github",
            },
            context: {
                returned: new Response(null, {
                    status: 302,
                }),
                newSession: {
                    user: createSessionUser(),
                },
            },
        } as HookEndpointContext)).toBe(false);
        expect(plugin.hooks.after[0].matcher({
            path: "/sign-in/social",
            context: {
                returned: null,
                newSession: null,
            },
        } as HookEndpointContext)).toBe(false);
    });

    it("fails closed when the stored provider does not match the configured provider", async () => {
        const plugin = persistSocialAccount("google");

        getAccountCookieMock.mockResolvedValue({
            providerId: "github",
            accountId: "github-user-1",
        });

        await expect(plugin.hooks.after[0].handler({
            path: "/callback/google",
            getCookie: vi.fn(),
            context: {
                newSession: {
                    user: createSessionUser(),
                },
                returned: new Response(null, {
                    status: 302,
                }),
            },
            params: {
                id: "google",
            },
        } as PersistSocialAccountContext)).rejects.toMatchObject({
            body: expect.objectContaining({
                code: "FAILED_TO_PERSIST_SOCIAL_ACCOUNT",
            }),
        });
        expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("fails closed when the decoded cookie payload is invalid", async () => {
        getAccountCookieMock.mockResolvedValue({
            providerId: "google",
        });

        await expect(persistSocialAccountData({
            getCookie: vi.fn(),
            context: {
                newSession: {
                    user: createSessionUser(),
                },
            },
        } as PersistSocialAccountContext)).rejects.toMatchObject({
            body: expect.objectContaining({
                code: "FAILED_TO_PERSIST_SOCIAL_ACCOUNT",
            }),
        });
    });

    it("fails closed when social account verification fails after the transaction", async () => {
        const tx = {
            user: {
                upsert: vi.fn().mockResolvedValue({
                    id: "app-user-1",
                }),
            },
            account: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn(),
                update: vi.fn(),
            },
        };

        getAccountCookieMock.mockResolvedValue({
            providerId: "google",
            accountId: "google-user-1",
        });
        prismaMock.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => {
            return await callback(tx);
        });
        prismaMock.account.findUnique.mockResolvedValue(null);

        await expect(persistSocialAccountData({
            getCookie: vi.fn(),
            context: {
                newSession: {
                    user: createSessionUser(),
                },
            },
        } as PersistSocialAccountContext)).rejects.toMatchObject({
            body: expect.objectContaining({
                code: "FAILED_TO_PERSIST_SOCIAL_ACCOUNT",
            }),
        });
    });

    it("fails closed when the persistence transaction throws", async () => {
        getAccountCookieMock.mockResolvedValue({
            providerId: "google",
            accountId: "google-user-1",
        });
        prismaMock.$transaction.mockRejectedValue(new Error("db is down"));

        await expect(persistSocialAccountData({
            getCookie: vi.fn(),
            context: {
                newSession: {
                    user: createSessionUser(),
                },
            },
        } as PersistSocialAccountContext)).rejects.toMatchObject({
            body: expect.objectContaining({
                code: "FAILED_TO_PERSIST_SOCIAL_ACCOUNT",
            }),
        });
    });
});
