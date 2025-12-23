"use client";

import { LoginForm } from "@/components/login-form";
import { authClient, AuthClientEmailSignInData } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function SignInPage() {
    const router = useRouter();
    const [isSuccess, setSuccess] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isError, setError] = useState<boolean>(false);

    const signIn = useCallback(async ({
        email,
        password,
    }: AuthClientEmailSignInData) => {
        const {} = await authClient.signIn.email({
            email,
            password,
        }, {
            onRequest: () => {
                setLoading(true);
            },
            onSuccess: () => {
                setLoading(false);
                router.push("/");
            },
            onError: (err) => {
                setLoading(false);
                setError(true);
            },
        });
    }, []);

    return (
        <div
            className="flex justify-center min-h-svh p-6 md:p-10"
        >
            <div
                className="w-full max-w-md"
            >
                <LoginForm
                    signIn={ signIn }
                    isSuccess={ isSuccess }
                    isLoading={ isLoading }
                    isError={ isError }
                />
            </div>
        </div>
    );
}
