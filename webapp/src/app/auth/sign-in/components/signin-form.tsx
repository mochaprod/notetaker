"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthClientEmailSignInData } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import z from "zod/v4";
import { Spinner } from "../../../../components/ui/spinner";

export type LoginFormProps = React.ComponentProps<"div"> & {
    signIn: (data: AuthClientEmailSignInData) => Promise<void>;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
};

const SignInFormSchema = z.object({
    email: z.string().min(1, "Email is required."),
    password: z.string().min(1, "Password is required."),
});

type SignInFormShape = z.infer<typeof SignInFormSchema>;

export function SignInForm({
    signIn,
    isSuccess,
    isLoading,
    isError,
    className,
    ...props
}: LoginFormProps) {
    const form = useForm({
        resolver: zodResolver(SignInFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSignUpFormSubmit: SubmitHandler<SignInFormShape> = useCallback(
        async (data) => {
            await signIn({
                email: data.email,
                password: data.password,
            });
        },
        [signIn],
    );

    return (
        <div className={cn("flex flex-col gap-5 pt-20", className)} {...props}>
            <Card
                className="gap-5 py-8"
            >
                <CardHeader>
                    <CardTitle className="text-xl">Sign in to your account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSignUpFormSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                        />
                                    </Field>
                                )}
                            />
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">
                                                Password
                                            </FieldLabel>
                                            <a
                                                href="#"
                                                className="ml-auto text-sm underline-offset-4 hover:underline"
                                            >
                                                Forgot your password?
                                            </a>
                                        </div>
                                        <Input
                                            type="password"
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                        />
                                    </Field>
                                )}
                            />
                            {isError && (
                                <div className="text-destructive flex items-center gap-2 text-sm">
                                    <TriangleAlert size={16} />
                                    Incorrect email or password.
                                </div>
                            )}
                            <Field>
                                <Button disabled={!form.formState.isValid || isLoading} type="submit" size="lg">
                                    {isLoading
                                        ? (<Spinner className="size-6" />)
                                        : "Sign in"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/auth/sign-up">Sign up</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    );
}
