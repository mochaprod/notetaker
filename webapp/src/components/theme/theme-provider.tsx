"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";

export type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "drift-theme";

const isTheme = (value: string | undefined): value is Theme =>
    value === "light" || value === "dark" || value === "system";

const isResolvedTheme = (value: string | undefined): value is Exclude<Theme, "system"> =>
    value === "light" || value === "dark";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemeProvider>) {
    return (
        <NextThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
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
    const [mounted, setMounted] = useState(false);

    const selectedTheme = isTheme(theme) ? theme : "system";
    const activeTheme = isResolvedTheme(resolvedTheme) ? resolvedTheme : "light";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
    }, [selectedTheme]);

    const setTheme = useCallback((nextTheme: Theme) => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        }

        setNextTheme(nextTheme);
    }, [setNextTheme]);

    const toggleTheme = useCallback(() => {
        if (selectedTheme === "light") {
            setTheme("dark");
            return;
        }

        if (selectedTheme === "dark") {
            setTheme("system");
            return;
        }

        setTheme("light");
    }, [selectedTheme, setTheme]);

    return {
        ...rest,
        mounted,
        resolvedTheme: activeTheme,
        theme: selectedTheme,
        setTheme,
        toggleTheme,
    };
}
