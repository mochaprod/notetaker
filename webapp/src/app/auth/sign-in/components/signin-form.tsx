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
import { authClient, AuthClientEmailSignInData } from "@/lib/auth-client";
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

    const signInWithGoogle = useCallback(async () => {
        const response = await authClient.signIn.social({
            provider: "google",
        });
    }, []);

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
                <CardContent
                    className="flex flex-col gap-6"
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full flex gap-3"
                        onClick={ signInWithGoogle }
                    >
                        <svg
                            viewBox="0 0 46.1454545 47.4666667"
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-5"
                            aria-hidden="true"
                        >
                            <path
                                d="M9.82727273 24c0-1.5242667.25315907-2.9856.705-4.3562667L2.62345455 13.6042667C1.08206818 16.7338667.213636364 20.2602667.213636364 24c0 3.7365333.867363636 7.2608 2.406613636 10.3882667l7.904545464-6.0512C10.0772273 26.9728 9.82727273 25.5168 9.82727273 24"
                                fill="#FBBC05"
                            />
                            <path
                                d="M23.7136364 10.1333333c3.3113636 0 6.3022727 1.1733334 8.6522727 3.0933334L39.2022727 6.4C35.0363636 2.77333333 29.6954545.533333333 23.7136364.533333333 14.4268636.533333333 6.44540909 5.84426667 2.62345455 13.6042667l7.90881815 6.0394666c1.8223182-5.5317333 7.0168864-9.5104 13.1813637-9.5104"
                                fill="#EB4335"
                            />
                            <path
                                d="M23.7136364 37.8666667c-6.1644773 0-11.3590455-3.9786667-13.1813637-9.5104l-7.90881815 6.0384C6.44540909 42.1557333 14.4268636 47.4666667 23.7136364 47.4666667c5.7318636 0 11.2041591-2.0352 15.3113181-5.8485334l-7.5071818-5.8037333c-2.1182045 1.3344-4.7854545 2.0522667-7.8041363 2.0522667"
                                fill="#34A853"
                            />
                            <path
                                d="M46.1454545 24c0-1.3866667-.2136363-2.88-.5340909-4.2666667H23.7136364V28.8h12.6045454c-.6302273 3.0912-2.3457273 5.4677333-4.8004091 7.0144l7.5071818 5.8037333C43.3393409 37.6138667 46.1454545 31.6490667 46.1454545 24"
                                fill="#4285F4"
                            />
                        </svg>
                        <span>
                            Sign in with Google
                        </span>
                    </Button>
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
