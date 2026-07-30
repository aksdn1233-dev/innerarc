# Continuation State

Last updated: 2026-07-30<br>
Current version: 0.18.0
Overall progress: 98%

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
- Supabase-backed identity and explicit durable record sync are connected. Payment code and its database foundation are present but remain disabled until live merchant keys, legal disclosures, and the production domain are approved.
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

## Verified baseline

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
