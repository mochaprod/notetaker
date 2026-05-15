import { describe, expect, it } from "vitest";
import { getSaveStatusLabel } from "./save-status-label";

describe("save status", () => {
    it("shows loading before a saved timestamp exists", () => {
        expect(getSaveStatusLabel({
            isLoading: true,
            lastSavedAt: null,
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Loading...");
    });

    it("shows saving while a saved timestamp exists", () => {
        expect(getSaveStatusLabel({
            isLoading: true,
            lastSavedAt: new Date(2026, 4, 3, 9, 59),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Saving...");
    });

    it("shows not saved yet before first persistence", () => {
        expect(getSaveStatusLabel({
            isLoading: false,
            lastSavedAt: null,
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Not saved yet");
    });

    it("shows saved just now for recent saves", () => {
        expect(getSaveStatusLabel({
            isLoading: false,
            lastSavedAt: new Date(2026, 4, 3, 9, 59, 45),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Saved just now");
    });

    it("shows an absolute time for older saves", () => {
        expect(getSaveStatusLabel({
            isLoading: false,
            lastSavedAt: new Date(2026, 4, 3, 9, 0),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Saved at 9:00 AM");
    });
});
