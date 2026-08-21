"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { NumerologyGuideRoster } from "@/components/numerology-guide-roster";
import { getNumerologyGuide, type NumerologyGuideId } from "@/core/numerology-guides";
import type { Locale } from "@/i18n/config";
import styles from "./saju-service-hub.module.css";

const copy = {
  ko: {
    brand: "결 사주",
    label: "나를 읽는 작은 시작",
    title: "오늘, 무엇이 가장 궁금하세요?",
    intro: "생년월일로 원국을 세우고, 지금 필요한 성찰 메뉴를 골라보세요.",
    start: "1회 5,500원",
    profileTitle: "먼저 내 사주 원국 만들기",
    profileBody: "네 기둥과 오행, 십신의 계산 근거까지 확인할 수 있어요.",
    section: "사주와 함께 보는 메뉴",
    ready: "바로 보기",
    soon: "준비 중",
    disclaimer: "사주는 전통 상징을 바탕으로 한 자기 성찰 도구입니다. 미래를 보장하거나 과학적 진단·치료·전문가의 조언을 대신하지 않습니다.",
    nav: ["홈", "사주", "원국", "기록"],
  },
  en: {
    brand: "GYEOL SAJU",
    label: "A small start to understanding yourself",
    title: "What are you most curious about today?",
    intro: "Build your Four Pillars chart, then choose the reflection that fits this moment.",
    start: "₩5,500 once",
    profileTitle: "Create my Four Pillars chart",
    profileBody: "See the calculation evidence behind the pillars, elements, and Ten Gods.",
    section: "Explore with your chart",
    ready: "Open",
    soon: "Coming soon",
    disclaimer: "Saju is a symbolic reflection tool rooted in tradition. It does not guarantee the future or replace scientific diagnosis, treatment, or professional advice.",
    nav: ["Home", "Saju", "Chart", "Records"],
  },
} as const;

const services = {
  ko: [
    ["원국", "내 사주 원국", "사주 네 기둥과 오행 분포를 계산 근거와 함께 봅니다.", "/saju", "5,500원", true],
    ["상세", "상세 리딩", "반복되는 선택과 지금의 현실 질문을 더 깊게 정리합니다.", "/plans", "39,000원", true],
    ["관계", "두 사람 궁합", "두 사람의 성향과 관계 패턴을 나란히 비교합니다.", "/compatibility", "무료", true],
    ["오늘", "오늘의 흐름", "원할 때 켜두면 현지 날짜에 맞춰 하루 한 번 새 성찰을 보여드려요.", "/daily-fortune", "무료", true],
    ["올해", "올해의 흐름", "한 해의 선택을 점검하는 성찰 메뉴를 준비하고 있어요.", "", "", false],
    ["기록", "내 기록", "저장한 리딩과 주문 내역을 한곳에서 확인합니다.", "/me", "", true],
  ],
  en: [
    ["Chart", "My Four Pillars", "See your pillars and element balance with calculation evidence.", "/saju", "₩5,500", true],
    ["Deep", "Detailed reading", "Explore recurring choices and your current real-life question.", "/plans", "₩39,000", true],
    ["Match", "Two-person match", "Compare two people's traits and relationship patterns.", "/compatibility", "Free", true],
    ["Today", "Today's flow", "Turn it on when you want a new reflection for each local date.", "/daily-fortune", "Free", true],
    ["Year", "This year's flow", "A yearly choice-reflection experience is being prepared.", "", "", false],
    ["Saved", "My records", "Find saved readings and order history in one place.", "/me", "", true],
  ],
} as const;

const serviceGuideIds: readonly NumerologyGuideId[] = [
  "taeryeong",
  "sahyeon",
  "yeonhui",
  "hwayeon",
  "hoyeon",
  "yundo",
];

export function SajuServiceHub({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const otherLocale = locale === "ko" ? "en" : "ko";
  const navHrefs = ["", "/fortune", "/saju", "/me"];
  const [selectedGuideId, setSelectedGuideId] = useState<NumerologyGuideId>("taeryeong");

  return (
    <main className={styles.page} id="main-content" tabIndex={-1}>
      <div className={styles.appShell}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href={`/${locale}`}>{t.brand}</Link>
          <Link className={styles.locale} href={`/${otherLocale}/fortune`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className={styles.hero} aria-labelledby="fortune-title">
          <p>{t.label}</p>
          <h1 id="fortune-title">{t.title}</h1>
          <span>{t.intro}</span>
        </section>

        <NumerologyGuideRoster
          locale={locale}
          onSelect={(guideId) => setSelectedGuideId(guideId)}
          selectedGuideId={selectedGuideId}
          surface="saju"
        />

        <Link className={styles.profileCard} href={`/${locale}/saju`}>
          <span className={styles.profileCopy}>
            <small>{t.start}</small>
            <strong>{t.profileTitle}</strong>
            <span>{t.profileBody}</span>
          </span>
          <span className={styles.arrow} aria-hidden="true">→</span>
        </Link>

        <section className={styles.menu} aria-labelledby="fortune-menu-title">
          <div className={styles.sectionHeading}>
            <h2 id="fortune-menu-title">{t.section}</h2>
            <span>{t.ready}</span>
          </div>
          <div className={styles.grid}>
            {services[locale].map(([eyebrow, title, body, href, badge, ready], index) => {
              const guide = getNumerologyGuide(serviceGuideIds[index]);
              const content = (
                <>
                  <span className={styles.serviceMeta}>
                    <small>{eyebrow}{badge ? ` · ${badge}` : ""}</small>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </span>
                  <Image
                    alt={guide.imageAlt[locale]}
                    className={styles.serviceCharacter}
                    height={384}
                    loading="lazy"
                    sizes="112px"
                    src={guide.image}
                    width={384}
                  />
                  <span className={styles.cardState}>{ready ? "→" : t.soon}</span>
                </>
              );

              return ready ? (
                <Link className={styles.serviceCard} href={`/${locale}${href}`} key={title}>{content}</Link>
              ) : (
                <article className={`${styles.serviceCard} ${styles.disabled}`} data-state="unavailable" key={title}>{content}</article>
              );
            })}
          </div>
        </section>

        <p className={styles.disclaimer}>{t.disclaimer}</p>

        <nav className={styles.bottomNav} aria-label={locale === "ko" ? "사주 서비스 탐색" : "Saju service navigation"}>
          {t.nav.map((label, index) => (
            <Link className={index === 1 ? styles.active : undefined} href={`/${locale}${navHrefs[index]}`} key={label}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
