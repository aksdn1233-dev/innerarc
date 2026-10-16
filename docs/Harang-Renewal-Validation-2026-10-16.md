# Harang renewal validation

Decision D-117: owner-selected Harang replaces retired public characters throughout the
existing product; focused home links into the real six-question Saju journey.
See Harang-Reading-Room-Renewal-2026-10-16.md for acceptance, demand, costs,
guardrails and rollback.

## Living checks
- Reference, current repository, approved Harang art and design boundary reconciled.
- Old public characters/audio/films/marketing captures retired; legacy optional guide IDs
  resolve to the sole current guide without changing saved calculation evidence.
- Real report preview, prices, services, FAQ, legal footer and Reality Check preserved.
- Initial unit run: 128 files, 1,229 tests passed.
- Initial browser findings: sample labels 4.35:1 and numbers 3.73:1; darken both.
- Phone scan: language/footer/sample links below 44px; add explicit minimum target sizes.
- Axe: explanations must be inside dd, not a sibling small in a dl group.
- Existing axe, phone-width, calculation, paid-entry and owner-isolation gates retained.

## Operations

Full browser runs use scripts/run-e2e.mjs, which enables the released device-only Dream
flag. A manually started server without the flag intentionally serves the unavailable
screen and is not equivalent release evidence.

Rollback the source to e9ad27811b022f09968fb4a7705fb66b1c29fcec or Worker
21a128c4-d172-40cc-815f-379ffe528392. Preserve dashboard variables with --keep-vars.
No migration, new provider call, model, token cost or payment setting changed.
Restore retired public assets together with their matching old source; do not restore
an obsolete recording under a current-screen label.

## Final gate results

- Node 24 lint: 0 errors, 4 existing internal-navigation warnings.
- Typecheck and Next production build passed; Cloudflare/Vinext build passed.
- Unit: 128 files, 1,229 tests passed.
- Full Chromium/mobile suite initially: 247 passed, 11 intentional skips, 6 failures
  from the invalid definition-list grouping and an ambiguous tutorial-image locator.
  Both causes were corrected. The affected home/intake/Space/accessibility matrix then
  passed 141 tests with 3 intentional skips.
- A visual review caught compact-header selectors being scoped by CSS Modules while
  markup used global class names. Correct the selector scope and add a rendered 64px
  portrait/first-screen input assertion; the final focused run passed 10/10 on both engines.
- Fake-provider checkout: 8/8 passed, including double-click idempotency and birth-date-only
  purchase. No real transaction was created.
- Home visual matrix: 8/8 passed, covering seven widths and real service destinations.
  42 section captures replace retired screenshots. Native portrait density >= 1.9.
- Existing route performance budgets were not increased. The full run's performance,
  privacy, account, report, Dream and calculation cases passed.
- Hosted full CI and deployed build identity remain release gates. Their authoritative
  result is attached to the pull request/deploy run; this local document is not by itself
  a production confirmation.
