import { hashPassword, verifyPassword } from "better-auth/crypto";
import { prisma } from "@db/prisma";

const CREDENTIAL_PROVIDER_ID = "credential";

type CreateCredentialUserInput = {
    email: string;
    name: string;
    password: string;
};

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export function toCredentialAccountId(email: string) {
    return normalizeEmail(email);
}

export async function findCredentialUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: {
            email: normalizeEmail(email),
        },
        include: {
            accounts: true,
        },
    });
}

export async function createCredentialUser({
    email,
    name,
    password,
}: CreateCredentialUserInput) {
    const normalizedEmail = normalizeEmail(email);
    const passwordHash = await hashPassword(password);

    return await prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
            where: {
                email: normalizedEmail,
            },
            select: {
                id: true,
            },
        });

        if (existingUser) {
            throw new Error("USER_ALREADY_EXISTS");
        }

        return await tx.user.create({
            data: {
                id: crypto.randomUUID(),
                name: name.trim(),
                email: normalizedEmail,
                accounts: {
                    create: {
                        id: crypto.randomUUID(),
                        providerId: CREDENTIAL_PROVIDER_ID,
                        accountId: toCredentialAccountId(normalizedEmail),
                        password: passwordHash,
                    },
                },
            },
        });
    });
}

export async function verifyCredentialUserPassword(email: string, password: string) {
    const user = await findCredentialUserByEmail(email);

    if (!user) {
        await hashPassword(password);
        return null;
    }

    const credentialAccount = user.accounts.find((account) => account.providerId === CREDENTIAL_PROVIDER_ID);

    if (!credentialAccount?.password) {
        await hashPassword(password);
        return null;
    }

    const isValid = await verifyPassword({
        hash: credentialAccount.password,
        password,
    });

    if (!isValid) {
        return null;
    }

    const { accounts: _, ...safeUser } = user;

    return safeUser;
}
