import type { ReactNode } from "react";

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

type WebtoonCharacterArtProps = {
  align?: "left" | "right";
  src: string;
  variant?: "panel" | "portrait";
};

/* Character art is part of the reading rhythm rather than a decorative background. The
   tall frames carry major story turns; the smaller expression crops sit beside the text
   at their native size so they stay sharp. The written heading already names the beat, so
   these images intentionally have an empty alt attribute. */
export function WebtoonCharacterArt({
  align = "left",
  src,
  variant = "portrait",
}: WebtoonCharacterArtProps) {
  const isPanel = variant === "panel";

  return (
    <figure className={`webtoon-character-art webtoon-character-${variant} webtoon-character-${align}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        height={isPanel ? 1920 : 230}
        loading="lazy"
        src={src}
        width={isPanel ? 1080 : 242}
      />
    </figure>
  );
}

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

/* Long report prose becomes a sequence of narration and dialogue balloons. Keeping the
   paragraphs as real <p> elements preserves the reading order while giving each thought
   its own visual beat on a phone. */
export function WebtoonDialogue({ text }: { text: string }) {
  const beats = text
    .split(/\n{2,}/u)
    .map((beat) => beat.trim())
    .filter(Boolean);

  return (
    <div className="webtoon-dialogue">
      {beats.map((beat, index) => (
        <p className={index % 3 === 2 ? "webtoon-caption" : "webtoon-bubble"} key={`${index}-${beat.slice(0, 32)}`}>
          {beat}
        </p>
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
