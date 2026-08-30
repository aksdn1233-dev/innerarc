# Monetization

Status: Hypothesis, not approved launch pricing.

## Tiers

- **Free:** core numbers, partial profile, one basic daily tarot, compatibility summary, limited celebrity comparison, partial weekly summary.
- **Plus:** full profile, no ads, full compatibility, personal year/month, journal, weekly/monthly report, limited AI questions.
- **Pro:** more AI questions, deep relationship analysis, team/family views, long monthly report, early features.

## Initial price hypotheses

- Korea: ₩6,900 monthly / ₩49,000 yearly.
- United States: $6.99 monthly / $49.99 yearly.
- Purchasing-power localization is evaluated before launch.

## Rules

- Show a paywall only after the first meaningful analysis.
- Disclose trial end, renewal, price, and cancellation before purchase.
- Keep cancellation as easy as signup and support store restore flows.
- Do not use fear, withheld safety content, false urgency, or guilt.
- Entitlements live server-side and payment webhooks are idempotent.
- Failed payment never corrupts user data or erase prior free access.

## 2026 summer one-time-reading event

- Detailed reading: normal 39,000 KRW, event 9,600 KRW.
- Premium in-depth reading: normal 79,000 KRW, event 39,000 KRW.
- Event window: 2026-08-01 00:00 through 2026-08-03 23:59:59 Asia/Seoul.
- The page and checkout resolve one server-owned schedule. A stale tab cannot charge a
  different amount without asking the buyer to review the updated price.
- Use a compact informational banner, not a blocking modal or second-by-second countdown.

## 2026-08-30 one-week owner-authorized extension

- Exact window: 2026-08-30 16:50 through 2026-09-06 16:50 Asia/Seoul.
- Four Pillars 5,500 → 1,500 KRW; Detailed 39,000 → 1,500 KRW; Premium 79,000 →
  1,500 KRW. Accessories and physical products are excluded.
- This is an acquisition experiment below the former 9,600/39,000 KRW promotional anchors, not a
  permanent-price decision. One 150,000 KRW prize requires 100 event orders merely to match its
  nominal value in gross revenue before payment fees, VAT, refunds, support, and displaced revenue.
- Coupon stacking is refused in UI and order API. Display, order, and provider amount share one
  clock and return to normal automatically. Detailed economics, prize rules, metrics, and reversal
  conditions are in `Campaign-2026-08-30.md`.

## Referral draft — not launched

- Proposed reward: 25% for each distinct verified new paying friend, maximum two
  rewards/50% per order. Unlimited stacking would make the fourth order free and is
  therefore not an acceptable default.
- A friend must complete an eligible first purchase, survive the refund/chargeback
  qualification window, and differ from the referrer. One pair and one qualifying
  order can create only one reward.
- Recommended public code is a generated alias. If a referrer's phone is accepted as
  input, it is normalized and HMAC-hashed immediately and never stored or logged raw.
- Recommended stacking rule is the larger of campaign or referral discount, not both.
  Final cap, qualification window, stacking, and copy require approval before launch.

## Future shop category

- The web MVP may show a closed, bilingual category preview for wearable accents, everyday carry, and desk/home accents. It does not show products, prices, stock, cart, checkout, or affiliate links.
- Opening commerce requires a separate launch decision covering suppliers, product safety/material claims, provenance, accessibility, inventory, fulfillment, regional tax, shipping, refunds/returns, customer support, fraud, privacy, payment, and consumer law.
- A result can explain why a category may fit symbolically, but no item is “lucky,” protective, healing, necessary, or guaranteed to improve relationships, money, work, or wellbeing.
- Organic symbolic relevance and paid placement are separate data fields and user-visible. Sponsorship or margin cannot alter the personalized order without explicit labelling and a new review.
- Initial monetization remains subscription-led. Commerce is an experiment only after web retention and trust metrics support it.

## Unit economics

Track AI cost per question and per monthly active user, payment fees, refund rate, store commission, gross margin by tier, and cost caps. Provider/model routing and free limits change only after quality and retention are compared with cost.

## Experiments

Test packaging, annual discount, free question allowance, and report depth. Guardrails: cancellation, refund/support contacts, “not relevant” rate, retention, safety complaints, and AI cost. No dark-pattern experiment is permitted.
