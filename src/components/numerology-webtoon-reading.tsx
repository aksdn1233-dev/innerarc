import Image from "next/image";
import type { ReactNode } from "react";
import type { NumerologyProfile } from "@/core/numerology";
import type { OnboardingReflectionContext } from "@/core/onboarding";
import { selectWebtoonSequence, type WebtoonScene } from "@/core/webtoon-scenes";
import type { Locale } from "@/i18n/config";
import styles from "./numerology-webtoon-reading.module.css";

type Props = {
  locale: Locale;
  result: NumerologyProfile;
  context: OnboardingReflectionContext;
  archetype: string;
  summary: string;
  risks: readonly string[];
  relationship: string;
};

type Panel = {
  scene: WebtoonScene;
  kicker: string;
  title: string;
  body: ReactNode;
};

const focusTheme: Record<OnboardingReflectionContext["focusId"], string> = {
  work: "decision",
  relationships: "relationship",
  health: "balance",
  growth: "possibility",
  money: "timing",
  leadership: "core",
};

export function SceneBackground({ scene }: { scene: WebtoonScene }) {
  return (
    <>
      <Image alt="" aria-hidden="true" className={styles.background} fill sizes="(max-width: 720px) 100vw, 720px" src={scene.backgroundPath} />
      {scene.effectPath && <Image alt="" aria-hidden="true" className={styles.effect} fill sizes="(max-width: 720px) 100vw, 720px" src={scene.effectPath} />}
    </>
  );
}

export function CharacterLayer({ scene, priority }: { scene: WebtoonScene; priority: boolean }) {
  return (
    <div className={styles.characterLayer}>
      <span aria-hidden="true" className={styles.characterFallback}>태령당</span>
      <Image
        alt={scene.altText}
        className={styles.character}
        height={384}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        sizes="(max-width: 520px) 72vw, 360px"
        src={scene.assetPath}
        style={{ objectPosition: scene.objectPosition }}
        width={384}
      />
    </div>
  );
}

export function SpeechBubble({ children, speaker }: { children: ReactNode; speaker: string }) {
  return (
    <div className={styles.bubble}>
      <strong className={styles.speaker}>{speaker}</strong>
      {children}
    </div>
  );
}

export function WebtoonPanel({ panel, index }: { panel: Panel; index: number }) {
  return (
    <article className={`${styles.panel} ${index % 2 === 1 ? styles.reverse : ""}`} data-character={panel.scene.character}>
      <SceneBackground scene={panel.scene} />
      <CharacterLayer priority={index === 0} scene={panel.scene} />
      <SpeechBubble speaker={panel.scene.characterNameKo}>
        <small>{panel.kicker}</small>
        <h3>{panel.title}</h3>
        <div className={styles.dialogue}>{panel.body}</div>
      </SpeechBubble>
    </article>
  );
}

export function NumerologyWebtoonReading({ locale, result, context, archetype, summary, risks, relationship }: Props) {
  const ko = locale === "ko";
  const seed = `${result.birthDate}:${result.lifePath.value}:${context.focusId}`;
  const scenes = selectWebtoonSequence([
    { seed: `${seed}:summary`, theme: "core", sectionType: "summary", emotion: "calm", emphasis: "medium" },
    { seed: `${seed}:numbers`, theme: "analysis", sectionType: "numbers", emotion: "focused", emphasis: "medium" },
    { seed: `${seed}:focus`, theme: focusTheme[context.focusId], sectionType: context.focusId === "relationships" ? "relationship" : "decision", emphasis: "medium" },
    { seed: `${seed}:warning`, theme: "warning", sectionType: "warning", emotion: "serious", emphasis: "high" },
    { seed: `${seed}:closing`, theme: context.focusId === "health" ? "healing" : "encouragement", sectionType: context.focusId === "health" ? "balance" : "encouragement", emotion: context.focusId === "health" ? "gentle" : "hopeful", emphasis: "low" },
  ]);

  const panels: Panel[] = [
    {
      scene: scenes[0],
      kicker: ko ? "핵심 장면" : "Core scene",
      title: ko ? `${archetype}, 지금 드러난 중심` : `${archetype}, the theme showing now`,
      body: <p>{summary}</p>,
    },
    {
      scene: scenes[1],
      kicker: ko ? "계산 결과" : "Calculated result",
      title: ko ? "숫자는 이렇게 나왔어요" : "Here are the calculated numbers",
      body: (
        <dl className={styles.numberList}>
          <div><dt>{ko ? "인생수" : "Life Path"}</dt><dd>{result.lifePath.value}</dd></div>
          <div><dt>{ko ? "생일수" : "Birthday"}</dt><dd>{result.birthday.value}</dd></div>
          <div><dt>{ko ? "태도수" : "Attitude"}</dt><dd>{result.attitude.value}</dd></div>
          <div><dt>{ko ? "개인연도" : "Personal Year"}</dt><dd>{result.personalYear.value}</dd></div>
        </dl>
      ),
    },
    {
      scene: scenes[2],
      kicker: context.focusLabel,
      title: context.title,
      body: <><p>{context.contextualInference}</p>{context.concern && <blockquote>{context.concern.text}</blockquote>}</>,
    },
    {
      scene: scenes[3],
      kicker: ko ? "주의해서 볼 점" : "Points to watch",
      title: ko ? "상징을 정답으로 만들지는 마세요" : "Do not turn symbolism into an answer",
      body: <><ul>{risks.map((risk) => <li key={risk}>{risk}</li>)}</ul><p>{context.realityCheck}</p></>,
    },
    {
      scene: scenes[4],
      kicker: ko ? "현실에서 해볼 일" : "Try this in real life",
      title: ko ? "작은 행동으로 확인해보세요" : "Test it with one small action",
      body: <><p>{context.practicalAction}</p><p>{context.focusId === "relationships" ? relationship : context.uncertainty}</p></>,
    },
  ];

  return (
    <section aria-label={ko ? "캐릭터와 함께 보는 수비학 결과" : "Numerology result with 태령당 characters"} className={styles.reading}>
      <header className={styles.heading}>
        <p>{ko ? "태령당 수비학 웹툰 리딩" : "태령당 numerology webtoon reading"}</p>
        <h2>{ko ? "계산 결과를 장면별로 살펴보세요" : "Walk through your calculation, scene by scene"}</h2>
        <span>{ko ? "대사는 이미지가 아닌 웹 텍스트이며, 숫자 계산값은 캐릭터 선택과 무관합니다." : "Dialogue is selectable web text. Characters never change your calculated numbers."}</span>
      </header>
      <div className={styles.panels}>
        {panels.map((panel, index) => <WebtoonPanel index={index} key={`${panel.scene.character}:${index}`} panel={panel} />)}
      </div>
      <p className={styles.boundary}>
        {ko
          ? "수비학은 상징을 활용한 자기 성찰 도구이며, 과학적 예측·진단·치료 또는 전문적인 조언을 대신하지 않습니다."
          : "Numerology is a symbolic reflection tool, not scientific prediction, diagnosis, treatment, or professional advice."}
      </p>
    </section>
  );
}
