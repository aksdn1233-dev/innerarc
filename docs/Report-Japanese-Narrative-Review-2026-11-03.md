# Japanese narrative evidence review — 2026-11-03

## Production and preserved baseline

Latest origin/main is `2b616c067a0c5e135b11066536386b3f6e60393c` (PR #91).
Main CI 40413008644 completed successfully on attempt 2; only the Android job whose
system-dependency installation timed out was rerun. Automatic Deploy 40416513074
succeeded, Worker `fc5a9c66-5981-4aa3-aa93-f810e66a20b4`. The skipped earlier Deploy
is not a failed live release. Current public health: site/database OK, payments open.
Public KO/EN/JA plan HTML independently confirms 5,500 / 9,800 / 36,000 KRW.
Archived ten pricing browser screenshots and .last-run.json confirm the interrupted
pricing release's final tests passed. PR #91 now records that completion; no new
production deployment was made to repair its final reporting record.

The primary checkout's unrelated uncommitted privacy/content-protection work is intact.
This draft reuses the clean recovery worktree on `codex/japanese-narrative-evidence`.
Before edits, `pnpm test:report-quality` passed 12 files / 311 checks. Earlier GPT cases
remain known regressions; no new independent GPT comparison or superiority claim is made.

## Four newly reproduced failures

Synthetic dates 2000-02-29 and 1990-01-01, each in Japanese Detailed and Premium, with
an empty name/question and no behavioral information, all received the same asserted
biography: others see a calm organizer, the person thinks over many possibilities,
excels at turning inconvenience into systems, and delays action or takes others' work.
The headline also asserted a habitual use of number-derived abilities. A final generic
hypothesis disclaimer did not qualify those individual claims.

Four added regressions failed on production source and now pass. The bounded draft
rewrites the summary and affected local chapters as symbolic hypotheses and observable
questions, explicitly marking absent evidence and retaining contrary experiences.
The work chapter asks for real responsibility/authority/experience rather than claiming
known suitability. The fixed personality label becomes a hypothesis label. Only new
Japanese numerology content version advances from 1.0.0 to 1.1.0. Japanese Saju remains
1.0.0; calculation engines, numeric fields, question answers, prices, auth/payments,
fulfillment, data rights, consent and stored purchases remain unchanged. No regeneration.

## Direct checks and release hold

- 136 unit files / 1,446 checks passed, including 12 focused files / 315 checks.
- Typecheck passed; lint has zero errors and four existing navigation warnings.
- Actual Vinext production build/style gate passed. No new Next/browser/hosted CI
  completion is claimed for this draft. Prior main's green CI validates prior source only.
- Initial local free space was 368 MiB, so no install/build was attempted then. Space
  later recovered externally to 4.7 GiB; the build was run afterward. No user file or
  browser profile was deleted and no large package/browser download was requested.
- `pnpm audit` now fails with two newly actionable moderate advisories, alongside two
  existing ignored high findings. Dependencies and ignore list were not changed.
  [Satori GHSA-wx4j-mvgx-mqwp](https://github.com/advisories/GHSA-wx4j-mvgx-mqwp)
  reaches Vinext's OG dependency; [minimatch GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
  reaches lint/build globbing. Existing copies are callable patched 3.1.5 and modern
  10.2.5; the advisory lists 11.0.1 as fixed. A blanket major override would change the
  legacy callable interface and is not a safe unverified copy-only fix. This is an audit
  gate failure, not evidence that production has been exploited.

Do not add an audit ignore or raise test/performance thresholds to ship this draft.
Resolve the security updates with verified compatibility first, then run normal CI,
merge, automatic deployment and matching live evidence. No known-failing CI was triggered
just to rediscover this gate, and this draft is **not merged or deployed**. Resume this
branch rather than recreating the same four failures or another speculative rebuild.
Local evidence: ignored artifacts/report-quality/review-2026-11-03/.

## Scope, remaining limits and rollback

This addresses the owner's recurring objectivity requirement through existing Japanese
paid/report paths. It adds no provider/model/token/subscription or fulfillment expense.
Current 9,800/36,000 prices and historical 9,600/39,000 reference economics are preserved;
no measurable lift, scientific validation or prediction accuracy is claimed. Existing
consented completion/feedback/counterevidence remain the evaluation path; no customer
records were queried and only synthetic cases were used.

Japanese long-form depth parity and remaining KO/EN unconditional career/money prose
still require separate review. The 2026 KO/EN edition remains explicit; Japanese annual
values still use input creation year. No 2027 edition rollout or old-purchase relabeling
is introduced. Revert this draft's Japanese composer/test commit to restore prior copy;
no migration or data rollback. Keep verified security fixes when any later release is
reverted. Production stays on the baseline above while the audit gate is unresolved.

## Owner-authorized security completion (supersedes the release hold above)

The owner requested fixing the audit gate and deploying this draft. Published npm
metadata/integrity and primary advisories were checked for Satori 0.33.5 and minimatch
11.0.1. All actual matching now uses upstream 11.0.1. Legacy <4 consumers resolve to
`@gyeol/minimatch-compat`, a small private callable/named-export adapter depending on
11.0.1; it contains no old matcher, faked upstream version or copied preprocessing.
Modern consumers use 11.0.1 directly. The historical 3.1.5 brace-export patch is unused.

An initial compatibility probe assumed the removed `makeRe` API. Upstream 11 removed
both that helper and the class method. Source inspection of the actual external
consumers and a full ESLint run found they use callable matching and named/class APIs,
not that regex compiler. Do not reconstruct a vulnerable regex compiler merely to pass
a speculative assertion. The replacement integration test proves real ESLint ignore
handling and a known no-explicit-any diagnostic still fire; callable/filter/list/defaults,
dot/negation/class/globstar behaviors remain tested. This is compatibility for the
installed consumers, not a promise to implement every historical minimatch API.

The real OG dependency now uses Satori 0.33.5. Its embedded-SVG attribute injection
regression verifies that synthetic markup stays escaped data, without remote input.
The first Satori update exposed a vulnerable fflate 0.7.4 dependency; pin the verified
same-line 0.7.5 fix. References: the Satori and minimatch advisories above and
https://github.com/advisories/GHSA-px8p-9vwx-vf98. No ignore entry was added or broadened.
Audit now exits 0 with only two existing ignored high findings; do not call that zero
remaining advisories or proof of no exploitation.

The previous release's Android install timed out downloading unneeded WebKit packages.
Each Space job now installs its actual declared browser only (desktop/Android Chromium,
iPhone WebKit). After a setup failure/cancellation, recovery/functional gates no longer
launch a missing browser; on successful setup they still run even if the earlier
performance gate failed. All three projects, test cases, flaky-test failure policy,
20-minute cap, performance budgets and artifact retention remain. Normal hosted CI must
verify this change; no gate is bypassed.

Free result relevance was already released in PR #90. Existing KO/EN checks prove all six
focus categories differ, business differs from job change, money/debt/investment differ,
and relationship/reconnection differ. Add a real money intake/result case beside existing
business/love cases; verify the same synthetic birth date on desktop/mobile. Category
context changes the opening guidance/domain order, not deterministic birth-date facts.
Unknown wording remains explicitly unresolved; no new AI/model calls or outcome claims.

Final local/hosted/deployment evidence is recorded on the release PR and ignored security
artifacts. Until those gates succeed, this section does not claim production rollout.
Rollback must retain these security fixes rather than restore the vulnerable dependencies;
revert only narrative/adapter behavior with a compatible patched engine if necessary.
Prices, old purchases, calculation engines, consent, retention and provider limits stay.

Local final Node 24 verification after the security update: 137 unit files / 1,450 tests,
including the Japanese narrative regressions, passed. Typecheck, lint (zero errors / four
existing warnings), real Vinext build/style gate and Next production build passed.
All six installed-Chrome desktop/mobile-emulation money/business/love free-result flows
passed without retries. These are synthetic local flows, not physical-device tests or
production proof. Audit exits zero with the two existing ignored highs unchanged.
Normal hosted CI and matching production checks remain the release gate.
