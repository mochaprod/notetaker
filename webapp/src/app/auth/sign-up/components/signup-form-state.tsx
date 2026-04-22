"use client";

import { SignUpForm, SignUpFormData } from "./signup-form";
import { authClientEmailSignUpAdapter } from "@/lib/auth-client";
import { useCallback, useState } from "react";
import { AuthNavbar } from "../../components/auth-navbar";

export function SignUpFormState() {
    const [isSuccess, setSuccess] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isError, setError] = useState<boolean>(false);

    const signUp = useCallback(async ({
        email,
        name,
        password,
    }: Omit<SignUpFormData, "confirmPassword">) => {
        setError(false);
        setSuccess(false);
        setLoading(true);

        try {
            await authClientEmailSignUpAdapter({
                email,
                name,
                password,
            });
            setLoading(false);
            setSuccess(true);
        } catch {
            setLoading(false);
            setError(true);
        }
    }, []);

    return (
        <div className="min-h-svh bg-background text-foreground">
            <AuthNavbar />
            <div className="flex justify-center px-6 py-10 md:px-10">
                <div className="w-full max-w-md">
                    <SignUpForm
                        signUp={ signUp }
                        isSuccess={ isSuccess }
                        isLoading={ isLoading }
                        isError={ isError }
                    />
                </div>
            </div>
        </div>
    );
}
