import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
});

type CredentialAuthResponse = {
    redirect: false;
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: string | Date;
        updatedAt: string | Date;
    };
};

async function postCredentialAuth<TBody>(path: string, body: TBody) {
    const response = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw payload ?? new Error("Credential auth request failed.");
    }

    return payload as CredentialAuthResponse;
}

export type AuthClientEmailSignUpData = {
    email: string;
    name: string;
    password: string;
};

export async function authClientEmailSignUpAdapter({
    name,
    email,
    password,
}: AuthClientEmailSignUpData) {
    return await postCredentialAuth("/api/auth/sign-up/credentials", {
        name,
        email,
        password,
    });
}

export type AuthClientEmailSignInData = {
    email: string;
    password: string;
};

export async function authClientEmailSignInAdapter({
    email,
    password,
}: AuthClientEmailSignInData) {
    return await postCredentialAuth("/api/auth/sign-in/credentials", {
        email,
        password,
    });
}
