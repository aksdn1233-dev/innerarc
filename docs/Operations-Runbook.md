# Operations and Rollback Runbook

Status: Supabase account persistence connected; production deployment and remaining service owners are unassigned.

## Release gate

1. Install from the frozen pnpm lockfile and run lint, strict typecheck, all unit/integration tests, production build, Chromium accessibility/performance/user-flow tests, and mobile flows.
2. Confirm required environment variables through provider startup checks. Never print secret values.
   - `NEXT_PUBLIC_APP_URL` must be the final path-free HTTPS origin before staging or production link-preview validation. Loopback HTTP is allowed only for local builds and tests.
   Set `APP_HTTPS_ONLY=true` only when the public origin and every required asset are served over HTTPS; it enables HSTS and CSP request upgrading. Local HTTP production-bundle tests leave it false.
3. Verify CSP/security headers, manifest, no unapproved third-party request, masked telemetry, deletion/export, subscription retry/cancel, and AI fallback in the production-like environment.
4. Record build ID, rule/policy versions, database migration version, enabled feature flags, provider aliases, and rollback target.
   - Current Supabase project: `innerarc` (`ytssrbmjyufphjyafjqa`), Singapore (`ap-southeast-1`).
   - Current database migration: `20260727000300_atomic_account_deletion.sql`.
5. Generate and archive the validated CycloneDX production SBOM. Review launch screenshots for synthetic-only content, expected dimensions, and absence of external requests.
6. Confirm crisis contacts against the official sources and review date in [Crisis Response Protocol](Crisis-Response-Protocol.md).
7. The product owner authorized automatic production deployment after validated site changes
   on 2026-08-21. Preserve the last verified rollback commit before every publish and stop for
   new authority only when access level, payments, migrations, or destructive scope changes.

## Feature rollback

- Set the affected flag's `killSwitch` before changing percentage or tier targeting. Kill switch always wins.
- AI provider incident: disable the provider adapter; deterministic profile fallback remains available. Never disable crisis/reality-first safety text.
- Payment incident: disable checkout creation, preserve current entitlement snapshots through the documented grace boundary, and keep Free access available.
- Analytics/monitoring incident: disable the sink. Product functionality must continue without analytics consent or delivery.
- Suspected privacy leak: disable the affected write/export/share/provider path, preserve masked audit metadata, and begin incident assessment. Do not copy raw user data into chat or tickets.
- Supabase auth/persistence incident: remove both public Supabase variables from the application environment, preserve device-only functionality, and investigate owner isolation before re-enabling sync.

## Technical rollback

- Roll back application code to the last verified build before applying destructive database changes.
- Database migrations must be forward-compatible or have a separately tested restoration plan. Never improvise a destructive down migration in production.
- Re-run smoke, authorization, deletion, and canonical calculation checks after rollback.
- A Sites vinext archive must retain `dist/server/index.js` from the archive root. Package
  `dist` together with `.openai/hosting.json` from the repository root; never archive the
  contents of `dist` as the archive root, which changes the entrypoint to unsupported
  `server/index.js`.

### Saju recalculation and migration hold

- Do not apply `20260821000100_versioned_saju_foundation.sql` in production until staging
  proves migration/rollback, RLS, account export/deletion, and backup restore. Its rollback
  reference drops only new Saju/cost/audit tables in reverse dependency order.
- A calculation change creates a candidate chart version. Compare canonical JSON, name
  affected profiles and interpretations, and obtain an operator decision before making it
  current. Never update historical canonical results or generated prose in place.
- If a material engine defect is found, disable new Saju generation, preserve the old and
  candidate versions, add a permanent fixture/regression test, identify affected users,
  invalidate only dependent interpretations, and keep payment/compensation evidence.
- Current engine/policy rollback reference: `saju-core-1.1.0` /
  `kr-standard-1.0.0`; the prior UI-compatible engine identifier was
  `jachyeong-1.0.0` in repository history.
- Long-form life-context prose is an interpretation/presentation layer only. Its pre-change
  rollback reference is production v71 at commit
  `16b37ce087f776ac0cf5b169b5f43ff22fb1db0b`. Disable `life-narrative.ts` and remove the
  optional report-name field together if prose is mistaken for verified biography, mobile report
  completion materially drops, or report generation fails; never roll back or rewrite canonical
  pillars or historical stored reports for a prose incident.

### Character webtoon rollback

- Current pre-character rollback reference: commit `86d9630`.
- A character-layer incident must not change numerology calculations. Disable or revert the
  webtoon component and manifest mapping while preserving the original text result, checkout,
  account, and entitlement paths.
- Remove a malformed cut from selector candidates only with a manifest/test update; never
  substitute an invented glyph, third-party character, or baked-in dialogue image.

### Daily Flow rollback

- Daily Flow is additive and has no migration, provider, payment, or account dependency.
  Revert its `/daily-fortune` route and return the Today service card to unavailable.
- Preserve device-data cleanup support for `innerarc:daily-fortune:v1` for at least one
  release after removing the UI so existing users can still export or delete the preference.
- Stop the feature immediately if device-local date rollover is wrong, same-day output drifts,
  the opt-in writes before an explicit action, deletion/export omits the preference, or copy
  crosses the symbolic-reflection boundary. Push/email/SMS reminders are not part of this release.

### Gift sharing and Japanese entry rollback

- Pre-release rollback reference is production v61 at commit
  `93e09be3527810461cdb324bf89957307da18e7c`.
- Gift delivery has no migration or provider registration. Remove the report gift panel and
  third-party intake selector if consent gating, report authorization, or recipient privacy
  regresses; existing download/print and checkout remain intact.
- Japanese entry is isolated to `/ja`, `/ja/reading`, and `/ja/plans`. Remove those routes and
  sitemap entries together if checkout handoff or copy review fails. Do not widen report rule
  locale types as an emergency fix.
- Vitest 4 does not accept Jest's `--runInBand` option. Run `npm test` directly; an unknown
  option is a runner invocation error, not a product-test failure.

### Accessory storefront rollback and activation hold

- Pre-storefront rollback reference is production v62 at commit
  `8db497064f423162407e825f2adf89ee82614120`.
- The current storefront has no migration, address collection, inventory mutation, or
  accessory checkout. Revert the shop recommendation sections and Saju/result links together
  if claims, materials, or purchase-state copy regress; digital reading checkout remains
  independent.
- Do not add an `accessory_*` product code to the payment catalog or database constraint until
  the specific SKU has supplier/material/allergen/origin/dimensions/care imagery, inventory,
  price/tax/shipping/returns/support evidence, and verified unit economics. Preserve a rollback
  reference before the later payment or migration change.
- A 30-day target begins only after verified payment for an approved SKU. The future order
  workflow must record promised-by, production, packed, shipped, delivered, canceled, and
  refunded states and alert the owner before the promise date; the public storefront alone is
  not fulfillment evidence.
- Current concept-vending rollback reference is production v63 at commit
  `eebeec00f6bee4da3fe5bc4e0aa96741e212e942`. Remove the eight concept assets and selector
  together if a visitor can mistake them for delivery-item photographs, if an indicative range
  appears as a checkout price, or if result variables leak into a URL or persistent store.
- `착불` does not remove the need to disclose the expected carrier basis and remote-area
  surcharge before purchase. Do not publish a blanket `반품 불가`: any later approved SKU must
  capture a separate pre-purchase custom-production notice/consent and preserve statutory defect,
  wrong-delivery, and description/contract-mismatch remedies.
- The 24-card expansion rollback reference is production v64 at commit
  `8abaa72c996b1f8b74298f9cb9458cd8c5ac3814`. Revert the full-catalog section and its product
  data together if a cropped board misrepresents the selected candidate, page weight causes a
  material shop regression, or any description reads as an approved material or purchasable SKU.
- The pre-detail rollback reference is production v66 at commit
  `e6f47aa0e41e1da10eae2679c4592aa73957911b`. Remove the multi-angle boards, product-detail
  routes, detail links, and sitemap entries together if viewpoint identity drifts, a visitor
  mistakes an AI concept for manufactured inventory, image payload becomes materially harmful,
  or any detail route exposes a cart, purchase, or checkout control.
- This repository does not define a `test:unit` package script. Use `pnpm test` for the Vitest
  unit/integration suite; `pnpm test:unit` is an invocation error rather than a product-test
  failure.
- The pre-curation rollback reference is production v67 at commit
  `e84f50e74929d84fbb7dfa15814f2a0ae2152419`. Remove the birth-date form, derived recommendation
  panel, and route-scoped shop palette together if the raw date enters a URL, storage, analytics,
  or a request; if recommendations drift for identical date/year inputs; if the UI implies a
  Saju calculation; or if contrast, mobile layout, disclosure visibility, or payload budgets fail.
- The pre-zoom/search-discovery rollback reference is production v68 at commit
  `811801afb105b6e084b2cc838654a35813f77724`. Revert the product media viewer, semantic image
  conversion, route metadata, structured data, and image sitemap together if focus/scroll fails,
  a product view becomes misleading, private URLs enter discovery documents, or search copy
  crosses the symbolic-reflection and non-purchasable concept boundaries.
- Naver Search Advisor issued the public `mygyeol.kr` ownership-verification meta value on
  2026-08-22. It is rendered server-side in the root document head and may be replaced through
  `NAVER_SITE_VERIFICATION` if Naver rotates it. Verify the live source before completing portal
  ownership, then submit `/sitemap.xml` and `/image-sitemap.xml`; no private route may be added.

## Incident priorities

1. Immediate safety or cross-user data exposure.
2. Irrecoverable deletion/export/auth or billing integrity failure.
3. Calculation/card provenance corruption or unsafe AI output.
4. Availability, latency, cost, and visual regressions.

The final runbook must add named on-call, legal/privacy, security, payment-support, and crisis-escalation owners plus provider dashboards and contact paths. Track the assignments in [Operational Ownership](Operational-Ownership.md), vendor gates in [Provider Selection](Provider-Selection.md), and unresolved launch fields in [Legal Review Packet](Legal-Review-Packet.md).

## Three-day campaign watch

- Campaign window: 2026-08-23 00:00–2026-08-26 00:00 Asia/Seoul. The code clock, not an
  environment price override, opens and closes it.
- Check `/api/health`, all three plan amounts, one order/provider amount sample, provider
  rejection counts, duplicate-order contacts, refund requests, and report finalization.
- The referral coupon is unavailable during the 1,500 KRW window and becomes valid afterward
  only on the 39,000/79,000 KRW products using the issuing checkout phone.
- On amount mismatch, coupon abuse, or material payment/report errors, pause new sales through
  the existing operations gate and roll back to `1714d1412e7c417a0c7466eac9d889b1fe662bac`.
- `pnpm build:sites` refreshes the Sites artifact but not Next's `.next` directory. Run
  `pnpm build` before the production-server E2E wrapper; otherwise a newly added route can
  correctly exist in Sites output while the local Next E2E server still returns its prior 404.
- The modal is intentionally limited to the localized home entry and dismissed for the browser
  session. Event/FAQ utility links remain available on direct service landings without blocking
  form controls.
