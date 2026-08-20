# Saju workstream decisions

The repository-wide canonical log remains `docs/Decision-Log.md`. This file records the
Saju workstream decisions required by the platform brief.

## S-001 — Extend the existing engine in place

- Decision: Keep `src/core/saju` and its working UI/tests instead of restructuring the
  repository into a new monorepo.
- Reason: Existing deterministic logic, bilingual UI, privacy model, payments, and release
  controls are working assets; a directory rewrite would add risk without product value.
- Reversal: Package extraction remains possible after API stability and fixture coverage.

## S-002 — Lunar input fails closed

- Decision: Represent lunar/leap-month input in domain contracts and fixtures but reject it
  until a validated Korean converter ships.
- Reason: KASI tables demonstrate variable month lengths and leap months. Approximation
  would corrupt every downstream pillar.
- Revisit: After two-source fixture validation and full supported-range coverage.

## S-003 — Immutable chart-version foundation stays inactive

- Decision: Add a reversible migration, but do not apply it to production or enable account
  Saju persistence in this phase.
- Reason: Birth and relationship data are sensitive; export/deletion/RLS integration must be
  proven before collection begins.
- Reversal: Drop only the new tables in documented reverse order.

## S-004 — Product expansion requires evidence

- Decision: Do not add a Saju SKU or change 9,600/39,000 KRW pricing in this workstream.
- Reason: No actual demand, provider cost, refund, or fulfillment evidence was supplied.
- Success gate: activation/conversion intent plus variable AI and provider cost estimates;
  reversal gate: weak paid intent, unsafe claims, or margin below the existing guardrails.
