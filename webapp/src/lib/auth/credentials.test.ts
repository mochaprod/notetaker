import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashPassword, verifyPassword } = vi.hoisted(() => ({
    prismaMock: {
        user: {
            findUnique: vi.fn(),
        },
        $transaction: vi.fn(),
    },
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
}));

vi.mock("@db/prisma", () => ({
    prisma: prismaMock,
}));

vi.mock("better-auth/crypto", () => ({
    hashPassword,
    verifyPassword,
}));

import {
    createCredentialUser,
    toCredentialAccountId,
    verifyCredentialUserPassword,
} from "@/lib/auth/credentials";

describe("credentials", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("normalizes email for credential account ids", () => {
        expect(toCredentialAccountId("  USER@Example.com  ")).toBe("user@example.com");
    });

    it("creates a credential user with a normalized email and hashed password", async () => {
        const tx = {
            user: {
                findUnique: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({
                    id: "user-1",
                    name: "Test User",
                    email: "user@example.com",
                }),
            },
        };

        hashPassword.mockResolvedValue("hashed-password");
        prismaMock.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => {
            return await callback(tx);
        });

        const result = await createCredentialUser({
            name: "  Test User  ",
            email: "  USER@example.com ",
            password: "password123",
        });

        expect(hashPassword).toHaveBeenCalledWith("password123");
        expect(tx.user.create).toHaveBeenCalledWith({
            data: {
                id: expect.any(String),
                name: "Test User",
                email: "user@example.com",
                accounts: {
                    create: {
                        id: expect.any(String),
                        providerId: "credential",
                        accountId: "user@example.com",
                        password: "hashed-password",
                    },
                },
            },
        });
        expect(result).toEqual({
            id: "user-1",
            name: "Test User",
            email: "user@example.com",
        });
    });

    it("rejects duplicate users during creation", async () => {
        const tx = {
            user: {
                findUnique: vi.fn().mockResolvedValue({ id: "user-1" }),
                create: vi.fn(),
            },
        };

        hashPassword.mockResolvedValue("hashed-password");
        prismaMock.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => {
            return await callback(tx);
        });

        await expect(createCredentialUser({
            name: "Test User",
            email: "user@example.com",
            password: "password123",
        })).rejects.toThrow("USER_ALREADY_EXISTS");
    });

    it("returns null when the credential user does not exist", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        hashPassword.mockResolvedValue("timing-buffer");

        const result = await verifyCredentialUserPassword("missing@example.com", "password123");

        expect(result).toBeNull();
        expect(hashPassword).toHaveBeenCalledWith("password123");
    });

    it("returns the safe user shape when the password is valid", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-1",
            name: "Test User",
            email: "user@example.com",
            emailVerified: false,
            image: null,
            createdAt: new Date("2026-04-22T10:00:00.000Z"),
            updatedAt: new Date("2026-04-22T10:00:00.000Z"),
            accounts: [
                {
                    providerId: "credential",
                    password: "hashed-password",
                },
            ],
        });
        verifyPassword.mockResolvedValue(true);

        const result = await verifyCredentialUserPassword("user@example.com", "password123");

        expect(verifyPassword).toHaveBeenCalledWith({
            hash: "hashed-password",
            password: "password123",
        });
        expect(result).toEqual({
            id: "user-1",
            name: "Test User",
            email: "user@example.com",
            emailVerified: false,
            image: null,
            createdAt: new Date("2026-04-22T10:00:00.000Z"),
            updatedAt: new Date("2026-04-22T10:00:00.000Z"),
        });
    });
});
