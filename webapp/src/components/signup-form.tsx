"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SignUpFormSchema = z
    .object({
        name: z.string().min(1, {
            message: "Name is required.",
        }),
        email: z.string().email({
            message: "Please enter a valid email.",
        }),
        password: z.string().min(8, {
            message: "Password must be at least 8 characters.",
        }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match.",
        path: ["confirmPassword"],
    });

export type SignUpFormData = z.infer<typeof SignUpFormSchema>;

export type SignUpFormProps = React.ComponentProps<typeof Card> & {
    signUp: (data: Omit<SignUpFormData, "confirmPassword">) => void;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
};

export function SignUpForm({
    signUp,
    isSuccess,
    isLoading,
    isError,
    ...props
}: SignUpFormProps) {
    const form = useForm<SignUpFormData>({
        resolver: zodResolver(SignUpFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSignUpFormSubmit = useCallback(async (data: SignUpFormData) => {
        const { confirmPassword, ...rest } = data;
        signUp(rest);
    }, [signUp]);

    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSignUpFormSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="m@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Must be at least 8 characters long.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Please confirm your password.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2 pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                Create Account
                            </Button>
                            <p className="px-6 text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/auth/sign-in"
                                    className="underline underline-offset-4 hover:text-primary"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
