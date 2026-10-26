# Free reading: start with the selected concern

## Observed problem and acceptance

Owner feedback: the free reading did not seem related to the selected business, love
or other category. Source inspection found the Saju intake kept focus/question only
for conversion tracking and the checkout handoff. Its free story depended on the
chart alone. A real browser regression with a synthetic business question failed on
production-equivalent ca3389b: no concern guidance existed in the first chapter.

The numerology result did have a generic context card, but opened with the same
personality scenes, exposed the same first three domains, and always used a dating
preview even for work/money. That made the chosen question seem unused.

Acceptance: show a useful, free first response to the selected concern before general
chapters; distinguish business/job change/job search, relationship/reconnection,
money/debt/investment, study, health and personal-growth questions where recognized.
Provide facts to check, one next action and a reconsideration condition. Do not turn
birth-date symbols into verified biography, diagnosis, guaranteed outcomes or private
knowledge of another person. Keep every deterministic value and purchased record.

## Implementation

- `free-concern:1.0.0` is a bounded local guidance composer accepting locale,
  selected focus and optional question only. It accepts no birth data. Blank questions
  receive meaningful category guidance; unrecognized wording explicitly needs context.
  Recognized questions may narrow or differ from a category; the display identifies
  both without silently changing Saju's checkout draft or analytics selection.
- Put a compact, accessible concern card first in KO/EN Saju and numerology/profile
  results. The quoted question is escaped ordinary React text. No image or generated
  mockup substitutes for the actual result. Existing general chapters remain general.
- Use existing category examples as context for short questions such as “이 사람과
  계속 가도 될까요?”. Business and changing jobs no longer share the same opening.
  Mixed recognized questions receive at most two explicit subjects; remaining subjects
  are disclosed and the visitor is invited to ask separately.
- Reorder, without mutating, numerology's existing domain display so the three free
  domains match the concern. Keep the free-count/remaining-domain disclosure. Only
  relationship questions show the existing dating preview; other concerns retain the
  existing paid teaser and real route with their relevant subject.
- Category changes clear an old automatically chosen example, while retaining text
  the visitor wrote themselves. Example placeholders follow the selected category.
- Move the existing question classifier unchanged into a lightweight shared module,
  preserving its existing paid import/export API and behavior. Free pages must not
  import the complete paid topic/answer prose; a regression guards this boundary.
- Urgent safety guidance precedes everything and suppresses symbolic chapters, sharing
  and paid offers until the question is edited. Reuse region-labelled crisis resources
  with official source links and no country inference from language. Crime-related
  refusals do not display suicide-hotline contacts.

No engine changes, DB migration, authentication/payment/price/entitlement change,
historical regeneration, new consent, provider request or customer-record access.
The written question stays only in current-page memory and is not added to URLs,
analytics, logs, share payloads or storage. Existing explicit checkout remains separate.

## Verification and limits

The first browser test reproduced the missing business guidance before implementation.
The first corrective browser pass caught an overlooked existing “지칠까요” example;
a focused regression and category-context recognition fix retain that question.
A final input-retention review replaced equality-to-example guessing with an explicit
example-selection flag, so manually typed wording is preserved even when identical
to a chip. Two browser checks cover this. The superseded initial PR run 40313482257
was cancelled before merge to verify this refinement without duplicate CI cost.
A mixed-length test fixture initially failed TypeScript's tuple typing; its optional
locale now has a default. Neither failure was waived or published.

Cover KO/EN category/question separation, missing/unknown/conflicting input, different
questions within one category, health/debt combinations, safety, HTML escaping,
region-labelled support and valid engine values. Browser tests use the actual six-step
Saju flow and the actual profile form, existing payment handoff and unknown birth time,
mobile wrapping, accessibility, no page errors and no question stored before checkout.

This is explicit keyword/category routing with curated introductory guidance, not a
claim of understanding every question or a new AI reasoning model. No personality,
medical, financial or future accuracy claim is made. Same-domain questions outside the
recognized subjects may still need refinement. Japanese free Saju is not introduced;
the existing JA paid/report routes and translations remain unchanged.

Boundary sources checked: [NHS fatigue](https://www.nhs.uk/symptoms/tiredness-and-fatigue/),
[CFPB credit counseling](https://www.consumerfinance.gov/ask-cfpb/what-is-credit-counseling-en-1451/),
[SEC investment risks and product terms](https://www.investor.gov/introduction-investing/investing-basics/investment-products),
[KR 109](https://www.129.go.kr/109), [US 988](https://988lifeline.org/get-help/).
These support practical checks and referral boundaries, not symbolic prediction.

Local Node 24 checks: 134 unit files / 1,426 tests, including 12 report-quality files /
311 checks, passed. Lint has zero errors and four existing navigation warnings. Typecheck,
actual Vinext production build/style gate and local audit passed (two existing ignored
high advisories remain; no new ignore/dependency change). Twenty installed-Chrome
desktop/mobile-emulation browser checks passed, including actual form/checkout/unknown-time
regressions, KO/EN concern outputs, 360/430px wrapping, serious/critical axe checks,
no page errors and question storage boundaries. These are not physical-device tests.

Final hosted checks and deployment identities are recorded in the PR and ignored
`artifacts/report-quality/free-concern-release/`. Run local audit before push: advisory
data changes independently of source. Do not infer release success from an HTTP 200
or passing unit test alone; exercise a real free-result interaction after deployment.

## Performance gate correction

PR CI 40314089234 passed 271 functional browser checks but failed both initial-payload
checks for `/en/saju`: decoded CSS was 364,049 bytes against the unchanged 362,000-byte
limit. The result card's stylesheet was preloaded/aggregated into the initial form even
though the result is not displayed until local input. Do not raise the budget or retry
unchanged code. Remaining superseded jobs were cancelled.

Keep the same visual rules as static typed style properties on the result component,
remove its additional stylesheet, and render those properties only with the card.
No global styles, fonts, images, screenshots or performance thresholds were weakened.
A real local Next production build now measures 359,139 CSS bytes and passes the same
committed desktop/mobile initial-payload tests. The actual Vinext production build/style
gate also passes; final hosted validation still remains required. The SSR term-count
check now accepts attributes on `<dt>` while still requiring all three semantic labels.

## Demand, business and rollback

Demand evidence is the owner's direct feedback and reproduced missing link, not a
measured uplift. Distribution remains current home/Saju/profile/numerology routes.
Existing 9,600/39,000 KRW offers and historical products remain intact; free guidance
is a short first step, not the paid full report. It adds no model/token/API/subscription
or fulfillment cost and no new tracking. Use existing consented free-result/paid-teaser
signals and support feedback to judge comprehension; no invented success percentages.

Guardrails: valid-input completion, unchanged calculations, no loss of prior purchases,
no payment/privacy regression, no serious accessibility finding or mobile overflow,
no confident answer to unsupported/safety questions. Reverse for any such regression
or persistently worse comprehension in a representative existing-traffic window.

Rollback source before release: ca3389bd274b862cf5b344c8c76cc12a9ce40df0.
Worker: a76176bb-6e5c-43aa-b330-241e539d4311. Revert this feature through normal CI/deploy;
preserve current security pins and dashboard variables (`--keep-vars`). No data rollback.
