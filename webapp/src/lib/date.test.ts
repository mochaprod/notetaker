import { describe, expect, it } from "vitest";
import { formatDateLabel } from "./date";

describe("date helpers", () => {
    it("formats today as Today", () => {
        const now = new Date("2026-05-03T12:00:00");

        expect(formatDateLabel(new Date("2026-05-03T08:30:00"), now)).toBe("Today");
    });

    it("formats yesterday as Yesterday", () => {
        const now = new Date("2026-05-03T12:00:00");

        expect(formatDateLabel(new Date("2026-05-02T23:30:00"), now)).toBe("Yesterday");
    });

    it("formats older dates with weekday, month, day, and year", () => {
        const now = new Date("2026-05-03T12:00:00");

        expect(formatDateLabel(new Date("2026-04-30T12:00:00"), now)).toBe("Thursday, April 30, 2026");
    });
});
