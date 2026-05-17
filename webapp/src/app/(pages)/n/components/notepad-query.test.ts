import { describe, expect, it } from "vitest";
import { notepadQueryKey } from "./notepad-query";

describe("notepadQueryKey", () => {
    it("separates daily notepad queries from exact notepad queries", () => {
        expect(notepadQueryKey({ kind: "date", dateKey: "2026-05-03" })).toEqual([
            "notepad",
            "date",
            "2026-05-03",
        ]);
        expect(notepadQueryKey({ kind: "notepad", notepadId: "notepad-1" })).toEqual([
            "notepad",
            "notepad",
            "notepad-1",
        ]);
    });
});
