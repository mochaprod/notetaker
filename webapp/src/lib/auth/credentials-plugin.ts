import { createCredentialUser, verifyCredentialUserPassword } from "@/lib/auth/credentials";
import { setSessionCookie } from "better-auth/cookies";
import { APIError, createAuthEndpoint, formCsrfMiddleware } from "better-auth/api";
import { z } from "zod/v4";

const AuthResponseUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const SignUpCredentialsBodySchema = z.object({
    name: z.string().trim().min(1),
    email: z.email().trim(),
    password: z.string().min(8),
    rememberMe: z.boolean().optional().default(true),
});

const SignInCredentialsBodySchema = z.object({
    email: z.email().trim(),
    password: z.string().min(1),
    rememberMe: z.boolean().optional().default(true),
});

function toAuthResponseUser(user: z.infer<typeof AuthResponseUserSchema>) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export function credentialsAuth() {
    return {
        id: "credentials-auth",
        endpoints: {
            signUpCredentials: createAuthEndpoint("/sign-up/credentials", {
                method: "POST",
                use: [formCsrfMiddleware],
                body: SignUpCredentialsBodySchema,
            }, async (ctx) => {
                let user;

                try {
                    user = await createCredentialUser(ctx.body);
                } catch (error) {
                    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
                        throw APIError.from("BAD_REQUEST", {
                            code: "USER_ALREADY_EXISTS",
                            message: "An account with this email already exists.",
                        });
                    }

                    throw error;
                }

                const session = await ctx.context.internalAdapter.createSession(user.id, ctx.body.rememberMe === false);

                if (!session) {
                    throw APIError.from("INTERNAL_SERVER_ERROR", {
                        code: "FAILED_TO_CREATE_SESSION",
                        message: "Failed to create session.",
                    });
                }

                await setSessionCookie(ctx, {
                    session,
                    user,
                }, ctx.body.rememberMe === false);

                return ctx.json({
                    redirect: false,
                    token: session.token,
                    user: toAuthResponseUser(user),
                });
            }),
            signInCredentials: createAuthEndpoint("/sign-in/credentials", {
                method: "POST",
                use: [formCsrfMiddleware],
                body: SignInCredentialsBodySchema,
            }, async (ctx) => {
                const user = await verifyCredentialUserPassword(ctx.body.email, ctx.body.password);

                if (!user) {
                    throw APIError.from("UNAUTHORIZED", {
                        code: "INVALID_EMAIL_OR_PASSWORD",
                        message: "Invalid email or password.",
                    });
                }

                const session = await ctx.context.internalAdapter.createSession(user.id, ctx.body.rememberMe === false);

                if (!session) {
                    throw APIError.from("INTERNAL_SERVER_ERROR", {
                        code: "FAILED_TO_CREATE_SESSION",
                        message: "Failed to create session.",
                    });
                }

                await setSessionCookie(ctx, {
                    session,
                    user,
                }, ctx.body.rememberMe === false);

                return ctx.json({
                    redirect: false,
                    token: session.token,
                    user: toAuthResponseUser(user),
                });
            }),
        },
    };
}
