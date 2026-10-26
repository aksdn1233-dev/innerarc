# Long-form report evidence review — 2026-10-26

## Baseline and reproduced defect

Latest origin/main was `d17124e61d2a53b304b85b46afa77024a5eefd7e`.
PR #88 was merged; main CI 39665478324 and production Deploy 39666960330
succeeded. The public health check on October 26 returned site/database OK and
payments open. This reconciles the pending release-record boxes in the October 22
documents; those earlier question failures are fixed, not newly discovered defects.
Before edits, `pnpm test:report-quality` passed 9 files / 283 checks.

Six new synthetic regressions then failed against that source:
- A no-biography input, a fatigue question and a friendship question, all with the
  same 1994-11-04 synthetic date, received unrelated software/customer/revenue prose.
- An explicit business question received an unsupported assurance of business suitability.
- Korean and English premium reports for another date, 1988-07-02, declared hidden
  motives or a root cause of failure without behavioral evidence.

The cause was a curated number-combination override treated as a known entrepreneur
biography, plus unconditional premium psychological copy. This was not a calculation
error. Raw local failure output is retained under ignored
`artifacts/report-quality/narrative-2026-10-26/`; no customer records were read.

## Bounded repair

- Rewrite that combination's Korean long-form chapters as symbolic prompts, with
  concrete observations, missing information and counterexamples. Do not infer a job,
  software business, observed habit, ability or hidden motive from the date.
- Replace the business module's suitability assurance with demand/cost/operating
  information to check. Business-specific examples stay in the selected business module.
- Make the shared KO/EN premium motive/paradox passages conditional questions, with
  explicit reasons to reject the hypothesis. Use distinct chapter perspectives so
  ordinary deduplication does not remove the local qualification or repeat whole passages.
- Increment only the detail/premium composer content versions to 2.1.0. Keep section
  counts, tier coverage, question policy, calculations and the declared 2026 edition.
- Preserve each sharp insight in the stored body as well as optional metadata. An
  intermediate regression caught omission after replacing the old paragraphs; fix the
  actual stored text rather than dropping the existing body-presence check.
- Replace legacy tests that demanded the fabricated software biography with evidence
  boundaries. Keep calculation, section, insight-presence, length and duplicate checks.
  Add six pre-fix regressions to `pnpm test:report-quality`.

No engine, database schema, fulfillment state machine, account isolation, local
export/delete, consent, payment, entitlement, historical purchase, price or provider
configuration changes. Stored purchases are not regenerated. No UI redesign.

## Validation

Local Node 24.19.0: 132 unit files / 1,404 tests, including 10 focused files / 289
checks, passed. Lint: zero errors and four existing navigation warnings. Typecheck
and the actual Vinext/Vite production build/style gate passed. The initial focused
baseline also ran successfully on the available Node 22 runtime; final verification
uses the required Node 24. Six installed-Chrome desktop/mobile-emulation tests
passed across 18 KO/EN/JA viewport combinations (1440/390/360px), with no overflow
or serious/critical accessibility findings. This is not a physical-device test.
No dependencies or audit exceptions changed.

The first editing attempt produced unescaped newlines in TS strings; compilation
caught it locally, and it was repaired before tests or publication. No failing
transform was committed. Hosted CI/browser and deployment must pass before release;
final run IDs and public checks are recorded with the PR/release evidence.

## Business, cost and limits

Demand is the owner's continuing quality request and these reproduced defects;
there is no measured conversion improvement. Existing distribution, 9,600/39,000 KRW
contracts and historical labels remain unchanged. This is local deterministic copy:
zero extra provider calls, tokens, subscriptions, customer collection or transfers.
Fulfillment cost and payment verification are unchanged.

Success: the six known defects stay absent, all existing calculation/question/tier
checks pass, and delivery remains healthy. Guardrails are consented Reality Check
feedback including misses, support/refund signals and new-generation failures, not
personality accuracy or future prediction. Do not invent an overall quality score.

This repairs a specific combination and shared premium passages, not every long-form
claim. Other generic profiles, basic-tier prose, domain copy, same-domain question
specificity and Japanese long-form depth/meaning parity remain review priorities.
No new GPT comparison was performed. Reusing known cases is regression evidence,
not independent proof of superiority. No independent native-language or empirical
personality validation is claimed. The KO/EN edition stays explicitly 2026; review
the annual transition before selling a new year's content without altering old orders.

## Rollback

Pre-release source: `d17124e61d2a53b304b85b46afa77024a5eefd7e`.
Pre-release Worker: `e3027752-2ae2-4104-bbe8-2ac081aa9b84`.
Revert this bounded report-copy change through normal CI and automatic deployment;
keep Vite 8.1.6 and dashboard variables (`--keep-vars`). No migration or data rollback.
Reverse for valid-input delivery failures, lost paid content, language/display
breakage, or payment/privacy regression. Never weaken the evidence gate to pass.
