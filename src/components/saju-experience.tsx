"use client";

import { HydrationGate } from "./hydration-gate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { captureConversionEvent } from "@/core/analytics";
import {
  SajuInputError,
  buildHarangFreeReading,
  buildSajuChart,
  buildSajuStory,
  type HarangFreeReading,
  type SajuChart,
  type SajuStoryReading,
} from "@/core/saju";
import { HARANG_IMAGES, HARANG_LINES } from "@/core/characters/harang";
import { MIN_BIRTH_DATE, currentMaxBirthDate, isAcceptedBirthDate } from "@/core/birth-range";
import type { PublicReview } from "@/core/reviews";
import type { ProductPriceSet } from "@/core/product-prices";
import type { Locale } from "@/i18n/config";
import styles from "./saju-experience.module.css";
import { createFreeConcernReading } from "@/core/free-concern-reading";
import { FreeConcernReadingCard } from "./free-concern-reading";

/**
 * The 사주 menu as a guided story.
 *
 * Six short questions, one per screen, asked by 하랑 법사. Then six free chapters built
 * from the chart and birth-date numbers the engines compute in the browser (nothing
 * personal is sent anywhere until checkout), and a last chapter that names what the paid
 * readings add and hands the same checkout draft to /plans that the rest of the site uses.
 *
 * Voice (owner's guide, 2026-10): the visitor is "님", 하랑 is "저", polite and a little
 * sly. One joke per visit at most, never inside a reading or on the fee screen.
 *
 * Conversion devices are kept honest on purpose: every number shown is either the
 * visitor's own chart or a real count passed in from the server, reviews are the
 * published ones only, and there is no countdown or invented "people paying now" figure.
 */

type FocusId = "work" | "relationships" | "health" | "growth" | "money";
type ProductCode = "plus_30d" | "pro_30d" | "premium_pdf";

const POSE = {
  front: HARANG_IMAGES.face,
  welcome: HARANG_IMAGES.bust,
  chart: HARANG_IMAGES.result,
  reveal: HARANG_IMAGES.base,
  loading: HARANG_IMAGES.loading,
  ahem: HARANG_IMAGES.ahem,
  sigh: HARANG_IMAGES.sigh,
  fee: HARANG_IMAGES.fee,
  soft: HARANG_IMAGES.soft,
  smile: HARANG_IMAGES.smile,
} as const;

/** Chapter positions. The fee chapter is always last. */
const CH = { prologue: 0, chart: 1, youth: 2, numbers: 3, past: 4, mask: 5, fee: 6 } as const;

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

/** A bust or face cut, cropped to fill small round and square slots. */
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
  const tracked = useRef(new Set<string>());

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
  const extra: HarangFreeReading | null = useMemo(() => (chart ? buildHarangFreeReading(chart, locale) : null), [chart, locale]);
  const concernReading = useMemo(() => chart ? createFreeConcernReading({ locale, focusId: focusId || "growth", concern }) : null, [chart, locale, focusId, concern]);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  const callName = name.trim() ? L(`${name.trim()}님`, name.trim()) : L("손님", "you");
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
      say: L(`${HARANG_LINES.welcome}\n먼저 어떻게 불러드리면 될까요?`, "Welcome. What is on your mind?\nWhat should I call you?"),
      accent: L("기본 풀이는 무료예요.", "The basic reading is free."),
      label: L("이름", "Name"),
      help: L("별명도 괜찮아요. 비워두시면 ‘손님’으로 불러드려요.", "A nickname is fine. Leave it blank and I'll call you 'guest'."),
      ok: true,
    },
    {
      say: L(`${callName}, 반가워요. 하랑이에요.\n성별을 알려주시면 전통 사주의 대운 방향을 정할 수 있어요.`, `Nice to meet you${name.trim() ? `, ${name.trim()}` : ""}. I'm Harang.\nYour sex sets the traditional direction of the ten-year cycles.`),
      label: L("성별", "Sex"),
      help: L("대운의 방향을 정하는 데만 씁니다.", "Used only to set the direction of your luck cycles."),
      ok: sex !== "",
    },
    {
      say: L(`${HARANG_LINES.birthDate}\n그 하루에 네 기둥, 여덟 글자가 다 들어 있습니다.`, "Tell me the day you were born, and I'll find that day's sky first.\nFour pillars and eight characters live in that one day."),
      label: L("생년월일 (양력)", "Date of birth (solar)"),
      help: L("음력 생일은 아직 못 받습니다. 양력으로 바꿔서 넣어주세요.", "Lunar dates aren't supported yet; please enter the solar date."),
      ok: isAcceptedBirthDate(birthDate),
    },
    {
      say: L("태어난 시간도 아세요?\n모르는 시간은 비워두고 볼게요.", "Do you know your birth time?\nIt's fine if not. An unknown hour stays empty."),
      label: L("태어난 시간", "Birth time"),
      help: L("모르시면 ‘시간 모름’을 골라주세요.", "Choose 'Unknown' if you don't know."),
      ok: hourChoice !== "" || exactTime !== "",
    },
    {
      say: L("요즘 어떤 일이 가장 궁금하세요?\n하나만 골라주시면 거기부터 볼게요.", "What is on your mind most?\nPick one and we’ll start there."),
      label: L("관심 분야", "Focus"),
      help: L("무료 첫 안내부터 이 분야에 맞춰 볼게요.", "Your free guidance starts with this area."),
      ok: focusId !== "",
    },
    {
      say: L("마지막이에요.\n정말 묻고 싶은 걸 한 줄로 적어주세요.", "Last one.\nWrite, in one line, what you really want to ask."),
      accent: L("한 가지 상황을 떠올리면, 나에게 맞는 부분을 살펴보기 쉬워요.", "Think of one situation. It can help you reflect on the parts that fit your life."),
      label: L("궁금한 것", "Your question"),
      help: L("예시를 누르거나 직접 적어주세요. 비워두면 전체 흐름으로 봐요.", "Tap a chip or write your own. Leave it blank for the overall flow."),
      ok: consent,
    },
  ] as const;
  const current = steps[step]!;

  useEffect(() => {
    if (chapter !== CH.past || pastReady) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPastReady(true), reduced ? 0 : 1400);
    return () => window.clearTimeout(timer);
  }, [chapter, pastReady]);

  function goChapter(next: number) {
    if (next === CH.fee && !tracked.current.has("paid_teaser_view")) {
      tracked.current.add("paid_teaser_view");
      captureConversionEvent("paid_teaser_view", locale, { concern: focusId || "growth" });
    }
    setChapter(Math.max(0, Math.min(CH.fee, next)));
    setTocOpen(false);
    window.scrollTo({ top: 0 });
  }

  function next() {
    if (!current.ok) return;
    if (!tracked.current.has("free_start")) {
      tracked.current.add("free_start");
      captureConversionEvent("free_start", locale, { surface: "saju" });
    }
    if (step === 2 && !tracked.current.has("birth_input_complete")) {
      tracked.current.add("birth_input_complete");
      captureConversionEvent("birth_input_complete", locale, { surface: "saju" });
    }
    if (step === 4) captureConversionEvent("concern_selected", locale, { concern: focusId || "growth", surface: "saju" });
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
      captureConversionEvent("free_result_view", locale, { concern: focusId || "growth" });
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
    captureConversionEvent("paid_teaser_click", locale, { concern: focus });
    captureConversionEvent("product_select", locale, { productCode: product, location: "product_card" });
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

  async function share() {
    // Only the page address is shared. The visitor's chart stays on this device.
    const url = new URL(`/${locale}/saju`, window.location.href).toString();
    const title = L("하랑 법사의 사주", "Saju with Harang");
    const text = L("하랑 법사가 사주 여덟 글자로 짚어주는 무료 풀이예요.", "A free Saju reading from your eight characters, by Harang.");
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareStatus("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setShareStatus("failed");
    }
  }

  /* ---------------- intake ---------------- */
  if (!chart || !story) {
    return (
      <main className={`saju-page saju-story ${styles.shell}`} data-stage="intake">
        <header className="saju-story-hero saju-intake-heading">
          <Link href={`/${locale}`} className="saju-intake-home">{L("← 홈", "← Home")}</Link>
          <Portrait className="saju-story-hero-portrait" src={POSE.front} />
          <div><p className="saju-story-edition">結 GYEOL · {L("하랑 법사", "HARANG")}</p>
          <h1>{L("내 이야기, 하나씩 풀어봐요.", "Your story, one step at a time.")}</h1>
          <p>{L("간단히 답하고 무료 풀이부터 읽어보세요.", "Answer a few questions, then read the free chapters.")}</p></div>
        </header>

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
              <p className="saju-story-bubble" role="status" aria-live="polite">
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
                    <button aria-checked={focusId === value} key={value} onClick={() => { if (focusId && CHIPS[focusId].includes(concern)) setConcern(""); setFocusId(value); }} role="radio" type="button">{label}</button>
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
                  <textarea aria-labelledby="saju-step-label" className="saju-story-input saju-story-textarea" id="saju-concern" maxLength={300} onChange={(e) => setConcern(e.target.value)} placeholder={`${L("예: ", "e.g. ")}${CHIPS[(focusId || "growth") as FocusId][0]}`} value={concern} />
                  <label className="check saju-story-consent">
                    <input checked={consent} name="privacyRequired" onChange={(e) => setConsent(e.target.checked)} required type="checkbox" />
                    <span>{L("[필수] 생년월일·출생 시각을 이 기기에서 사주 계산에 쓰는 데 동의합니다. 결제 전에는 서버로 보내지 않습니다.", "[Required] I agree to use my birth details on this device to calculate the chart. Nothing is sent before checkout.")}</span>
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
          <div><p className="eyebrow">SAJU ACCESSORY</p><h2>{L("님 오행에 맞는 장신구 방향", "Accessory directions for your Saju phases")}</h2><p>{L("오행별 모양·색·소재 방향을 먼저 비교해 보세요. 물건 하나로 운이나 결과가 바뀌지는 않습니다. 그건 제가 장담 못 합니다.", "Compare form, palette, and material directions by phase. An object does not change luck or outcomes.")}</p></div>
          <Link href={`/${locale}/shop#saju-accessory-title`}>{L("사주 추천 장신구 보기", "See Saju accessory directions")}</Link>
        </aside>
      </main>
    );
  }

  if (concernReading?.scope === "safety") {
    return <main className={`saju-page saju-story ${styles.shell}`} data-stage="safety">
      <FreeConcernReadingCard reading={concernReading} locale={locale} />
      <button className="saju-story-restart" onClick={() => { setChart(null); setStep(5); }} type="button">{L("질문 다시 입력하기", "Edit your question")}</button>
    </main>;
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
    L("Ch2. 어린 날과 보는 눈", "Ch2. Childhood and the way you look"),
    L("Ch3. 숫자로 본 나", "Ch3. Your numbers"),
    L("Ch4. 전생의 업보", "Ch4. Past-life karma"),
    L("Ch5. 사회적 가면", "Ch5. The social mask"),
    L("Ch6. 하랑의 복채", "Ch6. The reading fee"),
  ];
  const focusLabel = FOCUS.find(([value]) => value === focusId)?.[1] ?? L("나 자신", "Myself");
  const sealed = [
    L("되풀이되는 약점, 그리고 그 이유", "The weakness that keeps repeating, and why"),
    L(`${focusLabel} — 올해 붙잡아야 할 한 가지`, `${focusLabel} — the one thing to hold this year`),
    L("2026년 흐름과 조심할 시기", "Your 2026 flow and the stretch to be careful"),
    L("잘 될 때 · 보통일 때 · 어려울 때 대처법", "What to do when it goes well, so-so, or badly"),
  ];
  const tiers: readonly (readonly [ProductCode, string, string])[] = [
    ["pro_30d", L("기본 상세 리딩", "Detailed reading"), L("잠긴 4가지 전부 · 질문 직접 답 · 2026년 흐름 · 세 갈래 대처법", "All four sealed items, a direct answer, 2026 flow, three scenarios")],
    ["premium_pdf", L("고급 심화 리딩", "In-depth reading"), L("기본 상세 리딩 전부 + 더 깊은 섹션 · PDF로 소장", "Everything in Detailed plus deeper sections, as a PDF")],
    ["plus_30d", L("사주 원국 풀이만", "Four Pillars chart only"), L("원국 · 오행 · 억부/조후/격국 세 관점 해석", "Chart, phases, and three classical viewpoints")],
  ];
  const selectedPrice = prices[product];
  const ctaLabel = product === "plus_30d"
    ? L(`원국 풀이 열기 · ${won(selectedPrice)}`, `Open the chart reading · ${won(selectedPrice)}`)
    : L(`복채 ${won(selectedPrice)} 내고 전부 열기`, `Pay ${won(selectedPrice)} and open everything`);

  return (
    <main className={`saju-page saju-story ${styles.shell}`} data-stage="reading">
      <header className="saju-story-rhead">
        <Face className="saju-story-mini" src={POSE.front} />
        <div>
          <p className="saju-story-brand">{L("하랑 법사", "Harang")}</p>
          <p className="saju-story-chapter">{chapters[chapter]}</p>
        </div>
        <button className="saju-story-restart" onClick={() => { setChart(null); setStep(0); setShareStatus("idle"); }} type="button">{L("다시 입력", "Start over")}</button>
      </header>

      {chapter === CH.prologue && (
        <article className="saju-story-chapter-body" data-tone="night">
          {concernReading && <FreeConcernReadingCard reading={concernReading} locale={locale} />}
          <p className="saju-story-kicker">PROLOGUE</p>
          <h2 className="saju-story-title">{L(`이 사주는,\n${callName}의 이야기입니다`, "This chart tells\nyour story.")}</h2>
          <p className="saju-story-poem">{L("태어난 그 날, 그 시각의 하늘은\n두 번 오지 않습니다.\n그래서 이 여덟 글자는 세상에 하나뿐입니다.", "The sky of that day and hour\nnever comes twice.\nSo these eight characters are yours alone.")}</p>
          <blockquote className="saju-story-voice">{L("먼저 말씀드립니다. 이건 맞히기 놀음이 아니라 한 사람을 읽는 방법입니다. 글자는 제가 짚을 테니, 이야기가 맞는지는 님이 판단해 주세요. 틀리면 틀렸다고 하셔도 됩니다.", "Let me say this first: this is not a guessing game, it's a way of reading a person. I'll point to the characters; you judge whether the story fits.")}</blockquote>
          <p className="saju-story-poem">{L(`${HARANG_LINES.freeIntro}\n여덟 글자 가운데 님의 주인이 되는 글자,\n그것부터 보여드리겠습니다.`, "Let me start light, with something you've half noticed.\nOf the eight, here is\nthe one that is you.")}</p>
          <div className="saju-story-daycard" data-phase={story.dayMaster.phase}>
            <span className="saju-story-daycard-tag">{L("일간 · 나", "Day master")}</span>
            <b>{story.dayMaster.stem}</b>
            <small>{L(`${story.dayMaster.hangul}${chart.dayMasterPhase} · ${story.dayMaster.image}`, story.dayMaster.image)}</small>
          </div>
          <p className="saju-story-poem saju-story-poem-small">{L("나머지 일곱 글자는 다음 장에서 펼쳐 보이겠습니다.", "The other seven wait in the next chapter.")}</p>
        </article>
      )}

      {chapter === CH.chart && (
        <article className="saju-story-chapter-body" data-tone="paper">
          <p className="saju-story-poem">{L("여덟 글자를 다 그렸습니다. 전부 님의 것입니다.", "All eight are drawn. Every one is yours.")}</p>
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
          <p className="saju-story-caption">{L("위 글자가 하늘의 기운(천간), 아래 글자가 땅의 기운(지지)입니다. 가운데 이름표는 그 글자가 님과 어떤 사이인지 알려주는 십성입니다.", "Top: heavenly stems. Bottom: earthly branches. The middle tag is the ten-god relation to you.")}</p>
          {chart.hour === null && <p className="saju-note">{L("태어난 시간을 몰라 시주는 비워두었습니다. 짐작해서 채우지 않습니다.", "No birth time, so the hour pillar stays empty. We don't guess.")}</p>}
          {chart.termBoundaryWarning && <p className="saju-warning" role="status">{chart.termBoundaryWarning}</p>}
          <div className="saju-story-voice-row">
            <Face className="saju-story-avatar" src={POSE.chart} />
            <p>{L("원국은 평생 안 바뀝니다. 다만 이 글자를 어떻게 쓰느냐는 님 손에 달려 있습니다. 그건 제가 대신 못 해드립니다.", "The chart never changes. How you use it is up to you; that part I can't do for you.")}</p>
          </div>
          <section className="saju-story-card">
            <h3>{L(`일주 ${chart.day.label} — 나 자신`, `Day pillar ${chart.day.label} — you`)}</h3>
            <p>{L(`태어난 날의 글자입니다. 사주에서 가장 중요한 자리지요. 님의 중심은 ${story.dayMaster.image}입니다.`, `The characters of your birth day, the most important seat. Your core is ${story.dayMaster.image}.`)}</p>
            <p className="saju-story-inner">{L(`이 자리 아래 글자의 십성: ${chart.tenGods.dayBranch}`, `Ten god below: ${chart.tenGods.dayBranch}`)}</p>
          </section>
          <section className="saju-story-card">
            <h3>{L(`월주 ${chart.month.label} — 사회 속의 나`, `Month pillar ${chart.month.label} — you in society`)}</h3>
            <p>{L("태어난 달의 글자입니다. 일하고 사람을 만날 때 드러나는 모습이 여기서 보입니다. 이 자리는 Ch5에서 더 짚어드립니다.", "The month's characters show how you appear at work and among people. More in Ch5.")}</p>
            <p className="saju-story-inner">{L(`이 자리 위 글자의 십성: ${chart.tenGods.monthStem}`, `Ten god above: ${chart.tenGods.monthStem}`)}</p>
          </section>
          <dl className="saju-facts">
            <div><dt>{L("오행 분포", "Phase balance")}</dt><dd>{Object.entries(chart.phaseBalance).map(([phase, count]) => `${phase} ${num(count)}`).join(" · ")}</dd></div>
            <div><dt>{L("태어난 절기", "Solar term")}</dt><dd>{chart.monthTerm.name} → {chart.nextTerm.name}</dd></div>
          </dl>
        </article>
      )}

      {chapter === CH.youth && extra && (
        <article className="saju-story-chapter-body" data-tone="night">
          <p className="saju-story-kicker">CHILDHOOD</p>
          <h2 className="saju-story-title">{L("어린 날의 님", "You, as a child")}</h2>
          <div className="saju-story-voice-row">
            <Face className="saju-story-avatar" src={POSE.soft} />
            <p>{L("연주와 월주에는 어린 시절이 담깁니다. 어떤 집에서 어떤 눈치를 보며 컸는지, 세 토막으로 짚어보겠습니다.", "The year and month pillars hold childhood. Let me read it in three parts.")}</p>
          </div>
          <ol className="saju-story-stages">
            {extra.childhood.stages.map((stage) => (
              <li key={stage.ages}><b>{stage.ages}</b><p>{stage.body}</p></li>
            ))}
          </ol>
          <p className="saju-story-evidence">{extra.childhood.evidence}</p>

          <p className="saju-story-kicker saju-story-kicker-gap">THE WAY YOU LOOK</p>
          <section className="saju-story-card" data-tone="outer">
            <p className="saju-story-side">{L("● 사물을 보는 눈", "● How you see things")}</p>
            <h3>{extra.lens.title}</h3>
            <p>{extra.lens.body}</p>
            <p className="saju-story-poke"><span aria-hidden="true">🎯</span>{extra.lens.poke}</p>
            <p className="saju-story-do">{extra.lens.fix}</p>
          </section>
          <p className="saju-story-evidence">{extra.lens.evidence}</p>
        </article>
      )}

      {chapter === CH.numbers && extra && (
        <article className="saju-story-chapter-body" data-tone="paper">
          <p className="saju-story-kicker">NUMBERS</p>
          <h2 className="saju-story-title">{L("숫자로 본 나", "Your numbers")}</h2>
          <p className="saju-story-poem">{L(`${callName} 생년월일이 참 곱습니다.\n숫자인데도 곱다는 게 이상하죠.`, "Your birth date is a lovely one.\nOdd thing to say about numbers, I know.")}</p>
          <dl className="saju-story-numbers">
            <div data-main="true"><dt>{L("운명수", "Life path")}</dt><dd>{extra.numbers.lifePath.value}</dd><small>{extra.numbers.lifePath.formula}</small></div>
            <div><dt>{L("생일수", "Birthday")}</dt><dd>{extra.numbers.birthday.value}</dd><small>{extra.numbers.birthday.formula}</small></div>
            <div><dt>{L("태도수", "Attitude")}</dt><dd>{extra.numbers.attitude.value}</dd><small>{extra.numbers.attitude.formula}</small></div>
          </dl>
          <section className="saju-story-card">
            <h3>{L(`운명수 ${extra.numbers.lifePath.value} · ${extra.numbers.title}`, `Life path ${extra.numbers.lifePath.value} · ${extra.numbers.title}`)}</h3>
            <p>{extra.numbers.body}</p>
            <p className="saju-story-poke"><span aria-hidden="true">🎯</span>{extra.numbers.poke}</p>
            <p className="saju-story-do">{extra.numbers.fix}</p>
          </section>
          <p className="saju-story-evidence">{extra.numbers.evidence}</p>
          <p className="saju-story-fineprint">{L("수비학은 생년월일 숫자를 상징으로 읽는 자기 성찰 도구입니다. 예언이 아닙니다.", "Numerology reads birth-date digits as symbols for reflection. It is not a prediction.")}</p>
        </article>
      )}

      {chapter === CH.past && (
        <article className="saju-story-chapter-body" data-tone="ember">
          {!pastReady ? (
            <div className="saju-story-loading" role="status">
              <span className="saju-story-spinner" aria-hidden="true" />
              <Face className="saju-story-avatar saju-story-loading-face" src={POSE.loading} />
              <b>{L("하랑 법사가 전생을 살피는 중입니다…", "Harang is looking into your past life…")}</b>
              <span className="saju-story-aside">
                <Face className="saju-story-mini" src={POSE.ahem} />
                <small>{L("비 오는 날엔 파전이 점괘보다 정확한데… 흠흠. 방금 건 못 들은 걸로 해주세요.", "On rainy days a pancake beats any oracle… ahem. Forget I said that.")}</small>
              </span>
            </div>
          ) : (
            <>
              <p className="saju-story-hashtag">{story.pastLife.hashtag}</p>
              <p className="saju-story-muted-quote">{L("\"찾았습니다. 어디, 한번 들어보시지요.\"", "\"Found it. Have a listen.\"")}</p>
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
                <h3>{L("그래서 이렇게 하면 됩니다", "So here's what to do")}</h3>
                <p>{story.closing}</p>
              </section>
              <p className="saju-story-evidence">{L(`📐 근거: 전생 = 일간 ${chart.dayMaster}의 상징 · 부족/넘치는 기운 = 오행 분포(지장간 포함)`, `📐 Basis: past life = day master ${chart.dayMaster} symbolism · missing/overflowing = phase balance (hidden stems included)`)}</p>
              <p className="saju-story-fineprint">{L("전생 풀이는 일간의 상징을 이야기로 옮긴 재미 요소입니다. 사실 판정이 아닙니다.", "The past-life chapter turns your day master's symbolism into a story for fun. It is not a factual claim.")}</p>
            </>
          )}
        </article>
      )}

      {chapter === CH.mask && (
        <article className="saju-story-chapter-body" data-tone="night">
          <p className="saju-story-kicker">SOCIAL MASK</p>
          <h2 className="saju-story-title">{L("사회적 가면", "The social mask")}</h2>
          <p className="saju-story-poem">{L("\"사람들 앞에서는 웃고 있지만,\n속으로는 다른 생각을 하고 계시지요?\"", "\"You smile in front of people,\nbut inside you're thinking something else, aren't you?\"")}</p>
          <section className="saju-story-card" data-tone="outer">
            <p className="saju-story-side">{L("● 남들이 보는 님", "● How others see you")}</p>
            <h3>{story.mask.outerTitle}</h3>
            <p>{story.mask.outer}</p>
            <div className="saju-story-meter">
              <span>{L("겉과 속의 거리", "Distance between face and heart")}</span>
              <span>{story.mask.score} / 100</span>
              <div className="saju-story-progress"><i style={{ width: `${story.mask.score}%` }} /></div>
            </div>
          </section>
          <section className="saju-story-card" data-tone="inner">
            <p className="saju-story-side">{L("● 가면 뒤의 님", "● Behind the mask")}</p>
            <p>{story.mask.inner}</p>
          </section>
          <p className="saju-story-evidence">{L(`📐 근거: 겉 = 월간 ${chart.month.stem}(${chart.tenGods.monthStem}) · 속 = 일지 ${chart.day.branch}(${chart.tenGods.dayBranch}) · 점수 = 52에서 드러난 천간 십성마다 가감, 겉과 속 계열이 다르면 +6 (35~92)`, `📐 Basis: outer = month stem ${chart.month.stem} (${chart.tenGods.monthStem}) · inner = day branch ${chart.day.branch} (${chart.tenGods.dayBranch}) · score starts at 52, adjusted per visible stem ten god, +6 when outer and inner differ (35–92)`)}</p>
          <section className="saju-story-share">
            <Face className="saju-story-avatar" src={POSE.smile} />
            <div>
              <p>{L(HARANG_LINES.share, "Someone came to mind just now, didn't they? Show them too.")}</p>
              <button onClick={() => void share()} type="button">{L("이 풀이 보여주기", "Share this reading")}</button>
              <small aria-live="polite">{shareStatus === "shared" ? L("공유 창을 열었습니다.", "Share menu opened.") : shareStatus === "copied" ? L("링크를 복사했습니다. 생년월일은 담기지 않습니다.", "Link copied. Your birth details are not included.") : shareStatus === "failed" ? L("공유하지 못했습니다. 잠시 뒤 다시 눌러주세요.", "Couldn't share. Try again in a moment.") : L("링크에는 님의 생년월일이 담기지 않습니다.", "The link does not include your birth details.")}</small>
            </div>
          </section>
        </article>
      )}

      {chapter === CH.fee && (
        <article className="saju-story-chapter-body" data-tone="paper" id="saju-fee">
          <Portrait className="saju-story-fee-art" src={POSE.fee} />
          <p className="saju-story-poem">{L(`"${callName}, ${HARANG_LINES.fee}"`, '"From here, the reading is paid.\nCheck the added content and price first."')}</p>
          <section className="saju-story-found">
            <span className="saju-story-stamp" aria-hidden="true">{L("복채", "FEE")}</span>
            <h2>{L("하랑이 님의 사주에서\n먼저 찾아낸 것 9가지", "Nine things Harang\nfound in your chart")}</h2>
            <p className="saju-story-found-sub">{L("5개는 이미 보여드렸습니다 · 4개는 복채를 받고 열어드립니다", "Five shown already · four open with the fee")}</p>
            <ul className="saju-story-done">
              <li><b>{L("사주 원국 여덟 글자", "Your eight characters")}</b><span className="saju-story-mini-pillars">{pillars.map(([key, pillar]) => <span key={key}>{pillar ? pillar.label : "—"}</span>)}</span></li>
              {extra && <li><b>{L(`보는 눈 「${extra.lens.title}」`, `The way you look: ${extra.lens.title}`)}</b></li>}
              {extra && <li><b>{L(`운명수 ${extra.numbers.lifePath.value} 「${extra.numbers.title}」`, `Life path ${extra.numbers.lifePath.value}: ${extra.numbers.title}`)}</b></li>}
              <li><b>{L(`전생 「${story.pastLife.title}」`, `Past life: ${story.pastLife.title}`)}</b></li>
              <li><b>{L(`겉과 속의 거리 ${story.mask.score}점`, `Mask score ${story.mask.score}`)}</b></li>
            </ul>
            <ul className="saju-story-sealed">
              {sealed.map((item) => <li key={item}><span aria-hidden="true">封</span>{item}</li>)}
            </ul>
            {concern.trim() && (
              <p className="saju-story-asked">{L(`물어보신 것: "${concern.trim()}" — 이 질문의 직접 답은 기본 상세 리딩 첫 장에 담습니다.`, `You asked: "${concern.trim()}" — the direct answer opens the Detailed reading.`)}</p>
            )}
          </section>

          <h3 className="saju-story-section">{L("어디까지 열어보시겠습니까", "How much to open")}</h3>
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
          <details className="saju-story-faq"><summary>{L("정말 맞습니까?", "Is it accurate?")}</summary><p>{L("사주를 바탕으로 성향과 흐름을 읽는 풀이입니다. 미래를 정해드리지는 않습니다. 무료 장을 보시고 맞는지 직접 판단해 주세요.", "It reads tendencies and flow from the chart; it does not fix the future. Judge the free chapters yourself.")}</p></details>
          <details className="saju-story-faq"><summary>{L("결제하면 바로 볼 수 있습니까?", "Can I read it right after paying?")}</summary><p>{L("결제가 확인되면 풀이가 만들어지고, 주문 화면에서 바로 여실 수 있습니다.", "Once payment is confirmed, the reading is created and opens from your order page.")}</p></details>
          <details className="saju-story-faq"><summary>{L("입력한 정보는 어디에 쓰입니까?", "Where does my information go?")}</summary><p>{L("결제 전까지는 이 기기 안에서만 계산합니다. 결제를 진행하시면 풀이를 만드는 데만 씁니다.", "Until checkout it stays on this device. At checkout it is used only to create your reading.")}</p></details>

          <div className="saju-story-paybar">
            <p>{L("아직 못 보신 풀이 4개가 이 버튼 뒤에 있습니다", "Four readings you haven't seen are behind this button")}</p>
            <button className="saju-story-next" onClick={checkout} type="button"><span aria-hidden="true">開</span> {ctaLabel}</button>
            <small>{L("다음 화면에서 결제 수단을 고르고 결제하시면 됩니다.", "Choose a payment method on the next screen.")}</small>
          </div>
          <p className="saju-story-farewell">{L(HARANG_LINES.farewell, "That's enough for tonight. The moon is still high; come find me first next time.")}</p>
          <p className="saju-limits">{L("이 풀이는 상징적 자기 성찰 도구이며 의료·법률·투자 판단을 대신하지 않습니다.", "This is a symbolic self-reflection tool and does not replace medical, legal, or financial advice.")}</p>
        </article>
      )}

      {chapter >= CH.chart && chapter < CH.fee && (
        <div className="saju-story-stickycta">
          <button className="saju-story-next" onClick={() => goChapter(CH.fee)} type="button"><span aria-hidden="true">開</span> {L("잠긴 풀이 4개 + 전부 열기", "Open the 4 sealed readings")}</button>
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
                <li key={title}><button onClick={() => goChapter(index)} type="button"><span>{title}</span><small>{index === CH.fee ? L("복채", "Fee") : L("무료", "Free")}</small></button></li>
              ))}
            </ol>
            <button className="saju-story-toc-close" onClick={() => setTocOpen(false)} type="button">{L("닫기", "Close")}</button>
          </div>
        </div>
      )}
    </main>
  );
}
