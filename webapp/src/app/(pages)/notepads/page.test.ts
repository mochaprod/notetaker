import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Notepads page", () => {
    it("uses the auth guard", () => {
        const source = readFileSync(join(__dirname, "page.tsx"), "utf8");

        expect(source).toContain('import { withAuth } from "@/components/with-auth";');
        expect(source).toContain("export default withAuth(NotepadsPage);");
    });
});
