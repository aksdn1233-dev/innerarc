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
  remains separate from the server-only `ADMIN_EMAILS` authorization enforced by the console and
  administrator APIs.
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
- [x] Three products render and order at 1,500 KRW only inside the scheduled server window;
  normal prices, stale-tab rejection, coupon non-stacking, and automatic expiry are tested.
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
  order, provider amount, popup, event terms, and automatic expiry; campaign checkout rejects friend
  coupons and retains stale-price refusal rather than stacking or creating a negative charge.
- [x] The 150,000 KRW Shinsegae review draw states one winner, entry and draw times, exclusions,
  claim method, and redraw rule; prize entry consent is separate from review submission/publication,
  and adds no contact detail or external-share tracking.
