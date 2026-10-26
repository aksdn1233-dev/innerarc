import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createFreeConcernReading, freeDomainOrder } from "@/core/free-concern-reading";
import { onboardingFocusIds } from "@/core/onboarding";
import { calculateNumerologyProfile } from "@/core/numerology";

const read = (focusId = "work", concern = "", locale = "ko") => createFreeConcernReading({ focusId, concern, locale });
describe("free concern relevance", () => {
  it("gives every selected category distinct useful content with or without a question", () => {
    for (const locale of ["ko", "en"]) {
      const readings = onboardingFocusIds.map(id => read(id, "", locale));
      expect(new Set(readings.map(r => r.answer)).size).toBe(6);
      for (const reading of readings) {
        expect(reading.scope).toBe("category");
        expect(reading.question).toBeNull();
        for (const key of ["title", "answer", "information", "action", "reconsider"] as const) expect(reading[key].length).toBeGreaterThan(10);
      }
    }
  });
  it.each(["ko", "en"])("distinguishes business from changing jobs within the same category in %s", locale => {
    const business = read("work", locale === "ko" ? "사업을 시작해도 될까요?" : "Should I start a business?", locale);
    const career = read("work", locale === "ko" ? "이직해도 될까요?" : "Should I change jobs?", locale);
    expect(business.topicId).toBe("business"); expect(career.topicId).toBe("career");
    expect(business.answer).not.toBe(career.answer);
    expect(business.action).toMatch(/고객|customer/u);
    expect(career.information).toMatch(/급여|pay/u);
    expect(business.answer).not.toMatch(/맞습니다|성공합니다|will succeed/u);
  });
  it.each([
    ["relationships", "이 사람과 계속 가도 될까요?"], ["money", "언제쯤 돈이 모일까요?"],
    ["money", "돈이 왜 자꾸 새는 걸까요?"], ["health", "쉬는 법을 모르겠어요"], ["health", "요즘 왜 이렇게 지칠까요?"],
    ["relationships", "Should I stay with this person?", "en"],
    ["money", "When will money settle?", "en"], ["health", "I don't know how to rest", "en"],
  ])("understands the existing %s example as category context", (focus, question, locale = "ko") => {
    expect(read(focus, question, locale ?? "ko").scope).toBe("question");
  });
  it("separates job search, debt and investment questions instead of giving generic category advice", () => {
    expect(read("work", "취업을 준비하려면 무엇부터 해야 할까요?").topicId).toBe("job_hunt");
    const debt = read("money", "빚을 갚을 수 있을까요?");
    const investment = read("money", "주식 투자를 해도 될까요?");
    expect(debt.topicId).toBe("debt"); expect(investment.topicId).toBe("investment");
    expect(debt.answer).not.toBe(investment.answer);
    expect(debt.information).toContain("월 상환액"); expect(investment.information).toContain("수수료");
  });
  it("distinguishes reconnection from a general relationship question", () => {
    expect(read("relationships", "헤어진 사람과 재회할까요?").topicId).toBe("reunion");
    expect(read("relationships", "이 사람과 계속 가도 될까요?").topicId).toBe("relationships");
    expect(read("relationships").answer).not.toMatch(/고객|직무|고정비/u);
  });
  it("uses a clear question over a conflicting selection and discloses both", () => {
    const result = read("work", "요즘 피곤하고 잠을 못 자요");
    expect(result.focusId).toBe("health"); expect(result.selectedFocusId).toBe("work");
    expect(result.reconsider).toContain("의료진");
    expect(read("relationships", "사업을 시작해도 될까요?").topicId).toBe("business");
  });
  it("keeps safety ahead of business and preserves mixed health/debt guidance", () => {
    const urgent = read("work", "사업이 힘들어서 죽고 싶어요");
    expect(urgent.scope).toBe("safety"); expect(urgent.topicId).toBe("safety");
    expect(urgent.answer).not.toContain("고객");
    const mixed = read("growth", "피곤하고 빚 상환이 걱정돼요");
    expect(mixed.topicId).toContain("health"); expect(mixed.topicId).toContain("debt");
  });
  it("discloses an unrecognized question instead of pretending to answer it", () => {
    const result = read("money", "ZXQ-PRIVATE-SYNTHETIC-SITUATION");
    expect(result.scope).toBe("unresolved"); expect(result.answer).toContain("짚기 어려워요");
    expect(result.question).toBe("ZXQ-PRIVATE-SYNTHETIC-SITUATION");
  });
  it("keeps the free bundle separate from complete paid topic/answer prose", () => {
    const source = readFileSync("src/core/free-concern-reading.ts", "utf8");
    expect(source).not.toMatch(/from ["'].*(?:concern-topics|report-question-guidance)/u);
    expect(source).toContain('@/core/question-topics');
  });
  it("rejects invalid context without echoing sensitive input", () => {
    expect(() => read("bad-private-marker", "PRIVATE")).toThrow("INVALID_FREE_CONCERN_CONTEXT");
    expect(() => read("work", "x".repeat(2001))).toThrow("INVALID_FREE_CONCERN_CONTEXT");
    expect(read("work", "  사업\u0000을 시작해도 될까요?  ").question).toBe("사업을 시작해도 될까요?");
  });
  it("orders relevant free domains without changing calculated evidence or collecting birth data", () => {
    expect(freeDomainOrder("work")[0]).toBe("career");
    expect(freeDomainOrder("money")[0]).toBe("money");
    expect(freeDomainOrder("relationships")[0]).toBe("relationships");
    const before = calculateNumerologyProfile({ birthDate: "1994-11-04", personalYear: 2026 });
    for (const id of onboardingFocusIds) { read(id); expect(new Set(freeDomainOrder(id)).size).toBe(3); }
    expect(calculateNumerologyProfile({ birthDate: "1994-11-04", personalYear: 2026 })).toEqual(before);
    expect(() => createFreeConcernReading({ focusId: "work", locale: "ko", concern: "", birthDate: "1994-11-04" })).toThrow("INVALID_FREE_CONCERN_CONTEXT");
  });
});
