import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("business protection level", () => {
  it("uses level B while operational gates remain unresolved", async () => {
    const source = await readFile("src/components/content-protection-notice.tsx", "utf8");
    const standard = await readFile("docs/BUSINESS_CONTENT_PROTECTION_STANDARD.md", "utf8");
    expect(source).toContain("보호수준 B");
    expect(source).toContain("보장하지 않습니다");
    expect(source).not.toContain("관용 없이 엄정하게");
    expect(standard).toContain("require production approval");
  });
});
