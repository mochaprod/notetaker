"use client";

import { CheckIcon, Loader2, XIcon } from "lucide-react";
import {
    getSaveStatusIcon,
    getSaveStatusLabel,
    getSaveStatusTextColor,
    type SaveStatus,
} from "./save-status-label";

export function SaveStatusBar({ hasError, isLoading, loadingState, lastSavedAt }: SaveStatus) {
    const icon = getSaveStatusIcon({ hasError, isLoading, lastSavedAt });
    const textColor = getSaveStatusTextColor({ hasError });

    return (
        <div className={ `flex h-14 shrink-0 items-center bg-white/80 px-6 text-xs font-medium ${textColor} backdrop-blur-sm dark:border-white/10 dark:bg-white/10` }>
            <div className="flex min-w-32 items-center gap-1">
                {icon === "loading" && (
                    <Loader2
                        aria-hidden="true"
                        className="size-3.5 animate-spin"
                    />
                )}
                {icon === "error" && (
                    <XIcon
                        aria-hidden="true"
                        className="size-3.5"
                    />
                )}
                {icon === "success" && (
                    <CheckIcon
                        aria-hidden="true"
                        className="size-3.5"
                    />
                )}
                <span>{ getSaveStatusLabel({ hasError, isLoading, loadingState, lastSavedAt }) }</span>
            </div>
        </div>
    );
}
