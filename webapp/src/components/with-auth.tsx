import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

type ServerComponent<P> = (props: P) => Promise<ReactNode> | ReactNode;

export type WithAuthConfig = {
    redirectTo: string;
    invert: boolean;
};

export const WithAuthConfigDefaults: WithAuthConfig = {
    redirectTo: "/",
    invert: false,
};

export function withAuth<P extends object>(
    Component: ServerComponent<P>,
    config?: Partial<WithAuthConfig>
) {
    const { redirectTo, invert } = { ...WithAuthConfigDefaults, ...config };

    async function ProtectedComponent(props: P) {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if ((session?.session && invert) || (!session?.session && !invert)) {
            redirect(redirectTo);
        }

        return (
            <Component
                {...props}
            />
        );
    };
    ProtectedComponent.displayName = `withAuth(${Component.name})`;

    return ProtectedComponent;
}
