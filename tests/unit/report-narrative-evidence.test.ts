import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildDetailEditorialModel } from "@/core/detail-editorial";
import { DetailEditorialReport } from "@/components/detail-editorial-report";
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
  for (const productCode of ["pro_30d", "premium_pdf"] as const) {
    it.each(["2000-02-29", "1990-01-01"])("keeps Japanese %s biographical claims unverified in " + productCode, birthDate => {
      const report = createPaidReport("iasyntheticjapanesenarrative", {
        ...base, locale: "en", displayLocale: "ja", productCode, birthDate,
      });
      expect(report.summary).toMatch(/象徴|仮説/u);
      expect(report.summary).not.toMatch(/行動に使う傾向があります/u);
      for (const title of ["外から見える姿と内側の動き", "強みが最も生きる場面", "強みが負担に変わる瞬間"]) {
        const section = report.sections.find(s => s.title === title);
        expect(section?.body, title).toMatch(/未確認|分かりません|確認できません|判断できません|入力されていません/u);
        expect(section?.body, title).toMatch(/観察|記録|経験/u);
        expect(section?.body, title).toMatch(/違|反例|当てはまら/u);
      }
      expect(text(report)).not.toContain("周囲には落ち着いて状況を整理する人に見えます");
    });
  }

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


describe("work and money require lived evidence", () => {
  for (const locale of ["ko", "en"] as const) {
    for (const productCode of ["pro_30d", "premium_pdf"] as const) {
      it.each(["1988-07-02", "1990-01-01"])(`${locale} ${productCode} does not infer work performance or money habits for %s`, birthDate => {
        const report = createPaidReport("iasyntheticworkmoney", {
          ...base, birthDate, locale, productCode,
        });
        // Premium consolidates duplicated career prose in its deeper role chapter.
        const workTitle = productCode === "premium_pdf"
          ? (locale === "ko" ? /일과 역할/u : /Fitting work and roles/u)
          : (locale === "ko" ? /직업·사업/u : /Work and business/u);
        for (const title of [workTitle, locale === "ko" ? /재물/u : /Money flow/u]) {
          const section = report.sections.find(s => title.test(s.title));
          expect(section, String(title)).toBeDefined();
          expect(section?.body).toMatch(locale === "ko" ? /생년월일.*(알|판단|확인).*없/u : /birth date cannot (establish|determine)/iu);
          expect(section?.body).toMatch(locale === "ko" ? /상징|가설/u : /symbolic|hypothesis/iu);
          expect(section?.body).toMatch(locale === "ko" ? /반대 사례|맞지 않|다른 결과/u : /counterexample|does not fit|different outcome/iu);
          expect(section?.body).not.toMatch(/성과로 이어지기 쉬워요|At work, .* turns into results|Around money, .* supports the judgment/u);
        }
        if (productCode === "premium_pdf") {
          const roles = report.sections.find(s => /일과 역할|Fitting work and roles/u.test(s.title));
          expect(roles?.body).toMatch(locale === "ko" ? /적성.*(검사|확인).*아니|적성.*확인.*없/u : /not (an aptitude assessment|proof of suitability)/iu);
          expect(roles?.body).not.toMatch(/잘 맞는 자리 —|Fits —/u);
        }
      });
    }
  }

  it.each([
    ["career", "work", "지금 이직해도 될까요?"],
    ["money", "money", "돈 관리를 어떻게 시작할까요?"],
  ] as const)("does not fabricate %s abilities in the Korean domain answer", (_domain, focusId, concern) => {
    const report = createPaidReport("iasyntheticdomainfacts", { ...base, birthDate: "1988-07-02", focusId, concern });
    const section = report.sections.find(s => s.title.startsWith("질문 분야 상세 분석"));
    expect(section?.body).toMatch(/생년월일.*(알|판단|확인).*없/u);
    expect(section?.body).not.toMatch(/전략기획.*유리합니다|수익 기회를 빠르게 찾지만/u);
    expect(section?.body).toMatch(/실제|자료|기록/u);
  });
});


it.each(["ko", "en"] as const)("shows the bounded role chapter in the real %s premium reader without changing old report selection", locale => {
  const report = createPaidReport("iasyntheticrolesreader", { ...base, locale, birthDate: "1988-07-02", productCode: "premium_pdf" });
  const roles = report.sections.find(s => /일과 역할|Fitting work and roles/u.test(s.title))!;
  const model = buildDetailEditorialModel(report)!;
  expect(model.career.body).toBe(roles.body);
  const html = renderToStaticMarkup(createElement(DetailEditorialReport, { report, locale, orderId: report.orderId, signedIn: false }));
  expect(html).toContain(locale === "ko" ? "적성 검사 결과가 아닙니다" : "not an aptitude assessment");
  expect(html).toContain(locale === "ko" ? "살펴볼 업무" : "Work to explore");
  const legacy = { ...report, contentReferences: report.contentReferences?.filter(ref => ref !== "career-exploration:1.0.0") };
  const previousSection = legacy.sections.find(s => /직업·사업 방향|질문 분야 상세 분석|Work and business|Detailed domain analysis/u.test(s.title))!;
  expect(buildDetailEditorialModel(legacy)?.career.body).toBe(previousSection.body);
});
