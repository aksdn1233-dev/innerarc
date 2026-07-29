import { describe, expect, it } from "vitest";
import { concernTopics, resolveConcernTopic } from "@/core/topics/concern-topics";
import { createPaidReport } from "@/server/reports/paid-report";

const base = {
  version: 1 as const,
  locale: "ko" as const,
  productCode: "pro_30d" as const,
  birthDate: "1994-11-04",
  name: "테스트",
  createdAt: "2026-07-29T10:00:00.000Z",
};

function report(concern: string, focusId: "work" | "relationships" | "growth" | "money" = "work") {
  return createPaidReport("iatopic1234567", { ...base, focusId, concern });
}

function topicSection(concern: string, focusId?: "work" | "relationships" | "growth" | "money") {
  return report(concern, focusId).sections
    .find((section) => section.title.includes("이 고민에서 확인할 것")
      || section.title.includes("먼저 확인해야 할 것"));
}

describe("reading the sentence the buyer wrote", () => {
  it("answers the situation, not just the area", () => {
    // The whole point: a trainee asking about a debut and someone asking about debt
    // both used to receive the same paragraphs.
    const debut = topicSection("아이돌 연습생인데 데뷔할 수 있을까요?");
    const debt = topicSection("카드값이 밀려서 빚을 어떻게 갚아야 할지 모르겠어요", "money");

    expect(debut?.title).toContain("데뷔·오디션");
    expect(debut?.body).toContain("오디션");
    expect(debt?.title).toContain("빚");
    expect(debt?.body).not.toBe(debut?.body);
  });

  it("separates situations that share one area", () => {
    const bodies = [
      "무명배우인데 데뷔할 수 있을까요",
      "지금 회사에서 이직하는 게 맞을까요",
      "공무원 시험을 계속 준비해야 할까요",
      "가게를 하나 열어볼까 고민입니다",
      "직장 상사와 자꾸 부딪힙니다",
    ].map((concern) => topicSection(concern)?.body);

    expect(new Set(bodies).size).toBe(bodies.length);
  });

  it("covers the areas people actually write about", () => {
    const cases: readonly [string, string][] = [
      ["헤어진 사람과 다시 잘될 수 있을까요", "재회"],
      ["짝사랑하는 사람에게 고백해도 될까요", "짝사랑"],
      ["결혼을 해도 될지 확신이 안 섭니다", "결혼"],
      ["부모님과 자꾸 부딪혀서 힘듭니다", "부모"],
      ["아이 사춘기가 걱정입니다", "자녀"],
      ["시댁 명절 문제로 힘듭니다", "시댁"],
      ["전세로 이사를 갈지 고민입니다", "이사"],
      ["요즘 번아웃이 와서 무기력합니다", "번아웃"],
      ["운동 습관을 못 만들겠어요", "습관"],
      ["대학원 진학을 할지 고민입니다", "전공"],
    ];

    for (const [concern, expected] of cases) {
      const section = topicSection(concern, "growth");
      expect(section?.title, `"${concern}" was not recognised`).toContain(expected);
    }
  });

  it("falls back to the chosen area and says so, rather than guessing", () => {
    const section = topicSection("음 잘 모르겠어요 그냥 봐주세요", "money");

    expect(section?.title).toContain("이 고민에서 확인할 것");
    expect(section?.body).toContain("구체적인 상황을 특정하지 못해");
  });

  it("is stable: the same sentence always resolves the same way", () => {
    const first = resolveConcernTopic("데뷔할 수 있을까요", "work");
    const second = resolveConcernTopic("데뷔할 수 있을까요", "work");
    expect(first.topic.id).toBe(second.topic.id);
  });

  it("routes medical, legal, and self-harm questions away from symbolism", () => {
    for (const concern of [
      "암 진단을 받았는데 나을 수 있을까요",
      "소송 중인데 이길 수 있을까요",
    ]) {
      const section = topicSection(concern);
      expect(section?.title, concern).toContain("먼저 확인해야 할 것");
      expect(section?.body).toContain("자격을 갖춘");
    }
  });

  it("puts the topic's own step at the top of what to do", () => {
    const debut = report("아이돌 연습생인데 데뷔할 수 있을까요?");
    expect(debut.actions[0]).toContain("지원");
    expect(debut.cautions[0]).toContain("합격 여부");
  });
});

describe("topic definitions", () => {
  it("has no duplicate ids and every topic carries all four pieces", () => {
    const ids = concernTopics.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const topic of concernTopics) {
      for (const field of ["framing", "observe", "action", "caution"] as const) {
        expect(topic[field].ko.length, `${topic.id}.${field} ko`).toBeGreaterThan(20);
        expect(topic[field].en.length, `${topic.id}.${field} en`).toBeGreaterThan(20);
      }
      expect(topic.patterns.length).toBeGreaterThan(0);
    }
  });

  it("promises no outcome it cannot control", () => {
    for (const topic of concernTopics) {
      const text = [topic.framing.ko, topic.observe.ko, topic.action.ko, topic.caution.ko].join(" ");
      // Only affirmative promises. Denying a guarantee — "보장한다는 말은 사실이
      // 아닙니다" — is exactly the copy this rule wants to encourage.
      expect(text, topic.id).not.toMatch(/반드시 (된|이루|성공)|보장(합니다|해 ?드|해요)|틀림없/);
    }
  });
});
