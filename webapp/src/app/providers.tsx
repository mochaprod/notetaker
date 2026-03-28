"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useRef } from "react";

export function Providers({ children }: PropsWithChildren) {
    const queryClientRef = useRef(new QueryClient());

    return (
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
            <QueryClientProvider
                client={ queryClientRef.current }
            >
                { children }
            </QueryClientProvider>
        </ThemeProvider>
    );
}
