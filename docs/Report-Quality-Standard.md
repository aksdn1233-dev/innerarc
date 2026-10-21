# Report quality standard — 2026-10-22

Owner requirement: reports must be more reliable, objective and useful than an ordinary
ChatGPT prompt, with ongoing updates. This is a product goal, **not a verified superiority
claim**. Calculation correctness is testable; a symbolic description is not an empirically
established personality fact or prediction. Never turn an engineering pass rate into an
accuracy, medical, scientific, or future-outcome claim.

## Release gate

`createPaidReport` verifies newly generated reports before fulfillment. The gate compares
numerical metadata AND the displayed calculation chapter against the existing deterministic
engine, including master-number reductions, personal year and declared edition year. For
Saju, the printed four-pillar sequence must match the Saju engine; an unknown birth time
must stay unknown. Product/language identity, nonempty sections and a limitation notice
are also required. A mismatch produces only closed-set error codes, never input values.
Existing stored reports, historical entitlements, engines, prices, consent and storage
remain unchanged. The final notice distinguishes calculated values from symbolic hypotheses
in Korean, English and Japanese. Existing language, question relevance, safety, tier
inheritance, deletion/export, privacy and fulfillment tests remain authoritative.
New reports retain the internal audit policy reference `report-evidence:1.0.0`.

Premium personal questions now reuse the existing per-question topic and safety composer
instead of receiving identical relationship advice. Two-question Korean/English regressions
failed before the fix and pass afterward. The full direct-answer numeric paragraph must not
be copied into the supplement: backward deduplication otherwise removes the original opening
calculation context. Keep a compact separate basis line and the question's first answer
paragraph. Empty/whitespace concerns do not create pretend personal questions.

The English topic matcher now recognizes “changing jobs” as well as “change jobs”. Shared
job-change and debt verdicts no longer assert success or manageable repayment without facts.
The debt wording directs readers to their real circumstances and formal help rather than
inferring capacity from birth dates; see [CFPB's credit-counseling guidance](https://www.consumerfinance.gov/ask-cfpb/what-is-credit-counseling-en-1451/)
for the distinction between reviewing finances with a counselor and an unsupported prediction.

This gate is deliberately narrow. Matching our engine does not independently certify its
astronomical conventions, validate a person's biography, prove clinical effectiveness, or
detect every misleading sentence. Existing golden numerical and solar-term/late-Zi fixtures
still check the engines independently. Interpretation relevance and contradictions require
review against the actual question and explicitly consented lived evidence.
The question-by-question topic fix in this release applies to the KO/EN premium composer.
Japanese calculation/limitation checks are covered, but that does not certify equal narrative
depth or personalized-question coverage in the separate Japanese composer. Review that
language's semantic completeness separately; do not advertise parity based on numeric tests.

## Recurring review

App heartbeat `automation-2` is active: Mondays 09:00 Asia/Seoul, in this conversation.
It runs the focused checks, reviews concrete failures, preserves working systems and stays
quiet when nothing actionable changes. It does not authorize unbounded model spending or
export of customer data. This is separate from the pre-existing operational/marketing jobs.

Run `pnpm test:report-quality` on each weekly review; the default CI unit suite also includes
the evidence fixtures on every code change. Use synthetic examples only. Check calculations,
question/topic alignment, unsupported biographical assertions, conflicting recommendations,
repetition, uncertainty, actionable observations and counterevidence across KO/EN/JA and
the supported products. Keep separate counts for failures, accepted limitations and cases
requiring human review; do not collapse these into a fabricated single accuracy percentage.

The current KO/EN reports explicitly declare the 2026 edition; JA uses the input's creation
year. The gate checks internal edition consistency, not a silently substituted current year.
Review edition relevance and the annual transition before selling a new year's content.
Do not change the year, interpretation library or calculation convention without matching
fixtures and a versioned content release. Do not relabel old purchases as newly generated.

Only change code when a concrete defect or supported improvement is identified. Record its
input conditions, expected behavior, regression test and result. Green tests alone do not
justify rewriting working content. Reuse local fixtures and bounded tests; no recurring
paid model calls, customer exports, provider transfer or extra consent defaults are added.

## Comparison with an ordinary GPT response

The original release did not include a GPT comparison. The subsequent owner-requested
six-case live UI run is documented in `Report-GPT-Comparison-2026-10-22.md`, with raw
synthetic outputs and hashes saved locally. It found equal final numeric vectors, one
GPT display contradiction, and confirmed product question-coverage/claim defects.
It does **not** establish comparative superiority. Our own fixture pass rate is not a
GPT comparison or evidence of narrative completeness. Before making a superiority claim:

1. Freeze a representative held-out synthetic case set and rubric before seeing outputs.
   Include missing birth time, master numbers, leap dates, uncertain/private facts, conflicting
   goals, health/money boundaries, and different question domains and languages.
2. Record the exact account-accessible model/version, prompt, date, settings, supplied context,
   token/cost limits, failures and retries. Use the same question and disclosed information.
   Separate ordinary-prompt comparison from a comparison that supplies calculation evidence
   to both systems. Do not call a weak hand-written answer a GPT baseline.
3. Blind and randomize paired outputs. Have independent reviewers assess factual calculation
   accuracy, question relevance, unsupported claims, coherence, readability and useful next
   actions. Keep subjective judgments separate from mechanically verified facts. LLM grading
   can assist only after calibration against human judgment; it must not judge its own output
   as sole proof. Include counterexamples rather than cherry-picking flattering matches.
4. Report sample selection, denominators, paired uncertainty, disagreements, model cost and
   latency, including ties and losses. Predefine an adequate sample and a meaningful margin;
   do not claim “far more accurate” from a small or inconclusive test. An outcome-prediction
   claim would need separate empirical evidence that this symbolic product does not have.

Method reference: [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
recommends task-specific criteria, representative tests, human calibration and continuous
evaluation. No deprecated hosted Evals integration or new API dependency is introduced.

## Operations, business and rollback

Demand evidence is the owner's October 22 request; no measured conversion or accuracy gain
is claimed. Distribution and existing 9,600/39,000 KRW commercial contracts are unchanged;
the gate adds local computation, not provider/fulfillment fees. Track generation failures,
successful fulfillment, support/refund issues and the existing Reality Check outcomes.
Reality Check agreement is personal relevance, not scientific validation or ground truth.

Initial matrix: 135 synthetic product/language/date/time combinations, three independently
specified golden vectors, plus corruption/uncertainty/privacy regressions. A first local
failure exposed a validator false positive for the existing Korean coordinated negation
“보장하거나 … 대신하지 않습니다”; the matcher now recognizes that valid bounded construction.
The matrix includes it so valid Saju reports are not blocked to satisfy a brittle phrase check.
Likewise, a valid professional-first safety answer must not be replaced just because an
assertion expected the topic's exact sentence. Test its boundary and topic separately.

Local verification: 129 unit files / 1,378 tests, targeted ESLint, typecheck and the real
Vinext production build/style gate passed. The new evidence suite contains 149 checks.
The first local browser attempt could not launch because the pinned Playwright browser
binaries were absent; reinstall the package's Chromium/WebKit revisions and rerun before
calling browser verification complete. This is an environment failure, not a report failure.
Installation then hit local ENOSPC. Only the worktree's ignored `.next` output was removed
after a scoped Git dry run; source and customer data were preserved. Complete browser
validation on the hosted pinned-browser runners. Local HTTP checks returned 200 with the
intended limitation notices for KO/EN/JA. The Japanese public sample uses a separate fixed
editorial renderer and retains its existing notice; it is not proof of personalized parity.

The first PR CI (39648156938) passed lint/typecheck/unit/build and failed dependency audit:
Vite 8.1.5 was covered by newly updated launch-editor advisories
[GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm),
[GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv), and
[GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw).
Pin published Vite 8.1.6 (npm integrity verified) and regenerate the lockfile; the other
dependency versions remain unchanged, with peer-key normalization. `pnpm audit` then exits
successfully with only the three pre-existing workspace exceptions. No ignore was added.
The post-patch build/browser gates must pass on hosted CI; the earlier local build used
8.1.5 and is not represented as validating the patched bundler.

If `REPORT_EVIDENCE_MISMATCH` occurs, use the existing failed-paid-fulfillment/support/refund
procedure; do not mark the report ready or change a customer's facts to make it pass. Fix
the cause with a synthetic regression. Existing fulfillment catches the failure and never
exposes raw inputs in the audit code. A generated language audit remains advisory; this
new hard gate does not claim to prove every interpretation.

Pre-release source rollback: `acff4123a3e74af09d1c9250b5d6346d83bbcdb0`;
Worker `e0fbb3fe-d046-4865-abc3-e7bed85e8c5e`. Revert this release through normal CI/deploy
with preserved dashboard variables. No migration, entitlement regeneration or data deletion.
Revert for valid-input fulfillment failures or payment/privacy regression; repair the gate
before re-enabling it. Keep all calculation evidence and the symbolic claim boundary.
Keep the Vite security patch when reverting report behavior; do not reintroduce the known
toolchain advisory or add an audit bypass to make a rollback green.
