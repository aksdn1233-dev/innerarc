# InnerArc

InnerArc is an AI self-discovery and personal pattern intelligence platform. It combines deterministic numerology, auditable tarot symbolism, user context, and later outcome reviews. It does **not** claim scientific prediction: symbolic systems are prompts for reflection, and personal relevance is checked against lived experience.

## Current scope

Version 0.15.0 provides a web-first, guest-first Korean/English application with:

- deterministic Pythagorean numerology and calculation evidence;
- a context-aware first result that uses stable focus/depth choices and optional page-memory-only concern text without changing calculations, storage, sharing, analytics, or provider state;
- an eight-domain integrated profile and explanatory career exploration;
- a 78-card auditable tarot engine with seeded or manual draws;
- relationship energy, plausible meeting-context, and future-partner-quality reflection without predictions or probabilities;
- an explicit, editable, current-tab-only bridge from each relationship environment into a Reality Check experiment, with no birth date, name, number, partner, or location transfer;
- an explicit-use outcome-review layer that brings both relevant and missed saved relationship feedback into the next reflection without changing calculated facts;
- deterministic accessory and music-direction reflections with practical reality checks and no luck, healing, or performance claims;
- a bilingual closed shop preview for future accessory categories, with no products, prices, cart, checkout, or affiliate tracking;
- fail-closed future commerce contracts that require product disclosures, isolate sponsored placement, reject outcome claims, and cannot open the shop;
- seven-type two-person compatibility reflection;
- source-bound public-birth-date celebrity comparison;
- privacy-safe local SVG share cards;
- the Reality Check Loop, browser-local review-month capture, and read-only navigation across current and prior monthly pattern reports;
- a guest privacy center for independent consent, language/time-zone preferences, validated device export, and complete local deletion;
- bilingual pre-release privacy and terms pages that surface unresolved launch-review fields;
- region-labelled official crisis resources without inferring location from the selected language;
- consent-gated analytics, personalization, entitlement, billing, data-rights, and AI-provider contracts;
- accessibility, mobile WebKit, security-header, PWA manifest, performance, release regression, CycloneDX SBOM, and deterministic store-asset coverage.

The responsive website/PWA is the canonical first product. Native apps follow only after web activation, Reality Check return behavior, accessibility, safety, deletion, and unit economics are proven. External authentication, database, live paid AI, payments, monitoring, commerce, and deployment are intentionally not connected until the user authorizes service accounts and production work.

## Local setup

Prerequisites: Node.js 24 and pnpm 11.9.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/ko` or `/en`. Privacy controls are available at `/ko/me`, relationship reflection at `/ko/relationship`, two-person comparison at `/ko/compatibility`, sourced celebrity comparison at `/ko/celebrity`, Reality Check at `/ko/reality-check`, and the closed shop preview at `/ko/shop` (replace `ko` with `en` for English).

Verification:

```bash
pnpm verify
pnpm test:e2e
pnpm audit --prod
pnpm generate:sbom
```

On a new machine, Playwright may first need `pnpm exec playwright install --with-deps chromium webkit`.

## Architectural invariants

- Code, not AI, calculates numerology.
- Code, not AI or a seller, maps canonical facts into accessory/music reflection directions.
- Sponsored placement cannot enter the organic personal-result order, and a commerce readiness check cannot render purchasing controls or deploy.
- A seeded and auditable engine, not AI, draws tarot cards.
- Calculated facts, traditional symbolism, contextual inference, and limitations remain visibly separate.
- Guest input stays in browser memory unless the user explicitly enables on-device history.
- A relationship environment reaches Reality Check only after an explicit click through a strict 30-minute, one-time current-tab draft; it never uses URL parameters or persistent fallback storage.
- Share cards are rendered locally from allowlisted payloads and omit birth dates, names, questions, journals, and contact details.
- Marketing, AI personalization, model training, and raw-journal retention require separate consent.
- Medical, legal, investment, self-harm, violence, and crime questions are routed to reality-first safety handling.
- Crisis contacts are shown as region-labelled options with official sources; language is never treated as the user's location.
- A web-app manifest is included, but a service worker is deliberately absent until sensitive offline caching receives privacy review.

Read [Continuation State](docs/Continuation-State.md) first when resuming the project. The strict keep/improve/hold assessment is in [Feature Audit](docs/Feature-Audit.md). Operational boundaries are in [Operations Runbook](docs/Operations-Runbook.md), crisis behavior is in [Crisis Response Protocol](docs/Crisis-Response-Protocol.md), and the local security baseline is in [Security Review](docs/Security-Review.md).
