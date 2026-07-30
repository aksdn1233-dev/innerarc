import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { concernTopics } from "@/core/topics/concern-topics";
import { buildCharacterLabel } from "@/core/profile/character-label";
import { createPaidReport } from "@/server/reports/paid-report";

const BASE = {
  version: 1 as const,
  locale: "ko" as const,
  birthDate: "1994-11-04",
  name: "테스트",
  createdAt: "2026-07-29T10:00:00.000Z",
};

const TIERS = ["plus_30d", "pro_30d", "premium_pdf"] as const;

function reading(
  productCode: (typeof TIERS)[number],
  concern = "사업 준비 중인데 웹사업 잘될까 올해",
  focusId: "work" | "relationships" | "growth" | "money" | "health" = "work",
) {
  return createPaidReport("iaquality1234", { ...BASE, productCode, focusId, concern });
}

describe("the reading answers the question first", () => {
  it("opens with the answer, not with what it cannot do", () => {
    for (const tier of TIERS) {
      const first = reading(tier).sections[0];
      expect(first.title, tier).toBe("질문에 대한 직접 결론");
      expect(first.body.length, tier).toBeGreaterThan(30);
    }
  });

  it("never opens by disclaiming", () => {
    // These openings were what the reading actually led with before, across every
    // product: an explanation of its own limits in place of an answer.
    const banned = [
      /^알 수 없/,
      /^직업을 딱 정해드리는 건 아/,
      /^수익을 예측하지/,
      /^돈이 얼마나 들어올지는 알 수 없/,
      /^그동안의 선택을 떠올려/,
      /^어떤 일이 힘이 덜 빠지는지/,
      /^이 리포트는 .*판단하지 않습니다/,
    ];
    const concerns = [
      "사업 준비 중인데 웹사업 잘될까 올해",
      "이직해도 될까요",
      "재회할 수 있을까요",
      "목돈을 써도 될까요",
      "운동 습관을 만들고 싶어요",
    ];
    for (const tier of TIERS) {
      for (const concern of concerns) {
        const opening = reading(tier, concern).sections[0].body;
        for (const pattern of banned) {
          expect(opening, `${tier} / ${concern}`).not.toMatch(pattern);
        }
      }
    }
  });

  it("gives every situation a verdict that commits to a direction", () => {
    for (const topic of concernTopics) {
      expect(topic.verdict.ko.length, `${topic.id} ko`).toBeGreaterThan(30);
      expect(topic.verdict.en.length, `${topic.id} en`).toBeGreaterThan(30);
      // A verdict that opens with a limitation is the thing being removed.
      expect(topic.verdict.ko, topic.id).not.toMatch(/^(알 수 없|예측하지|보장하지)/);
    }
  });
});

describe("no tarot claim without a tarot draw", () => {
  it("never names a card in a numerology-only reading", () => {
    for (const tier of TIERS) {
      const whole = reading(tier).sections.map((s) => `${s.title} ${s.body}`).join(" ");
      expect(whole, tier).not.toMatch(/타로로 치면|카드가 나왔|뽑힌 카드/);
      // The archetype names are Major Arcana; none may appear as a claim about this
      // reading, because no card was drawn for it.
      expect(whole, tier).not.toMatch(/'(마법사|여사제|여제|황제|교황|연인|전차|힘|은둔자|정의|바보)'/);
    }
  });

  it("does not source the paid report from the archetype-named rule-based profile", async () => {
    // getRuleBasedProfile's copy opens with "{archetype} 자리에서..." — unquoted, so
    // the quoted-name check above cannot see it. It once leaked into "왜 이런 흐름이
    // 나오나" this way; guard the import directly instead of guessing at wording.
    const source = await readFile("src/server/reports/paid-report.ts", "utf8");
    expect(source).not.toMatch(/getRuleBasedProfile/);
  });

  it("names the person from the numbers that were calculated", () => {
    const label = buildCharacterLabel(11, 4, "ko");
    expect(label.label).toBe("절차를 세우는 통역자");
    expect(buildCharacterLabel(11, 4, "ko").label).toBe(label.label);
    // A different birth profile must produce a different label.
    expect(buildCharacterLabel(4, 8, "ko").label).not.toBe(label.label);
  });

  it("puts the character label in the reading", () => {
    const report = reading("pro_30d");
    const section = report.sections.find((s) => s.title === "캐릭터 한 줄");
    expect(report.characterLabel).toBe("판을 먼저 읽는 시스템 설계자");
    expect(section?.body).toContain("시스템 설계자");
  });
});

describe("the three products differ in what they explain", () => {
  it("gives each tier a different set of section titles", () => {
    const titles = TIERS.map((tier) => reading(tier).sections.map((s) => s.title));
    const [basic, detail, premium] = titles;

    expect(new Set(basic).size).toBe(basic.length);
    expect(new Set(detail).size).toBe(detail.length);
    expect(new Set(premium).size).toBe(premium.length);
    expect(detail.length).toBeGreaterThanOrEqual(13);
    expect(detail.length).toBeLessThanOrEqual(18);
    expect(basic).toContain("질문에 대한 직접 결론");
    expect(basic).toContain("핵심 숫자");
    expect(basic).toContain("핵심 성향");
    expect(basic).toContain("반복되는 약점");
    expect(basic.some((title) => title.startsWith("질문 분야 분석 ·"))).toBe(true);
    expect(detail).toContain("질문에 대한 직접 결론");
    expect(premium).toContain("네 숫자를 하나로 읽는 종합 해석");
  });

  it("reserves reasoning sections for the paid-up tiers", () => {
    const basic = reading("plus_30d").sections.map((s) => s.title);
    const detail = reading("pro_30d").sections.map((s) => s.title);
    const premium = reading("premium_pdf").sections.map((s) => s.title);

    expect(basic).not.toContain("숫자 조합 안의 모순");
    expect(detail).toContain("숫자 조합 안의 모순");
    expect(detail).toContain("생각하고 결정하는 방식");
    expect(detail).toContain("보류·중단·재검토 기준");

    expect(detail).not.toContain("네 숫자를 하나로 읽는 종합 해석");
    expect(detail).not.toContain("최선·현실·위험 시나리오");
    expect(premium).toContain("네 숫자를 하나로 읽는 종합 해석");
    expect(premium).toContain("최선·현실·위험 시나리오");
  });

  it("keeps the calculated numbers identical across tiers", () => {
    // Price changes composition and depth, never the deterministic calculation.
    const reports = TIERS.map((tier) => reading(tier));
    expect(reports[0].calculationBasis).toMatchObject({
      lifePath: 11,
      birthday: 4,
      attitude: 6,
      birthYear: 5,
      personalYear: 7,
    });
    for (const report of reports.slice(1)) {
      expect(report.sections[0]?.body).toMatch(/생명수 11.*개인년 7/u);
    }
  });

  it("does not repeat a whole section body twice in one reading", () => {
    for (const tier of TIERS) {
      const bodies = reading(tier).sections.map((s) => s.body.trim());
      expect(new Set(bodies).size, tier).toBe(bodies.length);
    }
  });

  it("keeps each tier's total depth above its own floor", () => {
    // A lightweight stand-in for a coverage matrix: no database, just a repeatable
    // floor on total reading length per tier so a future edit cannot silently thin
    // the content back out. Floors sit a little below what this round measured
    // (828 / 1,735 / 3,105 chars for the birth-1994-11-04 business regression case)
    // so ordinary content variance across other birth dates does not trip it.
    const floors: Record<(typeof TIERS)[number], number> = {
      plus_30d: 2500,
      pro_30d: 4000,
      premium_pdf: 2700,
    };
    for (const tier of TIERS) {
      const total = reading(tier).sections.reduce((sum, s) => sum + s.body.length, 0);
      expect(total, tier).toBeGreaterThan(floors[tier]);
    }
  });

  it("leaves no unresolved template token or empty section", () => {
    for (const tier of TIERS) {
      for (const section of reading(tier).sections) {
        expect(section.title.trim().length, tier).toBeGreaterThan(0);
        expect(section.body.trim().length, `${tier} / ${section.title}`).toBeGreaterThan(20);
        expect(section.body, section.title).not.toMatch(/\{\{|\}\}|undefined|NaN|\[object/);
        // Runs of spaces mean a piece was interpolated empty. Newline-indented lines
        // are deliberate: the career section lays out one role per line.
        expect(section.body, section.title).not.toMatch(/[^\n] {2,}/);
      }
    }
  });
});
