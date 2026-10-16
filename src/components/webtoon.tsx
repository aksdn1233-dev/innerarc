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
  harang: {
    ko: [
      (subject: string) => `‘${subject}’, 내 생활과 닮은 부분부터 찾아보세요.`,
      (subject: string) => `‘${subject}’의 계산과 해석을 하나씩 같이 볼게요.`,
      (subject: string) => `‘${subject}’에서 맞는 점과 다른 점을 함께 봐주세요.`,
      (subject: string) => `‘${subject}’를 읽고 지금 해볼 수 있는 한 가지를 골라봐요.`,
      (subject: string) => `‘${subject}’는 결론보다 내 선택을 돌아보는 실마리예요.`,
    ],
    en: [
      (subject: string) => `Start with the part of “${subject}” that resembles your life.`,
      (subject: string) => `Let’s review the calculation and interpretation of “${subject}” together.`,
      (subject: string) => `Notice both what fits and what differs in “${subject}.”`,
      (subject: string) => `After “${subject},” choose one small thing to try.`,
      (subject: string) => `Use “${subject}” as a prompt to reflect on your choices.`,
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

export const RESTORED_WEBTOON_CHARACTER_ASSETS = [
  "harang/harang_analyze_focused_01.png",
  "harang/harang_assure_confident_01.png",
  "harang/harang_result-card_confident_01.png",
] as const;

const restoredCharacterAssets = new Set<string>(RESTORED_WEBTOON_CHARACTER_ASSETS);

/** Keeps the 384px originals as the low-bandwidth 1x source while serving restored art
 * at the real pixel density of modern phones and laptops. */
export function getWebtoonCharacterImageSources(assetPath: string): { src: string; srcSet?: string } {
  const relativePath = assetPath.split("/characters/")[1];
  if (!relativePath || !restoredCharacterAssets.has(relativePath)) return { src: assetPath };

  const basePath = assetPath.replace(/\.png$/, "");
  return {
    src: assetPath,
    srcSet: `${assetPath} 1x, ${basePath}-hd-v2-2x.webp 2x, ${basePath}-hd-v2-3x.webp 3x`,
  };
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
  const characterImage = getWebtoonCharacterImageSources(scene.assetPath);

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
        {/* Character density candidates are authored assets rather than optimizer-enlarged
            copies. The 1x original stays available for low-density screens. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="webtoon-story-character"
          decoding="async"
          draggable={false}
          height={384}
          loading="lazy"
          src={characterImage.src}
          srcSet={characterImage.srcSet}
          width={384}
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
