import { describe, expect, it } from "vitest";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { createPaidReport } from "@/server/reports/paid-report";
import { createDetailPaidReport } from "@/server/reports/detail-report";

const base = {
  version: 1, locale: "ko", birthDate: "1994-11-04", name: "",
  focusId: "growth", concern: "", productCode: "pro_30d",
  createdAt: "2026-10-26T00:00:00.000Z",
} as const satisfies PaidReadingInput;
const text = (report: PaidReport) => [
  report.summary, ...report.sections.map(s => s.body), ...report.actions,
  ...(report.sharpInsights ?? []),
].join("\n");

describe("long-form symbolic evidence boundaries", () => {
  it.each([
    ["no biography", "", "growth"],
    ["health", "잠을 충분히 자도 피곤해요. 무엇부터 확인할까요?", "health"],
    ["relationship", "친구와 대화가 어긋나요. 어떤 점을 살펴볼까요?", "relationships"],
  ] as const)("does not assign a software business to a %s input", (_label, concern, focusId) => {
    const report = createPaidReport("iasyntheticnarrative", { ...base, concern, focusId });
    expect(text(report)).not.toMatch(/자동화 기술|웹서비스|유료고객|유료 전환|기술 부채|반복 매출/u);
    expect(report.sections.find(s => s.title === "핵심 성향과 기질")?.body)
      .toMatch(/상징|가설|관찰/u);
    expect(report.calculationBasis).toMatchObject({ lifePath: 11, birthday: 4, attitude: 6, personalYear: 7 });
  });

  it("does not validate business suitability from numbers even for an explicit business question", () => {
    const report = createDetailPaidReport("iasyntheticbusiness", {
      ...base, concern: "웹사업을 시작해도 될까요?", focusId: "work",
    });
    expect(text(report)).not.toContain("사업 방향 자체는 맞습니다");
    expect(report.sections[0].body).toMatch(/생년월일만으로.*(판단|정할|확인).*없/u);
    expect(report.sections.some(s => /고객|수요/u.test(s.body))).toBe(true);
  });

  it.each(["ko", "en"] as const)("does not declare hidden motives as known in %s premium prose", locale => {
    const report = createPaidReport("iasyntheticpremium", {
      ...base, locale, productCode: "premium_pdf", birthDate: "1988-07-02",
      focusId: "relationships", concern: locale === "ko" ? "친구와 어떻게 대화할까요?" : "How can I talk with a friend?",
    });
    expect(text(report)).not.toMatch(/숨은 동기는 단순한 승부욕이 아니라|뿌리 원인은 능력 부족이 아니라|The hidden motive is not status alone|The root cause is repeatedly choosing control/u);
    const temperament = report.sections.find(s => /핵심 성향과 기질|Core temperament/u.test(s.title));
    expect(temperament?.body).toMatch(locale === "ko" ? /가설|상징|질문/u : /hypothesis|symbolic|question/u);
  });
});
