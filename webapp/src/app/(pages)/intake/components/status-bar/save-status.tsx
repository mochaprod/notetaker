"use client";

import { Loader2 } from "lucide-react";
import {
    getSaveStatusLabel,
    type SaveStatus,
} from "./save-status-label";

export function SaveStatusBar({ isLoading, lastSavedAt }: SaveStatus) {
    return (
        <div className="flex h-14 shrink-0 items-center bg-white/80 px-6 text-xs font-medium text-neutral-400 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-neutral-400">
            <div className="flex min-w-32 items-center gap-1">
                {isLoading && (
                    <Loader2
                        aria-hidden="true"
                        className="size-3.5 animate-spin"
                    />
                )}
                <span>{ getSaveStatusLabel({ isLoading, lastSavedAt }) }</span>
            </div>
        </div>
    );
}
