import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Saju journey presentation", () => {
  it("keeps the expressive layer route-scoped, accessible, and motion-optional", async () => {
    const [hub, hubCss, intake, intakeCss, globalCss] = await Promise.all([
      readFile("src/components/saju-service-hub.tsx", "utf8"),
      readFile("src/components/saju-service-hub.module.css", "utf8"),
      readFile("src/components/saju-experience.tsx", "utf8"),
      readFile("src/components/saju-experience.module.css", "utf8"),
      readFile("src/app/globals.css", "utf8"),
    ]);

    expect(hub).toContain("FOUR PILLARS EDITION");
    expect(hub).toContain("계산 근거 공개");
    expect(hub).toContain('aria-hidden="true"');
    expect(hubCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(hubCss).toMatch(/\.locale\s*\{[^}]*min-height:\s*44px/s);
    expect(intake).toContain('import "./saju-experience.module.css"');
    expect(intake).toContain("기억나는 만큼만 알려주세요");
    expect(intakeCss).toContain(":global(.saju-intake-layout .saju-submit)");
    expect(intakeCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(globalCss).not.toContain("sajuPortalBreath");
  });
});
