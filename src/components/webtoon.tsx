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
