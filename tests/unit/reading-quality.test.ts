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
  focusId: "work" | "relationships" | "growth" | "money" = "work",
) {
  return createPaidReport("iaquality1234", { ...BASE, productCode, focusId, concern });
}

describe("the reading answers the question first", () => {
  it("opens with the answer, not with what it cannot do", () => {
    for (const tier of TIERS) {
      const first = reading(tier).sections[0];
      expect(first.title, tier).toBe("질문에 대한 답");
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
    const section = reading("pro_30d").sections.find((s) => s.title === "당신은 어떤 사람인가");
    expect(section?.body).toContain("통역자");
  });
});

describe("the three products differ in what they explain", () => {
  it("gives each tier a different set of section titles", () => {
    const titles = TIERS.map((tier) => reading(tier).sections.map((s) => s.title));
    const [basic, detail, premium] = titles;

    expect(new Set(basic).size).toBeLessThan(new Set(detail).size);
    expect(new Set(detail).size).toBeLessThan(new Set(premium).size);
    // Every lower-tier section is still present higher up: the answer does not change,
    // the explanation deepens.
    for (const title of basic) expect(detail, title).toContain(title);
    for (const title of detail) expect(premium, title).toContain(title);
  });

  it("reserves reasoning sections for the paid-up tiers", () => {
    const basic = reading("plus_30d").sections.map((s) => s.title);
    const detail = reading("pro_30d").sections.map((s) => s.title);
    const premium = reading("premium_pdf").sections.map((s) => s.title);

    expect(basic).not.toContain("왜 이런 흐름이 나오나");
    expect(detail).toContain("왜 이런 흐름이 나오나");
    expect(detail).toContain("잘될 조건과 어긋나는 조건");

    expect(detail).not.toContain("계산 근거");
    expect(detail).not.toContain("이렇게 갈 수 있습니다");
    expect(premium).toContain("계산 근거");
    expect(premium).toContain("이렇게 갈 수 있습니다");
  });

  it("keeps the calculated numbers identical across tiers", () => {
    // Price must change the depth of explanation, never the underlying reading.
    const answers = TIERS.map((tier) => reading(tier).sections[0].body);
    expect(new Set(answers).size).toBe(1);
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
      plus_30d: 700,
      pro_30d: 1500,
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
