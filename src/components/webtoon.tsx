import Image from "next/image";
import type { ReactNode } from "react";
import { selectWebtoonScene, type WebtoonSectionType } from "@/core/webtoon-scenes";

/*
 * The vertical-webtoon reading surface.
 *
 * A report is one long column of full-width beats rather than a stack of cards: one idea
 * per screen, alternating between a night panel and a paper panel so the eye gets a break
 * between them, and a scroll cue wherever the next beat is the payoff for this one. These
 * are plain markup with no hooks, so a server component can render them directly; the
 * reveal animation is opted into separately by <WebtoonReveal />.
 */

type WebtoonTone = "paper" | "night" | "gold" | "warn";

export function WebtoonPanel({
  badge,
  children,
  className,
  id,
  lead,
  title,
  tone = "paper",
}: {
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
  lead?: ReactNode;
  title?: ReactNode;
  tone?: WebtoonTone;
}) {
  return (
    <section
      className={`webtoon-panel webtoon-${tone}${className ? ` ${className}` : ""}`}
      data-webtoon-panel=""
      id={id}
    >
      <div className="webtoon-inner">
        {badge != null && <p className="webtoon-badge">{badge}</p>}
        {title != null && <h2 className="webtoon-title">{title}</h2>}
        {lead != null && <p className="webtoon-lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

function storyTheme(title: ReactNode, tone: WebtoonTone): { theme: string; sectionType: WebtoonSectionType } {
  const text = typeof title === "string" ? title : "";
  if (/관계|궁합|연애|가족|친구|동료|협업|대화|갈등|relationship|compatib|family|friend|cowork/i.test(text)) {
    return { theme: "relationship", sectionType: "relationship" };
  }
  if (/숫자|계산|근거|원국|오행|절기|십신|억부|조후|격국|number|calculation|pillar|phase/i.test(text)) {
    return { theme: "analysis", sectionType: "numbers" };
  }
  if (tone === "warn" || /주의|안전|중단|보류|위험|warning|safety|stop|risk/i.test(text)) {
    return { theme: "warning", sectionType: "warning" };
  }
  if (tone === "gold" || /실행|행동|마무리|결론|action|closing|conclusion/i.test(text)) {
    return { theme: "encouragement", sectionType: "encouragement" };
  }
  return { theme: tone === "night" ? "decision" : "core", sectionType: tone === "night" ? "decision" : "summary" };
}

const characterVoices = {
  taeryeong: {
    ko: [
      (subject: string) => `좋아, ‘${subject}’부터 큰 흐름을 잡아볼게.`,
      (subject: string) => `흩어진 신호를 모아서 ‘${subject}’의 구조부터 보자.`,
      (subject: string) => `‘${subject}’, 여기서 전체 판이 어떻게 움직이는지 읽어볼게.`,
      (subject: string) => `먼저 중심을 세우자. 이번 장면의 축은 ‘${subject}’야.`,
      (subject: string) => `복잡해 보여도 괜찮아. ‘${subject}’의 큰 결부터 연결해볼게.`,
    ],
    en: [
      (subject: string) => `All right. Let’s map the larger pattern behind “${subject}.”`,
      (subject: string) => `I’ll gather the scattered signals and start with the structure of “${subject}.”`,
      (subject: string) => `Let’s see how the whole board moves through “${subject}.”`,
      (subject: string) => `First, set the center. This scene turns on “${subject}.”`,
      (subject: string) => `It may look complex, but we can connect the larger thread of “${subject}.”`,
    ],
  },
  yeonhui: {
    ko: [
      (subject: string) => `‘${subject}’에서는 말보다 마음이 먼저 움직인 순간을 봐줘.`,
      (subject: string) => `천천히 읽어봐. ‘${subject}’ 안에 관계의 온도가 숨어 있어.`,
      (subject: string) => `이 장면은 다정하게 볼수록 선명해져. ‘${subject}’의 감정을 따라가 보자.`,
      (subject: string) => `누가 옳은지보다 ‘${subject}’에서 서로 무엇을 느꼈는지가 중요해.`,
      (subject: string) => `마음을 조금 가까이 가져와 봐. ‘${subject}’의 진짜 신호가 들릴 거야.`,
    ],
    en: [
      (subject: string) => `In “${subject},” notice the moment the heart moved before the words did.`,
      (subject: string) => `Read slowly. The emotional temperature of “${subject}” is hidden here.`,
      (subject: string) => `This scene gets clearer with gentleness. Follow the feeling in “${subject}.”`,
      (subject: string) => `More than who was right, notice what each person felt in “${subject}.”`,
      (subject: string) => `Come a little closer. The real signal in “${subject}” may become audible.`,
    ],
  },
  sahyeon: {
    ko: [
      (subject: string) => `서두르지 마. ‘${subject}’는 느낌보다 근거를 순서대로 확인해보자.`,
      (subject: string) => `이제 ‘${subject}’를 숫자와 반복 패턴으로 좁혀볼게.`,
      (subject: string) => `‘${subject}’의 사실과 해석을 분리하면 핵심이 정확히 보여.`,
      (subject: string) => `판단은 나중이야. 먼저 ‘${subject}’에서 반복되는 증거부터 보자.`,
      (subject: string) => `좋아, ‘${subject}’의 계산 근거를 하나씩 대조해볼게.`,
    ],
    en: [
      (subject: string) => `Don’t rush. For “${subject},” check the evidence in order.`,
      (subject: string) => `Now let’s narrow “${subject}” through numbers and recurring patterns.`,
      (subject: string) => `Separate fact from interpretation and the core of “${subject}” becomes precise.`,
      (subject: string) => `Judgment comes later. First, find the repeating evidence in “${subject}.”`,
      (subject: string) => `Good. Let’s compare the calculation behind “${subject}” one step at a time.`,
    ],
  },
  hwayeon: {
    ko: [
      (subject: string) => `잠깐. ‘${subject}’에서는 멈춰야 할 신호부터 확인해.`,
      (subject: string) => `여긴 가볍게 넘기면 안 돼. ‘${subject}’의 위험선을 분명히 보자.`,
      (subject: string) => `‘${subject}’ 앞에서는 속도보다 경계가 먼저야.`,
      (subject: string) => `단호하게 말할게. ‘${subject}’의 중단 기준을 미리 정해둬.`,
      (subject: string) => `불편해도 봐야 해. ‘${subject}’에서 놓치면 안 될 경고야.`,
    ],
    en: [
      (subject: string) => `Wait. In “${subject},” check the stop signals first.`,
      (subject: string) => `Don’t skim this. Mark the risk line around “${subject}” clearly.`,
      (subject: string) => `With “${subject},” boundaries come before speed.`,
      (subject: string) => `I’ll be direct: decide the stop rule for “${subject}” in advance.`,
      (subject: string) => `It may be uncomfortable, but this warning in “${subject}” matters.`,
    ],
  },
  yundo: {
    ko: [
      (subject: string) => `숨을 한번 고르고, ‘${subject}’에서 지킬 수 있는 균형을 찾아보자.`,
      (subject: string) => `‘${subject}’는 무리해서 바꾸기보다 오래 이어갈 리듬이 중요해.`,
      (subject: string) => `괜찮아. ‘${subject}’를 현실에서 가능한 크기로 천천히 맞춰보자.`,
      (subject: string) => `몸과 마음이 함께 버틸 수 있게 ‘${subject}’의 속도를 조절해볼게.`,
      (subject: string) => `‘${subject}’의 답은 극단보다 편안하게 지속되는 쪽에 있어.`,
    ],
    en: [
      (subject: string) => `Take a breath and find a sustainable balance in “${subject}.”`,
      (subject: string) => `For “${subject},” a lasting rhythm matters more than forcing change.`,
      (subject: string) => `It’s all right. Let’s bring “${subject}” down to a workable size.`,
      (subject: string) => `Let’s adjust the pace of “${subject}” so both body and mind can carry it.`,
      (subject: string) => `The answer in “${subject}” is closer to sustainable ease than an extreme.`,
    ],
  },
  hoyeon: {
    ko: [
      (subject: string) => `‘${subject}’를 끝까지 읽어봐. 다음 선택의 실마리가 보여.`,
      (subject: string) => `아직 답을 닫지 마. ‘${subject}’에 새로운 가능성이 남아 있어.`,
      (subject: string) => `‘${subject}’를 지나면 지금과 다른 방향이 조금 더 선명해질 거야.`,
      (subject: string) => `직감이 머무는 곳을 봐. ‘${subject}’가 다음 문을 가리키고 있어.`,
      (subject: string) => `마지막 빛은 작아도 충분해. ‘${subject}’에서 이어갈 길을 찾아보자.`,
    ],
    en: [
      (subject: string) => `Read “${subject}” through. A clue for your next choice is here.`,
      (subject: string) => `Don’t close the answer yet. “${subject}” still holds another possibility.`,
      (subject: string) => `Beyond “${subject},” a different direction may become clearer.`,
      (subject: string) => `Notice where intuition pauses. “${subject}” is pointing to the next door.`,
      (subject: string) => `Even a small final light is enough. Find the path forward in “${subject}.”`,
    ],
  },
} as const;

function stableVoiceIndex(seed: string, poolSize: number): number {
  let hash = 0;
  for (const character of seed) hash = (Math.imul(hash, 31) + (character.codePointAt(0) ?? 0)) >>> 0;
  return hash % poolSize;
}

function compactSceneSubject(title: string): string {
  const compact = title.replace(/\s+/g, " ").replace(/[.!?]+$/g, "").trim();
  return compact.length > 28 ? `${compact.slice(0, 27)}…` : compact;
}

/** A real scene beat: art, character acting, narration and an HTML speech bubble. */
export function CharacterWebtoonPanel({
  badge,
  children,
  className,
  id,
  lead,
  sceneKey,
  title,
  tone = "paper",
}: {
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
  lead?: ReactNode;
  sceneKey?: string;
  title?: ReactNode;
  tone?: WebtoonTone;
}) {
  const selection = storyTheme(title, tone);
  const titleText = typeof title === "string" ? title : sceneKey ?? tone;
  const scene = selectWebtoonScene({
    seed: sceneKey ?? `${selection.theme}:${titleText}`,
    theme: selection.theme,
    sectionType: selection.sectionType,
    emotion: tone === "warn" ? "serious" : tone === "gold" ? "hopeful" : tone === "night" ? "focused" : "calm",
    emphasis: tone === "warn" ? "high" : "medium",
  });
  const voiceLocale = /[가-힣]/.test(titleText) ? "ko" : "en";
  const voicePool = characterVoices[scene.character][voiceLocale];
  const voiceSeed = `${scene.character}:${titleText}:${typeof badge === "string" ? badge : ""}:${tone}`;
  const characterVoice = voicePool[stableVoiceIndex(voiceSeed, voicePool.length)](compactSceneSubject(titleText));

  return (
    <section
      className={`webtoon-story-panel webtoon-story-${tone}${className ? ` ${className}` : ""}`}
      data-character={scene.character}
      data-webtoon-panel=""
      id={id}
    >
      <div aria-hidden="true" className="webtoon-story-art">
        <Image className="webtoon-story-background" fill sizes="(max-width: 900px) 100vw, 900px" src={scene.backgroundPath} alt="" />
        {scene.effectPath && <Image className="webtoon-story-effect" fill sizes="(max-width: 900px) 100vw, 900px" src={scene.effectPath} alt="" />}
        <Image
          alt=""
          className="webtoon-story-character"
          height={560}
          sizes="(max-width: 680px) 82vw, 520px"
          src={scene.assetPath}
          width={560}
        />
      </div>
      <div className="webtoon-story-narration">
        {badge != null && <p>{badge}</p>}
        {lead != null && <span>{lead}</span>}
      </div>
      <div className="webtoon-story-bubble">
        <strong>{scene.characterNameKo}</strong>
        <p className="webtoon-character-voice">“{characterVoice}”</p>
        {title != null && <h2>{title}</h2>}
        <div className="webtoon-story-dialogue">{children}</div>
      </div>
    </section>
  );
}

/*
 * The calculated numbers are the one place the reader is looking for a figure rather than
 * a sentence, so they get read as objects on the page instead of a row of table cells.
 */
export function WebtoonOrbs({
  items,
  label,
}: {
  items: { label: string; note?: string; value: string }[];
  label: string;
}) {
  return (
    <div aria-label={label} className="webtoon-orbs">
      {items.map((item) => (
        <div className="webtoon-orb" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
          {item.note && <small>{item.note}</small>}
        </div>
      ))}
    </div>
  );
}

/* Two chevrons pointing into the next panel. Decoration only — the panel below is already
   in the document order a screen reader follows. */
export function WebtoonCue() {
  return (
    <div aria-hidden="true" className="webtoon-cue">
      <span />
      <span />
    </div>
  );
}

/* A phrase the reader should leave with, drawn as if run over with a marker. */
export function WebtoonMark({ children }: { children: ReactNode }) {
  return <mark className="webtoon-mark">{children}</mark>;
}

const reportKeywordPattern = /(핵심|우선|중요|주의|강점|위험|기회|선택|행동|관계|패턴|균형|경계|근거|확인|필요|권장|가능성|core|priority|important|caution|strength|risk|opportunity|choice|action|relationship|pattern|balance|boundary|evidence|check|need)/gi;

function emphasizeReportKeywords(text: string, keyPrefix: string) {
  return text.split(reportKeywordPattern).map((part, index) =>
    index % 2 === 1 ? <strong className="report-keyword-emphasis" key={`${keyPrefix}-${index}`}>{part}</strong> : part,
  );
}

/** Keeps report copy intact while giving its opening context and decision words visual weight. */
export function ReportEmphasis({ children }: { children: string }) {
  const opening = children.match(/^(\s*)([\s\S]{8,160}?[.!?])(?=\s|$)([\s\S]*)$/)
    ?? children.match(/^(\s*)([^\r\n]{8,160})(?:\r?\n|$)([\s\S]*)$/);
  if (!opening) return <>{emphasizeReportKeywords(children, "term")}</>;

  return (
    <>
      {opening[1]}
      <strong className="report-context-emphasis">{emphasizeReportKeywords(opening[2], "opening")}</strong>
      {emphasizeReportKeywords(opening[3], "rest")}
    </>
  );
}

/*
 * The bar that stays on screen for the whole scroll. Only pages without the five-item
 * bottom navigation use it, because the two would sit on top of each other.
 */
export function WebtoonCta({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="webtoon-cta">
      <div className="webtoon-cta-inner">
        {note && <p className="webtoon-cta-note">{note}</p>}
        <a className="webtoon-cta-button" href={href}>
          {label}
        </a>
      </div>
    </div>
  );
}
