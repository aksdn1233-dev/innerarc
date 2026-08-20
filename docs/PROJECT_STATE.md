# Project state — 2026-08-21 Saju platform workstream

## COMPLETED

- Reconciled current repository, launch boundary, uncommitted user work, docs, migrations,
  tests, runtime baseline, privacy/security/operations rules, and existing Saju engine.
- Public-only reference-product analysis with VERIFIED/INFERRED/UNKNOWN classifications.
- Explicit versioned Saju calculation policy and backward-compatible canonical chart.
- Stable stem/branch relationship facts with rule IDs.
- Golden/boundary fixtures, 60-day invariant, serialization regression, and narrative guard tests.
- Additive, inactive schema for reusable Saju profiles, immutable chart versions,
  interpretations, generation jobs, recalculation audit, and AI cost events.

## IN_PROGRESS

- Validation breadth beyond astronomical term instants and current regression anchors.
- Staging migration/RLS integration tests.

## NEXT

1. Integrate a Korean lunar converter only after KASI-table and second-implementation validation.
2. Add server-owned profile/chart repositories, explicit sync consent, export, and deletion coverage.
3. Build admin recalculation select/recompute/diff/invalidate workflow.
4. Add structured paid Saju report generation only after calculation release gates pass.

## DEFERRED

- Compatibility, daily/monthly/yearly flow, fortune calendar, date selection, Saju chat,
  notifications, native apps, and subscriptions for this workstream.
- Production application of the new migration and deployment.

## REJECTED

- LLM-calculated pillars; silent convention choices; rendered-prose-only storage; copied
  reference branding/assets/currency; fear-based claims; fate/diagnosis/guarantee language.

## NEEDS_REVIEW

- Domain expert review of pre-1908 time handling, luck-cycle conventions, and expanded rules.
- Legal/privacy review before durable birth/relationship data collection is enabled.
- Demand evidence and 9,600/39,000 KRW unit economics before adding or repricing a Saju SKU.

## Verification evidence

- `pnpm verify`: passed — lint has four warnings and no errors; typecheck passed; 70 test
  files / 678 unit-integration tests passed; Next production build emitted 68 pages.
- Sites/Vinext production artifact build: passed.
- Focused Saju E2E: 8/8 passed across desktop Chromium and mobile WebKit.
- Full E2E after installing pinned browsers: 127 passed, 9 skipped, 20 failed. Two Saju
  failures were stale expectations and now have regression fixes; focused rerun is green.
  The remaining observed failures belong to concurrent pre-existing UI work: two duplicate
  `.cinema-hero-portrait` strict-locator failures and sixteen CSS decoded-size failures
  (136,207 bytes versus a 132,000-byte budget). Those files were not overwritten here.
- New database migration: source/test inspected only; **NOT APPLIED and NOT staging-tested**.
- Runtime used Node 22.14.0 although the project requires Node 24; commands completed but a
  clean Node 24 verification remains a release requirement.
- Production dependency audit: zero known vulnerabilities after advancing the explicit
  `nanoid` override from 3.3.17 to patched 3.3.18; lockfile and both production builds pass.

## Hostile review result

- The compounding moat is presently the transparent engine/fixture/version history design,
  not corpus size; the corpus is still easy to reproduce and must grow from real defects.
- One calculation defect can still affect every user because recalculation tooling is schema
  only. Production generation stays held until select/recompute/diff/invalidate works.
- AI cost cannot yet explode in the new Saju path because no Saju model call is connected;
  cost-event storage exists but the Saju dashboard/guardrail enforcement is deferred.
- Paid Saju content is not yet meaningfully differentiated from the free chart; no Saju SKU
  should launch until structured paid depth and quality evidence exist.
- Ten-times traffic, model-price increase, provider outage, and Saju-specific payment failure
  recovery are NOT TESTED. Existing provider-neutral payment contracts reduce coupling but
  do not prove the new journeys.
