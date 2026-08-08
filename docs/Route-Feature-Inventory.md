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

## Resolved while doing this work

- `tests/e2e/performance.spec.ts` → `/en` used to time out on `waitUntil: "networkidle"`,
  on this change and on every commit before it. The keep-alive `POST
  /api/analytics/events` beacon never reported completion back to the page, so the
  page's network never went quiet. Fixed by sending conversion events with
  `navigator.sendBeacon`; the suite is now 139 passed / 0 failed.

## Known environment limits

- The WebKit (`mobile`) Playwright project cannot run in the agent container — no WebKit
  build is installed. The mobile viewport was exercised on Chromium instead; CI runs
  the repository's own configuration with both browsers.

## Where production actually runs

Worth writing down, because it is not obvious from the repository and it is easy to
verify the wrong thing:

- **`mygyeol.kr` is a Cloudflare Worker.** It is built by `pnpm build:sites`
  (`vinext build` + `scripts/fix-font-urls.mjs`, bundled through
  `@cloudflare/vite-plugin` with `worker/index.ts` as the entry) and deployed with
  `wrangler`. The live responses carry `server: cloudflare` and `vary: … X-Vinext-*`,
  and carry no `x-vercel-id`.
- **The Vercel project `innerarc-gyeol` also builds every push to `main`** and reports
  its production deployments as READY with `mygyeol.kr` in their alias list, but that
  is not what the domain serves. A green Vercel deployment is therefore *not* evidence
  that a change reached users.
- **The Worker is named `gyeol`, not `innerarc`.** The account holds four Workers —
  `gyeol`, `innerarc`, `mygyeol`, `innerarc-fix`. Only `gyeol` carries the fifteen
  `secret_text` bindings the app needs (`SUPABASE_SERVICE_ROLE_KEY`, the `PAYAPP_*`
  credentials, `ADMIN_EMAILS`, the price overrides); the other three have no bindings at
  all. The zone's routes are `mygyeol.kr/*` → `gyeol` and
  `mygyeol.kr/.innerarc-discard/*` → `innerarc`.
- **`mygyeol.kr` is not yet delegated to Cloudflare.** The zone is `status: pending`;
  the domain's authoritative nameservers are still `ns1..ns4.hosting.co.kr`, against
  Cloudflare's assigned `alice.ns.cloudflare.com` / `phil.ns.cloudflare.com`. The
  `mygyeol.kr/*` → `gyeol` route therefore does not fire, and the domain is served by an
  older deployment outside this account. Until the nameservers move, deploying to
  `gyeol` changes what `gyeol` runs but not what visitors get.

To check what is actually live, request the site and compare against the build — the
reliable marker is the hashed stylesheet, `dist/client/assets/index-*.css`, which changes
whenever the application changes. If `https://mygyeol.kr/ko` does not reference the hash
the build just produced, the deploy did not reach the domain, however green the run was.
Feature probes such as `POST /api/reviews` answering anything other than 404 work too, but
only until the feature is old news.
