# Release Checklist

## Product and content

- [x] Local P0 acceptance criteria trace to deterministic or browser tests.
- [x] No unsupported scientific, diagnostic, probability, fate, or prediction claim in tested output.
- [x] Free first value and deterministic entitlement policies.
- [x] Claim-free accessory/music directions and a visibly closed shop category preview.
- [x] Optional Daily Flow is deterministic, visibly symbolic and free; account-backed 09:00 inbox
  delivery requires separate consent, is idempotent per owner/day, and makes no push/email/SMS promise.
- [x] Public compatibility intake offers partner, coworker, family, friend, and business-partner contexts; each keeps consent, privacy, reality checks, and no fate score.
- [x] Numerology and Saju reports use separate calculation and explanation pipelines; unknown Saju birth time never displays a fabricated corrected clock time.
- [x] Saju report dialogue uses long-form, evidence-bound life-context sentences inside the
  existing webtoon scenes; childhood and family claims stay hypothetical and investment or
  guaranteed-outcome claims are refused.
- [x] All report-result chapters use supplied character assets as full illustrated scenes with HTML dialogue; mobile overflow and reduced-motion behavior are covered.
- [x] Key context and decision terms are consistently emphasized across Numerology, Saju, and compatibility report bodies.
- [x] Report immersion includes guide-specific voice lines, dark vignette gradients, and reduced-motion-safe atmospheric effects.
- [x] Consecutive scenes featuring the same guide use distinct, personality-consistent dialogue in Korean and English.
- [x] Every Korean Taeryeong bridge line passes the honorific-ending check.
- [x] Report character assets bypass image recompression and automated checks prevent native-resolution upscaling.
- [x] Missing optional Sites image bindings degrade to validated same-origin source assets instead
  of crashing report pages, with remote-source rejection covered by a worker regression test.
- [x] Saved relationship outcomes can inform the next reflection only after explicit use, with misses preserved and facts/ranking unchanged.
- [x] A selected relationship environment becomes an editable one-time Reality Check draft without URL data, persistent fallback, implicit record creation, or sensitive profile transfer.
- [x] Monthly Reality Check reports capture the browser-local review month, revisit prior months without writes, disclose legacy UTC fallback, and preserve the stored source records.
- [x] Focus, optional concern, depth, and AI consent produce a local contextual layer without changing canonical calculations or sending/storing/sharing the concern.
- [ ] Independent Korean/English native-copy and semantic review.
- [x] Japanese home/intake/plan entry copy, language links, metadata, sitemap entries, and
  checkout draft handoff verified; full Japanese generated-report localization is not claimed.
- [ ] Numerology/tarot editorial review and final rule freeze.

## Privacy and safety

- [x] Local owner-scope, export, all-data/third-party deletion, retry, and cross-owner denial tests.
- [x] Daily Flow view-only leaves storage untouched; explicit month/day persistence is
  validated and included in device inspect/export/delete without server sync.
- [x] Account morning notifications store month/day only after purpose-specific consent, expose
  independent on/off and paid-auto controls, and are included in account export/deletion.
- [x] Report experience responses require completed-report proof, accept bounded source/usefulness/
  return/follow-up/rhythm choices, preserve legacy answers and account export/deletion, do not alter
  notification consent, and are visible only through the allowlisted administrator console.
- [x] Supabase owner RLS, authenticated-only grants, anonymous fail-closed probe, validated explicit sync/restore, account export, and atomic deletion migration.
- [x] Administrator login embeds no owner identity or client-side allowlist; mailbox authentication
  receives only validated browser-safe Supabase configuration from the live request environment,
  and remains separate from the server-only `ADMIN_EMAILS` authorization enforced by the console
  and administrator APIs.
- [x] Production administrator magic-link delivery succeeds for the owner-confirmed Supabase team
  address; the Site URL is `https://mygyeol.kr` and the exact callback allowlist contains
  `https://mygyeol.kr/auth/callback`. Custom SMTP remains a reliability requirement before adding
  non-team administrators or depending on higher-volume delivery.
- [x] Share outputs omit dates, names, contact details, concerns, journals, and questions by construction.
- [x] Purchased-report gifting is explicitly distinguished from minimal public share cards,
  requires subject-consent confirmation, sends only on a user action, and stores no recipient
  email or Kakao identity.
- [x] Prompt-injection, high-risk-category, overclaim, and authorization adversarial baseline.
- [x] Local secret scan reports no recognized credentials.
- [x] Bilingual pre-release privacy/terms disclosures expose unresolved legal fields and are linked next to consent surfaces.
- [x] Official region-labelled 109/988 crisis-resource baseline, no language-based location inference, and source-refresh protocol.
- [ ] Final privacy notice, terms, consent receipts, age policy, jurisdiction, and DPA review.
- [ ] Real two-account isolation/session-revocation test, production administrative audit, environment separation, backup aging, and locale-aware crisis resources.

## Engineering

- [x] Reproducible pnpm lockfile and CI definition.
- [x] Unit/integration 425/425; 66 focused Chromium and 20 focused iPhone/WebKit onboarding/payment scenarios verified; accessibility, performance, metadata, native-share, account-boundary, fallback/cancellation, and local recovery suites are green.
- [x] Next.js 16.2.12 production build and 58 route outputs verified.
- [x] Vinext/Cloudflare Workers production artifact build verified locally; deployment was intentionally not performed.
- [x] Full production/development dependency audit reports zero known vulnerabilities.
- [x] CSP/security headers, opt-in HTTPS-only enforcement, feature flags, rate limits, and rollback runbook.
- [x] AI crawler refusal is emitted in `robots.txt` and enforced with edge 403 responses for pages,
  APIs, and assets; Googlebot, Naver Yeti, browsers, social previews, and the refusal file itself remain
  reachable, with spoofable-user-agent limits and rollback documented.
- [x] Customer-visible source strings, reports, metadata, alternative text, and crawler refusal copy
  contain no `AI`/`인공지능` label; generated imagery and external personalization remain truthfully
  described in plain language, and the home free-pattern action has a dedicated contrast regression.
- [x] Route/source journey events use closed categorical schemas, raw URL/referrer/query/UTM/PII
  values fail closed, and declared automation plus localhost/admin routes are excluded.
- [ ] After deployment, mark the operator browser as internal, verify one synthetic allowlisted
  source/route marker reaches the owner console, and confirm no raw campaign or personal value is
  present in storage or responses.
- [x] Chromium and WebKit are included in CI browser coverage.
- [x] GitHub CI uses Node 24-based official actions and Corepack-pinned pnpm 11.9.0 with no advisory, deprecation, warning, or check-annotation markers in the verified run.
- [x] Exact-process E2E runner refuses occupied port 3000 and terminates only its repository-scoped server.
- [x] CycloneDX 1.6 production SBOM generation verified locally for 0.17.1 (110 production components); CI artifact archival remains configured.
- [x] Korean/English Open Graph/X titles and descriptions, same-origin 1200×630 PNG responses, alt/type/dimension tags, and non-personalized URL checks are covered in both browser projects.
- [ ] Verify real monitoring, redacted telemetry, migrations, backup/restore, and rollback in staging.
- [x] Versioned deterministic Saju facts, explicit late-Zi/time/term/luck policies, golden fixtures, serialization invariant, and AI fact guard pass locally.
- [ ] Korean lunar/leap-month conversion passes KASI plus independent implementation fixtures; current typed rejection is not launch support.
- [ ] Saju chart-version migration, recalculation diff/invalidation, RLS, two-account isolation, export, deletion, and rollback pass in staging.
- [ ] Apply `20260830000100_personal_pattern_intelligence_p0.sql` in staging before application rollout; validate owner RLS, RPC-only writes, idempotency, confidence history, graph links, account export/deletion, and a two-account IDOR matrix.
- [ ] Configure separate 32+ character `PROVENANCE_HMAC_SECRET` and `ABUSE_HASH_SECRET` values; verify that neither is browser-visible and that missing values do not break report delivery.
- [ ] Verify report/account export provenance, no semantic canary text, security-event minimization, 30–90 day retention automation, and evidence-manifest integrity before describing these controls as operational.
- [ ] Paid Saju generation retry/compensation and Saju-specific E2E flows pass before a Saju SKU is enabled.

## Commerce

- [x] Provider-neutral entitlement, checkout/cancel, idempotency, stale-event, and failure-fallback contracts.
- [x] Payment plan/input switching, local no-order validation, bounded field/readiness/rate/widget/provider errors, isolated checkout browser regression, and a server-only production launch-approval gate.
- [x] Future accessory shop categories exist in a `coming later` state with no product, price, inventory, cart, checkout, or affiliate capability.
- [x] Accessory storefront foundation exposes Saju/Numerology recommendation directions,
  symbolic-claim limits, 30-day made-to-order copy, and a separate owner-console order view
  while retaining no product, price, inventory, address, cart, or checkout capability.
- [x] Eight local AI concept boards switch by Saju/Numerology result family without URL profile
  data; visible labels distinguish concepts from delivery photos, and indicative market ranges,
  one-to-one production, collect shipping, and statutory return boundaries are disclosed.
- [x] The accessory catalog exposes 24 unique concept entries with complete Korean/English
  descriptions, design directions, use settings, care checks, and per-entry indicative ranges;
  every card remains visibly non-purchasable and concept-labelled.
- [x] Accessory cards no longer show neighboring products from a shared board; every concept
  has Korean/English multi-angle detail views, selection checks, truthful AI-concept disclosure,
  accessible related-product navigation, and no cart or checkout control.
- [x] Shop birthday curation is local-only Numerology, deterministic, bilingual, reload-cleared,
  URL-clean, accessible, performance-bounded, and explicit that Saju requires its separate flow.
- [x] Product detail images support keyboard/mobile enlargement and semantic image discovery;
  public reading/shop routes publish unique bilingual metadata, canonicals, structured data,
  public Saju sitemap entries, and an image sitemap without exposing private report/order routes.
- [x] Future product contracts require complete disclosures, reject prohibited symbolic-outcome claims and tracking-bearing links, isolate sponsorship, and remain closed behind twelve evidence-backed gates plus explicit owner authorization.
- [ ] Approve suppliers, provenance/material/allergy disclosures, catalog moderation, accessibility, inventory, fulfillment, returns/refunds, support, privacy, and consumer-law controls before opening the shop.
- [ ] Validate localized prices, taxes, trial/renewal disclosure, purchase, restore, cancellation, refund-support, and AI unit economics with a real provider.
- [ ] Record real PayApp low-value approval, cancellation, virtual-account deposit, guest receipt/recovery, and refund-support evidence before broad promotion.

## Operations

- [x] Local pre-provider operations and rollback runbook.
- [x] Draft Korean/English store copy and fifteen synthetic-data mobile screenshots regenerated after the tarot reading-room change, technically verified, and key home/tarot/relationship/shop views visually inspected.
- [ ] Brand/trademark/domain clearance.
- [x] Set `NEXT_PUBLIC_APP_URL` to the approved path-free HTTPS production origin during artifact
  compilation; CI and the live release check reject loopback sitemap URLs, and external metadata is
  revalidated after deployment.
- [ ] Assign support, incident, data-request, and safety-escalation owners.
- [ ] Approve final store screenshots, copy, and review notes after brand, legal, native-language, and platform review.
- [ ] Obtain explicit user authorization for staging and production deployment.
- [x] Direct owner authorization in the 2026-08-23 campaign request includes production
  deployment after implementation and verification.
- [x] Four Pillars and Detailed render and order at 1,500 KRW only inside the scheduled server
  window; Premium remains 79,000 KRW, historical Premium 1,500 KRW charges remain verifiable,
  stale-tab rejection, product-scoped coupon non-stacking, and automatic expiry are tested.
- [x] Entry popup is once per session, Event/FAQ links remain keyboard accessible, result/service
  sharing is user initiated, and the event page carries privacy and symbolic-reflection limits.
- [x] Saju hub/intake redesign preserves bilingual headings, implemented route truth, live prices,
  consent, checkout draft handoff, unknown-time behavior, supplied character assets, minimum touch
  targets, reduced-motion support, and route-scoped CSS rather than increasing every page payload.
- [x] Final Saju journey release evidence: 728 unit tests, typecheck, lint with no errors,
  127-page production build, Sites artifact build, and 205 of 214 browser cases passed; the
  remaining nine are existing environment-gated skips rather than product failures.
- [x] Three-day campaign withdrawal removes its price branch, popup, utility links, plan banner,
  urgency copy, and public 1,500 KRW claims while preserving historical payment verification and
  existing friend-coupon entitlements; 728 unit and 205 browser cases pass with zero failures.
- [x] The one-week owner-authorized extension uses one exact seven-day server clock across display,
  order, provider amount, popup, event terms, and automatic expiry; discounted-product checkout
  rejects friend coupons while non-discounted Premium preserves valid coupon rights, and stale-price
  refusal prevents stacking or a negative charge.
- [x] The 150,000 KRW Shinsegae review draw states one winner, entry and draw times, exclusions,
  claim method, and redraw rule; prize entry consent is separate from review submission/publication,
  and adds no contact detail or external-share tracking.
- [x] Premium-exclusion release passes 760 unit cases, typecheck, lint with zero errors, and the
  130-page production build. The targeted campaign browser suite could not launch because the host
  lacks its pinned Chromium and WebKit binaries; this is an environment exception, not a passed
  browser result. Production HTML, catalog prices, and health must therefore be checked after deploy.
- [x] Compatibility intake refinement preserves the five relationship choices, consent, guest
  memory-only processing, and bilingual safety boundary; 760 unit cases, typecheck, lint with zero
  errors, and the 130-page build pass. Its new alignment regression is committed, while the missing
  local pinned Chromium binary is explicitly replaced by direct in-app-browser visual, DOM,
  interaction, 54-pixel button, exact label-centering, and horizontal-overflow checks before release.
- [x] Simple-is-best compatibility follow-up removes orbit/glow/grid/gradient decoration and nested
  person cards while preserving the form order, privacy statement, five relationship choices,
  consent, centered controls, responsive layout, and eight-section result behavior.

## Additive 3D Space V1 — release held

- [x] Independent Korean/English intro and owner workspace; default-off flags; existing checkout and calculation contracts preserved.
- [x] Strict candidate scene boundary, deterministic recommendations, reference-measurement provenance and safe manual fallback.
- [x] Private sanitized image transfer, quota/rate/cost limits, durable deletion queue and account export/deletion integration.
- [x] Local PostgreSQL-engine tests for the additive schema and inherited PPI deletion constraints.
- [x] Licensed asset manifest, actual GLB bounds/material tests, browser failure/retry and synthetic visual fixtures.
- [ ] Owner-approved premium visual gate from actual captures: preferred overall≥9.0; minimum overall≥8.7 only with explicit owner acceptance; every critical category≥8.5. Current provisional score is8.9 overall and8.6 minimum after the 2026-09-08 product-story/capture pass. Test success alone does not approve visuals.
- [ ] Hosted staging migration, two-owner Supabase RLS/storage/cleanup/rollback verification.
- [ ] Account-accessible model, current rate/capability evidence and consented live fixture extraction.
- [ ] Physical iPhone/Android GPU, touch and memory validation.
- [ ] Production enablement. No migration/deployment or new paid product is authorized by this checklist.

Rollback reference: production base `ee4ae5038e34e0715456b837cbe7c7f2db5591c4`; retain data-rights and cleanup code when disabling new space writes. See `Space-Intelligence-V1.md` and `Space-Failure-Ledger.md`.

## Additive premium capture pass — 2026-09-08

- [x] Real render pixels are visible and covered at balanced/high/Ultra/performance tiers; no CSS-only upscale is described as quality.
- [x] Capture-quality, duplicate-view and cross-view inconsistency failures have deterministic regression tests.
- [x] 390, 430, 768, 1024 and 1440 product evidence captures cover Space landing/workspace/analysis/current/recommended and success landing/result.
- [x] Success evidence uses official sources and visibly separates career facts, symbolic overlap, context and unknowns.
- [ ] Reconfirm the complete Node 24 CI matrix after PR push; local fallback runtime is Node 22 and does not replace CI evidence.
- [ ] Owner visual acceptance, hosted private storage/model tests, and physical iPhone/Android GPU/camera tests remain release blockers.

## Editorial home presentation — 2026-09-08

- [x] Home remains an introduction; purchase intake, checkout, entitlements, report generation, account recovery, and deterministic engines are unchanged.
- [x] Generated brand art is disclosed and no preview is presented as a customer outcome.
- [x] Symbolic systems remain clearly bounded from scientific prediction, diagnosis, treatment, and guaranteed results in Korean and English.
- [x] Feature-off rendering omits the Space menu/showcase without breaking the other home chapters.
- [ ] Run the complete Node 24 CI matrix and inspect generated five-width captures before merge.
- [ ] Keep PR #22 unmerged and Space flags off until its existing hosted, physical-device, and owner-acceptance gates pass.

## Feng Shui guide and Japanese reports — 2026-09-12

- [x] Popup progress and six-second advance, clickable Feng Shui tutorial, bright responsive presentation, Japanese samples, purchase handoff, protected reports, downloads, and Reality Check labels are covered.
- [x] Deterministic calculations remain authoritative; no model name, provider call, token cost, price, entitlement, database migration, or Space API contract changed.
- [x] Lint has zero errors, typecheck and 134-route production build pass, 1,064 unit tests pass, browser E2E passes 243 with 11 intentional skips, and the dedicated 3D matrix passes 90 with 30 intentional skips.
- [x] Merge commit `0ac66570c3a882ae9fe0e2dd0f93883343e3b474` is deployed as Cloudflare Worker version `9ac9d69f-e6c3-48fb-883c-979b7d0c3abd` and Sites version 102; both live origins passed post-deploy route checks.
- [ ] GitHub Actions run 34625549247 did not start because of the account payment/spending limit; restore the account limit before relying on hosted CI evidence.

## Success story and miniature guide hardening — 2026-09-08

- [x] Seven public records have validated HTTPS story sources, evidence status, context, unknowns, transferability and one bounded action.
- [x] Profession/name search has a truthful empty state; symbolic ranking remains deterministic and percentage-free.
- [x] Success action handoff and invalid mixed-context payloads have regression coverage.
- [x] Space guide is tied to a recommendation/object ID and keeps mute, replay, caption, detail and speech-failure paths.
- [x] New guide images are native 1254×1254 RGBA assets and are never upscaled beyond their 3× DPR safe display size.
- [x] Capture 390/430/768/1024/1440 success result and Space analysis after the asset/font load gate passes.
- [ ] Owner accepts the actual captures. This remains separate from CI and does not authorize merge or deployment.

## Feng Shui cardinal guide and electronics — 2026-09-12

- [x] No customer-facing north-degree input; four plain side choices and all four 3D cardinal labels are covered by browser tests.
- [x] Five new electronics have schema, dimensions, reviewed procedural geometry, manifest provenance, strict photo-classification prompt, collision-safe manual placement, and deterministic rest-check coverage.
- [x] Responsive four-step popup uses existing non-customer room images, remains reopenable, and has WCAG AA automated coverage with no nested controls.
- [x] No database migration, price, payment, entitlement, report, auth, storage-retention, attempt cap, token cap, or model identifier changed.
- [x] Dedicated desktop/iPhone/Android Space matrix: 90 passed, 30 intentionally skipped, 0 failed across 120 cases.
- [x] Local release checks: lint has zero errors, typecheck and the 134-route production build pass,
  and 1,087 unit tests pass. The payment-enabled full browser run passed 249 of 254 cases with three
  intentional skips; its only two failures are the existing closed-payment-copy assertions that
  intentionally conflict with `E2E_PAYMENT_CHECKOUT=1`, while the payment flow itself passed.
- [x] PR #59 merge `7590397334e332465477761667f8e4efbf4a8074` is deployed as Cloudflare
  Worker version `048554ea-a59a-4e77-9427-802cff69a59d` and public Sites version 103.
  Both live origins returned 200 for Korean home/Feng Shui, English Feng Shui, Japanese Premium,
  and health checks. Roll back to Worker `9ac9d69f-e6c3-48fb-883c-979b7d0c3abd` and Sites 102.
- [ ] GitHub Actions run 34644017812 created no executable steps because the account payment/spending
  limit remains active; restore it before treating hosted CI as release evidence.

## Feng Shui significant room details — 2026-09-12

- [x] Twelve new room details are present in schema, labels, strict extraction, manual correction, 3D rendering and manifest provenance.
- [x] Elevation, bounds, collision, door clearance, route/window access and each bounded recommendation have regression coverage.
- [x] Existing upload privacy, retention/deletion, authentication, payment, reports, prices, Reality Check and calculation engines are unchanged.
- [x] No new model identifier, provider request, retry, token cap, runtime AI cost or database migration was introduced.
- [x] Typecheck, lint with zero errors, 134-route production build, focused 217 tests and the 120-case Space browser/visual matrix pass (90 run, 30 intentional skips).
- [x] Full unit suite passed 1,160 of 1,160 cases. PR #61 merge `78214839114fb66f20b47e334e5a1a48e8667b60` is live as Worker `69ff79b4-2120-4934-b191-be24fdd9e606`; Sites version 105 packages the same application code with its own canonical origin. Both origins return 200 for home, Korean/English Feng Shui, Japanese Premium and health, and live object-add checks pass without overflow.
## Korean residential template engine — released 2026-09-12

- [x] Existing Scene renderer receives a validated living-room/kitchen scene; current photo/manual/recommendation/Reality Check paths remain available.
- [x] Synthetic provenance, zero real-complex coverage, MATCH_SCORE wording, conflict states, fixed fixtures, mirror/expansion transforms, and pinned versions have automated coverage.
- [x] Owner selection/correction RLS, no global overwrite, export, and project cascade have local PostgreSQL coverage.
- [ ] Licensed real-complex dataset and verification owner (not required for generic V1; required for any complex-specific claim).
- [x] The linked production database received the prerequisite daily-acquisition, PPI, Space V1, and residential-template migrations. Hosted schema lint passed; owner/service policy probes and private bucket controls passed.
- [x] Owner authorized production release. PR #64 merge `e8593380b594d55b85d2756840500ab487191766` is deployed as Cloudflare Worker version `9b70b0e4-bb61-4258-99b7-473dbeddea93` and public Sites version 106.
- [x] Both production origins return 200 for health, Korean home/Feng Shui/workspace, English Feng Shui, and Japanese Premium. Health reports site/database OK and payments open.
- [ ] Physical iPhone/Android camera, touch, memory, and GPU checks remain outstanding; current browser device projects are emulation evidence only.
- [x] Clean production rebuild after temporary visual-inspection route removal generated the expected 134 routes; no preview route remains in source or build output.
- [x] Dedicated Space behavior matrix: 23 passed and four intentional device skips. Five unrelated homepage image snapshots differed by about 1%; baselines were not rewritten to hide the discrepancy.
- [ ] GitHub Actions for PR #64 created no executable steps because the account payment/spending limit remains active. Local Node 24 release evidence is 1,175 unit tests, 120 files, zero failures; lint has zero errors, typecheck passes, and the 134-route production build passes.

## Feng Shui miniature companions — 2026-09-12

- [x] Storyboard and character assignment use the repository's existing canon rather than adding new identities.
- [x] Four versioned transparent assets, responsive delivery, localized descriptions and state mapping have unit coverage.
- [x] Production smoke review caught a transparent-PNG transformer failure; direct 144–291 KB WebP delivery preserves colour and alpha without CSS keying or enlargement.
- [x] The guided start and live 3D overlay were reviewed at 390px and 1280px with no overlap, overflow or console error.
- [x] Existing deterministic geometry, recommendations, photo privacy, authentication, payments, reports and database are unchanged.
- [x] Node 24 lint has zero errors, typecheck and 134-route production build pass, and the full unit suite passes 1,178 of 1,178 tests.
- [x] The 120-case desktop/iPhone/Android Space matrix passes 90 cases with 30 intentional skips and zero failures; new visual baselines include the active companion.
- [x] PR #66 merge `9ea839ccf84d39e3c30d3fc6392f17bf346fa7e5` and corrective PR #67 merge `c81bb0c0b99941f19a673f54b04bc5c2ea6e9960` are live as Worker `1336e29a-5b9f-43bd-9ca8-84cee610824a` and Sites version 108.
- [x] Both public origins return 200 for health, Korean Feng Shui HTML and direct WebP; health reports site/database OK and payments open, and 390px live visual review shows the character, bubble and primary controls without overlap.
- [x] Rollback preserves the pre-change Worker `9b70b0e4-bb61-4258-99b7-473dbeddea93` and Sites version 106; no migration or stored-data rollback is required.
- [ ] GitHub Actions runs 34696184156 and 34697173995 created no executable steps because the account payment/spending limit remains active; local Node 24 and three-browser evidence is authoritative for this release.

## Dream Intelligence preview and release gate — 2026-09-13

- [ ] Verify source metadata and commercial-use boundaries with editorial/legal review.
- [ ] Run migration lint plus two-user RLS create/read/delete/export probes outside production.
- [ ] Confirm raw text is absent by default from device storage, account rows, analytics and logs.
- [ ] Run all 10 dream fixtures, two-user personalization, hallucinated-source, retrofitting and safety tests.
- [ ] Validate 360/390/430/768/1024/1280/1440 layouts, keyboard use, reduced motion, no overflow and no console/hydration errors.
- [ ] Confirm existing payment, protected report, Saju, birth-date pattern, Reality Check and account regression gates.
- [ ] Record the exact provider/model/pricing evidence if AI is enabled; otherwise report deterministic-only operation.
- [x] Owner explicitly approved merging and production deployment on 2026-09-13.

### Dream Intelligence device-only production release — 2026-09-13

- [x] Release flags are separated: `DREAM_INTELLIGENCE_ENABLED=true`, `DREAM_ACCOUNT_SYNC_ENABLED=false`, `DREAM_AI_ENABLED=false`.
- [x] Missing hosted migration cannot trigger Dream API reads, writes or deletes; local recording, export and deletion remain available.
- [x] Node 24 full unit suite passes 1,220 tests after the sync-gate regression was added; lint, typecheck, production build and focused browser checks are rerun before publish.
- [x] The first full-suite run exposed a pre-existing five-second timeout in the 14-domain premium inheritance matrix under parallel load (5.84s); the same case passed alone in 1.83s. Its explicit non-performance timeout is now 10 seconds while every content, inheritance and contradiction assertion remains unchanged, and the full suite is rerun before publish.
- [x] Existing payment prices, entitlements, reports, deterministic Saju/birth-date calculations and Space behavior are unchanged.
- [ ] Apply `20260913000100_dream_intelligence_v1.sql`, run hosted two-owner isolation/export/deletion probes, then enable account sync in a separate release.
- [ ] AI remains disabled. No provider, model ID, token price or runtime AI cost is configured for this release.
