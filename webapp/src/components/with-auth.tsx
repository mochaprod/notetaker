import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type ServerComponent<P> = (props: P) => Promise<ReactNode> | ReactNode;

export function withAuth<P extends object>(
    Component: ServerComponent<P>,
    redirectTo = "/",
) {
    return async function ProtectedComponent(props: P) {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.session) {
            redirect(redirectTo);
        }

        return Component(props);
    };
}
