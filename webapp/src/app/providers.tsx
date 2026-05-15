"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: PropsWithChildren) {
    const queryClientRef = useRef(new QueryClient());

    return (
        <ThemeProvider>
            <QueryClientProvider
                client={ queryClientRef.current }
            >
                { children }
            </QueryClientProvider>
            <Toaster
                richColors
                closeButton
            />
        </ThemeProvider>
    );
}
