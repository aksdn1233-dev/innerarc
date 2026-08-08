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

function report(concern: string, focusId: "work" | "relationships" | "health" | "growth" | "money" = "work") {
  return createPaidReport("iatopic1234567", { ...base, focusId, concern });
}

function topicSection(concern: string, focusId?: "work" | "relationships" | "health" | "growth" | "money") {
  return report(concern, focusId).sections
    .find((section) => section.title.includes("질문 분야 상세 분석")
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

    expect(section?.title).toContain("질문 분야 상세 분석");
    expect(section?.body).toContain("질문의 구체적 상황이 짧아");
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
    const detail = topicSection("아이돌 연습생인데 데뷔할 수 있을까요?");
    expect(debut.actions[0]).toContain("지원");
    expect(detail?.body).toContain("합격 여부");
  });
});

describe("the wider set of situations", () => {
  it("recognises the rest of what people write about", () => {
    const cases: readonly [string, string][] = [
      ["승진에서 계속 밀리는 것 같습니다", "승진"],
      ["프리랜서로 독립해도 될까요", "프리랜서"],
      ["경력 단절 후 재취업이 될까요", "재취업"],
      ["부업을 하나 시작해볼까 합니다", "부업"],
      ["전역하고 뭘 해야 할지 모르겠습니다", "군 복무"],
      ["해외 취업을 준비 중입니다", "해외 취업"],
      ["은퇴 후가 막막합니다", "은퇴"],
      ["남자친구 외도가 의심됩니다", "외도"],
      ["집안 반대가 심합니다", "집안 반대"],
      ["장거리 연애 중인데 힘듭니다", "장거리"],
      ["권태기가 온 것 같아요", "권태기"],
      ["동거를 시작해도 될까요", "동거"],
      ["재혼을 고민 중입니다", "재혼"],
      ["언니와 사이가 안 좋습니다", "형제자매"],
      ["부모님 간병을 하고 있습니다", "간병"],
      ["강아지 입양할까 고민입니다", "반려동물"],
      ["목돈을 모으고 싶습니다", "저축"],
      ["보험을 정리해야 할까요", "보험"],
      ["상속 문제로 다툼이 있습니다", "상속"],
      ["운동 습관을 만들고 싶어요", "건강 습관"],
      ["내 건강 습관 어디부터 바꿀까요", "건강 습관"],
      ["불면증이 심합니다", "수면"],
      ["사람 만나기가 너무 힘듭니다", "사람 만나기"],
      ["요즘 너무 외롭습니다", "외로움"],
      ["외모 때문에 자신감이 없어요", "외모"],
      ["귀농을 생각하고 있습니다", "지역 이동"],
      // These four use phrasing that stays clear of the safety gate's own trigger
      // words (소송, 법률, 계약서, bare 임신) so the topic itself is what's tested.
      ["이혼하고 싶은데 어떻게 해야 할지 모르겠습니다", "이혼"],
      ["난임이라 마음이 너무 힘듭니다", "임신"],
      ["동업자랑 갈등이 심해서 고민입니다", "동업"],
      ["손해배상을 청구당해서 어떻게 해야 할지 모르겠습니다", "소송"],
    ];

    for (const [concern, expected] of cases) {
      const section = topicSection(concern, "growth");
      expect(section?.title, `"${concern}" was not recognised`).toContain(expected);
    }
  });

  it("sends situations with a working formal channel there instead of reading them", () => {
    for (const [concern, marker] of [
      ["학교에서 왕따를 당하고 있습니다", "학교폭력"],
      ["도박을 끊지 못하겠습니다", "중독"],
      ["아버지가 돌아가셨습니다", "사별"],
    ] as const) {
      const report = createPaidReport("iaescalate123", {
        ...base,
        focusId: "growth",
        concern,
      });
      const section = report.sections.find((s) => s.title.includes(marker));
      expect(section, `${concern} was not escalated`).toBeDefined();
      expect(section?.body).toMatch(/신고|센터|상담|1577|117/);
    }
  });

  it("keeps a specific situation from being swallowed by a broader one", () => {
    // Each of these contains a word that a broader topic also matches.
    const pairs: readonly [string, string][] = [
      ["부모님과 자꾸 부딪힙니다", "부모"],
      ["가족한테 돈을 빌려줬는데", "가족 간 돈"],
      ["학교폭력 신고를 해야 할까요", "학교폭력"],
      ["상사와 갈등이 있습니다", "직장 인간관계"],
      // "이혼" must not fall into marriage or the generic argument topic, and
      // "동업" must not fall into the generic startup topic that also matches 사업.
      ["이혼 절차가 궁금합니다", "이혼"],
      ["동업 사업 파트너와 지분 문제로 다툽니다", "동업"],
    ];
    for (const [concern, expected] of pairs) {
      expect(topicSection(concern, "growth")?.title, concern).toContain(expected);
    }
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

  it("recognises the conjugated forms people actually type", () => {
    // Korean stems change shape between syllables: 외로움 and 외롭습니다 share no
    // substring at all, so a pattern written from one form silently misses the other.
    const forms: readonly [string, string][] = [
      ["요즘 너무 외롭습니다", "외로움"],
      ["외로워서 힘들어요", "외로움"],
      ["다 지쳤습니다", "번아웃"],
      ["지쳐서 아무것도 못 하겠어요", "번아웃"],
      ["부모님과 부딪혀서 힘듭니다", "부모"],
      ["막막합니다", "방향"],
      ["무기력합니다", "번아웃"],
    ];
    for (const [concern, expected] of forms) {
      expect(topicSection(concern, "growth")?.title, concern).toContain(expected);
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
