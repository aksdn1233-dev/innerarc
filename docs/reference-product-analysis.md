# Reference product analysis: saju-kid.com

Observed 2026-08-21 through the public website only. No account was created, no OAuth
provider was opened, no form was submitted, no payment flow was entered, and no private
API or authenticated state was inspected. Product copy and visual assets below are
described only far enough to understand mechanics; none is licensed for reuse.

## Evidence labels

- **VERIFIED**: directly visible in a public page or redirect during this review.
- **INFERRED**: a likely product mechanism supported by public behavior, not directly observed.
- **UNKNOWN**: inaccessible without authentication/payment or absent from public behavior.

## Route map and screen map

| Route/state | Classification | Public behavior observed |
|---|---|---|
| `/` | VERIFIED | Narrow mobile-first storefront; login; daily free-chat entitlement banner; two character-led chat prompts; Saju, compatibility, ten-year flow, yearly flow, date selection, daily fortune, and consultation products; fixed five-item navigation. |
| `/auth/login?redirect=…` | VERIFIED | Contextual “continue to this content” card followed by Kakao, Naver, Google, and email entry methods. Redirect target is preserved. |
| `/auth/login/email?redirect=…` | VERIFIED | Email and password fields, password-recovery action, disabled confirmation until valid input. Whether confirmation signs in, signs up, or branches is UNKNOWN. |
| `/service/saju/add-new-member` | VERIFIED | Unauthenticated access redirects to contextual login for the low-cost Saju product. |
| `/service/fortune` | VERIFIED | Unauthenticated access redirects to contextual login for daily fortune. |
| `/chat` | VERIFIED | Unauthenticated access redirects to contextual login with a choice of two consultation personas/content styles. |
| `/library` | VERIFIED | Unauthenticated access redirects to login. Persistence categories and empty state are UNKNOWN. |
| `/my-page/inquiry` | VERIFIED | Unauthenticated access redirects to login. Inquiry workflow is UNKNOWN. |
| `/info/about`, `/info/terms`, `/info/privacy` | VERIFIED | Public links exist, but these routes redirected an unauthenticated browser to login during the review. Document content is UNKNOWN. |
| Checkout/result/detail routes | UNKNOWN | Product buttons require authentication before these states become reachable. |

## Product matrix

| Product | Public price/boundary | What is verified | What remains unknown |
|---|---|---|---|
| Base Saju explanation | “990원”, displayed as one internal unit | A low-friction paid entry product is the main card and authentication precedes profile entry. | Calculation method, preview depth, checkout provider, refunds, result structure. |
| Compatibility | One internal unit | Non-exclusive romantic positioning is stated publicly. | Profile selection, scoring, paid result depth. |
| Ten-year flow | “일부무료” | Partial-free boundary is advertised. | Free years/sections, exact calculation, upsell point. |
| Yearly/monthly flow | “일부무료” | Year-specific and monthly overview are promised. | Calendar navigation, cache/update semantics. |
| Date selection | “일부무료” | Moving, marriage, and opening examples appear in public copy. | Ranking logic, cautions, number of candidates. |
| Daily fortune | Free | A daily return surface exists and is login-gated. | Personalization inputs, expiration/cache behavior. |
| Consultation | One internal unit per public card | A daily free consultation ticket replenishes at 23:00; two chat entry styles are visible. | Message limits, context retrieval, model, moderation, purchase/refund behavior. |

## User journey map

### First paid Saju journey

1. **VERIFIED**: land on the storefront and see the low-price product above other services.
2. **VERIFIED**: select it and receive a contextual login screen with the intended product retained.
3. **INFERRED**: authenticate, create or select a person, review the order, pay one product unit, and open a persisted result.
4. **UNKNOWN**: whether any canonical Four Pillars preview appears before payment and how failure/refund is handled.

### Retention journey

1. **VERIFIED**: a free chat ticket states that it replenishes every night at 23:00.
2. **VERIFIED**: free daily fortune and a library occupy permanent navigation positions.
3. **INFERRED**: saved people and purchased results reduce repeat-entry friction and support compatibility/cross-sell.
4. **UNKNOWN**: push/email notifications, streaks, expiry, historical calendar depth, deletion/export.

## Conversion funnel

| Stage | Classification | Mechanism |
|---|---|---|
| Acquisition | VERIFIED | Search-oriented footer copy and public social/blog links. |
| Value proposition | VERIFIED | Low price, detailed-reading claim, broad product menu, and “free/partial free” labels. |
| Intent capture | VERIFIED | Product buttons route immediately to a login state that preserves product context. |
| Identity | VERIFIED | Four sign-in choices; email/password is available. |
| Profile | INFERRED | “사주추가” and multi-person compatibility imply reusable people. |
| Checkout | UNKNOWN | Provider, idempotency, confirmation, cancellation, and receipt were not reachable. |
| Fulfillment | UNKNOWN | Loading, generation, persistence, retry, and compensation were not reachable. |
| Retention | VERIFIED/INFERRED | Daily refill banner, daily fortune, chat prompts, and library are verified; notification mechanics are inferred. |

## Free/paid boundary matrix

| Surface | VERIFIED boundary | InnerArc decision |
|---|---|---|
| Daily fortune | Free, but requires login | **IMPROVE**: keep a useful guest-first calculation preview; ask for an account only to save/sync. |
| Consultation | One daily free ticket, then internal unit | **ADOPT WITH CHANGES**: bounded free follow-up can prove value, but use KRW/product entitlements rather than copying virtual-currency language. |
| Saju | Low-price paid entry | **IMPROVE**: canonical chart and basic evidence stay free; charge for structured depth, not arithmetic. |
| Ten-year/yearly/date selection | Partial free | **ADOPT** progressive disclosure with reasons and limitations, not fear. |
| Library | Login-gated | **ADOPT** for account persistence while retaining explicit guest-local privacy choices. |

## Retention loop

`storefront → authenticate/create person → obtain a reading → library → daily fortune or
daily consultation refill → add another person → compatibility/date flow → library`

The loop is **INFERRED** as a whole; its constituent navigation, refill, daily fortune,
profile-add, compatibility, and library surfaces are **VERIFIED**.

## Error and recovery matrix

| Condition | Evidence | Required independent implementation |
|---|---|---|
| Protected route without session | VERIFIED contextual redirect | Preserve exact destination; explain why identity is needed. |
| Empty/invalid login form | VERIFIED disabled confirm | Field-level validation and accessible errors. |
| OAuth cancellation/failure | UNKNOWN | Return to contextual login without losing product intent. |
| Invalid birth data or disputed boundary | UNKNOWN | Fail closed; preserve input; show policy/boundary evidence. |
| Payment callback retry | UNKNOWN | Provider verification plus one order/entitlement per idempotency key. |
| Generation timeout/permanent failure | UNKNOWN | Durable state machine, retry evidence, and compensation without recharge. |
| Empty library | UNKNOWN | Explain saving and offer free profile creation. |
| Account deletion/export | UNKNOWN | InnerArc must retain its existing local/account data-rights controls. |

## Estimated data model (INFERRED unless marked)

- `User`, linked social/email identities.
- `Person/SajuProfile` because “사주추가” and compatibility require reusable subjects.
- `Product`, `Price/InternalUnit`, `Purchase`, `Entitlement`, `PaymentTransaction`.
- `Chart`, `Reading`, `CompatibilityReading`, `PeriodReading`, `DateSelectionReading`.
- `Conversation`, `Message`, `DailyTicketBalance/Ledger` because a remaining balance and timed refill are visible (**balance/refill VERIFIED**, schema INFERRED).
- `LibraryItem` or polymorphic saved result.
- `Inquiry`, notification preference, audit/failure records are UNKNOWN.

## Competitive strengths and weaknesses

### Strengths

- **VERIFIED**: unusually clear mobile product menu and persistent navigation.
- **VERIFIED**: low-friction price anchor plus free/partial-free labels.
- **VERIFIED**: contextual authentication preserves the selected product.
- **VERIFIED**: daily refill and conversational prompts make the home page feel active.
- **INFERRED**: reusable people and a library likely compound retention.

### Weaknesses or risks

- **VERIFIED**: even free daily fortune is inaccessible before authentication, increasing activation friction.
- **VERIFIED**: legal/company pages redirected to login in this anonymous session, reducing pre-purchase transparency.
- **VERIFIED**: a public “more accurate than expensive readings” claim is difficult to substantiate.
- **INFERRED**: internal currency may obscure exact marginal price or compensation semantics.
- **UNKNOWN**: deterministic calculation evidence, versioning, privacy controls, payment idempotency, AI cost, and refund recovery cannot be assessed publicly.

## Adopt / improve / reject / defer

- **ADOPT**: compact mobile IA, reusable-profile concept, contextual redirect, daily/calendar/library retention surfaces.
- **IMPROVE**: give canonical calculation evidence free; preserve guest-first activation; show legal/privacy content before login; price in KRW/product entitlements; explain date rankings and period readings.
- **REJECT**: copied characters, artwork, brand voice, internal-currency terminology, accuracy claims, a compatibility destiny score, and anxiety-driven conversion.
- **DEFER**: native apps, push notifications, subscriptions, full date selection, and AI chat until the deterministic core, account isolation, payment lifecycle, demand, and unit economics pass their gates.

## Public-forensics limitations

Checkout, authenticated onboarding, profile fields, results, compatibility interaction,
calendar details, library taxonomy, support submission, refund behavior, notifications,
loading/error states after identity, and private data architecture are **UNKNOWN**. They must
not be described as reference-product facts without a separately authorized test account
and purchase/refund plan.
