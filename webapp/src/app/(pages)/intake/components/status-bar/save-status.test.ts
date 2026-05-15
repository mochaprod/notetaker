import { describe, expect, it } from "vitest";
import {
    getSaveStatusIcon,
    getSaveStatusLabel,
    getSaveStatusTextColor,
} from "./save-status-label";

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
            loadingState: "saving",
            lastSavedAt: new Date(2026, 4, 3, 9, 59),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Saving...");
    });

    it("shows loading during initial load even when a saved timestamp exists", () => {
        expect(getSaveStatusLabel({
            isLoading: true,
            loadingState: "initial-load",
            lastSavedAt: new Date(2026, 4, 3, 9, 59),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Loading...");
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

    it("shows saved before relative times", () => {
        expect(getSaveStatusLabel({
            isLoading: false,
            lastSavedAt: new Date(2026, 4, 3, 9, 56),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Saved 4 minutes ago");
    });

    it("shows an absolute time for older saves", () => {
        expect(getSaveStatusLabel({
            isLoading: false,
            lastSavedAt: new Date(2026, 4, 3, 9, 0),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Saved at 9:00 AM");
    });

    it("resolves a success icon after a successful save", () => {
        expect(getSaveStatusIcon({
            isLoading: false,
            lastSavedAt: new Date(2026, 4, 3, 9, 59, 45),
        })).toBe("success");
    });

    it("shows an error label when the save status has an error", () => {
        expect(getSaveStatusLabel({
            hasError: true,
            isLoading: false,
            lastSavedAt: new Date(2026, 4, 3, 9, 59, 45),
            now: new Date(2026, 4, 3, 10, 0),
        })).toBe("Unable to sync");
    });

    it("uses an error text color when the save status has an error", () => {
        expect(getSaveStatusTextColor({ hasError: true })).toBe("text-red-600 dark:text-red-400");
    });

    it("resolves an error icon when the save status has an error", () => {
        expect(getSaveStatusIcon({
            hasError: true,
            isLoading: false,
            lastSavedAt: new Date(2026, 4, 3, 9, 59, 45),
        })).toBe("error");
    });

    it("resolves a loading icon when the save status is loading", () => {
        expect(getSaveStatusIcon({
            isLoading: true,
            lastSavedAt: null,
        })).toBe("loading");
    });

    it("does not resolve an icon before the first save", () => {
        expect(getSaveStatusIcon({
            isLoading: false,
            lastSavedAt: null,
        })).toBeNull();
    });
});
