# Report question quality — first corrective release

Owner demand: improve the real weaknesses found in the October 22 GPT comparison.
This release repairs answer completeness, question routing and unsupported verdicts;
it is not proof that the whole report now outperforms GPT.

## Contract and acceptance

- Keep all deterministic numbers, edition years, Saju conventions, payment verification,
  account/guest authorization, historical purchases, consent, prices and deletion/export.
- Each premium personal question has its own answer, information to check, next step and
  reconsideration condition. Two similar or identical questions cannot erase each other.
- Names, master-number claims, health, finances, career, relationships, legal issues and
  immediate safety receive explicit, bounded guidance in Korean, English and Japanese.
  Multi-domain questions retain each matched domain. Immediate safety takes priority.
- Missing names are never invented; supplied supported letters use the existing engine.
  A recognized keyword does not establish a biography, diagnosis or outcome.
- Unsupported questions disclose insufficient context rather than silently receiving a
  confident answer about a different selected focus. Existing matched-domain prose is
  retained where no specific new guidance applies.
- New-generation fulfillment checks input/answer count, topic routing, nonempty fields
  and exact inclusion in the downloadable report body. Closed failure IDs contain no PII.
- The paid editorial renderer actually shows the new versioned answers near the top.
  Plain headings, short paragraphs and information/action/review labels reuse its style.
  Existing samples with no concern or personal questions keep their approved structure.
- Old stored reports have no new fields required and are never regenerated. Saju's
  calculation/output path remains separate and unchanged.

## Implementation and causes

`report-questions:1.0.0` records the new deterministic answer policy. The optional
`questionAnswers` field is additive. It is composed after ordinary narrative dedup;
each independent answer is audited separately, so shared essential conditions are not
deleted to manufacture a zero-duplicate score. Full strings stay in the existing final
section for legacy/download readers. Their exact presence is part of the output gate.

This fixes the cross-question deletion in C4.Q1/C6.Q1, Japanese C5's missing personal
answers, C6.Q2's wrong fallback and the unsupported conflict/habit guarantees. The old
editorial model selected only portions of the final section, so generating the text alone
was insufficient; `ReportQuestionGuidance` now renders the structured answers explicitly.
Source/body coverage and renderer escaping are both regression-tested.

The new copy separates a repeatable number calculation from a practical judgment. It
does not turn a birth number into proof of repayment capacity, another person's feelings,
special abilities or a health diagnosis. Guidance is decision support, not medical,
investment or legal advice. General boundaries were checked against primary sources:
[NHS fatigue guidance](https://www.nhs.uk/symptoms/tiredness-and-fatigue/) and
[CFPB credit-counseling guidance](https://www.consumerfinance.gov/ask-cfpb/what-is-credit-counseling-en-1451/).
No jurisdiction-specific eligibility, prognosis, treatment or investment return is inferred.

## Verification evidence

The first five regression tests all failed against the previous production composer.
The original six-case GPT comparison is immutable pre-fix evidence, not overwritten.
Local post-fix artifacts are `artifacts/report-quality/live-comparison/product-after.*`
and `repair-observations.json`. All nine personal questions now have four nonempty fields;
all 30 calculated values are unchanged. This is a regression check of previously seen
cases, not a fresh independent superiority benchmark or a claim of semantic perfection.

Additional cases cover repeated questions in three languages, mixed health/debt intents,
urgent safety ahead of career, missing/unsupported/actual name spellings, unknown primary
questions, malformed metadata, private-marker error leakage and HTML injection.
An English boundary regression prevents `improve` or proving job experience from being
misread as a claim about scientifically proven symbolic abilities.

Initial validation exposed phrase-only legacy assertions: they rejected a valid denial
of diagnosis because it contained the word diagnosis, or required one exact phrase for
a clinician. Tests now require the same substantive boundary while accepting natural copy.
Unit integration generates real React SSR from the report factory and server component.
Browser tests verify its component hash and render that output with production CSS/fonts
at 1440/390/360px in KO/EN/JA, including serious/critical accessibility checks. This isolated
component test is explicitly distinct from paid-order E2E coverage. The first attempt to
import TSX through Playwright produced its component-testing descriptors rather than React
elements; fixture generation now stays in the real React renderer. Non-ASCII assertions
then caught a missing UTF-8 declaration in the test-only intercepted response; both the
response and fixture document now explicitly declare UTF-8. Production's encoding was intact.

Local verification: lint has 0 errors / 4 pre-existing navigation warnings; typecheck,
131 unit files / 1,398 tests, 9 focused files / 283 checks, and the actual Vinext production
build/style gate passed. Pinned Playwright browsers are absent, but the installed Chrome
was used in a separate temporary test profile: all 3 language tests passed across the
9 language/viewport combinations with no overflow or serious/critical axe violations.
Mobile screenshots were inspected. Hosted pinned Chromium/WebKit and existing payment,
auth, report and Space gates remain required before release. No large browser download
or user-file cleanup was needed.

Final lint/typecheck/unit/build and hosted/browser identities are recorded at release.
No failing check may be relabeled as complete or skipped to pass.

## Business, cost and limits

Demand evidence is the owner's request and observed product defects, not measured sales
uplift. Existing distribution and the active 9,600/39,000 KRW contracts are preserved;
historical product labels/entitlements are untouched. No new provider, API token expense,
subscription, customer-data transfer, storage table or DB migration is introduced.
The layer is bounded local code over at most two questions; only ordinary report text and
small additive metadata are produced. No new tracking or collection of health/finance data.

Monitor new-generation failures, answer completeness, support/refund issues and user
Reality Checks through existing consented channels. These are relevance/operations signals,
not scientific personality or prediction accuracy. Reverse for valid-input fulfillment
failures, missing purchased content, payment/privacy regression or language/display breakage.

The policy still uses explicit keyword routing and curated copy; it does not understand
every paraphrase. Uncovered questions need review rather than a confidence score. Other
long-form chapters, profile-specific business assumptions, Japanese narrative-depth parity,
independent native-copy review and broader human calibration remain continuing work.
This release must not be advertised as empirically verified future prediction or always
better than a selected GPT model. Fresh blinded comparison requires new frozen examples
and independent human review; this repair set is now a regression suite.

## Rollback

Before release: main `7fb1a4b432f0c63a2700654955506616b3a2b38a`, Worker
`17fd2339-ae10-40b0-9100-02107fbb41c2`. Revert the corrective release through normal CI
and automatic deployment while preserving dashboard variables and Vite 8.1.6. Do not
regenerate, delete or change entitlement on historical purchases. Optional metadata is
ignored by old readers; complete question text remains in the stored sections/download.
