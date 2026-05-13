import { betterAuth } from "better-auth";
import { credentialsAuth } from "@/lib/auth/credentials-plugin";
import { persistSocialAccount } from "@/lib/auth/social-account-persistence";

export const auth = betterAuth({
    session: {
        cookieCache: {
            enabled: true,
            strategy: "jwe",
            refreshCache: true,
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
        persistSocialAccount("google"),
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        },
    },
});
