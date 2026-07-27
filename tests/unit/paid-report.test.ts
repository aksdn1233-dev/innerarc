import { describe, expect, it } from "vitest";
import { isAdminEmail } from "@/server/admin-access";
import { createPaidReport } from "@/server/reports/paid-report";

const baseInput = {
  version: 1 as const,
  locale: "ko" as const,
  birthDate: "1980-01-01",
  name: "테스트",
  focusId: "relationships" as const,
  concern: "관계에서 지금 조심할 점이 궁금합니다.",
  createdAt: "2026-07-27T10:00:00.000Z",
};

describe("paid report delivery", () => {
  it("creates a concise quick report and a longer premium report", () => {
    const quick = createPaidReport("iaquick123", {
      ...baseInput,
      productCode: "plus_30d",
    });
    const premium = createPaidReport("iapremium123", {
      ...baseInput,
      productCode: "premium_pdf",
    });

    expect(quick.title).toBe("간단 타로 리딩");
    expect(quick.sections.length).toBeLessThan(premium.sections.length);
    expect(premium.title).toBe("프리미엄 맞춤 리포트");
    expect(premium.actions.length).toBeGreaterThan(1);
    expect(premium.cautions.length).toBeGreaterThan(1);
  });

  it("uses an environment allowlist instead of a hard-coded admin password", () => {
    const environment = { ADMIN_EMAILS: "owner@example.com, second@example.com" };
    expect(isAdminEmail("OWNER@example.com", environment)).toBe(true);
    expect(isAdminEmail("visitor@example.com", environment)).toBe(false);
  });
});
