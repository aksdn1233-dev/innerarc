# Continuation State

Last updated: 2026-08-01 (scheduled summer pricing and inactive referral foundation)<br>
Current version: 0.20.0
Overall progress: 97% (web MVP code 100%; production deployment and payment path 98%; native app not started)

## 2026-08-01 — Scheduled summer pricing and inactive referral foundation

- Current detailed/premium prices are explicitly labelled as a summer event. The
  compact banner and crossed-out normal prices remain visible through 2026-08-03
  23:59:59 Korea time. At 2026-08-04 00:00 the same server-owned clock restores
  39,000/79,000 KRW, removes all event UI, and charges the restored amounts.
- Checkout sends the amount the buyer saw. If a tab crosses the deadline before the
  click, the server returns `PRICE_CHANGED` instead of silently charging a different
  amount. Known sale/normal deployment assertions no longer turn the deadline into an
  outage; unknown values still fail closed.
- A friend-referral foundation is code-complete but deliberately inactive and absent
  from the public UI/API. Draft policy is 25% per verified new paying friend, capped at
  two friends/50%; raw phone numbers are normalized then HMAC-hashed, self/duplicate
  claims are database-constrained, and the draft migration has not been applied.
- Remaining launch decision: approve the referral cap, campaign stacking rule, refund
  qualification window, and customer-facing alias/code design before applying the
  migration or setting `REFERRAL_DISCOUNT_ENABLED=true`.
- Validation passed: ESLint, strict TypeScript, the complete 58-file/541-test unit
  regression, Next production build, Sites production build, and ten checkout/browser
  flows across desktop Chromium and mobile WebKit. The first browser pass exposed a
  stale hard-coded event-price assertion and one mobile timing retry; the assertion was
  tied to the active product row, the current build was regenerated, and all ten flows
  passed together on the clean rerun.

## 2026-08-01 — One-tap PayApp checkout and simpler page hierarchy

- Replaced `결제수단 불러오기` with `바로 결제하기`. After local validation and
  server-side order creation, an active PayApp order now saves its guest recovery link
  and moves directly to the provider checkout in the same tab. The intermediate local
  payment-method panel and second payment button no longer appear for PayApp.
- Preserved phone validation, server-owned prices, duplicate-click protection, rate
  limits, sales pause, signed callbacks, payment-status recovery, and the instruction
  not to retry before checking approval. The direct action changes only navigation,
  not the payment security boundary.
- Simplified the main journey without removing its core promises: three quiet reflection
  prompts replace nine floating prompts and a decorative geometry layer; report examples,
  product descriptions, form copy, shadows, radii, cards, and disclosure placement are
  shorter and calmer. The locked free pattern remains visibly locked, and legal/refund
  content remains available under one disclosure.
- Validation passed: ESLint, strict TypeScript, production Next build, 56 unit-test
  files with 533 tests, ten direct-checkout browser flows across desktop and mobile, and 390×844 visual
  inspection of the complete home and plans pages. One full-regression failure correctly
  caught removal of the explicit non-testimonial disclosure; the disclosure was restored
  and its focused regression now passes. The complete regression and Sites production build
  are green; GitHub and the public release use this exact validated state.

## 2026-08-01 — Product-name encoding and solar-calendar input correction

- Replaced three corrupted Korean payment product names with `핵심 리딩`, `상세 리딩`,
  and `프리미엄 심층 리딩`. Added exact-text and mojibake regression checks around the
  server-owned PayApp catalog so the checkout cannot silently ship corrupted titles again.
- Every user-facing birth-date input now says `양력` in Korean and `Gregorian calendar`
  in English. The paid report intake also explains that the subject person's solar-calendar
  date must be entered; no lunar-date conversion or ambiguous calendar inference is performed.
- Validation and release passed: ESLint, strict TypeScript, 55 unit-test files with
  530 tests, the complete Sites production build, GitHub synchronization, and public
  deployment. `mygyeol.kr` returned 200 for home, plans, health, and administrator login;
  the corrected Korean names and solar-calendar copy are present, three consecutive
  health checks reported database `ok` and payments `open`, and recent worker errors were zero.

## 2026-08-01 — Production recovery and direct PayApp checkout

- The custom domain `mygyeol.kr` is active with an active TLS certificate. The public
  deployment now includes the dynamic worker routes required by `/api/health`, PayApp
  order/feedback/return processing, Supabase auth callbacks, and the administrator
  console; the previous live artifact returned 404 for every server route.
- Removed the separate administrator launch-approval feature and its endpoint. A valid
  PayApp/database/domain/catalog configuration opens checkout directly. The independent
  incident sales-pause switch remains, but it does not interfere with payment callbacks.
- Removed stale deployment price assertions left at 39,000/79,000 KRW. The code-owned
  catalog is authoritative: the retired 19,000 KRW offer is not purchasable, and the
  live products are 9,600 KRW and 39,000 KRW.
- Restored an allowlisted Supabase administrator page at `/ko/admin` with order,
  revenue, payment readiness, provider error, failed-report, inquiry, pause, mark-paid,
  and refund/cancel operations. Login remains magic-link based and restricted by
  `ADMIN_EMAILS`.
- Replaced unsupported file-based metadata routes with explicit worker routes for
  `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`; the brand icon is copied
  into the production client artifact during the Sites build.
- Verified strict TypeScript, targeted payment/security/metadata tests, the complete
  worker build, public health/routes, checkout creation, and PayApp-hosted checkout URL.

## 2026-07-31 — Checkout no longer fails closed silently

The reported symptom was correct PayApp credentials and a checkout that still refused
to open, with nothing anywhere saying why. Three separate causes were possible and
none of them was visible from outside.

- **Diagnosis.** `/ko/admin` now carries a 결제 열림 상태 panel that reports each of the
  nine conditions gating checkout — provider, launch approval, provider credentials,
  exposed payment methods, prices, database, production domain, administrator accounts,
  sales switch — as 정상/필요/오류 with the environment variable *names* to fix and one
  next action each. Values are never sent to the browser; a regression test asserts no
  configured secret appears in the serialized report.
- **Prices no longer require a deployment secret.** `INNERARC_COMPREHENSIVE_PRICE_KRW`
  and `INNERARC_PREMIUM_PDF_PRICE_KRW` are now optional assertions about the code
  catalog instead of its source. Absent means "use the catalog"; a value that disagrees
  still fails closed. The 2026-07-31 price reset (39,000/79,000 → 9,600/39,000) would
  otherwise have closed every deployment still holding the previous values, which is
  indistinguishable from an outage.
- **Superseded on 2026-08-01:** the launch-approval control described in this historical
  entry was removed. Current checkout readiness uses provider, credentials, database,
  HTTPS domain/callbacks, and the code-owned catalog directly.
- **Provider rejections are readable.** PayApp's own wording now survives the API
  boundary into `payment_setup_events` and the console's 최근 결제사 오류 list, so a
  merchant-side cause is distinguishable from a bug. The buyer still sees only the
  generic checkout error.
- **The plans page and the order API now read the same gate**, so the product page can
  no longer advertise a checkout the server would refuse.

## 2026-07-31 — Every Vercel deployment was failing, including main

Found while following this branch's CI: the Vercel project had not produced a single
successful build in weeks. `main` and every branch failed identically.

- **Cause.** `getSupabasePublicConfig` accepted only the current `sb_publishable_…`
  key shape and rejected the legacy anon JWT that most existing Supabase projects
  still hold. Because `next.config.ts` reads it at module scope, the rejection threw
  during config evaluation and aborted the entire build before any page rendered.
- **Fix.** Legacy anon keys are accepted, and the security property the check exists
  for is now stronger rather than weaker: a legacy token is admitted only after its
  own `role` claim reads `anon`, so a service-role JWT is refused for what it is
  instead of for its format. `sb_secret_…` is refused by name.
- **Blast radius.** Config reads that only widen the CSP no longer abort the build.
  A rejected value logs `[config] … is unusable, continuing without it` and the site
  deploys; the feature depending on it was broken either way, and the administrator
  console now names the variable. This also defused a second latent build-killer in
  the AI provider readiness check.
- Reproduced the exact Vercel error locally on the pre-fix commit, then confirmed both
  a legacy anon key and a genuinely malformed value now build to completion.

## 2026-07-31 — Service continuity during page work

- Added `src/app/[locale]/error.tsx`, `src/app/global-error.tsx`, and
  `src/app/not-found.tsx`. The application previously had no error boundary at all, so
  one failing route rendered a blank browser error for the whole segment.
- `/api/health` reports `status`, `site`, `database`, `payments` with no secret,
  revenue, or order count, always as HTTP 200, for a one-click check after any change.
- Every settings read is bounded at 3 seconds and degrades to a defined default, so an
  unresponsive Supabase cannot hang a page render. The sales switch fails open; the
  launch approval fails closed.
- The new migration is additive and the code tolerates its absence, so deploying ahead
  of the migration keeps checkout working on the environment-flag path.
- Verified: ESLint, strict TypeScript, 519 unit/integration tests (was 480), the
  61-route Next.js production build, and the Chromium/mobile browser suites including
  the isolated fake-provider checkout run. No real order or payment was created.

## 2026-07-31 — Homepage free-core entry locked

- The Korean and English home hero no longer link visitors into the free core-pattern
  flow. The former secondary link is now a visibly muted, disabled button with an
  explicit locked accessible name.
- The deterministic profile route and calculation engine remain intact for existing
  regression coverage and a possible later commercial decision; this change is a
  discoverable-entry lock rather than deletion of the underlying engine.
- Verified: ESLint, strict TypeScript, all 480 unit/integration tests, the 58-route
  Next.js production build, and all 19 focused Chromium onboarding/mobile/privacy
  flows.

## 2026-07-31 — Two-product pricing reset

- New Core (`plus_30d`) sales are temporarily retired. The product is absent from
  home, onboarding, plans, and the new-order API allowlist, while historical orders,
  stored reports, downloads, and the legacy composer remain compatible.
- Detailed (`pro_30d`) is now 9,600 KRW and Premium (`premium_pdf`) is now 39,000
  KRW across Korean/English product cards, mobile CTA, checkout, legal copy, admin
  labels, environment examples, and server-side amount validation.
- Stale 39,000/79,000 deployment price secrets fail closed instead of charging an
  amount that disagrees with the product page. Only `pro_30d` and `premium_pdf` can
  create new orders.
- The two-card desktop grids now use two equal columns and retain the existing
  single-column mobile layout.
- Verified locally: changed-source ESLint, strict TypeScript, the complete 480-test
  unit/integration suite, a post-catalog-extraction 38-test pricing/payment rerun,
  and the deployable Sites build. The Windows Next.js build reached page generation
  but was stopped after severe machine-wide I/O contention from a separate project;
  clean GitHub CI then passed full ESLint, TypeScript, 480 tests, production build,
  dependency audit, SBOM, 140 Chromium/mobile checks (9 intentional skips), and the
  isolated fake-provider checkout verification.

## 2026-07-31 — Mobile home visual refinement

- The hero's contextual question prompts now render as quiet floating text without
  speech-bubble borders, fills, tails, blur, or box shadows. Mobile positions use
  positive insets so no prompt is clipped against the hero frame.
- Mobile reading-field cards now keep a responsive 22–30 px horizontal content
  gutter instead of placing headings and body copy against the panel edge.
- A new 390x844 browser regression verifies the undecorated prompt treatment,
  in-frame prompt bounds, reading-field insets, and absence of horizontal overflow
  in both Chromium and mobile WebKit.
- The source was based on the fetched `origin/main` revision `ff7c4af`; the separate
  project worktree and its running services were not modified or stopped.
- Verified: ESLint, strict TypeScript, 480 unit/integration tests, the 58-route Next.js
  production build, deployable Sites build, focused Chromium and mobile WebKit flows,
  and reviewed mobile screenshots.

## 2026-07-31 — PREMIUM_79000 strict-superset correction

- The 79,000 KRW product keeps the payment, entitlement, environment, and persistence
  code `premium_pdf`, but all new purchases now route to the isolated deterministic
  `premium-report-composer-2.0.0`. The customer label is consistently
  `프리미엄 심층 리딩 · 79,000원`; PDF is no longer part of the product name.
- Premium is now a machine-audited strict superset of DETAIL_39000. It calls the
  detailed composer for the same input, preserves its character label and all
  calculated facts, deepens every one of 21 detailed categories, and adds 14 premium
  categories. Runtime creation fails closed if coverage, enrichment, logic, or
  calculation comparison arrays are non-empty.
- Premium adds four-number synthesis, hidden motivation and defense, the
  strength-to-failure paradox and root cause, three complete scenarios with triggers,
  actions, results, observable signs, responses, and thresholds, a five-part decision
  framework, a six-gate execution manual, seven risk checks, six hold/stop/pivot
  conditions, long-term strategy, consultant verdict, and grounded closing advice.
- The 1968-06-23 fixture is locked as Life Path 8, Birthday 23/5, Attitude 29/11/2,
  Birth Year 24/6, and 2026 Personal Year 3. Premium combines authority and resource
  operation, adaptability, social sensing and coordination, and responsibility and
  protection without inventing private facts or future years.
- Question input is optional for Premium. A blank question produces a complete
  person/work/money/collaboration/close-relationship/2026 report; a supplied question
  additionally focuses the direct answer, scenarios, signs, execution gates, and risk
  criteria. Question routing covers business, career, promotion, money, love,
  reconciliation, compatibility, child, study/exams, lesson business, health,
  housing, private facts, and general growth.
- The result renderer now has a premium mobile-first plan: tier, birth-date basis,
  question or birth-date title, direct answer, character and first analysis appear
  before progressive calculations. Inherited detail, actions/manual, stop criteria,
  premium synthesis/scenarios/checklists, verdict, safety and closing advice follow in
  decision order. Saved HTML uses the same order and old stored reports retain their
  legacy render path.
- Payment names and plan copy changed only at the customer-facing label boundary.
  Provider product code, environment price key, server-authoritative 79,000 KRW price,
  callback verification, refund revocation, order access, and stored-report schema
  remain compatible.
- Verified: strict TypeScript, warning-free ESLint, 474/474 unit/integration tests,
  a 58-route Next.js production build and deployable Sites build, a 14-domain Premium matrix, sensitive-question
  safety tests, empty-question checkout entry, and visual mobile (390×844) plus desktop
  (1440×900) browser checks with no horizontal overflow. No real order or payment was
  created.

## 2026-07-30 — DETAIL_39000 consultant-report correction

- The 39,000 KRW product keeps the payment and persistence code `pro_30d` and price
  39,000 KRW, but now routes after shared input validation to the isolated,
  deterministic `detail-report-composer-2.0.0`. BASIC_19000, PREMIUM_79000, order
  authorization, callbacks, entitlements, and stored-report lookup retain their
  existing contracts.
- Question mode now produces 16 meaningful sections around one routed domain; blank
  question mode produces an 18-section general detailed report. Both include five
  calculation facts, a character label, temperament, internal contradiction, decision
  sequence, strongest ability, explained failure mechanisms, stress response, 2026
  application, phases, 4–5 situations, five prioritized actions, three stop criteria,
  and a final conclusion.
- Stored exact content for the standing 1994-11-04 vector locks Life Path 11/2,
  Birthday 4, Attitude 6, Birth Year 5, and 2026 Personal Year 7. It covers market
  intuition, system building, intuition-before-evidence, completion and delegation
  risks, AI/web/platform/content/automation directions, cash-flow and relationship
  failure modes, and 2026 validation, legal, privacy, security, and technical review.
- Detailed routing now covers business, career, promotion, money, love,
  reconciliation, compatibility, child, lesson/education, health, housing,
  private-fact uncertainty, and two-person relationship questions. Medical/legal and
  loan-result questions keep qualified reality checks; private facts and future years
  are not invented.
- New detailed reports use additive optional `sectionPlan`, `calculationBasis`, and
  internal-only `contentReferences` fields. Existing stored reports without these
  fields still render through the legacy branch. Content references are excluded from
  the web page and saved download.
- The mobile-first result header now places tier, birth-date basis, question/title,
  direct answer, character label, and character analysis before progressive
  calculation detail. Body text is at least 16 px with 1.72 line-height and 20 px
  mobile card padding. Execution, stop criteria, final conclusion, and safety guidance
  use distinct ordered cards; the saved HTML download follows the same order.
- Customer-facing 39,000 KRW labels now say `상세 리딩` / `Detailed reading`; the
  question is optional for this tier so a birth-date-only general report can be
  purchased. Price, currency, product code, and provider boundary are unchanged.
- Verified: strict TypeScript, ESLint, 468/468 unit/integration tests, a 58-route
  Next.js production build, 129/129 applicable default Chromium/mobile E2E scenarios
  (9 payment-environment scenarios skipped), and all 8 explicitly enabled checkout
  scenarios. No real payment was created.

## 2026-07-30 — BASIC_19000 complete-report correction

- The 19,000 KRW product keeps the payment-critical code `plus_30d` and canonical
  display tier `BASIC_19000`, but now routes after input validation to an isolated,
  deterministic `basic-report-composer-2.0.0`. The 39,000/79,000 KRW composers,
  authorization, order creation, payment callbacks, stored-order lookup, and
  entitlements were not renamed or rewritten.
- The composer combines the existing deterministic calculation and stored profile/topic
  tables into either a complete ten-section general report or an eight-section,
  one-domain question report. It always includes five calculation facts, a memorable
  character phrase, core temperament, repeated weakness, 2026 direction, exactly three
  actions, and a final conclusion. A blank question is now valid only as an intake
  choice for producing the general report; the birth date remains required.
- The standing 1994-11-04 vector is locked as Life Path 11/2, Birthday 4, Attitude 6,
  Birth Year 5, and 2026 Personal Year 7. Stored combination copy names it
  "가능성을 구조로 만드는 설계자" and covers people/market intuition,
  idea-to-system execution, scattered projects, premature expansion, close-relationship
  risk, and a 2026 validation/completion direction.
- Added explicit routing and regression cases for general, business, career, money,
  love, reconciliation, child, lesson/education, health, housing, private-fact, and
  compatibility questions. Health copy no longer invents a precise two-week/5-percent
  threshold; private facts are not fabricated; a two-person comparison asks for the
  second birth date and stays in the separate compatibility flow.
- New reports carry additive optional `sectionPlan` and `calculationBasis` fields.
  Because both are optional, reports stored before this change continue through the
  legacy renderer. The new mobile renderer uses a compact five-number strip, 16 px
  minimum body type, 1.72 line-height, 20 px card padding, and places exactly three
  actions immediately before the final conclusion. Download output uses the same order.
- Customer-facing 19,000 KRW labels now say "핵심 리딩" / "Core reading" instead of
  implying a tarot draw. Price, currency, product code, and payment-provider boundary
  remain unchanged.
- Verified: strict TypeScript, ESLint, 445/445 unit/integration tests, a 58-route
  production build, and 129/129 applicable Chromium/mobile E2E scenarios (7
  environment-gated scenarios skipped). The 6 checkout/payment scenarios were then
  unlocked explicitly and all 6 passed in Chromium/mobile. Coverage includes report length
  (2,500–4,000 Korean characters), routing, deterministic facts, exact action count,
  safety, legacy compatibility, payment configuration, mobile renderer structure, and
  blank-question checkout intake.

## 2026-07-30 — Payment and release-quality audit

- Work was performed in the isolated `innerarc-payment-audit` worktree on branch
  `agent/supabase-toss-payments`. The original workspace, its uncommitted Reality Check
  work, and the unrelated service occupying port 3000 were not changed or stopped.
- Checkout now updates the chosen product and paid-reading input atomically, validates
  phone/depositor fields before creating an order, and distinguishes paused sales,
  rate limiting, order, widget, and provider failures. A hosted payment remains usable
  if optional local report-link persistence fails.
- Historical note: this release briefly required a server-only launch flag. Version
  0.18.2 removed that extra gate so a correctly configured PayApp checkout opens
  directly; the operational sales-pause switch remains available.
- Restored the payment-independent Korean/English free core profile at
  `/{locale}/profile` and removed whole-route entitlement redirects from deterministic
  Free-tier question, relationship, compatibility, celebrity, and Reality Check routes.
  Purchased report delivery remains fail-closed.
- Removed the more-than-100-file Korean webfont request fan-out, switched to bounded
  system stacks, and replaced the 1.78 MB hero PNG in production CSS with a visually
  reviewed 41.8 KB WebP. Replaced stale InnerArc social artwork with the 1200×630 GYEOL
  asset and corrected metadata/icon browser assertions.
- Verified locally: 425/425 unit/integration tests, ESLint, strict TypeScript, 58-route
  Next.js production build, 66 focused Chromium scenarios, and 20 iPhone/WebKit
  onboarding/payment scenarios. The mobile run exposed and fixed a hydration race in
  checkout testing and a navigation-completion race; no real order or payment was made.
- Full dependency audit reports zero known vulnerabilities. The validated CycloneDX 1.6
  SBOM for version 0.17.1 contains 110 production components.
- The final Vinext/Cloudflare Workers build completed for all application and API routes.
  No deployment was performed.
- Remaining launch blockers are external evidence, not hidden code completion:
  real seller/legal/refund/support disclosures, approved permanent domain/callbacks,
  live low-value approval/cancel/virtual-account tests, two-account staging isolation,
  monitoring/transactional email, and explicit owner launch approval. The accessory
  shop remains closed and native apps remain deferred until web evidence is accepted.

## 2026-07-30 (round 3) — Tier centralization, sharp insights, character label surfaced

- Confirmed no 17,000 KRW reference exists anywhere in source (grep + a permanent test
  guard, `tests/unit/tiers.test.ts`). Prices were already centralized in
  `src/server/payments/config.ts`'s `buildProducts()`, env-driven, correctly
  19,000/39,000/79,000. Added `src/core/tiers.ts` as a *display* single source of truth
  (canonical names BASIC_19000/DETAIL_39000/PREMIUM_79000, tier badge labels, sharp-
  insight counts per tier) without renaming the payment-critical `plus_30d`/`pro_30d`/
  `premium_pdf` codes — those are load-bearing across payment config, DB rows, order-pass
  tokens, and ~15 test files, so renaming them was judged higher-risk than the benefit.
- Added `src/core/profile/sharp-insights.ts`: 8 bilingual "behavioral contradiction"
  sentences per life-path number (12 × 8 = 96), authored via a parallel Workflow grounded
  strictly in the existing THEMES strength/shadow table so they stay consistent with the
  rest of the profile system. Sliced 2/5/8 by tier, always as an ordered prefix (a lower
  tier's insights are always the start of a higher tier's, never a different set).
- `PaidReport` gained four additive, optional fields: `tierLabel`, `characterLabel`,
  `sharpInsights`, `contentVersion`. Legacy stored reports lack them; the renderer
  (`src/app/[locale]/reports/[orderId]/page.tsx`) guards every one with `??`/`&&` so old
  records still render unchanged. The tier badge now shows in the header eyebrow
  ("핵심 리딩 · 19,000원" etc.) and the character label as its own styled line.
- Added two concern topics found missing while building the regression cases:
  `child_temperament` (자녀 성향·진로 — distinct from the existing worry-framed
  `children` topic; suppresses the premium tier's adult career-role section, since
  naming job titles like 전략기획/영업 for a child's own numbers was a real bug found
  this round) and `client_acquisition` (고객·수강생 확보, for freelancer/instructor
  "will I get customers" questions — needed for the violin-lesson regression case).
- Regression tests added for the three new cases from this round's instructions
  (education/lesson business, relationship contact-timing, child temperament) plus a
  "premium is not detail with adjectives" length/exclusivity guard. Note: the
  relationship case as specified gives two birth dates, but `createPaidReport`'s schema
  takes one birth date and free text — that is by design (the second-person case
  belongs to the separate `src/core/compatibility` feature); tested here the way a real
  buyer would actually use this product.
- Depth for the standing regression case (birth 1994-11-04, web-business question) is
  now 1,100 / 2,080 / 3,655 characters for basic/detail/premium — up again from last
  round's 828/1,735/3,105, still short of the 1,800–3,000 / 4,000–7,000 / 8,000–14,000
  character targets floated this round. See prior entry for why: the remaining gap is
  bulk domain-specific content (business/career/money/love/child/health/housing detail
  per number combination), which is a large authoring project, not a wiring one.
- Verified: `tsc --noEmit` clean, `eslint .` clean, `vitest run` 417/417 passing (was
  400). Built, deployed (Version ID `c2933cad-ba9b-42c1-9fa1-8b90db3566a3`), smoke-tested
  live with no console errors.

## 2026-07-30 — Reading-quality and content-depth pass

- Removed a residual tarot-archetype leak: `getRuleBasedProfile`'s `overview.summary`
  (an unquoted `"{archetype} 자리에서..."` sentence, e.g. "정의 자리에서...") was still
  spliced into the paid pro/premium "왜 이런 흐름이 나오나" section even after the
  visible tarot-card reference was replaced with a character label earlier. It is no
  longer imported by `paid-report.ts`; a source-level regression test guards the import.
  The free onboarding archetype/share-card feature (`share.test.ts`, `onboarding.spec.ts`)
  is untouched — that is a separate, deliberately tested feature.
- Added `src/core/profile/personal-year-theme.ts`: a deterministic personal-year
  (1–9/11/22/33) theme table used to give the pro/premium tier sections real
  "why this year" timing content instead of generic phrasing.
- Added four concern topics with regex ordering checked against existing patterns:
  `divorce`, `pregnancy_fertility` (relationship-extra), `business_partner` (work-extra),
  `lawsuit` (urgent, escalate:true). Note: the existing `assessQuestionSafety` legal/medical
  gate (`소송|법률|구속|계약서`, `임신|진단|질병`) intercepts several of the most common
  phrasings before topic resolution — this is pre-existing, deliberate behavior, so these
  topics are reached by their less-overlapping phrasings (고소장, 손해배상, 난임, 시험관, ...).
- Expanded `framing`/`observe`/`action`/`caution` prose across all ~57 topics in the five
  topic files (one added concrete sentence per field, ko+en) via a parallel Workflow, one
  agent per file. Bumped `plus_30d`'s domain-section count from 1 to 2.
- Net depth for the regression case (birth 1994-11-04, "사업 준비 중인데 웹사업 잘될까
  올해"): plus_30d 679→828 chars, pro_30d 1,368→1,735 chars, premium_pdf →3,105 chars.
  Still short of the ~1,500/3,000/6,000+ character targets floated for this pass — the
  remaining gap is in the shared "당신은 어떤 사람인가" character section and the
  8-domain content in `integrated-profile.ts`, neither of which was touched this round
  (higher risk: shared THEMES tables feed multiple features, not isolated topic data).
- Verified: `tsc --noEmit` clean, `eslint .` clean, `vitest run` 400/400 passing (was
  399). Built, deployed to `https://gyeol.aksdn1233.workers.dev` (Version ID
  `74aef45f-824b-44e3-a72c-465fe653b62e`), and smoke-tested live with no console errors.
- Deferred, not done: a real content database/coverage-matrix/approval-workflow
  architecture (would be a separate, larger, migration-backed project); a price change to
  match an external spec's numbers (would touch live PayApp product mappings — needs
  explicit approval, not silently changed).

## Active worktree status

- `CODEX-WINDOWS-HANDOFF.md` is the exact Windows continuation guide for the current worktree.
- Version 0.17.0 retains the complete 0.16.0 account-sync scope and adds the premium bilingual homepage plus a disabled-by-default Toss Payments V2 foundation.
- The homepage preserves InnerArc, the existing analysis engine, routing, authentication, and payment boundaries while adding a report preview, four analysis fields, free-input CTA, 30-day pass summary, trust guidance, and responsive editorial layout.
- Verified locally on the integrated current source: 275/275 unit/integration tests across 28 files, full ESLint, TypeScript, 40-output production build, Chromium 62/62, and mobile 61/62 with one intentional hardware-keyboard skip.
- Supabase migrations `20260727000100` through `20260727000400` are applied to the Singapore project. The payment foundation adds owner-scoped orders, events, entitlements, and atomic verified grants while anonymous access fails closed.
- Remote migration parity and schema lint passed with no errors; the temporary setup database password was then rotated and is not retained in the workspace.
- Private GitHub repository `aksdn1233-dev/innerarc` is connected. Normal non-force `main` pushes and the full cloud CI gate are working; `local-bootstrap` preserves the two original local commits. Generated archives, dependencies, build output, environment files, and test artifacts remain excluded.
- Windows WebKit can produce transient worker exits and navigation/click timeouts after a 20+ minute session without a repeated product assertion failure. Use one worker or the file-split clean-process commands in the Windows handoff.

## Product direction

- The responsive website and installable PWA are the canonical first product.
- Native iOS/Android work is intentionally deferred until web activation, Reality Check return behavior, accessibility, safety, deletion, and unit economics are proven.
- Numerology and tarot remain symbolic self-reflection systems, never scientific prediction, diagnosis, or guaranteed decision guidance.
- The working name `InnerArc` is provisional and not cleared for public launch.

## Completed

- Phase 0 repository/environment baseline, required documents, and workspace isolation checks.
- Phase 1 bilingual Next.js foundation, guest onboarding, design tokens, consent model, security headers, manifest, CI, and test infrastructure.
- Context-aware first-result layer that uses focus, depth, optional concern, and AI-consent state without changing canonical facts or causing persistence, analytics, sharing, logging, or provider requests.
- Phase 2 versioned deterministic Pythagorean numerology with all seven MVP values, 11/22/33 preservation, Unicode-name handling, calculation evidence, and fixed vectors.
- Phase 3 canonical AI schema/fact guard, high-risk routing, deterministic eight-domain/career fallback, metered runner, consented context contract, and a disabled-by-default OpenAI Responses candidate.
- The OpenAI candidate uses strict JSON Schema, `store: false`, raw-date/name minimization, fixed endpoint/no redirects, refusal/incomplete metering, abort propagation, explicit cost rates, production model pinning, and client-bundle secret checks. It is not approved or enabled.
- Phase 4 canonical bilingual 78-card tarot data, nine spreads, secure/fixed seeded draws, reversals, manual physical-card input, immutable provenance, history, export/delete, and safety handling.
- Reflective reading-room UX with first-party card-back geometry, portrait-format drawn cards, upright semantic text for reversed cards, progressive audit disclosure, reduced-motion/forced-color support, and no remote art or prediction theatre.
- Phase 5 relationship energy, realistic meeting-context hypotheses, future-partner qualities, seven-type compatibility, source-bound celebrity comparison, and privacy-safe share cards.
- Explicit per-context relationship-to-Reality-Check handoff: purpose-limited editable draft, 30-minute current-tab expiry, one-time consumption, clean URL, no profile/third-party/location transfer, no automatic record, and fail-closed storage handling.
- Phase 6 immutable Reality Check records, five relevance ratings, outcome review, idempotency, export/delete, browser-local review-month capture, prior-month navigation, disclosed legacy fallback, and monthly pattern grouping.
- Explicit-use outcome-informed relationship analysis: two-review minimum, two-thirds relevant/missed treatment, mixed/insufficient states, category isolation, bounded untrusted learning notes, raw-field exclusion, and no mutation of calculations or meeting-context rankings.
- Deterministic lifestyle curation: three accessory categories and three music lanes from canonical facts, with stable Korean/English IDs/evidence, master-number coverage, practical reality checks, and explicit no-luck/healing/therapy/performance claims.
- Bilingual `/shop` preview with three future accessory categories. Products, prices, inventory, cart, checkout, affiliate links, and payment are absent by design.
- Future commerce contract with complete product disclosures, prohibited-claim screening, tracking-free public links, organic/sponsored separation, duplicate protection, and a twelve-gate launch assessment that cannot render purchase controls or deploy.
- Current competitor-pattern research covering Labyrinthos, Tarot.com, The Pattern, Co-Star, World Numerology, Forceteller, and Stoic, with first-party evidence/inference separation and an InnerArc adoption/adaptation/rejection synthesis.
- Strict weighted feature audit with Keep/Improve/Hold/Remove decisions. Reality Check is the lead differentiator; lifestyle is an experiment; celebrity is held subordinate; shop remains closed; live AI and native apps remain on hold.
- Guest privacy center, localized pre-release privacy/terms pages, region-labelled official Korea 109 and US/territories 988 resources, and complete local export/deletion controls.
- Optional Supabase email account sync with explicit device upload, validated restore, versioned account export, and atomic owner-scoped server deletion.
- Mobile-first bilingual homepage with the approved Korean headline, report preview, pattern explanation, four analysis fields, free calculation CTA, pass summary, trust guidance, and responsive 320px-to-desktop visual checks.
- Toss Payments V2 one-time 30-day Plus/Pro foundation with server-owned amounts, server-only secret use, provider re-query webhooks, virtual-account secret verification, and atomic entitlement application.
- Free/Plus/Pro policy, provider-neutral payment contracts, privacy-minimized analytics, feature flags, rate limits, account data-rights contracts, rollback runbook, SBOM, and release evidence.
- Fifteen Korean/English synthetic mobile screenshots at 1242×2688, including context-aware onboarding, relationship outcome context, lifestyle, and closed-shop views, with first-party-origin and dimension checks plus visual inspection.
- Exact-process E2E runner that refuses occupied port 3000, starts only this repository's production server, and terminates only the PID it owns.
- Exact-process launch-capture runner that refuses occupied port 3000, disables AI, starts only this repository's production server, and terminates only the child process it owns.
- Native Korean/English share-link metadata with a static first-party social image, a strict loopback/HTTPS origin resolver, and no user-derived or tracking-bearing fields.
- Explicit `E2E_PORT` and `CAPTURE_PORT` alternatives that retain occupied-port refusal and exact child ownership.
- No source, dependency, process, or configuration in another project was changed. All repository writes remain inside this workspace; Playwright browser binaries are the only shared user-cache installation.

## Current state

- The provider-neutral web MVP, relationship action-to-outcome loop, lifestyle curation, closed shop-preview scope, and tarot reading-room UX are implemented and release-regression tested.
- The site is restyled as the paid GYEOL tarot service with three server-priced products and a PayApp hosted checkout, with bank transfer, PortOne, and Toss adapters kept as alternates.
- Supabase-backed identity and explicit durable record sync are connected. PayApp checkout and its database foundation are implemented; production checkout is deliberately closed unless provider readiness, database access, the sales switch, and the separate server-only launch-approval gate all pass.
- A Cloudflare Workers build target exists and is deployed to a temporary preview URL, `https://innerarc.truth-bakery.workers.dev`, with payments unconfigured. This is not a permanent address.
- The closed shop is product architecture only, not an operating store.

## Payment defects found and fixed after the first deployment

- Guest orders were never revoked. `apply_verified_payment` withdraws report access when a delivered order later leaves `DONE`, but that function only runs for owner-scoped orders. The PayApp feedback and PortOne webhook guest branches updated `payment_orders` alone, so a cancelled or refunded guest purchase kept serving its report. Both branches now withdraw access.
- The post-payment hand-off lived in `sessionStorage`, which a virtual-account deposit hours later or a payment-app context switch does not preserve. A guest's report URL is their only proof of purchase, so losing it meant paying and receiving nothing. The link is now shown and copyable before payment, kept in expiring per-order local storage, and the return screen explains recovery with the order number instead of dead-ending.
- `src/app/icon.tsx` rendered a constant icon through `next/og`, pulling the resvg rasterizer into the worker twice and pushing it past the size limit so the deployment failed outright. The icon ships as a static PNG.
- `vinext` 0.0.50 emits `@font-face` sources as build-machine absolute paths, so every custom font 404s once deployed. `build:sites` now rewrites them to the uploaded asset URLs.
- The social card was produced by a route handler reading `public/og.png` through `node:fs`, which has no filesystem on Workers and returned 500 to every link-preview crawl. Metadata points at the static asset instead.

## Next priorities

1. Configure the live PayApp link key/value and Supabase keys as deployment secrets, register the feedback URL, and run one real low-value approval, cancellation, and virtual-account deposit end to end.
2. Connect transactional email so a guest receives their report address after purchase. Local storage is a convenience, not a durable receipt, and it is currently the only recovery path for a guest who clears their browser.
3. Validate the connected Supabase foundation with two real staging accounts, session revocation, administrative audit, backup/restore, and retention/deletion-residue evidence.
4. Resolve the seller disclosures that a public paid launch requires: the 통신판매업 registration number and a lawful published business address.
5. Complete qualified legal/privacy/age/terms, crisis-escalation, numerology/tarot editorial, Korean/English native-language, accessibility, brand/trademark, and security reviews.
6. Validate product pricing and unit economics. Separately validate accessory/music usefulness and trust before deciding whether to open commerce.
7. Before shop opening, approve suppliers, provenance, material/allergy/fit disclosures, accessibility, inventory, fulfillment, tax, shipping, return/refund, fraud, support, privacy, and consumer-law operations.
8. Move off the temporary preview deployment to an approved permanent domain. Evaluate native apps after web cohort evidence.

## On hold / external blockers

- Social auth, custom transactional email, reminders, live paid AI, payment processing, analytics sink, error monitoring, and deployment require external accounts or user authorization. Supabase's default email auth and PostgreSQL are connected.
- Final privacy notice, terms, age policy, crisis escalation, trademark/domain/app-store work, editorial review, pricing, and launch approval require qualified human or business decisions.
- Supplier contracts and every live-commerce operation are unresolved; the shop must remain closed.
- The approved production domain remains unresolved; `NEXT_PUBLIC_APP_URL` must be set to its path-free HTTPS origin before external link-unfurl validation.
- This constrained Windows host becomes unstable during a 20+ minute single WebKit process: clean focused runs pass, while later unrelated navigations/clicks can be canceled or time out. Mobile release evidence is therefore split by test file or focused flow; do not treat a long-session browser-process failure as a product assertion without a clean-process reproduction.

## Resolved defects in this version

- Split runtime configuration validation from the OpenAI adapter so `next.config.ts` no longer loads application alias modules during build.
- Replaced the vulnerable `next>postcss` 8.5.10 override with 8.5.19 after GHSA-6g55-p6wh-862q; the graph now contains one PostCSS version and audits clean.
- Removed a recognized secret-shaped dummy test key and reconfirmed workspace/client-bundle scans.
- Fixed shop small-text contrast from 4.29:1 to a passing WCAG AA value.
- Fixed the new outcome-layer eyebrow and disclaimer contrast after the first dynamic axe run measured 4.47:1 and 4.29:1; the rerun and both full browser suites pass.
- Added fail-closed commerce readiness so neither a high sponsorship score nor an approved gate can silently open or enter the organic result order.
- Fixed Reality Check static-build date staleness and UTC/local-calendar boundary rejection. The page now subscribes to the browser's local date, refreshes at midnight/visibility change, and passes an explicitly bounded local creation date to the engine.
- Replaced a Windows Playwright server-teardown hang with an exact-child lifecycle runner; full suites now return normal exit codes.
- Hardened Reality Check device imports with strict field limits, real ISO dates, monotonic timestamps, strict object shapes, and duplicate record/create/review-request rejection so local tampering cannot inflate outcome signals.
- Closed the relationship-to-action gap: every displayed meeting environment can now create an editable one-time Reality Check draft without exposing sensitive profile data or creating a record before explicit save.
- Added strict handoff rejection for unsupported contexts, extra fields, stale or future-inconsistent timestamps, wrong locale, overlong text, and unavailable session storage; invalid present items are cleared instead of repeatedly retried.
- Regenerated and visually inspected lifestyle/shop launch assets after the release UI change.
- Deferred relationship outcome-history and handoff modules until explicit interaction after the initial decoded JavaScript exceeded the 1.05 MB performance budget by 10.9 KB; the unchanged budget and all seven route checks now pass.
- Deferred the relationship share-card panel after the monthly-report work pushed initial decoded JavaScript to 1,050,285 bytes, 285 bytes over the unchanged budget. The relationship share flow remains functional and privacy-safe in Chromium and mobile WebKit.
- Moved outcome-layer focus into a render-aware effect after deferred loading exposed a keyboard-focus race; focused Chromium/mobile accessibility tests and both full project suites pass.
- Updated the deterministic capture script to target the underlying onboarding radio controls after their visible text layer intercepted pointer automation; all fifteen assets now generate and validate.
- Deferred the relationship share builder and renderer until a relationship result exists after the initial route exceeded its decoded-JavaScript budget by 285 bytes; all seven representative routes now pass without raising the budget.
- Moved question safety/result focus to render-aware effects. The WebKit regression now waits for the scheduled animation-frame focus before taking its atomic safety snapshot, eliminating an intermittent test race without weakening card suppression.
- Replaced generic tarot result blocks with CSS-generated portrait cards and retained every title, position, orientation, keyword, and draw-audit field as semantic text.
- Cleared GitHub's high-severity GHSA-mh99-v99m-4gvg alert by resolving every `brace-expansion` path to 5.0.8. A narrow `minimatch` 3 import-compatibility patch preserves ESLint, and CI now audits development dependencies as well as production dependencies.
- Removed the prior Node 20 action-runtime deprecation path by upgrading the official GitHub actions to current Node 24-based majors.
- Removed `pnpm/action-setup` after its current bootstrap logged an advisory-affected pnpm 11.7.0 stage; Corepack now activates only the repository-pinned pnpm 11.9.0, and the replacement CI log has no severity, deprecation, or warning markers.
- Replaced an O(n) structural equality assertion over a 907 KB PNG after it exceeded the five-second unit-test ceiling; SHA-256 now proves byte identity in under one second.
- Added explicit localized image metadata after the first browser run proved that a child `openGraph`/`twitter` object replaced inherited file-based image fields.
- Preserved another workspace's active port-3000 server and completed E2E/capture through validated ports 3011/3012; both owned alternatives were released and the other listener remained active.
- Fixed the alternate-port regression exposed by the full 3011 run: the metadata fallback now uses the runner's canonical loopback host, and all E2E same-origin, navigation, privacy-request, and performance checks derive their expected origin from `E2E_BASE_URL` instead of hardcoding port 3000. The 54 directly affected Chromium/mobile flows pass on 3011.
- Added a local PNG/native-share path without weakening the existing share allowlist. The first implementation pushed the relationship route from below budget to 1,051,745 decoded JavaScript bytes. Deferring raster/file helpers reduced this to 1,050,057, removing a redundant branch reduced it to 1,050,003, and removing one duplicate result guard reached the still-failing exact ceiling of 1,050,000. The final fix defers deterministic numerology and relationship engines until form submission; the unchanged `<1,050,000` budget, relationship results, Reality Check handoff, outcome context, and share paths all pass.

## Prior release evidence

The current 0.17.1 audit evidence at the top of this document supersedes the historical
counts below. The entries remain only as provenance for earlier releases and CI runs.

- Unit/integration: 304/304 passed across 31 files, including PayApp callback route coverage for forged secrets, amount mismatch, wrong payment request, unknown order, unpaid virtual account, stale pre-payment events, cancellation revocation, owner-path entitlement, and retry idempotency.
- ESLint: passed with zero warnings.
- TypeScript strict check: passed.
- Next.js 16.2.11 production build: passed without metadata warnings; 40 route outputs generated.
- Complete local browser regression: 123/124 passed across Chromium and mobile, with one intentional hardware-keyboard skip.
- Homepage visual QA: no horizontal overflow at 320×700, 768×1024, or 1440×900; primary CTA, heading order, responsive field layout, focus states, and 44px link/button targets verified.
- Account browser boundary: Chromium 3/3 focused checks prove no implicit upload, unauthenticated API denial, and locale-aware magic-link callback forwarding.
- Complete local browser regression: Chromium 62/62; mobile 61/62 with one intentional hardware-keyboard skip.
- Canonical GitHub release gate `30239285659`: combined Chromium and iPhone 13/mobile run passed 117 tests with one intentional hardware-keyboard skip on source commit `8cce914`; 263 unit/integration tests, 27 route outputs, full dependency audit, and the version-0.15.2 97-component SBOM also passed with zero open Dependabot alerts, check annotations, or warning/deprecation markers.
- Local Windows browser evidence remains available as desktop Chromium 52/52 plus split clean-process mobile checks. A later 20+ minute single-session run produced only browser navigation/click cancellations, so constrained-Windows reruns should remain file-split while GitHub-hosted CI is the canonical combined-browser result.
- Outcome-informed flow proves zero history reads before explicit use, one read after use, relationship-category isolation, unchanged meeting-context ordering, bounded displayed learning, dynamic focus, and no horizontal mobile overflow.
- Relationship handoff tests prove explicit current-tab use, clean URL, one-time clearing, editable prefill, no automatic record, no date/name/number transfer, and fail-closed behavior with unavailable storage in both browsers.
- Monthly-report tests prove local/UTC boundary separation, legacy fallback disclosure, newest-first month options, read-only navigation, and unchanged stored source records.
- Accessibility: automated axe critical/serious checks passed on all 20 Korean/English application routes, the generated onboarding context, the generated outcome-review layer, and the relationship handoff-prefilled form.
- Performance: HTML, resource count, JavaScript/CSS transfer and decoded-size, total payload, and no-third-party-request budgets passed, including `/en/shop`.
- Full dependency audit: zero known vulnerabilities; PostCSS 8.5.19 and brace-expansion 5.0.8.
- Link-preview browser regression: four Korean/English Chromium/mobile flows verify native copy, large-image tags, same-origin URLs, image responses, alt/type fields, and 1200×630 PNG headers.
- CycloneDX 1.6 SBOM: validated with 107 production components for version 0.16.0.
- Client static bundle: no OpenAI endpoint, key/config name, or test-secret marker found.
- Workspace secret-pattern scan: no recognized API key, cloud credential, private key, or GitHub token pattern found; only `.env.example` exists.
- Store assets: fifteen regenerated synthetic screenshots passed external-origin and 1242×2688 PNG checks; Korean/English home, Korean tarot card, relationship context, and closed-shop views passed visual inspection.

## User work required

No user action is required to run or inspect the current local website. A real magic-link/account-isolation exercise requires an email inbox, and the next production stage requires hosting/service authorization. Legal, editorial, brand, pricing, commerce, and launch decisions also require human sign-off.
