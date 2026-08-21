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

## Incident priorities

1. Immediate safety or cross-user data exposure.
2. Irrecoverable deletion/export/auth or billing integrity failure.
3. Calculation/card provenance corruption or unsafe AI output.
4. Availability, latency, cost, and visual regressions.

The final runbook must add named on-call, legal/privacy, security, payment-support, and crisis-escalation owners plus provider dashboards and contact paths. Track the assignments in [Operational Ownership](Operational-Ownership.md), vendor gates in [Provider Selection](Provider-Selection.md), and unresolved launch fields in [Legal Review Packet](Legal-Review-Packet.md).
