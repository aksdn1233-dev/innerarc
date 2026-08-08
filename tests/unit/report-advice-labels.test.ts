import { describe, expect, it } from "vitest";

import { createPaidReport } from "@/server/reports/paid-report";

const BASE = {
  version: 1 as const,
  locale: "ko" as const,
  birthDate: "1994-11-04",
  name: "테스트",
  focusId: "relationships" as const,
  concern: "연애 관계에서 반복되는 갈등을 어떻게 풀어야 하나요?",
  createdAt: "2026-08-09T00:00:00.000Z",
};

describe("paid report advice labels", () => {
  for (const productCode of ["plus_30d", "pro_30d", "premium_pdf"] as const) {
    it(`${productCode} identifies the subject before actions and cautions`, () => {
      const report = createPaidReport(`subject-${productCode}`, { ...BASE, productCode });
      const standalone = [...report.actions, ...report.cautions];

      expect(standalone.length).toBeGreaterThan(0);
      for (const item of standalone) expect(item).toMatch(/^[^:：\n]{1,20}[:：]\s/u);

      const contextualSections = report.sections.filter((section) =>
        /상황별 대처|보류·중단·재검토 기준/u.test(section.title),
      );
      for (const section of contextualSections) {
        expect(section.body).toMatch(/\d+\.\s[^:：\n]{1,20}[:：]\s/u);
      }
    });
  }
});
