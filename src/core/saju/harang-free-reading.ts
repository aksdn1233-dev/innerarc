import { calculateAttitudeNumber, calculateBirthdayNumber, calculateLifePath } from "@/core/numerology/engine";
import type { NumberCalculation } from "@/core/numerology/types";
import { godFamily } from "./story-reading";
import type { FivePhase, SajuChart, TenGod } from "./types";

/**
 * The extra free chapters 하랑 법사 reads before the fee: childhood in three stages,
 * the way of looking at things, and the birth-date numbers.
 *
 * Like `story-reading.ts`, nothing here is new astrology and nothing is random. Each
 * line is a fixed lookup keyed by a value the engines already computed (a ten-god
 * family, the day master's phase and polarity, a Pythagorean number), and each section
 * carries the evidence line that names the key it was read from.
 *
 * Copy rules (owner decision, 2026-10): 하랑 calls the visitor "님" and himself "저",
 * stays polite, says one plain thing, and always follows it with what to do about it.
 * The jokes live in the UI around these lines, never inside the reading itself.
 */

type Locale = "ko" | "en";
type Text = Readonly<{ ko: string; en: string }>;
type GodFamily = ReturnType<typeof godFamily>;

const t = (ko: string, en: string): Text => ({ ko, en });
const pick = (text: Text, locale: Locale) => text[locale];

const CHILDHOOD: Readonly<Record<"early" | "school" | "teen", Readonly<Record<GodFamily, Text>>>> = {
  early: {
    peer: t("'내 것'과 '네 것'이 분명한 아이였을 겁니다. 또래와 자주 견주며 컸고, 지기 싫은 마음이 일찍 생겼습니다.", "You knew early what was yours. You grew up measuring yourself against others and disliked losing."),
    expression: t("말이 빠르고 손이 바쁜 아이였을 겁니다. 하고 싶은 게 생기면 일단 해봤고, 혼나도 금방 또 했지요.", "A quick-talking, busy-handed child. If you wanted to try something, you tried it, scolding or not."),
    resource: t("어른들 기분과 집안 사정을 일찍 알아챘을 겁니다. 갖고 싶은 것보다 '지금 말해도 되나'를 먼저 살폈습니다.", "You read the adults' moods and the household early, checking whether it was a good time before asking."),
    authority: t("규칙이 분명한 집이었거나, 어른 눈치를 많이 본 시절이었을 겁니다. 잘해야 칭찬받는다는 걸 일찍 배웠습니다.", "A home with clear rules, or a time of watching adults closely. You learned early that praise followed doing well."),
    learning: t("보살핌을 받거나 혼자 생각하는 시간이 많은 아이였을 겁니다. 책이든 공상이든 머릿속 세상이 넓었습니다.", "A child who was looked after, or who spent long hours thinking alone. Books or daydreams, your inner world was wide."),
  },
  school: {
    peer: t("학교에서는 친구 무리가 제일 중요했습니다. 편이 갈리면 어느 한쪽에 서야 마음이 놓였지요.", "At school your circle of friends mattered most. When sides formed, you felt settled only once you stood on one."),
    expression: t("재주가 드러나는 시기였습니다. 그림이든 말이든 운동이든, 남 앞에 서는 걸 은근히 좋아했습니다.", "Your talents showed. Drawing, talking or sport, you quietly liked being in front of people."),
    resource: t("용돈 계산이 빨랐을 겁니다. 무엇을 하든 '이게 나한테 남는 게 있나'를 일찍 따졌습니다.", "You counted pocket money fast and asked early what you would get out of things."),
    authority: t("선생님 말씀을 잘 듣는 편이었거나, 반대로 규칙과 자주 부딪혔습니다. 어느 쪽이든 규칙이 늘 신경 쓰였지요.", "Either you followed teachers closely or clashed with rules. Either way, rules were always on your mind."),
    learning: t("한 가지에 깊게 빠지는 시기였습니다. 이해가 안 되면 넘어가지 못하는 아이였습니다.", "You sank deep into one thing and could not move on until you understood it."),
  },
  teen: {
    peer: t("고집이 단단해진 시기입니다. 남이 정해준 길보다 내가 고른 길이어야 움직였습니다.", "Your will hardened. You moved only on a path you had chosen yourself."),
    expression: t("하고 싶은 말이 늘어난 시기입니다. 참으면 몸이 먼저 티를 냈을 겁니다.", "You had more to say, and when you held it in, your body showed it first."),
    resource: t("현실 감각이 생긴 시기입니다. 꿈보다 '그걸로 뭘 먹고 사나'를 먼저 계산했습니다.", "A practical streak appeared. You worked out how a dream would pay before chasing it."),
    authority: t("맡은 역할이 무거워진 시기입니다. 맏이 노릇, 반장 노릇처럼 책임질 자리가 많았을 겁니다.", "Responsibility grew. Eldest child, class leader: you held more roles than most."),
    learning: t("생각이 깊어진 시기입니다. 혼자 있는 시간이 늘었고, 그 시간에 나름의 기준을 세웠습니다.", "Your thinking deepened. You spent more time alone and set your own standards there."),
  },
};

const FAMILY_LABEL: Readonly<Record<GodFamily, Text>> = {
  peer: t("비겁", "peer"),
  expression: t("식상", "output"),
  resource: t("재성", "wealth"),
  authority: t("관성", "authority"),
  learning: t("인성", "resource"),
};

const LENS: Readonly<Record<FivePhase, { title: Text; body: Text; poke: Text; fix: Text }>> = {
  목: {
    title: t("자라는 쪽을 먼저 봅니다", "You look first at what can grow"),
    body: t("님은 무엇을 보든 '이게 앞으로 어떻게 클까'부터 봅니다. 사람도 일도 가능성으로 읽지요.", "Whatever you see, you first ask how it might grow. You read people and work as potential."),
    poke: t("새 계획 세울 땐 신나는데, 중간 점검은 자꾸 미루시죠?", "Planning thrills you, but the mid-point check keeps slipping, doesn't it?"),
    fix: t("그래서 이렇게 하면 됩니다. 계획을 세우는 날, 점검할 날짜도 같이 달력에 적어두세요.", "So: on the day you plan, put the check-in date on the calendar too."),
  },
  화: {
    title: t("드러나는 쪽을 먼저 봅니다", "You look first at what shows"),
    body: t("분위기와 표정이 먼저 들어옵니다. 같은 말도 누가 어떤 얼굴로 했는지가 더 중요하지요.", "Mood and faces reach you first. Who said it, and with what face, matters more than the words."),
    poke: t("기분이 얼굴에 다 드러나는데, 본인만 모른다고 생각하시죠?", "Your mood is all over your face, and you think only you can't tell, right?"),
    fix: t("그래서 이렇게 하면 됩니다. 중요한 말은 기분이 가라앉은 다음 날 꺼내세요.", "So: say the important thing the day after the mood settles."),
  },
  토: {
    title: t("오래 가는 쪽을 먼저 봅니다", "You look first at what lasts"),
    body: t("이게 오래 갈지, 믿을 만한지를 먼저 봅니다. 그래서 결정이 느려도 한번 정하면 잘 안 바꿉니다.", "You first ask whether it will last and can be trusted. Slow to decide, slow to change once decided."),
    poke: t("'좀 더 생각해볼게요' 하고, 사실 마음은 이미 정해두셨죠?", "You say 'let me think about it' when your mind is already made up, don't you?"),
    fix: t("그래서 이렇게 하면 됩니다. 정한 게 있으면 그날 바로 한 사람에게 말로 꺼내세요.", "So: once you have decided, tell one person that same day."),
  },
  금: {
    title: t("맞고 틀림을 먼저 봅니다", "You look first at right and wrong"),
    body: t("기준에 맞는지, 앞뒤가 맞는지를 먼저 봅니다. 대충 넘어가는 걸 제일 못 견디지요.", "You check first whether it meets the standard and adds up. Sloppiness is what you tolerate least."),
    poke: t("남이 틀린 걸 보면 말하고 싶어서 입이 근질근질하시죠?", "When someone gets it wrong, your mouth itches to say so, doesn't it?"),
    fix: t("그래서 이렇게 하면 됩니다. 지적하기 전에 잘한 점 하나를 먼저 말하세요.", "So: name one thing done well before the correction."),
  },
  수: {
    title: t("속뜻과 흐름을 먼저 봅니다", "You look first at the undercurrent"),
    body: t("말 뒤에 숨은 뜻, 일 뒤에 숨은 흐름을 먼저 읽습니다. 겉말만 듣고 넘어가는 법이 없지요.", "You read the meaning behind words and the current behind events. You never take things at face value."),
    poke: t("답장 하나 받고, 마침표 하나에 숨은 뜻까지 따져보시죠?", "One reply arrives and you analyse the meaning of its full stop, don't you?"),
    fix: t("그래서 이렇게 하면 됩니다. 짐작이 세 번 넘게 돌면, 그냥 한 번 물어보세요.", "So: once a guess has circled three times, just ask."),
  },
};

const POLARITY_NOTE: Readonly<Record<"양" | "음", Text>> = {
  양: t("그리고 그 시선을 밖으로 드러내는 편입니다.", "And you tend to show that view openly."),
  음: t("그리고 그 시선을 속으로 삭이는 편입니다.", "And you tend to keep that view to yourself."),
};

const LIFE_PATH: Readonly<Record<number, { title: Text; body: Text; poke: Text; fix: Text }>> = {
  1: { title: t("먼저 가는 사람", "The one who goes first"), body: t("스스로 정하고 먼저 움직일 때 힘이 납니다. 남이 정한 순서를 따르면 금방 지칩니다.", "You come alive deciding and moving first. Following someone else's order tires you fast."), poke: t("누가 '같이 하자'고 하면, 속으로 '그냥 내가 할게'부터 떠오르시죠?", "When someone says 'let's do it together', you think 'I'll just do it myself', don't you?"), fix: t("혼자 정할 일과 같이 정할 일을 미리 나눠두세요.", "Decide in advance what you settle alone and what you settle together.") },
  2: { title: t("맞춰주는 사람", "The one who attunes"), body: t("사람 사이의 온도를 잘 맞춥니다. 대신 내 마음은 뒤로 미루는 버릇이 있습니다.", "You tune the temperature between people, and push your own wishes back."), poke: t("'아무거나 괜찮아요' 해놓고, 속으로는 먹고 싶은 게 있으시죠?", "You say 'anything is fine' while craving something specific, don't you?"), fix: t("싫은 것 하나는 하루에 한 번 말로 꺼내보세요.", "Once a day, say out loud one thing you do not want.") },
  3: { title: t("말과 재미로 사는 사람", "The one who lives by expression"), body: t("표현할 때 살아납니다. 말이 막히면 기운도 같이 막힙니다.", "You come alive expressing yourself. When words are blocked, so is your energy."), poke: t("단톡방에선 제일 웃긴데, 정작 속얘기는 혼자 삼키시죠?", "Funniest in the group chat, yet the real things you swallow alone, right?"), fix: t("속얘기를 들어줄 사람 한 명만 정해두세요.", "Choose one person who hears the real things.") },
  4: { title: t("차곡차곡 쌓는 사람", "The one who builds step by step"), body: t("순서와 계획이 있어야 마음이 놓입니다. 갑자기 바뀌는 일에 약합니다.", "Order and plans settle you. Sudden changes shake you."), poke: t("약속 시간이 바뀌면 괜찮다고 하고, 하루 종일 신경 쓰이시죠?", "A changed appointment is 'fine', and it bothers you all day, doesn't it?"), fix: t("계획마다 '바뀔 수 있음' 칸을 하나 미리 넣어두세요.", "Leave a 'may change' slot in every plan.") },
  5: { title: t("바람처럼 움직이는 사람", "The one who moves like wind"), body: t("새로운 걸 만나야 숨이 쉬어집니다. 같은 일이 길어지면 몸이 먼저 근질거립니다.", "You breathe through new things. Long sameness makes you restless."), poke: t("장바구니에 담아만 두고, 여행 계획은 늘 머릿속에만 있으시죠?", "Carts full of saved items, trips planned only in your head, right?"), fix: t("새로운 걸 하나 시작할 때, 하던 것 하나는 끝내세요.", "Each time you start something new, finish one old thing.") },
  6: { title: t("챙기는 사람", "The one who looks after"), body: t("주변을 돌봐야 마음이 편합니다. 그러다 내 몫을 놓치기 쉽습니다.", "You rest easy when others are cared for, and often miss your own share."), poke: t("남 부탁은 다 들어주고, 내 일은 밤에 하시죠?", "You do everyone's favours by day and your own work at night, don't you?"), fix: t("남의 부탁을 받기 전에 내 일 하나를 먼저 끝내세요.", "Finish one of your own tasks before taking a favour.") },
  7: { title: t("파고드는 사람", "The one who digs deep"), body: t("이해가 돼야 움직입니다. 혼자 생각하는 시간이 꼭 필요합니다.", "You move once you understand. Time alone to think is a must."), poke: t("검색 한 번이면 끝날 걸, 새벽까지 파고드신 적 있으시죠?", "Something one search would settle kept you up till dawn, didn't it?"), fix: t("알아보는 시간을 정해두고, 그 시간이 끝나면 정하세요.", "Set a research time limit, and decide when it ends.") },
  8: { title: t("결과를 내는 사람", "The one who delivers"), body: t("목표와 성과가 보여야 힘이 납니다. 돈과 힘의 흐름을 잘 읽습니다.", "Visible goals and results drive you. You read money and power well."), poke: t("쉬는 날에도 머릿속으로는 숫자를 세고 계시죠?", "Even on days off, you're counting numbers in your head, aren't you?"), fix: t("일주일에 하루는 숫자를 안 보는 날로 정하세요.", "Make one day a week a no-numbers day.") },
  9: { title: t("넓게 품는 사람", "The one who embraces widely"), body: t("큰 그림과 의미를 봅니다. 끝맺음이 어렵고, 정이 많아 손해도 봅니다.", "You see the big picture and meaning. Endings are hard, and your warmth costs you."), poke: t("끝난 인연도 연락이 오면, 또 받아주시죠?", "When an ended tie calls again, you pick up, don't you?"), fix: t("끝낼 관계와 이어갈 관계를 종이에 적어 나눠보세요.", "Write down which ties to end and which to keep.") },
  11: { title: t("느끼고 비추는 사람", "The one who senses and reflects"), body: t("직감이 빠르고 예민합니다. 남의 기분이 내 기분처럼 들어옵니다.", "Quick intuition, fine sensitivity. Others' moods enter you as your own."), poke: t("말 안 해도 분위기 바뀐 건 제일 먼저 알아채시죠?", "You notice the mood shift before anyone speaks, don't you?"), fix: t("'이건 그 사람 기분이다' 하고 속으로 한 번 선을 그어보세요.", "Tell yourself, 'that mood belongs to them', and draw the line.") },
  22: { title: t("크게 짓는 사람", "The one who builds large"), body: t("큰 계획을 현실로 옮길 힘이 있습니다. 대신 스스로 거는 기대가 무겁습니다.", "You can turn large plans into reality, under heavy self-expectation."), poke: t("남들은 잘했다는데, 본인만 아직 멀었다고 하시죠?", "Everyone says you did well, and you alone say you're not there yet, right?"), fix: t("목표를 한 달 단위로 잘라 작은 성공부터 세어보세요.", "Cut the goal into months and count the small wins first.") },
  33: { title: t("품고 가르치는 사람", "The one who nurtures and teaches"), body: t("돌봄과 가르침에 힘이 있습니다. 남을 살리다 내가 지치기 쉽습니다.", "Your strength is care and teaching, and you tire yourself saving others."), poke: t("괜찮냐는 질문에는 늘 '저는 괜찮아요'라고 답하시죠?", "Asked if you're okay, you always say 'I'm fine', don't you?"), fix: t("돕는 일에도 쉬는 날을 정해두세요.", "Give your helping a day off too.") },
};

export type HarangNumberEvidence = Readonly<{ value: number; formula: string }>;

export type HarangFreeReading = Readonly<{
  childhood: Readonly<{
    stages: readonly Readonly<{ ages: string; body: string }>[];
    evidence: string;
  }>;
  lens: Readonly<{ title: string; body: string; poke: string; fix: string; evidence: string }>;
  numbers: Readonly<{
    lifePath: HarangNumberEvidence;
    birthday: HarangNumberEvidence;
    attitude: HarangNumberEvidence;
    title: string;
    body: string;
    poke: string;
    fix: string;
    evidence: string;
  }>;
}>;

/** "1+9+9+4+1+1+0+4 = 29 → 2+9 = 11" — every reduction step, so the number can be checked by hand. */
export function formulaOf(calculation: NumberCalculation): string {
  const head = `${calculation.expression.replaceAll(" ", "")} = ${calculation.initialTotal}`;
  return calculation.steps.reduce((text, step) => `${text} → ${step.digits.join("+")} = ${step.output}`, head);
}

export function buildHarangFreeReading(chart: SajuChart, locale: Locale): HarangFreeReading {
  const L = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const familyOf = (god: TenGod) => godFamily(god);
  const early = familyOf(chart.tenGods.yearStem);
  const school = familyOf(chart.tenGods.yearBranch);
  const teen = familyOf(chart.tenGods.monthStem);
  const lens = LENS[chart.dayMasterPhase];
  const lifePath = calculateLifePath(chart.birthDate);
  const birthday = calculateBirthdayNumber(chart.birthDate);
  const attitude = calculateAttitudeNumber(chart.birthDate);
  const path = LIFE_PATH[lifePath.value] ?? LIFE_PATH[9]!;
  const godLabel = (god: TenGod, family: GodFamily) => `${god}·${pick(FAMILY_LABEL[family], locale)}`;
  return {
    childhood: {
      stages: [
        { ages: L("0~7세", "Age 0–7"), body: pick(CHILDHOOD.early[early], locale) },
        { ages: L("8~13세", "Age 8–13"), body: pick(CHILDHOOD.school[school], locale) },
        { ages: L("14~19세", "Age 14–19"), body: pick(CHILDHOOD.teen[teen], locale) },
      ],
      evidence: L(
        `📐 근거: 연간 ${chart.year.stem}(${godLabel(chart.tenGods.yearStem, early)}) → 0~7세 · 연지 ${chart.year.branch}(${godLabel(chart.tenGods.yearBranch, school)}) → 8~13세 · 월간 ${chart.month.stem}(${godLabel(chart.tenGods.monthStem, teen)}) → 14~19세`,
        `📐 Basis: year stem ${chart.year.stem} (${godLabel(chart.tenGods.yearStem, early)}) → 0–7 · year branch ${chart.year.branch} (${godLabel(chart.tenGods.yearBranch, school)}) → 8–13 · month stem ${chart.month.stem} (${godLabel(chart.tenGods.monthStem, teen)}) → 14–19`,
      ),
    },
    lens: {
      title: pick(lens.title, locale),
      body: `${pick(lens.body, locale)} ${pick(POLARITY_NOTE[chart.dayMasterPolarity], locale)}`,
      poke: pick(lens.poke, locale),
      fix: pick(lens.fix, locale),
      evidence: L(
        `📐 근거: 일간 ${chart.dayMaster} = ${chart.dayMasterPolarity}${chart.dayMasterPhase}. 오행이 시선의 방향을, 음양이 드러내는 정도를 정합니다.`,
        `📐 Basis: day master ${chart.dayMaster} = ${chart.dayMasterPolarity} ${chart.dayMasterPhase}. The phase sets the direction of the view; the polarity sets how openly it shows.`,
      ),
    },
    numbers: {
      lifePath: { value: lifePath.value, formula: formulaOf(lifePath) },
      birthday: { value: birthday.value, formula: formulaOf(birthday) },
      attitude: { value: attitude.value, formula: formulaOf(attitude) },
      title: pick(path.title, locale),
      body: pick(path.body, locale),
      poke: pick(path.poke, locale),
      fix: `${L("그래서 이렇게 하면 됩니다. ", "So: ")}${pick(path.fix, locale)}`,
      evidence: L(
        `📐 근거: 운명수 = 생년월일 숫자 합 ${formulaOf(lifePath)} (11·22·33은 줄이지 않음, 피타고라스식)`,
        `📐 Basis: life path = sum of birth-date digits ${formulaOf(lifePath)} (11, 22 and 33 are kept; Pythagorean)`,
      ),
    },
  };
}
