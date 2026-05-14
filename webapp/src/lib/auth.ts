import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { credentialsAuth } from "@/lib/auth/credentials-plugin";
import { prisma } from "@db/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    session: {
        cookieCache: {
            enabled: true,
            strategy: "jwe",
            maxAge: 604800, // 1 week
        },
    },
    account: {
        storeStateStrategy: "cookie",
        storeAccountCookie: true,
        accountLinking: {
            enabled: false,
        },
    },
    plugins: [
        credentialsAuth(),
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        },
    },
});
