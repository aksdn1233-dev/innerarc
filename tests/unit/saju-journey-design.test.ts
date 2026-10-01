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
    // One question per screen, asked by 태령, with the free chapters before any fee.
    expect(intake).toContain("무료 결과 먼저 확인");
    expect(intake).toContain("모르는 시간은 짐작하지 않고 비워둡니다");
    expect(intake).toContain("Ch4. 태령의 복채");
    // No invented urgency or crowd numbers: no countdowns, no "N명 결제" counters.
    expect(intake).not.toMatch(/setInterval|명 결제|명이 복채/);
    expect(intakeCss).toContain(":global(.saju-story)");
    expect(intakeCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(globalCss).not.toContain("sajuPortalBreath");
  });
});
