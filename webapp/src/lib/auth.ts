import { betterAuth } from "better-auth";
import { credentialsAuth } from "@/lib/auth/credentials-plugin";

export const auth = betterAuth({
    session: {
        cookieCache: {
            enabled: true,
            strategy: "jwe",
            refreshCache: true,
        },
    },
    account: {
        storeStateStrategy: "cookie",
        storeAccountCookie: true,
    },
    plugins: [
        credentialsAuth(),
    ],
});
