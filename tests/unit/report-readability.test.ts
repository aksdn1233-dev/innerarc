import { describe, expect, it } from "vitest";

import { deduplicateReportSections } from "@/core/report-quality";
import { createPaidReport } from "@/server/reports/paid-report";
import { polishReportText } from "@/server/reports/report-display";

describe("report readability", () => {
  it("removes authoring labels and fixes Korean particles for old stored reports", () => {
    const legacy = "[프리미엄 확장 · direct_answer] 경계 존중을(를) 확인합니다. [tension] 두 해석이 다릅니다.";

    expect(polishReportText(legacy, "ko")).toBe(
      "더 깊게 보면, 경계 존중을 확인합니다. 서로 충돌하는 지점: 두 해석이 다릅니다.",
    );
  });

  it("preserves paragraph breaks while removing duplicate sentences", () => {
    const sections = deduplicateReportSections("", [
      { title: "앞", body: "반복 검사를 위해 충분히 길게 작성한 첫 번째 문장입니다.\n\n이어지는 문단입니다." },
      { title: "뒤", body: "반복 검사를 위해 충분히 길게 작성한 첫 번째 문장입니다.\n\n마지막 문단입니다." },
    ]);

    expect(sections[0]?.body).toBe("이어지는 문단입니다.");
    expect(sections[1]?.body).toBe("반복 검사를 위해 충분히 길게 작성한 첫 번째 문장입니다.\n\n마지막 문단입니다.");
  });

  it("does not expose internal labels in a generated premium report", () => {
    const report = createPaidReport("readability-premium", {
      version: 1,
      locale: "ko",
      birthDate: "1994-11-04",
      name: "테스트",
      focusId: "relationships",
      concern: "연애 관계에서 반복되는 갈등을 어떻게 풀어야 하나요?",
      createdAt: "2026-08-09T00:00:00.000Z",
      productCode: "premium_pdf",
    });
    const fullText = [report.summary, ...report.sections.flatMap((section) => [section.title, section.body])].join("\n");

    expect(fullText).not.toMatch(/프리미엄 확장|direct_answer|core_numbers|\[(?:tension|reinforcement|moderation)\]/u);
    expect(fullText).toContain("서로 충돌하는 지점");
    expect(report.actions.join(" ")).toContain("연애와 가까운 관계에서 직접 바꿀 행동 하나");
  });
});
