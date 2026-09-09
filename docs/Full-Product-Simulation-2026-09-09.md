# Full product user simulation — 2026-09-09

## Scope

The production bundle is exercised as a guest on desktop Chromium and mobile emulation across Korean and English. The matrix covers home guidance, free Numerology, Saju, tarot safety routing, relationship and compatibility, sourced public comparison, Reality Check, local export/deletion, share files, shop concepts, account denial, payment creation and recovery, accessibility, metadata, performance and 3D Space loading/fallback. Payment scenarios intercept provider handoff and never approve a real charge.

## First-run findings

- 236 of 252 browser cases passed, 9 environment-gated cases skipped and 7 failed.
- Two failures were the same home CSS budget regression on desktop and mobile. The home preloaded a linked Saju route's 13.2 KB stylesheet before the visitor selected it.
- Four failures were stale test selectors after the approved home redesign: one link name became ambiguous and the Space section now intentionally has one primary room-analysis link alongside the permanent navigation link.
- One failure reproduced alone: a delayed 3D asset path could leave the loading message visible beyond 30 seconds. There was already a text fallback and retry button, but no whole-startup deadline.

## Corrections

- Disable automatic prefetch for home service links. Navigation still begins immediately on click and avoids loading unused route CSS.
- Keep exact route assertions while selecting the exact intended link and current single Space call to action.
- Fail the 3D startup safely after 25 seconds, abort partial resources and retain text analysis plus explicit retry.
- Measure hero sharpness from the decoded response bitmap while keeping responsive compression. The earlier `naturalWidth` assertion read a `srcset` density descriptor as if it were the physical response width and caused an unnecessary 300 KB transfer increase; this is corrected rather than hidden by a larger budget.
- Keep the mobile loading-position case on the configured coarse-pointer phone project. The desktop project at a 390-pixel viewport still uses the intentionally heavier desktop renderer and is not evidence of actual phone behavior.
- Refresh visual evidence to the approved current product screens and the real 1.5x 3D render output. WebGL screenshots allow up to 5% backend shading noise while exact scene state, object counts, geometry, render scale and performance budgets remain strict.

## Final evidence

- Full user-flow browser matrix: 242 passed, 10 intentionally environment-gated cases skipped, 0 failed (252 total).
- Dedicated Space matrix across desktop Chromium, iPhone WebKit emulation and Android Chromium emulation: 82 passed, 23 non-applicable cases skipped, 0 failed (105 total).
- No major design change was required. The visual baselines now describe the already approved screen and its higher internal render resolution.
- The release audit found newly published Next.js, Sharp, js-yaml and Vitest advisories. Next.js/eslint-config-next moved to 16.3.3, Vitest to 4.1.11, and the workspace pins Sharp 0.35.4 plus js-yaml 4.3.2. The remaining two high findings are the existing reviewed audit exclusions.

No calculation, price, payment entitlement, authentication, stored record, database schema, provider or visual system changes are included.
