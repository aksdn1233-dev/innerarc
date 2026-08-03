/**
 * Original artwork for the reading experience, drawn as SVG in this repository.
 *
 * There is no licensed illustration set for GYEOL and no image-generation step in this
 * build, so the visual language is code: meteor trails for the arrival of a reading,
 * a numeric path for the calculation, and a woven grain for 결 itself. Drawing them
 * here means no external request, no unlicensed asset, no broken image frame, and no
 * placeholder standing in for artwork that never arrives.
 *
 * Every piece is decorative, deterministic (no random values, so server and client
 * markup agree), sized by its container, and hidden from assistive technology. Motion
 * is opt-out through `prefers-reduced-motion` in globals.css.
 */

type VisualProps = Readonly<{ className?: string }>;

function classes(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

/**
 * Meteor trails. Three strands falling at the same angle at different speeds, each a
 * tapered line with a bright head — the arrival motif used behind the hero.
 */
export function MeteorTrails({ className }: VisualProps) {
  return (
    <svg
      aria-hidden="true"
      className={classes("brand-visual brand-meteors", className)}
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 400 260"
    >
      <defs>
        <linearGradient id="gyeol-meteor-fade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="65%" stopColor="currentColor" stopOpacity="0.45" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {[
        { x: 38, y: 18, length: 96, delay: "0s" },
        { x: 186, y: -22, length: 148, delay: "1.9s" },
        { x: 296, y: 44, length: 74, delay: "3.4s" },
      ].map((meteor) => (
        <g className="brand-meteor" key={meteor.x} style={{ animationDelay: meteor.delay }}>
          <line
            stroke="url(#gyeol-meteor-fade)"
            strokeLinecap="round"
            strokeWidth="1.6"
            x1={meteor.x}
            x2={meteor.x + meteor.length}
            y1={meteor.y}
            y2={meteor.y + meteor.length}
          />
          <circle
            cx={meteor.x + meteor.length}
            cy={meteor.y + meteor.length}
            fill="currentColor"
            fillOpacity="0.75"
            r="2.4"
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * The numeric path: the nine single digits of Pythagorean reduction, joined in order
 * by the line the calculation walks. Used wherever the method is being explained.
 */
export function NumberPath({ className }: VisualProps) {
  const points = [
    [14, 74], [52, 42], [90, 66], [128, 30], [166, 58],
    [204, 26], [242, 62], [280, 38], [318, 70],
  ] as const;
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  return (
    <svg
      aria-hidden="true"
      className={classes("brand-visual brand-number-path", className)}
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 332 96"
    >
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.32"
        strokeWidth="1.4"
      />
      {points.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} fill="currentColor" fillOpacity="0.1" r="11" />
          <circle cx={x} cy={y} fill="none" r="11" stroke="currentColor" strokeOpacity="0.34" strokeWidth="1" />
          <text
            dominantBaseline="central"
            fill="currentColor"
            fillOpacity="0.72"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            x={x}
            y={y + 0.5}
          >
            {index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

/**
 * Thread weave — 결 is the grain running through wood, fabric, and a person. Warp and
 * weft at low opacity, offset so the crossings read as a pattern rather than a grid.
 */
export function ThreadWeave({ className }: VisualProps) {
  const warp = Array.from({ length: 9 }, (_, index) => 12 + index * 26);
  const weft = Array.from({ length: 5 }, (_, index) => 14 + index * 24);
  return (
    <svg
      aria-hidden="true"
      className={classes("brand-visual brand-thread-weave", className)}
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 240 120"
    >
      {warp.map((x, index) => (
        <path
          d={`M${x} 0 C ${x + (index % 2 === 0 ? 9 : -9)} 40, ${x - (index % 2 === 0 ? 9 : -9)} 80, ${x} 120`}
          fill="none"
          key={`warp-${x}`}
          stroke="currentColor"
          strokeOpacity={index % 2 === 0 ? 0.22 : 0.13}
          strokeWidth="1"
        />
      ))}
      {weft.map((y, index) => (
        <path
          d={`M0 ${y} C 60 ${y + (index % 2 === 0 ? 7 : -7)}, 180 ${y - (index % 2 === 0 ? 7 : -7)}, 240 ${y}`}
          fill="none"
          key={`weft-${y}`}
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

/**
 * A scene divider: one long horizon rule interrupted by a small constellation, so
 * sections separate without a hard line across the page.
 */
export function SceneDivider({ className }: VisualProps) {
  return (
    <svg
      aria-hidden="true"
      className={classes("brand-visual brand-scene-divider", className)}
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 480 24"
    >
      <line stroke="currentColor" strokeOpacity="0.18" x1="0" x2="196" y1="12" y2="12" />
      <line stroke="currentColor" strokeOpacity="0.18" x1="284" x2="480" y1="12" y2="12" />
      <path
        d="M212 12 L232 5 L252 15 L268 8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.36"
        strokeWidth="1.2"
      />
      {[[212, 12], [232, 5], [252, 15], [268, 8]].map(([x, y]) => (
        <circle cx={x} cy={y} fill="currentColor" fillOpacity="0.5" key={`${x}-${y}`} r="1.8" />
      ))}
    </svg>
  );
}
