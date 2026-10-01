import type { FivePhase, HeavenlyStem, SajuChart, TenGod } from "./types";

/**
 * The free, story-shaped reading shown before checkout on the 사주 page.
 *
 * Everything here is derived from the chart that `buildSajuChart` already computed: the
 * day master, the ten gods of the visible stems and branches, and the phase balance. No
 * new calculation is introduced, nothing is random, and the same chart always tells the
 * same story. The 전생(past life) chapter is a symbolic character sketch drawn from the
 * day master, written as entertainment and labelled that way on screen.
 *
 * Copy rules (owner decision, 2026-09): 태령 speaks in calm, polite Korean (해요·습니다체),
 * says things plainly, and writes at a first-year middle-school reading level.
 */

type Locale = "ko" | "en";
type Text = Readonly<{ ko: string; en: string }>;
type GodFamily = "peer" | "expression" | "resource" | "authority" | "learning";

const t = (ko: string, en: string): Text => ({ ko, en });

export function godFamily(god: TenGod): GodFamily {
  if (god === "비견" || god === "겁재") return "peer";
  if (god === "식신" || god === "상관") return "expression";
  if (god === "편재" || god === "정재") return "resource";
  if (god === "편관" || god === "정관") return "authority";
  return "learning";
}

const STEM_READING: Readonly<Record<HeavenlyStem, { hangul: string; image: Text }>> = {
  甲: { hangul: "갑", image: t("곧게 뻗은 큰 나무", "a tall, straight tree") },
  乙: { hangul: "을", image: t("바람에 휘어도 꺾이지 않는 풀꽃", "a flower that bends but never breaks") },
  丙: { hangul: "병", image: t("한낮에 뜬 해", "the midday sun") },
  丁: { hangul: "정", image: t("밤을 밝히는 촛불", "a candle lighting the night") },
  戊: { hangul: "무", image: t("넓고 든든한 산", "a wide, steady mountain") },
  己: { hangul: "기", image: t("씨앗을 품은 밭", "a field holding seeds") },
  庚: { hangul: "경", image: t("단단한 바위와 쇠", "hard rock and iron") },
  辛: { hangul: "신", image: t("잘 다듬은 보석", "a finely cut gem") },
  壬: { hangul: "임", image: t("크게 흐르는 강물", "a wide, flowing river") },
  癸: { hangul: "계", image: t("조용히 스며드는 비", "quiet, soaking rain") },
};

const PAST_LIFE: Readonly<Record<HeavenlyStem, {
  title: Text;
  tag: Text;
  story: readonly Text[];
  lesson: Text;
}>> = {
  甲: {
    title: t("산길을 먼저 내던 개척단의 우두머리", "the leader who cut the first mountain path"),
    tag: t("앞장서는_개척단장", "trail_breaker"),
    story: [
      t("아주 먼 옛날, 당신은 아무도 가지 않은 산에 처음 길을 내던 사람들의 우두머리였습니다. 남들이 망설일 때 먼저 도끼를 들었고, 그 길로 마을 사람들이 지나다녔습니다.",
        "Long ago you led the people who cut the first path through an untouched mountain. You raised the axe while others hesitated, and a village walked the road you made."),
      t("다만 너무 앞서 걷다 보니 뒤에서 지친 사람을 자주 놓쳤습니다. 길은 잘 냈지만, 같이 걷는 법은 끝까지 서툴렀지요.",
        "You walked so far ahead that you often missed the ones falling behind. You made good roads, but walking together stayed hard."),
    ],
    lesson: t("이번 생의 숙제는 앞장서는 힘은 그대로 두고, 가끔 뒤를 돌아보는 것입니다.", "This life asks you to keep leading, and to look back now and then."),
  },
  乙: {
    title: t("장터와 장터 사이 소식을 잇던 보부상", "the peddler who carried news between markets"),
    tag: t("소식_잇는_보부상", "market_messenger"),
    story: [
      t("당신은 이 장터에서 저 장터로 짐을 지고 다니던 보부상이었습니다. 물건보다 소식을 더 빨리 날랐고, 어느 마을에 가도 아는 얼굴이 있었습니다.",
        "You were a peddler walking from market to market. You carried news faster than goods, and every village had a face that knew you."),
      t("누구와도 잘 어울렸지만, 정작 한곳에 뿌리내리는 일은 늘 미뤘습니다. 떠나는 것이 편해서 머무는 법을 배우지 못했습니다.",
        "You got along with everyone, yet always put off settling anywhere. Leaving was easier, so you never learned to stay."),
    ],
    lesson: t("이번 생의 숙제는 넓게 이어진 인연 가운데 오래 머물 자리를 하나 정하는 것입니다.", "This life asks you to choose one place among your many ties and stay."),
  },
  丙: {
    title: t("큰 잔치를 이끌던 놀이패의 우두머리", "the head of a travelling festival troupe"),
    tag: t("잔치판_우두머리", "festival_lead"),
    story: [
      t("당신은 마을 잔치 때마다 불려 가던 놀이패의 우두머리였습니다. 당신이 판에 서면 사람들이 모였고, 굳었던 얼굴들이 풀렸습니다.",
        "You led the troupe every village called for its festivals. When you stepped out, people gathered and tight faces softened."),
      t("그런데 잔치가 끝나면 누구보다 먼저 지쳤습니다. 늘 밝아야 한다는 마음 때문에 힘든 날에도 웃는 얼굴만 보였지요.",
        "But when the festival ended, you were the first to tire. Feeling you always had to shine, you smiled even on hard days."),
    ],
    lesson: t("이번 생의 숙제는 밝지 않은 날도 괜찮다고, 스스로에게 먼저 말해주는 것입니다.", "This life asks you to let yourself have days that are not bright."),
  },
  丁: {
    title: t("밤새 등불 아래 책을 옮겨 적던 필사가", "the scribe copying books by lamplight"),
    tag: t("등불_아래_필사가", "lamplight_scribe"),
    story: [
      t("당신은 밤마다 작은 등불 아래서 귀한 책을 한 글자씩 옮겨 적던 필사가였습니다. 남들이 자는 동안 지식을 지켜낸 사람이었지요.",
        "Every night you copied precious books by a small lamp, letter by letter. While others slept, you kept knowledge alive."),
      t("섬세하고 꼼꼼했지만, 마음속 생각은 좀처럼 말로 꺼내지 않았습니다. 알아주는 사람이 없어 서운해도 혼자 삼켰습니다.",
        "You were careful and precise, but rarely spoke what you felt. When no one noticed you, you swallowed the hurt alone."),
    ],
    lesson: t("이번 생의 숙제는 속으로 삼키던 마음을 가까운 한 사람에게 꺼내 보는 것입니다.", "This life asks you to say what you usually swallow, to one close person."),
  },
  戊: {
    title: t("고갯마루 주막을 지키던 주인", "the keeper of the inn on the mountain pass"),
    tag: t("고갯마루_주막지기", "pass_innkeeper"),
    story: [
      t("당신은 험한 고갯마루에서 주막을 지키던 주인이었습니다. 지친 나그네 누구에게나 밥과 잠자리를 내주었고, 사람들은 당신을 믿고 쉬어 갔습니다.",
        "You kept an inn on a steep mountain pass. Every tired traveller got a meal and a bed, and people rested because they trusted you."),
      t("하지만 늘 남을 받아주기만 하다가, 정작 당신이 기댈 곳은 만들지 못했습니다. 든든한 사람일수록 외로웠습니다.",
        "Always taking others in, you never made a place to lean on yourself. The steadier you were, the lonelier it got."),
    ],
    lesson: t("이번 생의 숙제는 받아주는 만큼, 나도 도와 달라고 말하는 것입니다.", "This life asks you to ask for help as often as you give it."),
  },
  己: {
    title: t("약초밭을 돌보던 마을 의원", "the village healer tending an herb garden"),
    tag: t("약초밭_의원", "herb_healer"),
    story: [
      t("당신은 마을 뒤 약초밭을 돌보며 아픈 사람을 살피던 의원이었습니다. 무엇이 필요한지 먼저 알아채고, 말없이 챙겨주는 사람이었지요.",
        "You were the healer who tended the herb garden behind the village. You noticed what people needed first and quietly took care of it."),
      t("남을 돌보는 일에는 빈틈이 없었지만, 자기 몸과 마음은 늘 나중이었습니다. 지쳐도 쉬는 법을 몰랐습니다.",
        "You never missed a thing when caring for others, but your own body and heart always came last. You did not know how to rest."),
    ],
    lesson: t("이번 생의 숙제는 남을 챙기는 것처럼 나 자신도 챙기는 것입니다.", "This life asks you to care for yourself the way you care for others."),
  },
  庚: {
    title: t("국경을 지키던 젊은 무관", "the young officer guarding the border"),
    tag: t("국경_지키던_무관", "border_officer"),
    story: [
      t("당신은 나라의 끝, 국경을 지키던 젊은 무관이었습니다. 정해진 원칙을 목숨처럼 지켰고, 위급할 때 가장 먼저 칼을 뽑았습니다.",
        "You were a young officer guarding the far border. You held to your rules like your life depended on it and drew first when danger came."),
      t("덕분에 많은 사람을 지켰지만, 말이 짧고 단호해서 부하들은 당신을 어려워했습니다. 옳은 말이 늘 따뜻하게 들리지는 않았지요.",
        "You protected many, but your short, firm words made your soldiers wary. Being right did not always sound kind."),
    ],
    lesson: t("이번 생의 숙제는 옳은 말을 하기 전에, 한 번 부드럽게 다듬는 것입니다.", "This life asks you to soften the right words before you say them."),
  },
  辛: {
    title: t("왕실 장신구를 다듬던 장인", "the jeweller who shaped royal ornaments"),
    tag: t("왕실_장신구_장인", "royal_jeweller"),
    story: [
      t("당신은 왕실에 올릴 장신구를 다듬던 장인이었습니다. 작은 흠 하나도 그냥 넘기지 않았고, 당신 손을 거친 물건은 늘 빛났습니다.",
        "You shaped ornaments for the royal court. You never let a tiny flaw pass, and whatever left your hands shone."),
      t("그 눈썰미는 사람에게도 향했습니다. 남의 흠이 먼저 보여 쉽게 실망했고, 스스로에게는 더 엄격했습니다.",
        "That sharp eye turned on people too. You saw their flaws first, were easily let down, and were harder still on yourself."),
    ],
    lesson: t("이번 생의 숙제는 흠보다 빛나는 곳을 먼저 말해주는 것입니다.", "This life asks you to name what shines before what is flawed."),
  },
  壬: {
    title: t("먼 바다를 건너던 배의 선장", "the captain who crossed far seas"),
    tag: t("먼바다_선장", "far_sea_captain"),
    story: [
      t("당신은 남들이 가지 않는 먼 바다로 배를 몰던 선장이었습니다. 새로운 땅을 보는 것이 가장 큰 기쁨이었고, 선원들은 당신의 배짱을 믿었습니다.",
        "You captained a ship to seas no one else sailed. New shores were your greatest joy, and your crew trusted your nerve."),
      t("다만 한번 마음먹으면 멈출 줄을 몰라, 폭풍이 와도 뱃머리를 돌리지 않은 날이 있었습니다. 용기와 무리의 경계가 흐렸지요.",
        "Once decided, you could not stop, and some days you did not turn back even in a storm. Courage and recklessness blurred."),
    ],
    lesson: t("이번 생의 숙제는 나아갈 때와 멈출 때를 미리 정해 두는 것입니다.", "This life asks you to decide in advance when to go and when to stop."),
  },
  癸: {
    title: t("사람들의 꿈을 풀어주던 점쟁이", "the diviner who read people's dreams"),
    tag: t("꿈_풀던_점쟁이", "dream_reader"),
    story: [
      t("당신은 사람들이 꾼 꿈을 듣고 그 뜻을 풀어주던 점쟁이였습니다. 말하지 않아도 마음을 알아채는 눈이 있어서 많은 사람이 당신을 찾아왔습니다.",
        "You listened to people's dreams and told them what they meant. You could read hearts without words, and many came to you."),
      t("하지만 남의 슬픔을 너무 깊이 받아들이다 보니 밤마다 마음이 무거웠습니다. 남의 짐을 내려놓는 법을 몰랐습니다.",
        "But you took in others' sorrow so deeply that your nights grew heavy. You never learned to set their burdens down."),
    ],
    lesson: t("이번 생의 숙제는 남의 마음을 알아채되, 내 것처럼 짊어지지 않는 것입니다.", "This life asks you to notice others' hearts without carrying them as your own."),
  },
};

const FAMILY_ECHO: Readonly<Record<GodFamily, Text>> = {
  peer: t("그때도 당신은 혼자 해내는 것을 자존심으로 여겼습니다.", "Even then, doing it alone was your pride."),
  expression: t("그때도 당신은 말과 재주로 사람을 모았습니다.", "Even then, your words and talents drew people in."),
  resource: t("그때도 당신은 셈이 빨랐고 손해 보는 일을 싫어했습니다.", "Even then, you counted fast and hated a loss."),
  authority: t("그때도 당신은 한번 한 약속을 끝까지 지켰습니다.", "Even then, you kept every promise to the end."),
  learning: t("그때도 당신은 배우고 기록하는 일을 가장 좋아했습니다.", "Even then, learning and writing things down was your favourite work."),
};

const PHASE_NAME: Readonly<Record<FivePhase, Text>> = {
  목: t("목(나무)", "Wood"),
  화: t("화(불)", "Fire"),
  토: t("토(흙)", "Earth"),
  금: t("금(쇠)", "Metal"),
  수: t("수(물)", "Water"),
};

const PHASE_LOW: Readonly<Record<FivePhase, { meaning: Text; advice: Text }>> = {
  목: { meaning: t("새로 시작하는 힘이 약한 편입니다. 생각은 많은데 첫발이 늦어집니다.", "Starting new things is harder for you; the first step comes late."),
    advice: t("계획은 반만 세우고, 작은 일부터 오늘 시작해 보세요.", "Plan only half, and start something small today.") },
  화: { meaning: t("마음을 밖으로 드러내는 힘이 약한 편입니다. 좋아도 티를 잘 안 냅니다.", "Showing what you feel is harder; you rarely let it show."),
    advice: t("좋은 것은 좋다고, 고마운 것은 고맙다고 말로 꺼내 보세요.", "Say out loud when something is good or when you are grateful.") },
  토: { meaning: t("버티고 정리하는 힘이 약한 편입니다. 일이 쉽게 흩어집니다.", "Holding things together is harder; tasks scatter easily."),
    advice: t("하루 할 일을 세 가지로 줄여서 적어 보세요.", "Write down only three things to do each day.") },
  금: { meaning: t("끊고 정하는 힘이 약한 편입니다. 거절이 어렵고 결정이 늦습니다.", "Cutting and deciding is harder; saying no and choosing take long."),
    advice: t("할 일보다 '안 할 일' 목록을 먼저 만들어 보세요.", "Make a list of what you will not do before your to-do list.") },
  수: { meaning: t("쉬고 식히는 힘이 약한 편입니다. 머리가 쉴 틈 없이 달립니다.", "Resting and cooling down is harder; your mind never stops."),
    advice: t("하루 20분은 아무것도 하지 않는 시간을 정해 두세요.", "Set aside twenty minutes a day to do nothing at all.") },
};

const PHASE_HIGH: Readonly<Record<FivePhase, { meaning: Text; advice: Text }>> = {
  목: { meaning: t("앞서가려는 마음과 고집이 넘칩니다.", "The urge to lead and stubbornness run high."),
    advice: t("정하기 전에 한 사람에게만 먼저 물어보세요.", "Before deciding, ask just one person first.") },
  화: { meaning: t("급한 마음과 감정의 불길이 넘칩니다.", "Hurry and hot feelings run high."),
    advice: t("중요한 결정은 하룻밤 자고 나서 내리세요.", "Sleep on any important decision.") },
  토: { meaning: t("걱정과 버티려는 마음이 넘칩니다.", "Worry and the urge to hold on run high."),
    advice: t("쌓인 걱정은 종이에 적고, 하나씩 지워 가세요.", "Write your worries on paper and cross them out one by one.") },
  금: { meaning: t("날카로운 말과 완벽하려는 마음이 넘칩니다.", "Sharp words and perfectionism run high."),
    advice: t("지적하기 전에 좋은 점 하나를 먼저 말해 보세요.", "Name one good thing before you point out a flaw.") },
  수: { meaning: t("생각이 너무 많아 몸이 늦게 움직입니다.", "Too many thoughts slow your body down."),
    advice: t("생각이 길어지면 일단 자리에서 일어나 움직이세요.", "When thinking runs long, stand up and move first.") },
};

const MASK_OUTER: Readonly<Record<GodFamily, { title: Text; body: Text }>> = {
  peer: { title: t("혼자서도 잘 해내는 사람", "someone who handles it alone"),
    body: t("밖에서 당신은 누구에게 기대지 않고 자기 몫을 해내는 사람으로 보입니다. 믿음직하지만, 조금 다가가기 어렵다는 말도 듣습니다.", "Out in the world you look like someone who carries their own weight. Reliable, though some find you hard to approach.") },
  expression: { title: t("분위기를 바꾸는 재주꾼", "the one who changes the room"),
    body: t("밖에서 당신은 말과 재주로 분위기를 바꾸는 사람으로 보입니다. 함께 있으면 즐겁지만, 속을 알기 어렵다는 말도 듣습니다.", "You look like someone whose words and talents change the mood. Fun to be around, though people say you are hard to read.") },
  resource: { title: t("현실적이고 셈이 빠른 사람", "a practical, quick-counting person"),
    body: t("밖에서 당신은 일을 빠르게 정리하고 손해를 막는 사람으로 보입니다. 든든하지만, 너무 계산적이라는 오해도 받습니다.", "You look like someone who sorts things fast and prevents losses. Solid, though sometimes mistaken as calculating.") },
  authority: { title: t("원칙을 지키는 믿음직한 사람", "a principled, dependable person"),
    body: t("밖에서 당신은 약속과 규칙을 지키는 사람으로 보입니다. 윗사람은 믿고 맡기지만, 가까운 사람은 조금 딱딱하다고 느낍니다.", "You look like someone who keeps rules and promises. Superiors trust you; close people find you a little stiff.") },
  learning: { title: t("생각이 깊고 차분한 사람", "a thoughtful, calm person"),
    body: t("밖에서 당신은 잘 듣고 깊이 생각하는 사람으로 보입니다. 조언을 구하러 오는 사람이 많지만, 속마음은 잘 보여주지 않습니다.", "You look like someone who listens and thinks deeply. Many come for advice, yet you rarely show your own heart.") },
};

const MASK_INNER: Readonly<Record<GodFamily, Text>> = {
  peer: t("속으로는 '나도 기대고 싶다'는 마음이 있습니다. 다만 먼저 말하면 지는 것 같아 참습니다.", "Inside, you want to lean on someone too. You hold back because asking first feels like losing."),
  expression: t("속으로는 사람들이 내 진짜 마음도 알아주길 바랍니다. 웃음 뒤에 서운함을 자주 숨깁니다.", "Inside, you want people to see your real feelings too. You often hide hurt behind a smile."),
  resource: t("속으로는 늘 불안이 조금씩 있습니다. 준비해 두지 않으면 무너질 것 같아 쉬지 못합니다.", "Inside, there is always a little worry. You cannot rest unless things are prepared."),
  authority: t("속으로는 실수할까 봐 늘 긴장합니다. 잘해야 사랑받는다는 생각이 오래 남아 있습니다.", "Inside, you are always tense about mistakes. The idea that you must do well to be loved has stayed a long time."),
  learning: t("속으로는 누군가 나를 먼저 챙겨주길 바랍니다. 괜찮다고 말하지만 사실은 지쳐 있을 때가 많습니다.", "Inside, you wish someone would look after you first. You say you are fine, but often you are tired."),
};

export type SajuStoryReading = Readonly<{
  dayMaster: Readonly<{ stem: HeavenlyStem; hangul: string; phase: FivePhase; image: string }>;
  pastLife: Readonly<{ title: string; hashtag: string; story: readonly string[]; echo: string; lesson: string }>;
  phases: Readonly<{
    low: readonly Readonly<{ phase: FivePhase; label: string; count: number; meaning: string; advice: string }>[];
    high: readonly Readonly<{ phase: FivePhase; label: string; count: number; meaning: string; advice: string }>[];
  }>;
  mask: Readonly<{ score: number; outerTitle: string; outer: string; inner: string }>;
  closing: string;
}>;

function pick(text: Text, locale: Locale): string {
  return text[locale];
}

function dominantFamily(chart: SajuChart): GodFamily {
  const gods = [
    chart.tenGods.yearStem,
    chart.tenGods.monthStem,
    chart.tenGods.hourStem,
    chart.tenGods.yearBranch,
    chart.tenGods.monthBranch,
    chart.tenGods.dayBranch,
    chart.tenGods.hourBranch,
  ].filter((god): god is TenGod => god !== null);
  const order: readonly GodFamily[] = ["peer", "expression", "resource", "authority", "learning"];
  const counts = new Map<GodFamily, number>(order.map((family) => [family, 0]));
  for (const god of gods) counts.set(godFamily(god), (counts.get(godFamily(god)) ?? 0) + 1);
  // Ties resolve in a fixed order so the same chart never reads two ways.
  return order.reduce((best, family) => ((counts.get(family) ?? 0) > (counts.get(best) ?? 0) ? family : best), order[0]!);
}

/** 0–100. Higher means the face shown to the world sits further from the inner self. */
export function socialMaskScore(chart: SajuChart): number {
  const visible = [chart.tenGods.yearStem, chart.tenGods.monthStem, chart.tenGods.hourStem]
    .filter((god): god is TenGod => god !== null);
  let score = 52;
  for (const god of visible) {
    const family = godFamily(god);
    if (family === "authority") score += 9;
    else if (family === "resource") score += 7;
    else if (family === "expression") score += 5;
    else if (family === "learning") score += 3;
    else score -= 4;
  }
  if (godFamily(chart.tenGods.monthStem) !== godFamily(chart.tenGods.dayBranch)) score += 6;
  return Math.max(35, Math.min(92, score));
}

export function buildSajuStory(chart: SajuChart, locale: Locale): SajuStoryReading {
  const stem = chart.dayMaster;
  const life = PAST_LIFE[stem];
  const family = dominantFamily(chart);
  const balance = chart.phaseBalance;
  const phases = Object.keys(balance) as FivePhase[];
  const max = Math.max(...phases.map((phase) => balance[phase]));
  const low = phases.filter((phase) => balance[phase] === 0);
  // "Overflowing" needs to stand out, not merely be the largest of an even spread.
  const high = phases.filter((phase) => balance[phase] === max && max >= 3);
  const outerFamily = godFamily(chart.tenGods.monthStem);
  const innerFamily = godFamily(chart.tenGods.dayBranch);
  const toEntry = (phase: FivePhase, table: typeof PHASE_LOW) => ({
    phase,
    label: pick(PHASE_NAME[phase], locale),
    count: balance[phase],
    meaning: pick(table[phase].meaning, locale),
    advice: pick(table[phase].advice, locale),
  });
  const lowEntries = low.map((phase) => toEntry(phase, PHASE_LOW));
  const highEntries = high.map((phase) => toEntry(phase, PHASE_HIGH));
  const closing = lowEntries[0]
    ? (locale === "ko"
      ? `당신의 사주에는 ${lowEntries[0].label} 기운이 비어 있습니다. 그 부족한 힘을 생활 습관으로 조금씩 채우면, 타고난 강점을 더 오래 지킬 수 있습니다.`
      : `Your chart has no ${lowEntries[0].label}. Filling that gap with small daily habits helps you keep your natural strengths longer.`)
    : (locale === "ko"
      ? "당신의 사주는 다섯 기운이 비교적 고르게 들어 있습니다. 한쪽으로 쏠리지 않게 지금의 균형을 지키는 것이 가장 큰 힘입니다."
      : "Your chart holds the five phases fairly evenly. Keeping that balance is your greatest strength.");
  return {
    dayMaster: {
      stem,
      hangul: STEM_READING[stem].hangul,
      phase: chart.dayMasterPhase,
      image: pick(STEM_READING[stem].image, locale),
    },
    pastLife: {
      title: pick(life.title, locale),
      hashtag: `#${pick(life.tag, locale)}`,
      story: life.story.map((line) => pick(line, locale)),
      echo: pick(FAMILY_ECHO[family], locale),
      lesson: pick(life.lesson, locale),
    },
    phases: { low: lowEntries, high: highEntries },
    mask: {
      score: socialMaskScore(chart),
      outerTitle: pick(MASK_OUTER[outerFamily].title, locale),
      outer: pick(MASK_OUTER[outerFamily].body, locale),
      inner: pick(MASK_INNER[innerFamily], locale),
    },
    closing,
  };
}
