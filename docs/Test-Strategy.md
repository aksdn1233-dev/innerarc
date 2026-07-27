# Test Strategy

## Layers

1. **Pure unit tests:** numerology, tarot draw, mapping, schemas, safety, masking.
2. **Integration tests:** canonical facts → AI validation → persistence adapters; retries/idempotency; deletion/export.
3. **Browser flows:** guest, account conversion, result, compatibility, question, outcome review, payment/cancel, deletion.
4. **Regression corpus:** fixed Korean/English symbolic cases and safety adversarial prompts.
5. **Non-functional:** accessibility, responsive layout, performance, authorization, privacy, cost, and recovery.

## Current fixed vectors

- `1994-11-04 → 29 → 11`
- `1980-01-03 → 22`
- `1990-09-05 → 33`
- Valid leap days 2000/2024; invalid 1900/2023.
- José accent normalization, separators, Korean/Japanese unavailable behavior, mixed script, 201-character limit, Y consonant.
- Tarot: 78 unique cards, 22/56 split, nine spreads, fixed-seed replay, 100 seeded no-duplicate draws, reversal boundaries, manual card validation, and non-predictive combination rules.
- Tarot history: canonical snapshot restore, source/audit preservation, duplicate request idempotency, delete/export, corrupt and incompatible device data, explicit no-default-persistence, and manual-entry browser flow.
- Romantic discovery: deterministic ranking, unique meeting contexts, master numbers, missing/non-Latin names, Korean/English structural parity, no probability percentages, no guaranteed meeting/marriage language, and evidence-reference integrity.
- Onboarding context: five stable focus IDs, three depth IDs, Korean/English structural parity, deterministic copy/next-step mapping, deep-profile disclosure, optional-consent zero-provider behavior, Unicode normalization, 1,000-code-point bound, control-character rejection, concern-as-inert-text rendering, and absence from calculation evidence, URLs, storage, analytics, and share payloads.
- Reality Check: all five relevance values, due-date validation, text limits, immutable original interpretation, idempotent create/review, reviewed/due status, deletion/export, corrupt adapter payload, browser-local reviewed-month capture, UTC-boundary separation, legacy-month fallback disclosure, newest-first report-month navigation, and monthly relevant/uncertain/not-relevant grouping.
- Outcome-informed next analysis: explicit device-read action, category isolation, two-review minimum, two-thirds relevance/non-relevance thresholds, mixed/insufficient states, deterministic recent-note order, Unicode-safe 280-character bounds, duplicate-note removal, injection-shaped notes remaining inert text, no raw-field inclusion, Korean/English structural parity, unchanged canonical relationship result, and fail-closed corrupt/overlong/stale-time/duplicate storage.
- Relationship-to-Reality-Check handoff: explicit per-context write, no pre-click storage action, session-only key, strict source/locale/context/rule/ID validation, text bounds, created/expiry order, 30-minute maximum lifetime, future-clock tolerance, wrong-locale/corrupt/extra-field rejection, clean URL, one-time removal, editable prefill, no automatic record, inaccessible-storage error, no date/name/number/third-party fields, Korean/English field parity, focus, mobile layout, and dynamic accessibility.
- Integrated profile: eight stable domain IDs, canonical evidence only, missing-name fallback, career role uniqueness/order, required adverse/complementary/environment fields, money-safety wording, and Korean/English structural parity.
- Lifestyle curation: three unique accessory categories and three unique music lanes, canonical evidence only, deterministic replay, 11/22/33 handling, missing-name fallback, Korean/English ID/rank/evidence parity, closed-shop state, no raw date/name in output, and no luck/healing/protection/therapy/prediction claims.
- Shop preview: direct bilingual route access, three allowlisted category anchors, no product/price/cart/checkout/affiliate controls while closed, no personalized query parameters, first-party-only assets, keyboard operation, and mobile layout.
- Future commerce: complete material/supplier/return disclosures, HTTPS links without tracking parameters, prohibited outcome claims, explicit bilingual sponsorship labels, organic/sponsored separation, duplicate rejection, twelve evidence-backed launch gates, approved-product count, owner authorization, and emergency-kill-switch precedence. Readiness still cannot render purchase controls.
- Compatibility: seven relationship types, same-profile and contrasting-profile cases, swap symmetry, missing/non-Latin names, canonical evidence, all eight required output fields, role/power caution, Korean/English structural parity, and no success percentage or fate verdict.
- Celebrity comparison: source schema/HTTPS/access date, duplicate ID, valid ISO date, confidence labels, deterministic role filtering and ranking, date-only evidence, Korean/English parity, direct source links, and no personality-identity percentage.
- Share cards: typed builder allowlists for four card kinds, no exact dates/questions/contacts/third-party labels, overclaim screening, bounded copy, XML escaping, self-contained SVG, bilingual schema parity, and browser download smoke test.
- Accessibility/security/PWA: axe-core critical/serious audits on every localized application route, keyboard skip/focus flow, mobile 44px targets, reduced-motion behavior, production response-header assertions, manifest/icon response checks, and explicit absence of service-worker registration.
- Analytics/entitlements/billing: strict event-property schemas, consent-off no-write, event idempotency, AI cost bounds, tier/quota matrices, paid-status grace rules, failed checkout non-mutation, duplicate webhook idempotency, and stale-event ordering.
- AI provider runner: disabled/provider-error/timeout/schema/fact-mismatch/overclaim fallback paths, successful validated output, bounded metering metadata, and proof that audit callbacks receive no raw request or response text.
- Personalization context: no-read without consent, owner isolation, journal-retention gate, invalid/cross-owner rows, bounded newest-first selection, and injection-shaped text remaining data rather than instructions.
- Operational controls: rate-limit allowed/denied/retried/reset decisions, isolated policies, invalid counters and timestamps, feature-flag kill switch, tier gates, deterministic rollout, and non-opaque subject rejection.
- Data rights: empty/full owner exports, JSON safety, cross-owner adapter leakage, all-data and third-party-only deletion, collection counts, identical retry replay, idempotency conflict, and post-deletion export state.
- Crisis resources and legal disclosure: official HTTPS sources, region labels, no language-to-location inference, self-harm card suppression, bilingual pre-release privacy/terms structural parity, unresolved launch fields, and adjacent consent links.
- Question tarot presentation: pre-draw reading-room framing, three semantic card results, orientation-preserving text, collapsed deterministic audit, no-card high-risk routing, render-aware result/safety focus, and mobile WebKit focus retry before an atomic safety snapshot.
- Release evidence: CycloneDX 1.6 format/component/dependency validation, no local workspace path in the SBOM, synthetic-only screenshot scenarios, rejection of unexpected origins, PNG header validation at 1242x2688, and visual framing review.
- Link-preview metadata: native Korean/English title and description, Open Graph and X large-image tags, validated loopback/HTTPS metadata bases, same-origin generated image URLs, explicit alt/type/1200x630 fields, PNG header verification, no personalized query data, and no prediction/accuracy claim.

## Performance budgets

- Initial localized route: fewer than 40 resource requests and no unapproved cross-origin request.
- HTML response body: under 250 KB.
- Initial JavaScript: under 350 KB transferred and 1.05 MB decoded; all resources: under 450 KB transferred and 1.2 MB decoded.
- Initial CSS: under 120 KB decoded.

The split budgets prevent compression from hiding parse cost while avoiding the mistake of treating decoded runtime size as network transfer. The first measured Next.js/React baseline was 934–979 KB decoded JavaScript with zero third-party requests; the 1.05 MB gate allows limited headroom and must not be raised without a documented bundle review.

`pnpm test:e2e` owns a repository-scoped custom production server through `scripts/run-e2e.mjs`, fails closed if its port is already occupied, waits for the localized health route, runs Playwright with `PLAYWRIGHT_EXTERNAL_SERVER=1`, and terminates only the exact child process it created. The default remains 3000; `E2E_PORT` allows an explicit validated alternative without reusing or stopping another project's server. Every E2E same-origin, navigation, and external-request assertion derives its expected origin from the runner-forwarded `E2E_BASE_URL`; no individual flow may hardcode the default port. Launch capture follows the same ownership rule through `CAPTURE_PORT`. This avoids Windows Playwright web-server teardown hangs and prevents reuse of another project's server. Direct Playwright CLI use retains a config fallback for environments that support its lifecycle. WebKit/axe runs use an explicit extended per-test ceiling and one worker on constrained Windows environments. Clean project-scoped release runs completed Chromium 52/52 and mobile WebKit 51 passed plus one intentional hardware-keyboard skip.

Use the following file-split fallback when the host is under load or a long WebKit process shows provisional-navigation cancellation:

```powershell
node scripts/run-e2e.mjs --project=chromium --timeout=180000
node scripts/run-e2e.mjs tests/e2e/accessibility.spec.ts --project=mobile --timeout=180000
node scripts/run-e2e.mjs tests/e2e/onboarding.spec.ts --project=mobile --timeout=180000
node scripts/run-e2e.mjs tests/e2e/performance.spec.ts --project=mobile --timeout=180000
```

A 20+ minute WebKit process has produced provisional-navigation cancellation and unrelated click timeouts after earlier checks passed. Reproduce a failure in a clean focused process before classifying it as a product defect.

Transport enforcement is separately tested with `APP_HTTPS_ONLY=true`. Local HTTP production-bundle runs leave it false so WebKit does not upgrade first-party test assets to an unavailable HTTPS origin; CSP, framing, MIME, referrer, capability, opener, and resource-isolation headers remain active.

## Required error matrix

Normal/empty inputs, invalid date, leap years, time zones, locale date displays, Korean/English/Japanese/accent names, very long names, symbols, duplicate account, network/AI/payment failure, deletion, authorization, injection, sensitive leakage, overconfidence, language contradiction, and retry duplicates.

## AI gates

- Schema validity and canonical-fact reference integrity.
- No prohibited certainty, fear, diagnosis, investment/legal/medical directive, defamation, or fake celebrity facts.
- No retrieval of another user’s context.
- Same deterministic facts in Korean and English.
- Provider failure gives a limited fallback.

## Completion gate

Pull requests require lint, strict typecheck, unit/integration suite, and production build. Release additionally requires Chromium/mobile user flows, deletion/export proof, WCAG-oriented audit, performance budget, dependency/security review, and manual bilingual content review.

Every fixed defect adds a regression test and a Decision Log or Continuation State note when it changes behavior.
