"use client";

import { SignUpForm, SignUpFormData } from "@/components/signup-form";
import { authClient } from "@/lib/auth-client";
import { useCallback, useState } from "react";

export default function SignUpPage() {
    const [isSuccess, setSuccess] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isError, setError] = useState<boolean>(false);

    const signUp = useCallback(async ({
        email,
        name,
        password,
    }: Omit<SignUpFormData, "confirmPassword">) => {
        const { data, error } = await authClient.signUp.email({
            email,
            name,
            password,
        }, {
            onRequest: () => {
                setLoading(true);
            },
            onSuccess: () => {
                setSuccess(true);
            },
            onError: () => {
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
                <SignUpForm
                    signUp={ signUp }
                    isSuccess={ isSuccess }
                    isLoading={ isLoading }
                    isError={ isError }
                />
            </div>
        </div>
    );
}
