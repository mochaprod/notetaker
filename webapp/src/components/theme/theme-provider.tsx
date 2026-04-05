"use client";

import React, { useCallback, useEffect } from "react";
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "drift-theme";

const isTheme = (value: string | undefined): value is Theme =>
    value === "light" || value === "dark";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemeProvider>) {
    return (
        <NextThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey={THEME_STORAGE_KEY}
            { ...props }
        >
            { children }
        </NextThemeProvider>
    );
}

export function useTheme() {
    const {
        theme,
        resolvedTheme,
        setTheme: setNextTheme,
        ...rest
    } = useNextTheme();

    const activeTheme = isTheme(theme)
        ? theme
        : isTheme(resolvedTheme)
          ? resolvedTheme
          : "light";

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
    }, [activeTheme]);

    const setTheme = useCallback((nextTheme: Theme) => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        }

        setNextTheme(nextTheme);
    }, [setNextTheme]);

    const toggleTheme = useCallback(() => {
        setTheme(activeTheme === "dark" ? "light" : "dark");
    }, [activeTheme, setTheme]);

    return {
        ...rest,
        theme: activeTheme,
        setTheme,
        toggleTheme,
    };
}
