import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
});

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
    const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
    });

    if (error) {
        throw error;
    }
}

export type AuthClientEmailSignInData = {
    email: string;
    password: string;
};

export async function authClientEmailSignInAdapter({
    email,
    password,
}: AuthClientEmailSignInData) {
    const { data, error } = await authClient.signIn.email({
        email,
        password,
    });

    if (error) {
        throw error;
    }
}

