"use client";

import { HydrationGate } from "./hydration-gate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  SajuInputError,
  buildSajuChart,
  buildSajuStory,
  type SajuChart,
  type SajuStoryReading,
} from "@/core/saju";
import { MIN_BIRTH_DATE, currentMaxBirthDate, isAcceptedBirthDate } from "@/core/birth-range";
import type { PublicReview } from "@/core/reviews";
import type { ProductPriceSet } from "@/core/product-prices";
import type { Locale } from "@/i18n/config";
import "./saju-experience.module.css";

/**
 * The 사주 menu as a guided story.
 *
 * Six short questions, one per screen, asked by 태령. Then four free chapters built from
 * the chart the engine computes in the browser (nothing personal is sent anywhere until
 * checkout), and a fifth chapter that names what the paid readings add and hands the
 * same checkout draft to /plans that the rest of the site uses.
 *
 * Conversion devices are kept honest on purpose: every number shown is either the
 * visitor's own chart or a real count passed in from the server, reviews are the
 * published ones only, and there is no countdown or invented "people paying now" figure.
 */

type FocusId = "work" | "relationships" | "health" | "growth" | "money";
type ProductCode = "plus_30d" | "pro_30d" | "premium_pdf";

const IMG = "/assets/gyeol-webtoon/characters/taeryeong";
const POSE = {
  front: `${IMG}/taeryeong_front_neutral_01.png`,
  welcome: `${IMG}/taeryeong_reach-hand_welcoming_01.png`,
  explain: `${IMG}/taeryeong_explain_calm_01.png`,
  chart: `${IMG}/taeryeong_read-chart_focused_01.png`,
  reveal: `${IMG}/taeryeong_result-reveal_dramatic_01.png`,
  ponder: `${IMG}/taeryeong_ponder_thoughtful_01.png`,
  warm: `${IMG}/taeryeong_smile_warm_01.png`,
  book: `${IMG}/taeryeong_read-book_focused_01.png`,
} as const;

/** 시진 labels, with the wall-clock ranges most Korean 만세력 print. Picking one sends the
 * middle of its range; the engine then applies the usual longitude correction. */
const HOURS: readonly (readonly [string, string, string])[] = [
  ["자시", "23:30~01:30", "00:30"],
  ["축시", "01:30~03:30", "02:30"],
  ["인시", "03:30~05:30", "04:30"],
  ["묘시", "05:30~07:30", "06:30"],
  ["진시", "07:30~09:30", "08:30"],
  ["사시", "09:30~11:30", "10:30"],
  ["오시", "11:30~13:30", "12:30"],
  ["미시", "13:30~15:30", "14:30"],
  ["신시", "15:30~17:30", "16:30"],
  ["유시", "17:30~19:30", "18:30"],
  ["술시", "19:30~21:30", "20:30"],
  ["해시", "21:30~23:30", "22:30"],
];

const PILLAR_ROLE = {
  ko: { year: ["年", "뿌리 · 어린 시절"], month: ["月", "사회 · 청년기"], day: ["日", "나 · 배우자"], hour: ["時", "자녀 · 말년"] },
  en: { year: ["YEAR", "Roots"], month: ["MONTH", "Society"], day: ["DAY", "Self"], hour: ["HOUR", "Later life"] },
} as const;

function Portrait({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} className={className} decoding="async" height={384} loading="lazy" src={src} width={384} />;
}

/** The full-body pose, framed on the face for small round and square slots. */
function Face({ src, className }: { src: string; className: string }) {
  return (
    <span aria-hidden="true" className={`saju-story-face ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" decoding="async" height={384} loading="lazy" src={src} width={384} />
    </span>
  );
}

export function SajuExperience({
  locale,
  prices,
  reviews = [],
  reviewCount = null,
}: {
  locale: Locale;
  prices: ProductPriceSet;
  reviews?: readonly PublicReview[];
  reviewCount?: number | null;
}) {
  const ko = locale === "ko";
  const L = (k: string, e: string) => (ko ? k : e);
  const num = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));
  const won = (value: number) => (ko ? `${value.toLocaleString("ko-KR")}원` : `₩${value.toLocaleString("en-US")}`);
  const maxBirthDate = currentMaxBirthDate();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [sex, setSex] = useState<"female" | "male" | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [hourChoice, setHourChoice] = useState("");
  const [exactTime, setExactTime] = useState("");
  const [midnight, setMidnight] = useState<"야자시" | "조자시">("야자시");
  const [focusId, setFocusId] = useState<FocusId | "">("");
  const [concern, setConcern] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chart, setChart] = useState<SajuChart | null>(null);
  const [chapter, setChapter] = useState(0);
  const [pastReady, setPastReady] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [product, setProduct] = useState<ProductCode>("pro_30d");

  const story: SajuStoryReading | null = useMemo(() => (chart ? buildSajuStory(chart, locale) : null), [chart, locale]);
  const callName = name.trim() || L("당신", "you");
  const birthTime = exactTime || (hourChoice && hourChoice !== "unknown" ? HOURS.find((h) => h[0] === hourChoice)?.[2] ?? "" : "");

  const FOCUS: readonly (readonly [FocusId, string])[] = [
    ["work", L("일 · 사업", "Work")],
    ["money", L("돈", "Money")],
    ["relationships", L("사람 · 연애", "Love & people")],
    ["health", L("몸과 마음", "Body & mind")],
    ["growth", L("나 자신", "Myself")],
  ];
  const CHIPS: Readonly<Record<FocusId, readonly string[]>> = ko
    ? {
        work: ["이직해도 될까요?", "사업을 시작해도 될까요?"],
        money: ["언제쯤 돈이 모일까요?", "돈이 왜 자꾸 새는 걸까요?"],
        relationships: ["이 사람과 계속 가도 될까요?", "연애가 왜 늘 비슷하게 끝날까요?"],
        health: ["요즘 왜 이렇게 지칠까요?", "쉬는 법을 모르겠어요"],
        growth: ["나에게 맞는 길은 뭘까요?", "올해 무엇을 붙잡아야 할까요?"],
      }
    : {
        work: ["Should I change jobs?", "Should I start a business?"],
        money: ["When will money settle?", "Why does money keep leaking?"],
        relationships: ["Should I stay with this person?", "Why do my relationships end the same way?"],
        health: ["Why am I so tired lately?", "I don't know how to rest"],
        growth: ["What path fits me?", "What should I hold on to this year?"],
      };

  const steps = [
    {
      say: L(`어서 오세요. 여기까지 오셨다면 마음에 걸리는 일이 있으시겠지요.\n먼저 이름을 알려주세요.`, "Welcome. If you came this far, something is on your mind.\nFirst, tell me your name."),
      accent: L("기본 풀이는 복채 없이 봐드리겠습니다.", "The basic reading is free."),
      label: L("이름", "Name"),
      help: L("별명도 괜찮아요. 비워두셔도 됩니다.", "A nickname is fine. You can leave it blank."),
      ok: true,
    },
    {
      say: L(`${callName}님, 반갑습니다.\n성별을 알려주시면 흐름을 더 바르게 볼 수 있습니다.`, `Nice to meet you, ${callName}.\nYour sex sets the direction of the ten-year cycles.`),
      label: L("성별", "Sex"),
      help: L("대운의 방향을 정하는 데 필요한 정보예요.", "Needed to set the direction of your luck cycles."),
      ok: sex !== "",
    },
    {
      say: L("태어나신 날을 알려주세요.\n그 하루에 네 기둥, 여덟 글자가 모두 담겨 있습니다.", "Tell me the day you were born.\nFour pillars and eight characters live in that one day."),
      label: L("생년월일 (양력)", "Date of birth (solar)"),
      help: L("음력 생일은 아직 받지 않아요. 양력으로 바꿔서 넣어주세요.", "Lunar dates are not supported yet; please enter the solar date."),
      ok: isAcceptedBirthDate(birthDate),
    },
    {
      say: L("태어난 시간도 아시나요?\n모르셔도 괜찮습니다. 모르는 시간은 짐작하지 않고 비워둡니다.", "Do you know your birth time?\nIt's fine if not. I leave an unknown hour empty rather than guess."),
      label: L("태어난 시간", "Birth time"),
      help: L("모르면 '시간 모름'을 골라주세요.", "Choose 'Unknown' if you don't know."),
      ok: hourChoice !== "" || exactTime !== "",
    },
    {
      say: L("요즘 가장 마음이 쓰이는 곳은 어디인가요?\n하나만 고르시면 그곳부터 깊게 보겠습니다.", "Where does your mind go most these days?\nPick one and I'll look there first."),
      label: L("관심 분야", "Focus"),
      help: L("유료 풀이가 이 분야를 중심으로 짜여요.", "The paid reading centres on this area."),
      ok: focusId !== "",
    },
    {
      say: L("마지막입니다.\n정말 묻고 싶은 것을 한 줄로 적어주세요.", "Last one.\nWrite, in one line, what you really want to ask."),
      accent: L("구체적으로 적어주실수록 더 정확히 짚어드립니다.", "The more specific, the sharper the answer."),
      label: L("궁금한 것", "Your question"),
      help: L("칩을 눌러도 되고, 직접 써도 돼요. 비워두면 전체 흐름으로 봅니다.", "Tap a chip or write your own. Leave it blank for the overall flow."),
      ok: consent,
    },
  ] as const;
  const current = steps[step]!;

  useEffect(() => {
    if (chapter !== 2 || pastReady) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPastReady(true), reduced ? 0 : 1400);
    return () => window.clearTimeout(timer);
  }, [chapter, pastReady]);

  function goChapter(next: number) {
    setChapter(Math.max(0, Math.min(4, next)));
    setTocOpen(false);
    window.scrollTo({ top: 0 });
  }

  function next() {
    if (!current.ok) return;
    setError(null);
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    if (!isAcceptedBirthDate(birthDate)) {
      setStep(2);
      setError(L("생년월일을 다시 확인해 주세요.", "Please check the date of birth."));
      return;
    }
    try {
      const built = buildSajuChart({
        birthDate,
        birthTime: birthTime || undefined,
        sex: sex === "male" ? "male" : "female",
        midnightConvention: midnight,
      });
      setChart(built);
      setChapter(0);
      setPastReady(false);
      window.scrollTo({ top: 0 });
    } catch (caught) {
      setError(caught instanceof SajuInputError ? caught.message : L("계산하지 못했어요. 입력을 다시 확인해 주세요.", "Couldn't calculate. Please check your input."));
    }
  }

  function back() {
    setError(null);
    if (step > 0) setStep(step - 1);
  }

  function checkout() {
    const focus = (focusId || "growth") as FocusId;
    const draft = {
      version: 1 as const,
      locale,
      productCode: product,
      ...(product === "plus_30d" ? { readingKind: "saju_chart" as const } : {}),
      birthDate,
      birthTime: birthTime || undefined,
      name: name.trim(),
      focusId: focus,
      concern: concern.trim().slice(0, 2_000),
      gender: sex === "male" ? ("male" as const) : ("female" as const),
      midnightConvention: midnight,
      createdAt: new Date().toISOString(),
    };
    window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(draft));
    router.push(`/${locale}/plans?product=${product}`);
  }

  /* ---------------- intake ---------------- */
  if (!chart || !story) {
    return (
      <main className="saju-page saju-story" data-stage="intake">
        {step === 0 && <header className="saju-story-hero">
          <Portrait className="saju-story-hero-portrait" src={POSE.welcome} />
          <p className="saju-story-edition">太靈堂 · FOUR PILLARS</p>
          <h1>{L("숨김없이 짚어드리는 태령당 사주", "Taeryeongdang Saju, read plainly")}</h1>
          <p className="saju-story-lede">{L("왜 늘 같은 자리에서 막히는지, 사주 여덟 글자로 차분히 짚어드립니다.", "Why you keep getting stuck in the same place, read calmly from your eight characters.")}</p>
          <ul className="saju-story-chips" aria-label={L("풀이 구성", "What you get")}>
            <li>{L("사주 원국 무료 계산", "Free chart")}</li>
            <li>{L("전생 풀이", "Past-life sketch")}</li>
            <li>{L("겉과 속 점수", "Mask score")}</li>
          </ul>
          {reviewCount !== null && reviewCount > 0 && (
            <p className="saju-story-count">{L(`공개된 후기 ${reviewCount.toLocaleString("ko-KR")}개`, `${reviewCount.toLocaleString("en-US")} published reviews`)}</p>
          )}
        </header>}

        <form className="saju-story-intake" onSubmit={(event) => { event.preventDefault(); next(); }} noValidate>
          <HydrationGate locale={locale}>
            <div className="saju-story-topbar">
              <button aria-label={L("이전 단계", "Previous step")} className="saju-story-round" disabled={step === 0} onClick={back} type="button">←</button>
              <span>{L(`${step + 1}/6단계`, `Step ${step + 1} of 6`)}</span>
              <span className="saju-story-free">{L("무료 결과 먼저 확인", "Free result first")}</span>
            </div>
            <div className="saju-story-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / 6) * 100}%` }} /></div>

            <div className="saju-story-bubble-row">
              <Face className="saju-story-avatar" src={POSE.front} />
              <p className="saju-story-bubble">
                {current.say}
                {"accent" in current && current.accent && <><br /><b>{current.accent}</b></>}
              </p>
            </div>

            <div className="saju-story-field">
              <p className="saju-story-label" id="saju-step-label">{current.label}</p>
              <p className="saju-story-help">{current.help}</p>

              {step === 0 && (
                <input aria-labelledby="saju-step-label" autoComplete="name" className="saju-story-input" id="saju-readingName" maxLength={80} name="readingName" onChange={(e) => setName(e.target.value)} placeholder={L("홍길동", "Your name")} type="text" value={name} />
              )}

              {step === 1 && (
                <div className="saju-story-choice" role="radiogroup" aria-labelledby="saju-step-label">
                  {([["female", L("여성", "Female")], ["male", L("남성", "Male")]] as const).map(([value, label]) => (
                    <button aria-checked={sex === value} key={value} onClick={() => setSex(value)} role="radio" type="button">{label}</button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <input aria-labelledby="saju-step-label" className="saju-story-input" id="saju-birthDate" max={maxBirthDate} min={MIN_BIRTH_DATE} name="birthDate" onChange={(e) => setBirthDate(e.target.value)} type="date" value={birthDate} />
              )}

              {step === 3 && (
                <>
                  <select aria-labelledby="saju-step-label" className="saju-story-input saju-story-select" id="saju-birthHour" onChange={(e) => { setHourChoice(e.target.value); setExactTime(""); }} value={hourChoice}>
                    <option value="">{L("시간을 골라주세요", "Choose a time")}</option>
                    <option value="unknown">{L("시간 모름", "Unknown")}</option>
                    {HOURS.map(([label, range]) => (
                      <option key={label} value={label}>{ko ? `${label} (${range})` : `${range}`}</option>
                    ))}
                  </select>
                  <details className="saju-story-advanced">
                    <summary>{L("정확한 시각을 알아요 · 자시 기준", "I know the exact time · midnight rule")}</summary>
                    <label htmlFor="saju-birthTime">{L("정확한 출생 시각", "Exact birth time")}</label>
                    <input className="saju-story-input" id="saju-birthTime" onChange={(e) => { setExactTime(e.target.value); if (e.target.value) setHourChoice(""); }} type="time" value={exactTime} />
                    <fieldset>
                      <legend>{L("자시 기준", "Midnight convention")}</legend>
                      <label><input checked={midnight === "야자시"} name="midnight" onChange={() => setMidnight("야자시")} type="radio" /> {L("야자시 (23시 이후는 다음 날)", "야자시 (after 23:00 counts as next day)")}</label>
                      <label><input checked={midnight === "조자시"} name="midnight" onChange={() => setMidnight("조자시")} type="radio" /> {L("조자시 (자정 기준)", "조자시 (midnight boundary)")}</label>
                    </fieldset>
                  </details>
                </>
              )}

              {step === 4 && (
                <div className="saju-story-choice saju-story-choice-small" role="radiogroup" aria-labelledby="saju-step-label">
                  {FOCUS.map(([value, label]) => (
                    <button aria-checked={focusId === value} key={value} onClick={() => setFocusId(value)} role="radio" type="button">{label}</button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <>
                  <div className="saju-story-pills">
                    {CHIPS[(focusId || "growth") as FocusId].map((chip) => (
                      <button aria-pressed={concern === chip} key={chip} onClick={() => setConcern(chip)} type="button">{chip}</button>
                    ))}
                  </div>
                  <textarea aria-labelledby="saju-step-label" className="saju-story-input saju-story-textarea" id="saju-concern" maxLength={300} onChange={(e) => setConcern(e.target.value)} placeholder={L("예: 언제쯤 돈이 모일까요?", "e.g. When will money settle?")} value={concern} />
                  <label className="check saju-story-consent">
                    <input checked={consent} name="privacyRequired" onChange={(e) => setConsent(e.target.checked)} required type="checkbox" />
                    <span>{L("[필수] 생년월일·출생 시각을 이 기기에서 사주 계산에 쓰는 데 동의합니다. 결제 전에는 서버로 보내지 않아요.", "[Required] I agree to use my birth details on this device to calculate the chart. Nothing is sent before checkout.")}</span>
                  </label>
                </>
              )}
            </div>

            {error && <p className="saju-error" role="alert">{error}</p>}
            <button className="saju-story-next saju-submit" disabled={!current.ok} type="submit">
              {step === steps.length - 1 ? L("무료 풀이 보기 ›", "See my free reading ›") : L("다음 ›", "Next ›")}
            </button>
          </HydrationGate>
        </form>

        <aside className="saju-shop-entry">
          <div><p className="eyebrow">SAJU ACCESSORY</p><h2>{L("내 사주 오행에 맞는 악세서리 방향", "Accessory directions for your Saju phases")}</h2><p>{L("오행별 형태·색·소재 방향을 먼저 비교해 보세요. 물건이 운이나 결과를 바꾸는 것은 아닙니다.", "Compare form, palette, and material directions by phase. An object does not change luck or outcomes.")}</p></div>
          <Link href={`/${locale}/shop#saju-accessory-title`}>{L("사주 추천 악세서리 보기", "See Saju accessory directions")}</Link>
        </aside>
      </main>
    );
  }

  /* ---------------- reader ---------------- */
  const pillars = [
    ["year", chart.year, chart.tenGods.yearStem, chart.tenGods.yearBranch],
    ["month", chart.month, chart.tenGods.monthStem, chart.tenGods.monthBranch],
    ["day", chart.day, null, chart.tenGods.dayBranch],
    ["hour", chart.hour, chart.tenGods.hourStem, chart.tenGods.hourBranch],
  ] as const;
  const chapters = [
    L("서막", "Prologue"),
    L("Ch1. 나의 사주 팔자", "Ch1. My eight characters"),
    L("Ch2. 전생의 업보", "Ch2. Past-life karma"),
    L("Ch3. 사회적 가면", "Ch3. The social mask"),
    L("Ch4. 태령의 복채", "Ch4. The reading fee"),
  ];
  const focusLabel = FOCUS.find(([value]) => value === focusId)?.[1] ?? L("나 자신", "Myself");
  const sealed = [
    L("되풀이되는 약점, 그리고 그 이유", "The weakness that keeps repeating, and why"),
    L(`${focusLabel} — 올해 붙잡아야 할 한 가지`, `${focusLabel} — the one thing to hold this year`),
    L("2026년 흐름과 조심할 시기", "Your 2026 flow and the stretch to be careful"),
    L("잘 될 때 · 보통일 때 · 어려울 때 대처법", "What to do when it goes well, so-so, or badly"),
  ];
  const tiers: readonly (readonly [ProductCode, string, string])[] = [
    ["plus_30d", L("사주 원국 풀이", "Four Pillars reading"), L("원국 · 오행 · 억부/조후/격국 세 관점 해석", "Chart, phases, and three classical viewpoints")],
    ["pro_30d", L("상세 풀이", "Detailed reading"), L("잠긴 4가지 전부 · 질문 직접 답 · 2026년 흐름 · 세 갈래 대처법", "All four sealed items, a direct answer, 2026 flow, three scenarios")],
    ["premium_pdf", L("프리미엄 PDF", "Premium PDF"), L("상세 풀이 전부 + 더 깊은 섹션 · PDF로 소장", "Everything in Detailed plus deeper sections, as a PDF")],
  ];
  const selectedPrice = prices[product];
  const ctaLabel = product === "plus_30d"
    ? L(`원국 풀이 열기 · ${won(selectedPrice)}`, `Open the chart reading · ${won(selectedPrice)}`)
    : L(`복채 ${won(selectedPrice)} 내고 전부 열기`, `Pay ${won(selectedPrice)} and open everything`);

  return (
    <main className="saju-page saju-story" data-stage="reading">
      <header className="saju-story-rhead">
        <Face className="saju-story-mini" src={POSE.front} />
        <div>
          <p className="saju-story-brand">{L("태령당", "Taeryeongdang")}</p>
          <p className="saju-story-chapter">{chapters[chapter]}</p>
        </div>
        <button className="saju-story-restart" onClick={() => { setChart(null); setStep(0); }} type="button">{L("다시 입력", "Start over")}</button>
      </header>

      {chapter === 0 && (
        <article className="saju-story-chapter-body" data-tone="night">
          <p className="saju-story-kicker">PROLOGUE</p>
          <h2 className="saju-story-title">{L(`이 사주는,\n${callName}님의 이야기입니다`, `This chart is\nyour story, ${callName}`)}</h2>
          <p className="saju-story-poem">{L("태어난 그 날, 그 시각의 하늘은\n두 번 오지 않습니다.\n그래서 이 여덟 글자는 세상에 하나뿐입니다.", "The sky of that day and hour\nnever comes twice.\nSo these eight characters are yours alone.")}</p>
          <blockquote className="saju-story-voice">{L("먼저 말씀드립니다. 이것은 맞히기 놀음이 아니라, 한 사람을 읽는 방법입니다. 글자는 제가 짚어드릴 테니, 이야기가 맞는지만 살펴봐 주세요.", "Let me say this first: this is not a guessing game, it's a way of reading a person. I'll point to the characters; you judge whether the story fits.")}</blockquote>
          <p className="saju-story-poem">{L("여덟 글자 가운데\n당신의 주인이 되는 글자,\n하나부터 보여드리겠습니다.", "Of the eight,\nlet me first show you\nthe one that is you.")}</p>
          <div className="saju-story-daycard" data-phase={story.dayMaster.phase}>
            <span className="saju-story-daycard-tag">{L("일간 · 나", "Day master")}</span>
            <b>{story.dayMaster.stem}</b>
            <small>{L(`${story.dayMaster.hangul}${chart.dayMasterPhase} · ${story.dayMaster.image}`, story.dayMaster.image)}</small>
          </div>
          <p className="saju-story-poem saju-story-poem-small">{L("나머지 일곱 글자는 다음 장에서 펼쳐 보이겠습니다.", "The other seven wait in the next chapter.")}</p>
        </article>
      )}

      {chapter === 1 && (
        <article className="saju-story-chapter-body" data-tone="paper">
          <p className="saju-story-poem">{L("여덟 글자를 모두 그렸습니다. 전부 당신의 것입니다.", "All eight are drawn. Every one is yours.")}</p>
          <div className="saju-story-pillars saju-chart">
            {pillars.map(([key, pillar, stemGod]) => {
              const [han, role] = PILLAR_ROLE[locale][key];
              return (
                <div className="saju-story-pillar" data-self={key === "day"} key={key}>
                  <span className="saju-story-pillar-han">{han}</span>
                  <span className="saju-story-pillar-role">{role}</span>
                  {pillar ? (
                    <>
                      <b className="saju-story-glyph">{pillar.stem}</b>
                      <span className="saju-story-god">{key === "day" ? L("본인", "Self") : stemGod}</span>
                      <b className="saju-story-glyph saju-story-glyph-branch">{pillar.branch}</b>
                    </>
                  ) : (
                    <span className="saju-story-empty">{L("시간 모름", "Unknown")}</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="saju-story-caption">{L("위 글자가 하늘의 기운(천간), 아래 글자가 땅의 기운(지지)입니다. 가운데 이름표는 그 글자가 '나'와 어떤 사이인지 알려주는 십성입니다.", "Top: heavenly stems. Bottom: earthly branches. The middle tag is the ten-god relation to you.")}</p>
          {chart.hour === null && <p className="saju-note">{L("태어난 시간을 몰라 시주는 비워두었습니다. 짐작해서 채우지 않습니다.", "No birth time, so the hour pillar stays empty. We don't guess.")}</p>}
          {chart.termBoundaryWarning && <p className="saju-warning" role="status">{chart.termBoundaryWarning}</p>}
          <div className="saju-story-voice-row">
            <Face className="saju-story-avatar" src={POSE.chart} />
            <p>{L("원국은 평생 바뀌지 않습니다. 다만 이 글자들을 어떻게 쓰느냐는 당신의 손에 달려 있습니다.", "The chart never changes. How you use it is up to you.")}</p>
          </div>
          <section className="saju-story-card">
            <h3>{L(`일주 ${chart.day.label} — 나 자신`, `Day pillar ${chart.day.label} — you`)}</h3>
            <p>{L(`태어난 날의 글자입니다. 사주에서 가장 중요한 자리예요. 당신의 중심은 ${story.dayMaster.image}입니다.`, `The characters of your birth day, the most important seat. Your core is ${story.dayMaster.image}.`)}</p>
            <p className="saju-story-inner">{L(`이 자리 아래 글자의 십성: ${chart.tenGods.dayBranch}`, `Ten god below: ${chart.tenGods.dayBranch}`)}</p>
          </section>
          <section className="saju-story-card">
            <h3>{L(`월주 ${chart.month.label} — 사회 속의 나`, `Month pillar ${chart.month.label} — you in society`)}</h3>
            <p>{L("태어난 달의 글자입니다. 일하고 사람을 만날 때 드러나는 모습이 여기서 보입니다. 이 자리는 Ch3에서 더 짚어드립니다.", "The month's characters show how you appear at work and among people. More in Ch3.")}</p>
            <p className="saju-story-inner">{L(`이 자리 위 글자의 십성: ${chart.tenGods.monthStem}`, `Ten god above: ${chart.tenGods.monthStem}`)}</p>
          </section>
          <dl className="saju-facts">
            <div><dt>{L("오행 분포", "Phase balance")}</dt><dd>{Object.entries(chart.phaseBalance).map(([phase, count]) => `${phase} ${num(count)}`).join(" · ")}</dd></div>
            <div><dt>{L("태어난 절기", "Solar term")}</dt><dd>{chart.monthTerm.name} → {chart.nextTerm.name}</dd></div>
          </dl>
        </article>
      )}

      {chapter === 2 && (
        <article className="saju-story-chapter-body" data-tone="ember">
          {!pastReady ? (
            <div className="saju-story-loading" role="status">
              <span className="saju-story-spinner" aria-hidden="true" />
              <b>{L("태령이 전생을 살피는 중입니다…", "Taeryeong is looking into your past life…")}</b>
            </div>
          ) : (
            <>
              <p className="saju-story-hashtag">{story.pastLife.hashtag}</p>
              <p className="saju-story-muted-quote">{L("\"오셨군요. 어디, 한번 살펴보겠습니다.\"", "\"You've come. Let me take a look.\"")}</p>
              <figure className="saju-story-pastlife">
                <Face className="saju-story-pastlife-art" src={POSE.reveal} />
                <figcaption>
                  <span>{L("전생의 모습", "Who you were")}</span>
                  <h2>{story.pastLife.title}</h2>
                </figcaption>
              </figure>
              <p className="saju-story-kicker">KARMA</p>
              <div className="saju-story-prose">
                {story.pastLife.story.map((line) => <p key={line}>{line}</p>)}
                <p>{story.pastLife.echo}</p>
                <p className="saju-story-lesson">{story.pastLife.lesson}</p>
              </div>
              {story.phases.low.map((entry) => (
                <section className="saju-story-phase" data-kind="low" key={`low-${entry.phase}`}>
                  <h3>{L(`부족한 기운 · ${entry.label} ${num(entry.count)}`, `Missing · ${entry.label} (${num(entry.count)})`)}</h3>
                  <p>{entry.meaning}</p>
                  <p className="saju-story-do">{entry.advice}</p>
                </section>
              ))}
              {story.phases.high.map((entry) => (
                <section className="saju-story-phase" data-kind="high" key={`high-${entry.phase}`}>
                  <h3>{L(`넘치는 기운 · ${entry.label} ${num(entry.count)}`, `Overflowing · ${entry.label} (${num(entry.count)})`)}</h3>
                  <p>{entry.meaning}</p>
                  <p className="saju-story-do">{entry.advice}</p>
                </section>
              ))}
              <section className="saju-story-final">
                <h3>{L("그렇다면 어떻게 살아야 할까요?", "So how should you live?")}</h3>
                <p>{story.closing}</p>
              </section>
              <p className="saju-story-fineprint">{L("전생 풀이는 일간의 상징을 이야기로 옮긴 재미 요소입니다. 사실 판정이 아닙니다.", "The past-life chapter turns your day master's symbolism into a story for fun. It is not a factual claim.")}</p>
            </>
          )}
        </article>
      )}

      {chapter === 3 && (
        <article className="saju-story-chapter-body" data-tone="night">
          <p className="saju-story-kicker">SOCIAL MASK</p>
          <h2 className="saju-story-title">{L("사회적 가면", "The social mask")}</h2>
          <p className="saju-story-poem">{L("\"사람들 앞에서는 웃고 있지만,\n속으로는 다른 생각을 하고 계시지요?\"", "\"You smile in front of people,\nbut inside you're thinking something else, aren't you?\"")}</p>
          <section className="saju-story-card" data-tone="outer">
            <p className="saju-story-side">{L("● 남들이 보는 당신", "● How others see you")}</p>
            <h3>{story.mask.outerTitle}</h3>
            <p>{story.mask.outer}</p>
            <div className="saju-story-meter">
              <span>{L("겉과 속의 거리", "Distance between face and heart")}</span>
              <span>{story.mask.score} / 100</span>
              <div className="saju-story-progress"><i style={{ width: `${story.mask.score}%` }} /></div>
            </div>
          </section>
          <section className="saju-story-card" data-tone="inner">
            <p className="saju-story-side">{L("● 가면 뒤의 당신", "● Behind the mask")}</p>
            <p>{story.mask.inner}</p>
          </section>
          <p className="saju-story-fineprint">{L("점수는 월간과 일지의 십성 관계로 계산한 참고 지표입니다.", "The score is a reference index from the month stem and day branch relations.")}</p>
        </article>
      )}

      {chapter === 4 && (
        <article className="saju-story-chapter-body" data-tone="paper" id="saju-fee">
          <Portrait className="saju-story-fee-art" src={POSE.welcome} />
          <p className="saju-story-poem">{L(`"${callName}님, 여기서부터는\n복채를 받고 말씀드리겠습니다."`, `"${callName}, from here on\nI read for a fee."`)}</p>
          <section className="saju-story-found">
            <span className="saju-story-stamp" aria-hidden="true">{L("복채", "FEE")}</span>
            <h2>{L("태령이 당신의 사주에서\n먼저 찾아낸 것 7가지", "Seven things Taeryeong\nfound in your chart")}</h2>
            <p className="saju-story-found-sub">{L("3개는 이미 보여드렸습니다 · 4개는 복채를 받고 열어드립니다", "Three shown already · four open with the fee")}</p>
            <ul className="saju-story-done">
              <li><b>{L("사주 원국 여덟 글자", "Your eight characters")}</b><span className="saju-story-mini-pillars">{pillars.map(([key, pillar]) => <span key={key}>{pillar ? pillar.label : "—"}</span>)}</span></li>
              <li><b>{L(`전생 「${story.pastLife.title}」`, `Past life: ${story.pastLife.title}`)}</b></li>
              <li><b>{L(`겉과 속의 거리 ${story.mask.score}점`, `Mask score ${story.mask.score}`)}</b></li>
            </ul>
            <ul className="saju-story-sealed">
              {sealed.map((item) => <li key={item}><span aria-hidden="true">封</span>{item}</li>)}
            </ul>
            {concern.trim() && (
              <p className="saju-story-asked">{L(`물어보신 것: "${concern.trim()}" — 이 질문의 직접 답은 상세 풀이 첫 장에 담깁니다.`, `You asked: "${concern.trim()}" — the direct answer opens the Detailed reading.`)}</p>
            )}
          </section>

          <h3 className="saju-story-section">{L("어디까지 열어볼까요", "How much to open")}</h3>
          <div className="saju-story-tiers" role="radiogroup" aria-label={L("상품 선택", "Choose a reading")}>
            {tiers.map(([code, title, detail]) => (
              <button aria-checked={product === code} className="saju-story-tier" data-product-option={code} key={code} onClick={() => setProduct(code)} role="radio" type="button">
                <span className="saju-story-tier-dot" aria-hidden="true" />
                <span><b>{title}</b><small>{detail}</small></span>
                <span className="saju-story-tier-price">{won(prices[code])}</span>
              </button>
            ))}
          </div>

          {reviews.length > 0 && (
            <>
              <h3 className="saju-story-section">{L("실제 후기", "Real reviews")}</h3>
              {reviews.slice(0, 3).map((review) => (
                <blockquote className="saju-story-review" key={review.id}>
                  <p>{review.mostUseful}</p>
                  <footer>{review.displayName} · {review.publishedMonth}</footer>
                </blockquote>
              ))}
            </>
          )}

          <h3 className="saju-story-section">{L("자주 묻는 질문", "FAQ")}</h3>
          <details className="saju-story-faq"><summary>{L("정말 맞나요?", "Is it accurate?")}</summary><p>{L("사주를 바탕으로 성향과 흐름을 읽는 풀이예요. 미래를 확정하지 않아요. 무료 챕터를 보고 맞는지 직접 판단해 주세요.", "It reads tendencies and flow from the chart; it does not fix the future. Judge the free chapters yourself.")}</p></details>
          <details className="saju-story-faq"><summary>{L("결제하면 바로 볼 수 있나요?", "Can I read it right after paying?")}</summary><p>{L("결제가 확인되면 풀이가 만들어지고, 주문 화면에서 바로 열 수 있어요.", "Once payment is confirmed, the reading is created and opens from your order page.")}</p></details>
          <details className="saju-story-faq"><summary>{L("입력한 정보는 어디에 쓰이나요?", "Where does my information go?")}</summary><p>{L("결제 전까지는 이 기기 안에서만 계산해요. 결제를 진행하면 풀이를 만드는 데만 써요.", "Until checkout it stays on this device. At checkout it is used only to create your reading.")}</p></details>

          <div className="saju-story-paybar">
            <p>{L("아직 보지 못한 풀이 4개가 이 버튼 뒤에 있습니다", "Four readings you haven't seen are behind this button")}</p>
            <button className="saju-story-next" onClick={checkout} type="button"><span aria-hidden="true">開</span> {ctaLabel}</button>
            <small>{L("다음 화면에서 결제 수단을 고르고 결제해요.", "Choose a payment method on the next screen.")}</small>
          </div>
          <p className="saju-limits">{L("이 풀이는 상징적 자기 성찰 도구이며 의료·법률·투자 판단을 대신하지 않습니다.", "This is a symbolic self-reflection tool and does not replace medical, legal, or financial advice.")}</p>
        </article>
      )}

      {chapter >= 1 && chapter <= 3 && (
        <div className="saju-story-stickycta">
          <button className="saju-story-next" onClick={() => goChapter(4)} type="button"><span aria-hidden="true">開</span> {L("잠긴 풀이 4개 + 전부 열기", "Open the 4 sealed readings")}</button>
        </div>
      )}

      <nav className="saju-story-nav" aria-label={L("챕터 이동", "Chapters")}>
        <button onClick={() => setTocOpen(true)} type="button">{L("목차", "Contents")}</button>
        <button aria-label={L("이전 챕터", "Previous chapter")} disabled={chapter === 0} onClick={() => goChapter(chapter - 1)} type="button">‹</button>
        <span className="saju-story-nav-count">{chapter + 1} / {chapters.length}<i style={{ width: `${((chapter + 1) / chapters.length) * 100}%` }} /></span>
        <button aria-label={L("다음 챕터", "Next chapter")} disabled={chapter === chapters.length - 1} onClick={() => goChapter(chapter + 1)} type="button">›</button>
      </nav>

      {tocOpen && (
        <div className="saju-story-toc" onClick={(event) => { if (event.target === event.currentTarget) setTocOpen(false); }} role="presentation">
          <div aria-label={L("목차", "Contents")} className="saju-story-toc-sheet" role="dialog">
            <h2>{L("목차", "Contents")}</h2>
            <ol>
              {chapters.map((title, index) => (
                <li key={title}><button onClick={() => goChapter(index)} type="button"><span>{title}</span><small>{index === 4 ? L("복채", "Fee") : L("무료", "Free")}</small></button></li>
              ))}
            </ol>
            <button className="saju-story-toc-close" onClick={() => setTocOpen(false)} type="button">{L("닫기", "Close")}</button>
          </div>
        </div>
      )}
    </main>
  );
}
