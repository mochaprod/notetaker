import type { SlateDocument } from "@common/types/intake";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import {
    createSaveNotepadMutationOptions,
    formatSaveNotepadErrorMessage,
    saveNotepadRetryDelay,
} from "./notepad-save";

const savePayload = {
    dateKey: "2026-05-03",
    title: "Untitled",
    content: [
        {
            type: "paragraph" as const,
            children: [{ text: "Saved note" }],
        },
    ] satisfies SlateDocument,
};

describe("notepad save error handling", () => {
    it("uses a safe production save failure message", () => {
        vi.stubEnv("NODE_ENV", "production");

        expect(formatSaveNotepadErrorMessage(new Error("database unavailable"))).toBe(
            "Failed to save notepad. Please try again.",
        );
    });

    it("includes error details outside production", () => {
        vi.stubEnv("NODE_ENV", "test");

        expect(formatSaveNotepadErrorMessage(new Error("database unavailable"))).toContain(
            "database unavailable",
        );
    });

    it("does not show an error toast for retryable save failures before retries are exhausted", async () => {
        const error = new Error("database unavailable");
        const saveNotepad = vi.fn().mockRejectedValue(error);
        const showError = vi.fn();
        const onSuccess = vi.fn();
        const options = createSaveNotepadMutationOptions(saveNotepad, showError, onSuccess);

        await expect(options.mutationFn(savePayload)).rejects.toBe(error);

        expect(showError).not.toHaveBeenCalled();
    });

    it("shows one error toast after tanstack retries are exhausted", async () => {
        const queryClient = new QueryClient();
        const error = new Error("database unavailable");
        const saveNotepad = vi.fn().mockRejectedValue(error);
        const showError = vi.fn();
        const observer = new MutationObserver(queryClient, {
            ...createSaveNotepadMutationOptions(saveNotepad, showError, vi.fn()),
            retryDelay: 0,
        });

        await expect(observer.mutate(savePayload)).rejects.toBe(error);

        expect(saveNotepad).toHaveBeenCalledTimes(4);
        expect(showError).toHaveBeenCalledTimes(1);
        expect(showError).toHaveBeenLastCalledWith(expect.stringContaining("database unavailable"));
    });

    it("uses capped exponential retry backoff", () => {
        expect(saveNotepadRetryDelay(0)).toBe(1000);
        expect(saveNotepadRetryDelay(1)).toBe(2000);
        expect(saveNotepadRetryDelay(4)).toBe(8000);
    });

    it("builds shared mutation options for all notepad save surfaces", async () => {
        const error = new Error("database unavailable");
        const saveNotepad = vi.fn().mockRejectedValue(error);
        const showError = vi.fn();
        const onSuccess = vi.fn();
        const options = createSaveNotepadMutationOptions(saveNotepad, showError, onSuccess);

        expect(options.retry).toBe(3);
        expect(options.retryDelay(1)).toBe(2000);
        expect(options.onSuccess).toBe(onSuccess);
        await expect(options.mutationFn(savePayload)).rejects.toBe(error);
        expect(showError).not.toHaveBeenCalled();
        options.onError(error);
        expect(showError).toHaveBeenCalledWith(expect.stringContaining("database unavailable"));
    });
});
