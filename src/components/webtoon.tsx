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

export function WebtoonPanel({
  art,
  badge,
  children,
  className,
  id,
  lead,
  title,
  tone = "paper",
}: {
  /* Drawn scenery for this beat. A webtoon panel is a picture the words sit inside, not a
     band of colour behind them — without this the column is just tinted paragraphs. */
  art?: ReactNode;
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
      className={`webtoon-panel webtoon-${tone}${art ? " has-art" : ""}${className ? ` ${className}` : ""}`}
      data-webtoon-panel=""
      id={id}
    >
      {art && <div aria-hidden="true" className="webtoon-panel-art">{art}</div>}
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

/*
 * The guide, dropped in between panels with something to say.
 *
 * This is the thing that makes a column of panels read as an episode rather than a
 * document: a small figure who turns up every so often, says one line, and hands the
 * reader on to the next beat. The portrait is decorative — the line in the bubble is real
 * text and is what a screen reader announces.
 */
export function WebtoonNarrator({
  children,
  side = "left",
}: {
  children: ReactNode;
  side?: "left" | "right";
}) {
  return (
    <div className={`webtoon-cut webtoon-cut-${side}`} data-webtoon-panel="">
      {/* The figure is inside the frame and cropped by it, the way a webtoon panel holds a
          character — not a chip sitting outside the content next to a message. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden="true" className="webtoon-cut-figure" src="/images/taeyul-hero.jpg" />
      <p className="webtoon-cut-balloon">{children}</p>
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
