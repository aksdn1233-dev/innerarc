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
