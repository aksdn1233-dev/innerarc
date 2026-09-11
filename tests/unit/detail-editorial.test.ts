import { describe, expect, it } from "vitest";
import { buildDetailEditorialModel } from "@/core/detail-editorial";
import { createPaidReport } from "@/server/reports/paid-report";

const fixtures = [
  ["1994-11-04", "male"],
  ["1975-10-11", "unstated"],
  ["1994-02-03", "female"],
  ["1981-08-22", "female"],
  ["2006-12-29", "unstated"],
  ["2007-09-22", "unstated"],
  ["2013-02-21", "unstated"],
] as const;

function report(birthDate: string, gender: "female" | "male" | "unstated", concern = "") {
  return createPaidReport(`fixture${birthDate.replaceAll("-", "")}`, {
    version: 1,
    locale: "ko",
    productCode: "pro_30d",
    readingKind: "numerology",
    birthDate,
    birthTime: birthDate === "1994-11-04" ? "09:30" : undefined,
    name: "",
    focusId: concern ? "money" : "growth",
    concern,
    gender,
    createdAt: "2026-08-21T00:00:00.000Z",
  });
}

describe("DETAIL_39000 editorial model", () => {
  it("builds the complete 941104 male publication model from deterministic report evidence", () => {
    const paid = report("1994-11-04", "male");
    const model = buildDetailEditorialModel(paid);

    expect(model).not.toBeNull();
    expect(model?.genderLabel).toBe("남성");
    expect(model?.birthTime).toBe("09:30");
    expect(model?.symbol.name).toBe("안개 속 등대");
    expect(model?.numbers.map((item) => item.value)).toEqual(["11/2", "4", "6", "5"]);
    expect(model?.strengths).toHaveLength(5);
    expect(new Set(model?.strengths.map((item) => item.title)).size).toBe(5);
    expect(model?.shadows).toHaveLength(5);
    expect(model?.recurringPatterns.length).toBeGreaterThanOrEqual(3);
    expect(model?.recurringPatterns.every((item) => item.why && item.realLife && item.trigger && item.risk && item.correction)).toBe(true);
    expect(model?.years.map((item) => item.year)).toEqual([2026, 2027, 2028]);
    expect(model?.realityQuestions.length).toBeGreaterThanOrEqual(5);
    expect(model?.actions).toHaveLength(3);
  });

  it.each(fixtures)("keeps %s grounded, distinct and free of stock fortune claims", (birthDate, gender) => {
    const model = buildDetailEditorialModel(report(birthDate, gender, "돈과 일의 방향을 어떻게 정할까요?"));
    const text = JSON.stringify(model);
    expect(model).not.toBeNull();
    expect(model?.birthDate).toBe(birthDate);
    expect(model?.strengths).toHaveLength(5);
    expect(model?.years).toHaveLength(3);
    expect(text).not.toMatch(/운명의 비밀|미래를 정확|반드시 성공|과학적으로 증명|AI가 분석/u);
    expect(text).not.toMatch(/undefined|NaN|\{\{/u);
  });

  it("does not reuse one profile across the fixture set", () => {
    const signatures = fixtures.map(([birthDate, gender]) => {
      const model = buildDetailEditorialModel(report(birthDate, gender));
      return `${model?.numbers.map((item) => item.value).join("-")}:${model?.symbol.name}:${model?.coreLine}`;
    });
    expect(new Set(signatures).size).toBe(fixtures.length);
  });

  it("keeps the report unavailable to other product renderers", () => {
    const basic = createPaidReport("basicfixture", {
      version: 1, locale: "ko", productCode: "plus_30d", readingKind: "numerology",
      birthDate: "1994-11-04", name: "", focusId: "growth", concern: "",
      gender: "male", createdAt: "2026-08-21T00:00:00.000Z",
    });
    expect(buildDetailEditorialModel(basic)).toBeNull();
  });
});
