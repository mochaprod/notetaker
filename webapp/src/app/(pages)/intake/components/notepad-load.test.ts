import { describe, expect, it, vi } from "vitest";
import {
    LOAD_NOTEPAD_ERROR_MESSAGE,
    formatLoadNotepadErrorMessage,
} from "./notepad-load";

describe("notepad load error handling", () => {
    it("uses a safe production load failure message", () => {
        vi.stubEnv("NODE_ENV", "production");

        expect(formatLoadNotepadErrorMessage(new Error("database unavailable"))).toBe(
            LOAD_NOTEPAD_ERROR_MESSAGE,
        );
    });

    it("includes error details outside production", () => {
        vi.stubEnv("NODE_ENV", "test");

        expect(formatLoadNotepadErrorMessage(new Error("database unavailable"))).toContain(
            "database unavailable",
        );
    });
});
