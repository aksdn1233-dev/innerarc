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

/**
 * A full-bleed night scene for the cinematic hero: a low moon over layered ridges, a
 * scatter of fixed stars, and the woven 결 grain rising from the horizon.
 *
 * This stands where a commissioned illustration would go. It is drawn here for the same
 * reason as everything else in this file — there is no licensed art set and no
 * image-generation step — and it is built to be replaced: give `.cinema-hero` a
 * background image and this sits behind it without changing any layout.
 *
 * `preserveAspectRatio="xMidYMax slice"` keeps the horizon anchored to the bottom of
 * whatever box it fills, so the ridges stay put on a tall phone and a wide desktop alike.
 */
export function NightHorizon({ className }: VisualProps) {
  // Fixed, not random: server and client must produce identical markup.
  const stars = [
    [8, 14, 1.1], [17, 27, 0.7], [24, 9, 1.4], [31, 21, 0.8], [39, 33, 1],
    [46, 12, 1.3], [53, 25, 0.7], [61, 17, 1.1], [68, 31, 0.9], [74, 8, 1.2],
    [81, 22, 0.8], [88, 15, 1.3], [93, 29, 0.7], [12, 38, 0.9], [58, 40, 0.8],
    [35, 5, 0.9], [66, 6, 0.8], [86, 37, 1], [21, 44, 0.7], [77, 44, 0.9],
  ] as const;

  return (
    <svg
      aria-hidden="true"
      className={classes("brand-visual brand-night", className)}
      focusable="false"
      preserveAspectRatio="xMidYMax slice"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="gyeol-night-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#070d1c" />
          <stop offset="46%" stopColor="#12203f" />
          <stop offset="78%" stopColor="#1d3358" />
          <stop offset="100%" stopColor="#0d1730" />
        </linearGradient>
        <radialGradient id="gyeol-night-moon">
          <stop offset="0%" stopColor="#fdf6e3" />
          <stop offset="62%" stopColor="#f3e6c4" />
          <stop offset="100%" stopColor="#e8d5a6" />
        </radialGradient>
        <radialGradient id="gyeol-night-halo">
          <stop offset="0%" stopColor="#f6ecd2" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#f6ecd2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect fill="url(#gyeol-night-sky)" height="100" width="100" x="0" y="0" />

      {stars.map(([cx, cy, r]) => (
        <circle cx={cx} cy={cy} fill="#f7f1e7" key={`${cx}-${cy}`} opacity={0.28 + r * 0.3} r={r * 0.22} />
      ))}

      <circle cx="72" cy="20" fill="url(#gyeol-night-halo)" r="17" />
      <circle cx="72" cy="20" fill="url(#gyeol-night-moon)" r="6.4" />

      {/* Layered ridges: far ones lighter and hazier, near ones darker, so depth reads
          without any texture work. */}
      <path d="M0 72 L14 63 L27 70 L41 58 L56 69 L70 60 L84 68 L100 61 L100 100 L0 100 Z" fill="#16264a" opacity="0.85" />
      <path d="M0 80 L12 73 L26 81 L38 71 L52 80 L67 72 L82 81 L100 74 L100 100 L0 100 Z" fill="#101d3b" opacity="0.92" />
      <path d="M0 89 L16 83 L30 90 L45 82 L61 90 L76 84 L90 91 L100 86 L100 100 L0 100 Z" fill="#08122a" />

      {/* The 결 grain, rising from the horizon rather than sitting on top of it. */}
      <g opacity="0.3" stroke="#c8a86a" strokeLinecap="round" strokeWidth="0.35">
        <path d="M6 100 C 22 88, 38 92, 52 82" fill="none" />
        <path d="M18 100 C 34 90, 50 94, 66 84" fill="none" />
        <path d="M32 100 C 48 91, 64 95, 80 85" fill="none" />
        <path d="M46 100 C 62 92, 78 96, 94 86" fill="none" />
      </g>
    </svg>
  );
}
