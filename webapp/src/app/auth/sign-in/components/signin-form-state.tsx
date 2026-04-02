"use client";

import { authClient, AuthClientEmailSignInData } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AuthNavbar } from "../../components/auth-navbar";
import { SignInForm } from "./signin-form";

export default function SignInFormState() {
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
        <div className="min-h-svh bg-background text-foreground">
            <AuthNavbar />
            <div className="flex justify-center px-6 py-10 md:px-10">
                <div className="w-full max-w-md">
                    <SignInForm
                        signIn={ signIn }
                        isSuccess={ isSuccess }
                        isLoading={ isLoading }
                        isError={ isError }
                    />
                </div>
            </div>
        </div>
    );
}
