# InnerArc

InnerArc is an AI self-discovery and personal pattern intelligence platform. It combines deterministic numerology, auditable tarot symbolism, user context, and later outcome reviews. It does **not** claim scientific prediction: symbolic systems are prompts for reflection, and personal relevance is checked against lived experience.

## Current scope

Version 0.18.1 provides a web-first, guest-first Korean/English application with:

- a mobile-first premium homepage that introduces the InnerArc pattern model, previews a result, explains four analysis fields, and leads clearly into the existing free calculation flow;
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
- privacy-safe local PNG/SVG share cards with explicit native file sharing, cancellation handling, and a download fallback that adds no upload, tracking, or browser storage;
- native Korean/English link-preview metadata and a first-party 1200×630 GYEOL social card with no personal result data or tracking dependency;
- the Reality Check Loop, browser-local review-month capture, and read-only navigation across current and prior monthly pattern reports;
- a guest privacy center for independent consent, language/time-zone preferences, validated device export, and complete local deletion;
- optional Supabase email sign-in with explicit owner-scoped upload/restore, account export, and atomic server-record deletion;
- a fail-closed PayApp hosted checkout with virtual-account deposit notifications plus PortOne/Toss fallbacks, server-owned 9,600/39,000 KRW active products, guest or optional-account purchase, verified payment callbacks, post-payment reports, downloads, My Page storage, notification preferences, and an allowlisted admin console;
- a per-condition payment readiness report in that console that names the variable closing checkout without ever showing its value, records the payment company's own rejection wording, and lets the owner grant the launch approval without a redeploy;
- route-level and root error boundaries, a bounded settings read, and a secret-free `/api/health` endpoint so page changes cannot silently take the storefront down;
- a temporarily retired Core product retained only for historical-order and stored-report compatibility;
- bilingual pre-release privacy and terms pages that surface unresolved launch-review fields;
- region-labelled official crisis resources without inferring location from the selected language;
- consent-gated analytics, personalization, entitlement, billing, data-rights, and AI-provider contracts;
- accessibility, mobile WebKit, security-header, PWA manifest, performance, release regression, CycloneDX SBOM, and deterministic store-asset coverage.

The responsive website/PWA is the canonical first product. Native apps follow only after web activation, Reality Check return behavior, accessibility, safety, deletion, and unit economics are proven. Supabase Auth/Postgres is connected for optional account sync. PayApp checkout opens whenever the live provider credentials, database, callback domain, and code-owned catalog are valid; there is no separate administrator launch-approval gate. The administrator console remains protected by Supabase sign-in and an `ADMIN_EMAILS` allowlist. Live paid AI, monitoring, and physical commerce remain outside the current launch boundary.

## Local setup

Prerequisites: Node.js 24 and pnpm 11.9.

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000/ko` or `/en` so the local Supabase magic-link callback stays on the same host as its PKCE cookie. Privacy controls are available at `/ko/me`, payment readiness at `/ko/plans`, relationship reflection at `/ko/relationship`, two-person comparison at `/ko/compatibility`, sourced celebrity comparison at `/ko/celebrity`, Reality Check at `/ko/reality-check`, and the closed physical shop preview at `/ko/shop` (replace `ko` with `en` for English).

Copy `.env.example` to `.env.local` and fill the two public Supabase values to enable email sign-in and account sync. Keep database credentials, payment secrets, and service-role keys out of browser-prefixed variables. Payment launch requirements are in [the Korean payment, legal, and domain checklist](docs/PAYMENTS-LEGAL-DOMAIN-LAUNCH-KO.md); when checkout is closed, `/{locale}/admin` names the specific condition responsible.

Verification:

```bash
pnpm verify
pnpm test:e2e
pnpm audit --prod
pnpm generate:sbom
```

On a new machine, Playwright may first need `pnpm exec playwright install --with-deps chromium webkit`.

## Deployment

**`https://mygyeol.kr` is the live site and the only address in use.** It is a Cloudflare
Worker built by `pnpm build:sites`. Earlier `*.workers.dev` preview URLs are retired, and
the Vercel project attached to this repository builds the same source but is not what the
domain serves — a green Vercel deployment is not evidence that a change reached visitors.

`.github/workflows/deploy.yml` ships it: after CI passes on `main` it builds, deploys, and
then asks the live site whether its database and home page still answer, failing the run
if they do not. It needs two repository secrets, `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`.

Two things make a hand-run deploy dangerous, and both are handled in that workflow:

- **`wrangler deploy` deletes every Worker variable** unless `--keep-vars` is passed. The
  Supabase keys, PayApp credentials, and `ADMIN_EMAILS` live in the Cloudflare dashboard,
  not in this repository, so a deploy without that flag takes payments and the database
  down on a working site.
- **A deploy replaces the Worker's bindings** with whatever the generated config declares.
  `worker/index.ts` uses `env.IMAGES`, so `vite.config.ts` declares that binding; without
  it every optimized image on the live site breaks.

To check what is actually live, request the site and look for something the build
introduced rather than reading a deployment dashboard. The reasoning is in
[Route and feature inventory](docs/Route-Feature-Inventory.md).

## Architectural invariants

- Code, not AI, calculates numerology.
- Code, not AI or a seller, maps canonical facts into accessory/music reflection directions.
- Sponsored placement cannot enter the organic personal-result order, and a commerce readiness check cannot render purchasing controls or deploy.
- A seeded and auditable engine, not AI, draws tarot cards.
- Calculated facts, traditional symbolism, contextual inference, and limitations remain visibly separate.
- Guest input stays in browser memory unless the user explicitly enables on-device history.
- Account records reach Supabase only after sign-in and an explicit sync action; row-level security limits every table to the authenticated owner.
- A relationship environment reaches Reality Check only after an explicit click through a strict 30-minute, one-time current-tab draft; it never uses URL parameters or persistent fallback storage.
- Share cards are rendered locally from allowlisted payloads and omit birth dates, names, questions, journals, and contact details. Native sharing passes one generic-titled PNG with no text or URL only after a user click; unsupported devices download the same PNG locally.
- Marketing, AI personalization, model training, and raw-journal retention require separate consent.
- Medical, legal, investment, self-harm, violence, and crime questions are routed to reality-first safety handling.
- Crisis contacts are shown as region-labelled options with official sources; language is never treated as the user's location.
- A web-app manifest is included, but a service worker is deliberately absent until sensitive offline caching receives privacy review.

Read [Continuation State](docs/Continuation-State.md) first when resuming the project. The strict keep/improve/hold assessment is in [Feature Audit](docs/Feature-Audit.md). Operational boundaries are in [Operations Runbook](docs/Operations-Runbook.md), crisis behavior is in [Crisis Response Protocol](docs/Crisis-Response-Protocol.md), and the local security baseline is in [Security Review](docs/Security-Review.md).
