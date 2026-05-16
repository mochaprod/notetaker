import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Home page", () => {
    it("uses the inverted auth guard to redirect signed-in users to intake", () => {
        const source = readFileSync(join(__dirname, "page.tsx"), "utf8");

        expect(source).toContain('import { withAuth } from "@/components/with-auth";');
        expect(source).toContain('export default withAuth(Home, { redirectTo: "/intake", invert: true });');
    });
});
