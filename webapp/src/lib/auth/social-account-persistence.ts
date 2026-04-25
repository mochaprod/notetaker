import { prisma } from "@db/prisma";
import type { BetterAuthPlugin, HookEndpointContext } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { getAccountCookie } from "better-auth/cookies";
import { z } from "zod";
import { LOGGER } from "../logger";

type HookContext = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

const storedAccountSchema = z.object({
    accountId: z.string(),
    providerId: z.string(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    idToken: z.string().optional(),
    scope: z.string().optional(),
    accessTokenExpiresAt: z.union([z.string(), z.date()]).optional(),
    refreshTokenExpiresAt: z.union([z.string(), z.date()]).optional(),
});

type StoredAccount = z.infer<typeof storedAccountSchema>;
type PersistedSocialAccount = {
    userId: string;
    accountId: string;
    providerId: string;
};

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function splitSetCookieHeader(setCookieHeader: string) {
    return setCookieHeader.split(/,(?=\s*[^;,=\s]+=[^;,]*)/g).map((value) => value.trim()).filter(Boolean);
}

function getSetCookieValues(headers: Headers) {
    const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;

    if (typeof getSetCookie === "function") {
        return getSetCookie.call(headers);
    }

    const combined = headers.get("set-cookie");
    return combined ? splitSetCookieHeader(combined) : [];
}

function getCookieValue(cookieHeader: string) {
    const separatorIndex = cookieHeader.indexOf(";");
    const cookiePair = separatorIndex === -1 ? cookieHeader : cookieHeader.slice(0, separatorIndex);
    const equalsIndex = cookiePair.indexOf("=");

    if (equalsIndex === -1) {
        return null;
    }

    return {
        name: cookiePair.slice(0, equalsIndex).trim(),
        value: cookiePair.slice(equalsIndex + 1),
    };
}

function joinCookieChunks(cookieName: string, setCookieHeaders: string[]) {
    const chunks = setCookieHeaders.flatMap((header) => {
        const cookie = getCookieValue(header);

        if (!cookie) {
            return [];
        }

        if (cookie.name === cookieName) {
            return [{ index: 0, value: cookie.value }];
        }

        if (!cookie.name.startsWith(`${cookieName}.`)) {
            return [];
        }

        const chunkIndex = Number(cookie.name.slice(cookieName.length + 1));
        return Number.isFinite(chunkIndex) ? [{ index: chunkIndex, value: cookie.value }] : [];
    });

    if (chunks.length === 0) {
        return null;
    }

    return chunks.sort((left, right) => left.index - right.index).map((chunk) => chunk.value).join("");
}

function toDate(value?: string | Date) {
    if (!value) {
        return null;
    }

    return value instanceof Date ? value : new Date(value);
}

async function readStoredAccount(ctx: HookContext): Promise<ReturnType<typeof getAccountCookie>> {
    return await getAccountCookie(ctx);
}

function createSocialPersistenceError(message: string) {
    return APIError.from("INTERNAL_SERVER_ERROR", {
        code: "FAILED_TO_PERSIST_SOCIAL_ACCOUNT",
        message,
    });
}

async function ensureSocialAccountPersisted(result: PersistedSocialAccount) {
    const persistedAccount = await prisma.account.findUnique({
        where: {
            providerId_accountId: {
                providerId: result.providerId,
                accountId: result.accountId,
            },
        },
        select: {
            accountId: true,
            providerId: true,
            userId: true,
        },
    });

    if (!persistedAccount || persistedAccount.userId !== result.userId) {
        throw createSocialPersistenceError("Social account persistence verification failed.");
    }
}

export async function persistSocialAccountData(ctx: HookContext, providerKey?: string) {
    const sessionUser = ctx.context.newSession?.user;

    if (!sessionUser || !sessionUser?.email) {
        throw createSocialPersistenceError("No authenticated session user was available after social sign-in.");
    }

    const storedAccount = await readStoredAccount(ctx);

    if (!storedAccount?.providerId || !storedAccount.accountId) {
        throw createSocialPersistenceError("Social account data was missing from the callback.");
    }

    const normalizedEmail = normalizeEmail(sessionUser.email);
    const providerId = providerKey ?? (typeof ctx.params?.id === "string" ? ctx.params.id : storedAccount.providerId);
    let persistedResult: PersistedSocialAccount;

    try {
        persistedResult = await prisma.$transaction(async (tx) => {
            const user = await tx.user.upsert({
                where: {
                    email: normalizedEmail,
                },
                update: {
                    emailVerified: sessionUser.emailVerified,
                    image: sessionUser.image ?? null,
                    name: sessionUser.name,
                },
                create: {
                    id: crypto.randomUUID(),
                    email: normalizedEmail,
                    emailVerified: sessionUser.emailVerified,
                    image: sessionUser.image ?? null,
                    name: sessionUser.name,
                },
            });

            const existingAccount = await tx.account.findFirst({
                where: {
                    accountId: storedAccount.accountId,
                    providerId,
                },
                select: {
                    id: true,
                },
            });

            const accountData = {
                accessToken: storedAccount.accessToken ?? null,
                refreshToken: storedAccount.refreshToken ?? null,
                idToken: storedAccount.idToken ?? null,
                scope: storedAccount.scope ?? null,
                accessTokenExpiresAt: storedAccount.accessTokenExpiresAt
                    ? toDate(storedAccount.accessTokenExpiresAt)
                    : null,
                refreshTokenExpiresAt: storedAccount.refreshTokenExpiresAt
                    ? toDate(storedAccount.refreshTokenExpiresAt)
                    : null,
                userId: user.id,
            };

            if (existingAccount) {
                await tx.account.update({
                    where: {
                        id: existingAccount.id,
                    },
                    data: accountData,
                });

                return {
                    userId: user.id,
                    accountId: storedAccount.accountId,
                    providerId,
                };
            }

            await tx.account.create({
                data: {
                    id: crypto.randomUUID(),
                    accountId: storedAccount.accountId,
                    providerId,
                    ...accountData,
                },
            });


            return {
                userId: user.id,
                accountId: storedAccount.accountId,
                providerId,
            };
        });
    } catch {
        throw createSocialPersistenceError("Failed to persist the social account.");
    }

    await ensureSocialAccountPersisted(persistedResult);
}

export function persistSocialAccount(providerKey: string) {
    const callbackPath = `/callback/:id`;
    const concreteCallbackPath = `/callback/${providerKey}`;

    return {
        id: `persist-social-account-${providerKey}`,
        hooks: {
            after: [{
                matcher: (ctx: HookEndpointContext) => {
                    const matchesCallbackPath = ctx.path === callbackPath
                        || ctx.path === concreteCallbackPath
                        || !!ctx.path?.startsWith(`${concreteCallbackPath}/`);
                    const matchesProvider = ctx.params?.id === providerKey || ctx.path === concreteCallbackPath;

                    return matchesCallbackPath
                        && matchesProvider
                        && !!ctx.context.returned
                        && !!ctx.context.newSession;
                },
                handler: createAuthMiddleware(async (ctx) => {
                    const storedAccount = await readStoredAccount(ctx);

                    if (storedAccount?.providerId && storedAccount.providerId !== providerKey) {
                        throw createSocialPersistenceError("Social provider mismatch during callback persistence.");
                    }

                    await persistSocialAccountData(ctx, providerKey);
                }),
            }],
        },
    } satisfies BetterAuthPlugin;
}

export const socialAccountPersistenceInternals = {
    joinCookieChunks,
    splitSetCookieHeader,
    readStoredAccount,
};
