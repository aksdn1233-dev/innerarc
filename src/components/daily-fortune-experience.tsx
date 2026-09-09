"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearDailyFortunePreference,
  createDailyFortune,
  isValidMonthDay,
  loadDailyFortunePreference,
  localDateKey,
  saveDailyFortunePreference,
  type DailyFortuneResult,
} from "@/core/daily-fortune";
import { getNumerologyGuide } from "@/core/numerology-guides";
import type { Locale } from "@/i18n/config";
import styles from "./daily-fortune-experience.module.css";

const copy = {
  ko: {
    brand: "결 오늘의 흐름",
    back: "사주 메뉴",
    eyebrow: "하루 한 번 · 무료",
    title: "오늘의 선택을 짧게 점검해보세요",
    intro: "생일의 월·일과 오늘 날짜를 조합해 하루의 성찰 주제를 보여드립니다. 같은 날에는 같은 결과가 유지됩니다.",
    month: "태어난 달",
    day: "태어난 날",
    placeholder: "선택",
    privacy: "월·일은 이 브라우저에서만 계산됩니다. ‘매일 업데이트 켜기’를 누를 때만 이 기기에 저장하며 서버나 외부 서비스로 보내지 않습니다.",
    privacyCheck: "개인정보 처리 안내를 확인했습니다. (필수)",
    view: "오늘만 보기",
    enable: "매일 업데이트 켜기",
    disable: "매일 업데이트 끄기",
    enabled: "매일 업데이트가 켜져 있습니다. 이 페이지를 열면 현지 날짜 기준으로 새 흐름을 보여드립니다.",
    disabled: "기기 저장을 껐습니다. 현재 화면의 결과는 페이지를 닫거나 새로고침하면 사라집니다.",
    invalid: "실제 생일의 월과 일을 선택하고 개인정보 안내를 확인해 주세요.",
    resultEyebrow: "오늘의 개인 흐름",
    action: "오늘의 작은 행동",
    caution: "주의해서 볼 점",
    question: "오늘의 질문",
    evidence: "계산 근거",
    evidenceBody: "개인연도 → 개인월 → 개인일 순서로 각 값을 한 자리 수로 줄였습니다.",
    localTime: "기기 현지 날짜 기준",
    disclaimer: "오늘의 흐름은 생년월일 패턴 상징을 활용한 자기 성찰 도구입니다. 미래를 예측하거나 결과를 보장하지 않으며 의료·법률·금융 등 전문가의 조언을 대신하지 않습니다.",
  },
  en: {
    brand: "태령당 Daily Flow",
    back: "Saju menu",
    eyebrow: "Once a day · Free",
    title: "Pause for a short reflection on today's choices",
    intro: "Your birth month and day are combined with today's date to form one reflection theme. The result stays the same throughout the day.",
    month: "Birth month",
    day: "Birth day",
    placeholder: "Choose",
    privacy: "The month and day are calculated only in this browser. They are saved on this device only when you choose daily updates and are never sent to a server or outside service.",
    privacyCheck: "I have read the privacy notice. (Required)",
    view: "View today only",
    enable: "Turn on daily updates",
    disable: "Turn off daily updates",
    enabled: "Daily updates are on. Opening this page shows the flow for your device's current local date.",
    disabled: "Device storage is off. The current result disappears when you refresh or leave this page.",
    invalid: "Choose a real birth month and day and acknowledge the privacy notice.",
    resultEyebrow: "Your personal flow today",
    action: "Small action",
    caution: "What to watch",
    question: "Today's question",
    evidence: "Calculation evidence",
    evidenceBody: "Each value is reduced to one digit in the order personal year, personal month, and personal day.",
    localTime: "Device-local date",
    disclaimer: "Daily Flow is a symbolic numerology reflection tool. It does not predict or guarantee outcomes and does not replace medical, legal, financial, or other professional advice.",
  },
} as const;

export function DailyFortuneExperience({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [result, setResult] = useState<DailyFortuneResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const maximumDay = useMemo(() => {
    const month = Number(birthMonth);
    return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
  }, [birthMonth]);

  useEffect(() => {
    const saved = loadDailyFortunePreference(window.localStorage);
    if (!saved) return;
    const frame = window.requestAnimationFrame(() => {
      const today = localDateKey(new Date());
      setBirthMonth(String(saved.birthMonth));
      setBirthDay(String(saved.birthDay));
      setPrivacyAccepted(true);
      setDailyEnabled(true);
      setResult(createDailyFortune({ birthMonth: saved.birthMonth, birthDay: saved.birthDay, dateKey: today, locale }));
      setMessage(t.enabled);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [locale, t.enabled]);

  function calculate(persist: boolean) {
    const month = Number(birthMonth);
    const day = Number(birthDay);
    if (!privacyAccepted || !isValidMonthDay(month, day)) {
      setError(t.invalid);
      setMessage("");
      return;
    }
    const today = localDateKey(new Date());
    setResult(createDailyFortune({ birthMonth: month, birthDay: day, dateKey: today, locale }));
    setError("");
    if (persist) {
      saveDailyFortunePreference(window.localStorage, {
        version: 1,
        birthMonth: month,
        birthDay: day,
        enabledAt: new Date().toISOString(),
      });
      setDailyEnabled(true);
      setMessage(t.enabled);
    } else {
      setMessage("");
    }
  }

  function disableDaily() {
    clearDailyFortunePreference(window.localStorage);
    setDailyEnabled(false);
    setMessage(t.disabled);
    setError("");
  }

  const guide = result ? getNumerologyGuide(result.guideId) : null;
  const dateLabel = result
    ? new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(new Date(`${result.dateKey}T12:00:00`))
    : "";

  return (
    <main className={styles.page} id="main-content" tabIndex={-1}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href={`/${locale}/fortune`} className={styles.brand}>{t.brand}</Link>
          <Link href={`/${locale}/fortune`} className={styles.back}>← {t.back}</Link>
        </header>

        <section className={styles.hero} aria-labelledby="daily-title">
          <p>{t.eyebrow}</p>
          <h1 id="daily-title">{t.title}</h1>
          <span>{t.intro}</span>
        </section>

        <section className={styles.formCard} aria-label={locale === "ko" ? "오늘의 흐름 입력" : "Daily Flow input"}>
          <div className={styles.dateFields}>
            <label>
              <span>{t.month}</span>
              <select value={birthMonth} onChange={(event) => { setBirthMonth(event.target.value); setBirthDay(""); setError(""); }}>
                <option value="">{t.placeholder}</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option value={month} key={month}>{month}</option>)}
              </select>
            </label>
            <label>
              <span>{t.day}</span>
              <select value={birthDay} onChange={(event) => { setBirthDay(event.target.value); setError(""); }}>
                <option value="">{t.placeholder}</option>
                {Array.from({ length: maximumDay }, (_, index) => index + 1).map((day) => <option value={day} key={day}>{day}</option>)}
              </select>
            </label>
          </div>
          <p className={styles.privacy}>{t.privacy}</p>
          <label className={styles.check}>
            <input type="checkbox" checked={privacyAccepted} onChange={(event) => { setPrivacyAccepted(event.target.checked); setError(""); }} />
            <span>{t.privacyCheck}</span>
          </label>
          <Link className={styles.privacyLink} href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보 처리 안내 읽기" : "Read the privacy information"}</Link>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={() => calculate(false)}>{t.view}</button>
            {dailyEnabled
              ? <button type="button" className={styles.danger} onClick={disableDaily}>{t.disable}</button>
              : <button type="button" className={styles.primary} onClick={() => calculate(true)}>{t.enable}</button>}
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          {message && <p className={styles.status} role="status">{message}</p>}
        </section>

        {result && guide && (
          <section className={styles.result} aria-labelledby="daily-result-title">
            <div className={styles.resultVisual}>
              <Image src={guide.image} alt={guide.imageAlt[locale]} width={768} height={768} priority />
              <div className={styles.number} aria-label={`${locale === "ko" ? "개인일 수" : "Personal day"} ${result.personalDay}`}>{result.personalDay}</div>
            </div>
            <div className={styles.resultCopy}>
              <p className={styles.resultEyebrow}>{t.resultEyebrow} · {guide.name[locale]}</p>
              <p className={styles.date}>{dateLabel} · {t.localTime}</p>
              <h2 id="daily-result-title">{result.copy.title}</h2>
              <p className={styles.summary}>{result.copy.summary}</p>
              <dl className={styles.prompts}>
                <div><dt>{t.action}</dt><dd>{result.copy.action}</dd></div>
                <div><dt>{t.caution}</dt><dd>{result.copy.caution}</dd></div>
                <div><dt>{t.question}</dt><dd>{result.copy.question}</dd></div>
              </dl>
              <details className={styles.evidence}>
                <summary>{t.evidence}</summary>
                <p>{t.evidenceBody}</p>
                <code>{result.personalYear} → {result.personalMonth} → {result.personalDay} · {result.ruleVersion}</code>
              </details>
            </div>
          </section>
        )}

        <p className={styles.disclaimer}>{t.disclaimer}</p>
      </div>
    </main>
  );
}
