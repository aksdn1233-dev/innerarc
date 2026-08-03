# Route and feature inventory — before and after

Taken against `origin/main` at `8c2f49f` and re-checked after the review-collection
change. Every route below was requested against a local production build
(`pnpm build` then `node scripts/serve-production.mjs`) in both states.

## Pages

| Route | Before | After | Note |
| --- | --- | --- | --- |
| `/` | 307 → `/ko` | 307 → `/ko` | locale redirect unchanged |
| `/ko`, `/en` | 200 | 200 | one section added; nothing removed |
| `/{locale}/plans` | 200 | 200 | untouched |
| `/{locale}/shop` | 200 | 200 | untouched |
| `/{locale}/me` | 200 | 200 | untouched |
| `/{locale}/profile` | 200 | 200 | untouched |
| `/{locale}/question` | 200 | 200 | untouched |
| `/{locale}/relationship` | 200 | 200 | untouched |
| `/{locale}/compatibility` | 200 | 200 | untouched |
| `/{locale}/celebrity` | 200 | 200 | untouched |
| `/{locale}/reality-check` | 200 | 200 | untouched |
| `/{locale}/orders` | 200 | 200 | untouched |
| `/{locale}/support` | 200 | 200 | untouched |
| `/{locale}/privacy`, `/{locale}/terms` | 200 | 200 | untouched |
| `/{locale}/reports/[orderId]` | authorised 200 / 404 | authorised 200 / 404 | review panel added below the existing actions |
| `/{locale}/payments/success` | 404 without provider params | 404 without provider params | pre-existing; needs the callback query |
| `/{locale}/payments/fail` | 200 | 200 | untouched |
| `/{locale}/payments/payapp-return` | routed | routed | untouched |
| `/{locale}/admin` | 307 → login when signed out | 307 → login when signed out | moderation section added |
| `/{locale}/admin/login` | 200 | 200 | untouched |
| `/auth/callback` | routed | routed | untouched |

## API routes

| Route | Before | After |
| --- | --- | --- |
| `/api/health` | 200 | 200 |
| `/api/payments/orders`, `/confirm`, `/toss/webhook`, `/portone/webhook`, `/payapp/return`, `/payapp/feedback` | present | unchanged |
| `/api/orders/lookup`, `/api/orders/[orderId]/pass` | present | unchanged |
| `/api/reports/[orderId]/download` | present | unchanged |
| `/api/account/*` | present | unchanged |
| `/api/admin/orders/*`, `/api/admin/settings`, `/api/admin/payments/status`, `/api/admin/inquiries/[id]` | present | unchanged |
| `/api/analytics/events` | present | unchanged — no new event name, no new property |
| `/api/support` | present | unchanged |
| `/api/reviews` | — | **new**: submit, proof-of-access required |
| `/api/reviews/consent` | — | **new**: withdraw or re-request publication |
| `/api/admin/reviews/[id]` | — | **new**: moderate, allowlisted operator only |

## Features

| Capability | State |
| --- | --- |
| Numerology calculation in code, not AI | preserved, untouched |
| Free first result varying by input | preserved, untouched |
| Onboarding intake (birth date, area, name, concern) | preserved, untouched |
| Product selection and price display | preserved — `resolveProductPricing` still the single source |
| Checkout entry and provider hand-off | preserved, untouched |
| Payment callbacks, cancellation, failure states | preserved, untouched |
| Result access (token, ticket, pass, phone lookup, account) | preserved — the review flow reuses the same check |
| PDF/download action | preserved, untouched |
| Guest access and optional account sync | preserved, untouched |
| Account pages, support, legal pages | preserved, untouched |
| Owner console | preserved, plus a review moderation section and a pending-review counter |
| Review collection | **new** |
| Public review display with evidence fallback | **new** |

Nothing was moved and nothing was removed, so there is no replacement route to document.

## Known pre-existing items

- `tests/e2e/performance.spec.ts` → `/en` times out on `waitUntil: "networkidle"` in
  this container because the keep-alive `POST /api/analytics/events` beacon stays open.
  Reproduced on unmodified `origin/main` in the same container before the change, so it
  is environmental or pre-existing, not a regression. Every other e2e test passes.
- The WebKit (`mobile`) Playwright project cannot run in this container — no WebKit
  build is installed. The mobile viewport was exercised on Chromium instead; CI runs
  the repository's own configuration with both browsers.
