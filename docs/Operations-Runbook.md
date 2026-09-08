# Operations and Rollback Runbook

Status: Supabase account persistence connected; production deployment and remaining service owners are unassigned.

## Deployment needs two Cloudflare secrets (added 2026-09-02)

Between 2026-08-30 and 2026-09-02 `aksdn1233-dev/innerarc` had **zero** GitHub Actions
secrets — none at repository level and none in the `Production` or `Preview` environments.
They have since been added; this stays here because it is how the failure looks. `deploy.yml` passes
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` through as empty strings, so
`wrangler deploy` stops with "In a non-interactive environment, it's necessary to set a
CLOUDFLARE_API_TOKEN environment variable".

This is why `main` has been ahead of what mygyeol.kr serves: every Deploy run since
2026-08-30 has failed at that step, and CI failing separately meant later runs were skipped
before they even got there. A green CI run is not a deployment.

To restore it, the account owner adds both secrets — Settings → Secrets and variables →
Actions — and then re-runs Deploy (it accepts `workflow_dispatch`, so no new commit is
needed):

- `CLOUDFLARE_API_TOKEN` — a token for the account that owns the `innerarc` Worker, with
  *Workers Scripts: Edit*. `vite.config.ts` also declares an Images binding and a custom
  domain route for `mygyeol.kr`, so the token must be allowed to update those.
- `CLOUDFLARE_ACCOUNT_ID` — the account the Worker lives in.

Confirm afterwards by requesting the live site and checking it references the stylesheet the
build produced, exactly as the workflow's last step does. Deployed and serving are different
claims.

## A failed "Confirm the domain is serving this build" is not always a failed deploy

That step compares the live HTML against the stylesheet the build just produced. Until
2026-09-03 it piped curl into `grep -q` under `set -o pipefail`: grep exits the instant it
matches, curl dies on the broken pipe, and the pipeline reports failure *because* the
check passed. It only ever succeeded when the page was small enough for curl to finish
writing first, so it started failing on every run as the home page grew — reporting a
detached deploy for a build the domain was already serving. The response is now read into
a variable before matching, over twelve attempts in three minutes.

Before assuming a deploy is detached, check what the domain actually serves:

```
curl -s https://mygyeol.kr/ko | grep -o 'assets/index-[A-Za-z0-9_-]*\.css'
```

If that matches the asset the run said it was expecting, the deploy landed and only the
check timed out. If it does not, the error text on that step is the right place to start.

## Release gate

1. Install from the frozen pnpm lockfile and run lint, strict typecheck, all unit/integration tests, production build, Chromium accessibility/performance/user-flow tests, and mobile flows.
2. Confirm required environment variables through provider startup checks. Never print secret values.
   - `NEXT_PUBLIC_APP_URL` must be the final path-free HTTPS origin before staging or production link-preview validation. Loopback HTTP is allowed only for local builds and tests.
   Set `APP_HTTPS_ONLY=true` only when the public origin and every required asset are served over HTTPS; it enables HSTS and CSP request upgrading. Local HTTP production-bundle tests leave it false.
3. Verify CSP/security headers, manifest, no unapproved third-party request, masked telemetry, deletion/export, subscription retry/cancel, and AI fallback in the production-like environment.
4. Record build ID, rule/policy versions, database migration version, enabled feature flags, provider aliases, and rollback target.
   - Current Supabase project: `innerarc` (`ytssrbmjyufphjyafjqa`), Singapore (`ap-southeast-1`).
   - Current database migration: `20260727000300_atomic_account_deletion.sql`.
5. Generate and archive the validated CycloneDX production SBOM. Review launch screenshots for synthetic-only content, expected dimensions, and absence of external requests.
6. Confirm crisis contacts against the official sources and review date in [Crisis Response Protocol](Crisis-Response-Protocol.md).
7. The product owner authorized automatic production deployment after validated site changes
   on 2026-08-21. Preserve the last verified rollback commit before every publish and stop for
   new authority only when access level, payments, migrations, or destructive scope changes.

## Feature rollback

- Set the affected flag's `killSwitch` before changing percentage or tier targeting. Kill switch always wins.
- AI provider incident: disable the provider adapter; deterministic profile fallback remains available. Never disable crisis/reality-first safety text.
- Payment incident: disable checkout creation, preserve current entitlement snapshots through the documented grace boundary, and keep Free access available.
- Analytics/monitoring incident: disable the sink. Product functionality must continue without analytics consent or delivery.
- Suspected privacy leak: disable the affected write/export/share/provider path, preserve masked audit metadata, and begin incident assessment. Do not copy raw user data into chat or tickets.
- Supabase auth/persistence incident: remove both public Supabase variables from the application environment, preserve device-only functionality, and investigate owner isolation before re-enabling sync.

### Administrator magic-link incident

1. Confirm the production login form is blank and sends the entered normalized email to Supabase;
   an owner address or client-side allowlist must never appear in the browser bundle.
2. Confirm the two public Supabase values are present without printing them and that the dynamic
   login page passes the validated browser-safe pair from the live request environment; a direct
   build must not rely on a local `.env` file. Then check provider email rate limits and delivery
   status. The page exposes only the closed operational categories `configuration`, `rate_limited`,
   or `provider`; never expose the provider's raw message, email, or configured allowlist.
3. Confirm the production origin and `/auth/callback` are accepted redirect targets and that the
   callback returns to the locale-specific administrator route. The production baseline is Site URL
   `https://mygyeol.kr` plus exact redirect URL `https://mygyeol.kr/auth/callback`; never leave a
   localhost Site URL in the production project.
4. Confirm the authenticated address matches one normalized entry in the server-side
   `ADMIN_EMAILS` value. Do not move that allowlist into public configuration or source code.
5. A successful email request is authentication evidence only. Verify a non-allowlisted session
   still cannot open the console or any administrator API before closing the incident.
6. Supabase's built-in SMTP is low-rate and refuses recipients outside the project team. The current
   owner address is a verified team address; configure reviewed custom SMTP before adding a non-team
   administrator or requiring production delivery guarantees. Do not invite an address into the
   organization only as a delivery workaround. Keep SMTP credentials out of source and logs.

## Technical rollback

- Roll back application code to the last verified build before applying destructive database changes.
- Database migrations must be forward-compatible or have a separately tested restoration plan. Never improvise a destructive down migration in production.
- Re-run smoke, authorization, deletion, and canonical calculation checks after rollback.
- A Sites vinext archive must retain `dist/server/index.js` from the archive root. Package
  `dist` together with `.openai/hosting.json` from the repository root; never archive the
  contents of `dist` as the archive root, which changes the entrypoint to unsupported
  `server/index.js`.
- Before publishing, smoke-test `/_vinext/image` once with Sites image bindings and once without
  them. The no-binding path must redirect only to a same-origin source asset;
  remote and protocol-relative source URLs must return 400 instead of reaching a network fetch.

### Saju recalculation and migration hold

- Do not apply `20260821000100_versioned_saju_foundation.sql` in production until staging
  proves migration/rollback, RLS, account export/deletion, and backup restore. Its rollback
  reference drops only new Saju/cost/audit tables in reverse dependency order.
- A calculation change creates a candidate chart version. Compare canonical JSON, name
  affected profiles and interpretations, and obtain an operator decision before making it
  current. Never update historical canonical results or generated prose in place.
- If a material engine defect is found, disable new Saju generation, preserve the old and
  candidate versions, add a permanent fixture/regression test, identify affected users,
  invalidate only dependent interpretations, and keep payment/compensation evidence.
- Current engine/policy rollback reference: `saju-core-1.1.0` /
  `kr-standard-1.0.0`; the prior UI-compatible engine identifier was
  `jachyeong-1.0.0` in repository history.
- Long-form life-context prose is an interpretation/presentation layer only. Its pre-change
  rollback reference is production v71 at commit
  `16b37ce087f776ac0cf5b169b5f43ff22fb1db0b`. Disable `life-narrative.ts` and remove the
  optional report-name field together if prose is mistaken for verified biography, mobile report
  completion materially drops, or report generation fails; never roll back or rewrite canonical
  pillars or historical stored reports for a prose incident.

### Saju journey presentation rollback

- The pre-redesign rollback reference is production v76 at commit
  `c80b59579c6b161b0c8b7d1becfcc4a9e1d4e80a`. Revert the `/fortune` hub module, the route-scoped
  Saju intake module, and their markup together if service selection, mobile reading, checkout
  handoff, accessibility, or initial payload budgets regress. Do not alter calculation, consent,
  price, entitlement, or historical report code as part of a presentation rollback.

### Character webtoon rollback

- Current pre-character rollback reference: commit `86d9630`.
- A character-layer incident must not change numerology calculations. Disable or revert the
  webtoon component and manifest mapping while preserving the original text result, checkout,
  account, and entitlement paths.
- Remove a malformed cut from selector candidates only with a manifest/test update; never
  substitute an invented glyph, third-party character, or baked-in dialogue image.

### Daily Flow rollback

- Device-only Daily Flow remains independent. The account morning inbox uses migration
  `20260825000100_daily_notifications_and_acquisition_surveys.sql` and the `0 0 * * *` Worker
  trigger. Disable that trigger first during a schedule, duplication, consent, or database incident;
  existing inbox rows remain owner-readable/exportable/deletable.
- Preserve device-data cleanup support for `innerarc:daily-fortune:v1` for at least one
  release after removing the UI so existing users can still export or delete the preference.
- Stop the feature immediately if device-local date rollover is wrong, same-day output drifts,
  the opt-in writes before an explicit action, a payment creates consent, deletion/export omits
  notification data, or copy crosses the symbolic-reflection boundary. Email/push/SMS delivery is
  not active until a provider and its bounce/suppression/privacy runbook are approved.
- Pre-change rollback reference is production v73 at commit
  `efd788b6d0f2949ea02300c1a401ff513a67672b`. Revert the UI and cron together, but keep the
  additive tables during rollback so users can export or delete already-created rows.

### Gift sharing and Japanese entry rollback

- Pre-release rollback reference is production v61 at commit
  `93e09be3527810461cdb324bf89957307da18e7c`.
- Gift delivery has no migration or provider registration. Remove the report gift panel and
  third-party intake selector if consent gating, report authorization, or recipient privacy
  regresses; existing download/print and checkout remain intact.
- Japanese entry is isolated to `/ja`, `/ja/reading`, and `/ja/plans`. Remove those routes and
  sitemap entries together if checkout handoff or copy review fails. Do not widen report rule
  locale types as an emergency fix.
- Vitest 4 does not accept Jest's `--runInBand` option. Run `npm test` directly; an unknown
  option is a runner invocation error, not a product-test failure.

### Accessory storefront rollback and activation hold

- Pre-storefront rollback reference is production v62 at commit
  `8db497064f423162407e825f2adf89ee82614120`.
- The current storefront has no migration, address collection, inventory mutation, or
  accessory checkout. Revert the shop recommendation sections and Saju/result links together
  if claims, materials, or purchase-state copy regress; digital reading checkout remains
  independent.
- Do not add an `accessory_*` product code to the payment catalog or database constraint until
  the specific SKU has supplier/material/allergen/origin/dimensions/care imagery, inventory,
  price/tax/shipping/returns/support evidence, and verified unit economics. Preserve a rollback
  reference before the later payment or migration change.
- A 30-day target begins only after verified payment for an approved SKU. The future order
  workflow must record promised-by, production, packed, shipped, delivered, canceled, and
  refunded states and alert the owner before the promise date; the public storefront alone is
  not fulfillment evidence.
- Current concept-vending rollback reference is production v63 at commit
  `eebeec00f6bee4da3fe5bc4e0aa96741e212e942`. Remove the eight concept assets and selector
  together if a visitor can mistake them for delivery-item photographs, if an indicative range
  appears as a checkout price, or if result variables leak into a URL or persistent store.
- `착불` does not remove the need to disclose the expected carrier basis and remote-area
  surcharge before purchase. Do not publish a blanket `반품 불가`: any later approved SKU must
  capture a separate pre-purchase custom-production notice/consent and preserve statutory defect,
  wrong-delivery, and description/contract-mismatch remedies.
- The 24-card expansion rollback reference is production v64 at commit
  `8abaa72c996b1f8b74298f9cb9458cd8c5ac3814`. Revert the full-catalog section and its product
  data together if a cropped board misrepresents the selected candidate, page weight causes a
  material shop regression, or any description reads as an approved material or purchasable SKU.
- The pre-detail rollback reference is production v66 at commit
  `e6f47aa0e41e1da10eae2679c4592aa73957911b`. Remove the multi-angle boards, product-detail
  routes, detail links, and sitemap entries together if viewpoint identity drifts, a visitor
  mistakes an AI concept for manufactured inventory, image payload becomes materially harmful,
  or any detail route exposes a cart, purchase, or checkout control.
- This repository does not define a `test:unit` package script. Use `pnpm test` for the Vitest
  unit/integration suite; `pnpm test:unit` is an invocation error rather than a product-test
  failure.
- The pre-curation rollback reference is production v67 at commit
  `e84f50e74929d84fbb7dfa15814f2a0ae2152419`. Remove the birth-date form, derived recommendation
  panel, and route-scoped shop palette together if the raw date enters a URL, storage, analytics,
  or a request; if recommendations drift for identical date/year inputs; if the UI implies a
  Saju calculation; or if contrast, mobile layout, disclosure visibility, or payload budgets fail.
- The pre-zoom/search-discovery rollback reference is production v68 at commit
  `811801afb105b6e084b2cc838654a35813f77724`. Revert the product media viewer, semantic image
  conversion, route metadata, structured data, and image sitemap together if focus/scroll fails,
  a product view becomes misleading, private URLs enter discovery documents, or search copy
  crosses the symbolic-reflection and non-purchasable concept boundaries.
- Naver Search Advisor issued the public `mygyeol.kr` ownership-verification meta value on
  2026-08-22. It is rendered server-side in the root document head and may be replaced through
  `NAVER_SITE_VERIFICATION` if Naver rotates it. Verify the live source before completing portal
  ownership, then submit `/sitemap.xml` and `/image-sitemap.xml`; no private route may be added.
- Production discovery URLs are compiled into the artifact. Build locally with
  `NEXT_PUBLIC_APP_URL=https://mygyeol.kr pnpm build:sites`; setting the value only in the Worker
  dashboard is too late for generated sitemap, canonical, Open Graph, and JSON-LD documents. After
  every deploy, require `/sitemap.xml` to contain `https://mygyeol.kr/` and reject any occurrence of
  `localhost` or `127.0.0.1`. The 2026-08-30 direct deploy exposed this failure and was immediately
  rebuilt rather than submitted to a portal.

## Personal Pattern Intelligence P0 rollout hold

- `20260830000100_personal_pattern_intelligence_p0.sql` is forward-only and additive, but it replaces `delete_account_data`; apply it in staging first and compare the complete function body with the latest notification/survey version before production.
- Deploy order is migration → two-account/RLS/RPC verification → app. The app fails softly when new tables are absent, but feedback and evidence writes remain unavailable until the migration is present.
- Test one owner and one attacker account against every pattern read/write, a foreign paid-report order/section, duplicate client request IDs, pagination ceilings, report/account export, all-data deletion, and third-party deletion.
- Configure `ABUSE_HASH_SECRET` and `PROVENANCE_HMAC_SECRET` separately. Never log either secret or raw IP. Rotate by accepting old provenance for investigations while issuing only the new version.
- Roll back application UI/API code first if pattern persistence causes errors. Keep additive tables and recorded user history in place. Do not reverse a production migration by dropping user records; prepare a separately reviewed archive/export and restoration plan.
- P0 confidence is a transparent bounded heuristic, not probability. Disable new feedback writes if history rows diverge from hypothesis counters, and reconstruct only from preserved checks/events after an audited repair.

## Incident priorities

1. Immediate safety or cross-user data exposure.
2. Irrecoverable deletion/export/auth or billing integrity failure.
3. Calculation/card provenance corruption or unsafe AI output.
4. Availability, latency, cost, and visual regressions.

The final runbook must add named on-call, legal/privacy, security, payment-support, and crisis-escalation owners plus provider dashboards and contact paths. Track the assignments in [Operational Ownership](Operational-Ownership.md), vendor gates in [Provider Selection](Provider-Selection.md), and unresolved launch fields in [Legal Review Packet](Legal-Review-Packet.md).

## AI crawler refusal operations

- Check `/robots.txt` after every deployment and confirm GPTBot, OAI-SearchBot, ChatGPT-User,
  ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, PerplexityBot, Perplexity-User, and
  CCBot each have `Disallow: /`.
- Probe one public page and one first-party image with a declared AI user agent; both must return
  403 with `Cache-Control: private, no-store` and an `X-Robots-Tag` containing `noindex`. The same
  public page must remain reachable to Googlebot, Naver Yeti, a normal browser, and social previews.
- Review official crawler documentation quarterly and after any operator notice. Add renamed tokens
  with a failing test first. Do not block Googlebot or Yeti while conventional search acquisition is
  in scope, and do not rely on `Google-Extended` as an HTTP user agent because Google documents it as
  a robots-only control token.
- Treat unexpected sustained scraper traffic as an availability/security incident. User-agent rules
  cannot identify a hostile client that impersonates a browser; escalate to rate limits or a managed
  WAF/bot rule only with measured false-positive impact on checkout, callbacks, search, and sharing.
- Roll back the edge matcher to production v73 commit
  `efd788b6d0f2949ea02300c1a401ff513a67672b` if customers, payment callbacks, ordinary search, or
  social previews are refused. Keep private-route authorization and response-level `noindex` intact.

### Customer-language guard

- Run the customer-facing string regression whenever adding a report chapter, consent surface,
  metadata field, image alternative, sitemap caption, shop disclosure, or provider error.
- Internal provider identifiers and crawler tokens may retain their protocol names; never rename
  database consent fields or security modules merely to change display copy.
- Plain-language replacements must still disclose external processing and automatically generated
  imagery. Treat any wording that implies a generated concept is a delivered-item photograph, or
  that combines personalization with model-training consent, as a release blocker.
- The first audit failed on one Korean method sentence. That failure is now a permanent regression
  case rather than a justified exception.
- The first full-suite rerun timed out in three calculation-heavy tests while the Vinext preview and
  two other verification jobs were competing for the same local CPU. Stop only the repository-owned
  preview before the full Vitest suite, require a clean rerun, then restart the preview before the
  deployment build; do not weaken the five-second test guard to hide local resource contention.
- Under zsh, quote route paths containing bracket segments and do not use its read-only `status`
  variable in verification loops. Apply one patch operation per target file. These command-shape
  failures are tooling errors rather than product evidence; correct the invocation and rerun the
  exact check instead of weakening or skipping it.
- Under zsh, do not name a loop variable `path`: it is tied to `PATH` and removes command lookup
  while the loop runs. Use `route_name` and `status_code` for HTTP route probes, then rerun every
  intended route after correcting the tooling-only failure.
- The final 2026-08-25 Saju journey run left the unrelated process already occupying port 3000
  untouched, selected validated port 3005, and passed 205 of 214 browser cases with two workers;
  nine existing environment-gated skips remained and no browser case failed.
- Wait for the retained Vinext server to print its Local URL before probing it, and request that
  exact hostname. A development server may bind `localhost` over IPv6 while an immediate
  `127.0.0.1` probe refuses; a successful retry on the printed URL is the required evidence.
- Turbopack rejects a detached deployment worktree when its `node_modules` is a symlink outside
  that worktree's filesystem root. Run the Next production build in the normal checkout, and use
  the verified Vinext build for exact-commit Sites packaging; alternatively install real local
  dependencies inside the detached worktree rather than weakening the filesystem-root check.

## Active one-week extension guard and review draw

- From 2026-08-30 16:50 until 2026-09-06 16:50 Asia/Seoul, the current catalog, order request,
  and provider amount must resolve to 1,500 KRW for Four Pillars and Detailed, and 79,000 KRW for
  Premium. At the exact ending instant they must resolve to 5,500/39,000/79,000 KRW without an
  environment edit.
- Keep 1,500 KRW in historical amount verification after expiry. If a former authorized order
  fails, restore only its verification allowlist, not an expired campaign clock or public claim.
- Campaign checkout may render the referral-coupon field because Premium is not discounted. The
  order API must refuse a coupon for either 1,500 KRW product before discount arithmetic, while a
  valid coupon may apply to Premium under the existing phone/product/signature/expiry controls.
  After expiry the same coupon rules apply to the 39,000/79,000 KRW products.
- Review entries use a versioned server-authored receipt in the existing operator-only audit note,
  so no campaign migration is required. If review reads or writes become unavailable, do not claim
  that entries can be received; pause the draw CTA or roll back while preserving accepted entries.
- On a current amount mismatch, negative/stacked discount attempt, material payment/report error,
  or privacy incident, pause new sales through the operations gate and roll back to pre-campaign
  Cloudflare version `ca5d819d-b23f-46de-b08b-836a8f874268` for the premium-exclusion change, or
  pre-campaign commit `a39e80a` for a full campaign withdrawal. Existing accepted payment
  verification, valid entries, issued coupon rights, and the prize obligation survive an early pause.
- On 2026-09-08 18:00 KST, parse only valid `one_week_extension_1500` receipts whose timestamp
  fall inside the event window and whose order remains completed and non-refunded. Sort stable IDs,
  select one with a cryptographically secure random draw, and record eligible count, chosen review
  ID, masked order number, timestamp, and operator. Publish only the masked order number. Verify a
  claim through report ownership; request fulfilment details separately; redraw after seven days if
  unclaimed. See `docs/Campaign-2026-08-30.md`.
- `pnpm build:sites` refreshes the Sites artifact but not Next's `.next` directory. Run
  `pnpm build` before the production-server E2E wrapper; otherwise a newly added route can
  correctly exist in Sites output while the local Next E2E server still returns its prior 404.
- A release is blocked if dates, normal-price comparisons, exclusions, winner/prize details, consent
  boundaries, catalog/order/provider amounts, or automatic expiry disagree.

## Traffic and journey interpretation

- Never call Cloudflare `unique visitors`, request totals, or `sum.visits` people. First subtract
  infrastructure checks, vulnerability probes, declared crawlers, release agents, and known
  operator browsing. Use `requestSource: eyeball` for Cloudflare path/user-agent diagnostics.
- Treat the owner-console journey counters as aggregate route entries, not unique people. Compare
  only like-for-like time windows and sources. Do not inspect or record IPs, personal inputs, raw
  referrers, queries, or individual browsing histories.
- For production browser verification, use the named `GYEOL release verification` user agent or
  open a public route once with `internal_preview=1`; that first-party marker sets
  `gyeol.analytics.internal.v1=1` for later QA in the same browser. Never include the marker in a
  public campaign link. localhost and administrator routes are excluded automatically.
- Do not diagnose percentage drop-off below 30 non-internal home entries per source. With smaller
  samples, report exact counts and uncertainty. At sufficient volume, examine home → free/Saju or
  reading → form start → form complete → plans → payment start → payment success. Payment/report
  errors override the sample threshold and trigger the payment incident procedure immediately.
- If known bots appear in the owner console, add a failing user-agent test before expanding the
  bounded server filter. If real customer browsers are excluded, remove the overbroad matcher and
  roll back the journey component without changing payment or historical aggregates.

## 3D 공간운 — disabled-by-default operational path

Follow `Space-Intelligence-V1.md` for staging migration dependencies and exact environment prerequisites. Enable saved/manual operation separately from AI. Monitor candidate validity/manual fallback, per-run reserved/settled cost, failed saves, leases, upload quota, hourly cleanup backlog and 48-hour deletion warnings. No image/report text belongs in logs.

On a privacy/cost/write incident: set `SPACE_AI_ENABLED=false`; set `SPACE_ENABLED=false` to stop new writes. Preserve owner reads/export/delete and scheduled cleanup. Do not drop `space-private` or new tables while retained data remains. The additive migration also repairs existing PPI deletion ordering; reverting all code can strand cleanup or regress account rights. Main auto-deploys; use an unmerged review branch until hosted two-owner and model gates pass.

Space deletion responses now acknowledge the committed database deletion immediately and conservatively report image-removal verification pending. Only the scheduled worker drains the global cleanup queue. Monitor backlog separately; never interpret a successful API receipt as proof that all private bytes have already been removed. Do not disable cleanup when rolling back feature writes.


### Space draft remote validation exception — 2026-09-07

Draft PR22 remains blocked. Run34093793928 passed general verify but recorded3 retry-pass mobile tests (share accessibility, onboarding result, shop curation); local repeated checks passed9/9 without retries, and the remote first-failure cause remains unconfirmed. The space job passed57 and failed3 unchanged<100ms frame gates at234–1049.9ms. GPU ReadPixels stalls are evidence, not a verified backend diagnosis. Keep SPACE_ENABLED/SPACE_AI_ENABLED off in production, preserve traces/captures, and require runner/device diagnosis plus the visual gate before launch. No main merge, migration or deployment is authorized by a green general-verify job alone. Diagnostic attachments now precede the performance assertion; that change does not waive the failing gate.

Run34095636928 then proved every failed canvas was fully outside the viewport. Chromium's SwiftShader CPU submission stayed4–7ms while offscreen rAF was throttled to633–1050ms. The product now snaps a validated move when the canvas is completely invisible and benchmarks the same edit with the canvas visible; threshold remains100ms. A WebKit-incompatible shadow-cache attempt was removed rather than excepted. Local quality matrix60/60 passes at17.7–18.2ms. Keep both feature flags off until the matching remote run passes, owner visual review accepts the8.51 provisional capture set, and hosted storage/model tests are supplied and pass.

Run34100600256 passed general verification but the visible fixed canvas still measured235–237ms in WebKit after automatic fallback; desktop/Android could not gather12 frames on the constrained runner. The performance tier now explicitly removes contact and directional shadow passes while higher tiers retain them. Run34105562638 passed general verification and19/20 cases on each browser, but a combined case exhausted90 seconds before measurement. Run34111669123 split it; the focused snapshot showed its enabled select present while Playwright actionability/scroll settling consumed the timeout. Each matrix job now starts a fresh process and programmatically dispatches the actual select change for the benchmark, then a second process runs20 functional/visual cases:63 total, with the same90-second and100ms limits. Do not merge until all three remote jobs are green. Hosted private storage/model and physical-device/owner review gates still apply.

Run34113160978 reached the isolated WebKit measurement but active P90 was106–114ms even with6–10ms CPU render and all expensive effects disabled. The performance profile now sets renderer pixel ratio0.7, and the benchmark blocks if its canvas scale exceeds0.71 or active P90 reaches100ms. Higher tiers and their review captures remain unchanged.

Run34113746751 passed the WebKit animation gate after that change. Android SwiftShader still scheduled visible rAF at433–450ms while synchronous render was2.5–3.1ms. Known software renderers now expose `software-snap` and synchronously draw a validated move; their response time must remain below100ms. Do not report this as physical-Android performance. Hardware backends continue to animate and use active-frame P90.

The additive premium pass keeps both flags off and does not alter this fallback policy. Local Node24 evidence was space66/66, including the unchanged performance ceilings and a real Ultra canvas-scale assertion. The 2026-09-08 capture pass raises Ultra to at least2.0× and exposes exact CSS and drawing-buffer dimensions; it is still a user-selected inspection tier and must not replace the 0.7 performance profile on constrained devices. The provisional actual-app visual review remains below the preferred9.0, so record the owner's explicit capture acceptance before clearing the visual gate. Hosted private storage/model, physical-device, merge and deployment gates remain unchanged.

Run34131758087 showed that a hardware renderer can also receive263–269ms animation callbacks while its synchronous render stays15–19ms. Do not use the renderer name as the only scheduling signal. In the performance tier, four repeated frames over the unchanged100ms ceiling switch later validated moves to `adaptive-snap`; monitor that policy separately from `software-snap`. This protects response time but is still not physical-iPhone performance evidence.

### Capture-quality and render-resolution signals — 2026-09-08

Treat `PHOTO_QUALITY_UNUSABLE`, `PHOTO_SET_QUALITY_LOW`, `PHOTO_VIEWS_DUPLICATED` and `INSUFFICIENT_CAPTURE_EVIDENCE` as recapture/manual-measurement outcomes, not provider outages. A sudden rise can mean changed camera formats, browser canvas behavior or over-strict thresholds; reproduce with synthetic non-personal fixtures before changing a threshold. Never weaken cross-view or scale confirmation to improve completion rate. The 3D host exposes `data-css-width`, `data-css-height`, `data-render-width`, `data-render-height` and `data-render-scale` for QA. Ultra must remain at least 2.0x; the performance profile must remain at or below 0.71x and keep its existing response-time gate. On memory/GPU incidents, let automatic fallback operate or disable new Space writes; preserve cleanup.

For isolated checkout UI evidence, run `E2E_PAYMENT_CHECKOUT=1 pnpm test:e2e tests/e2e/payments.spec.ts ...`. Setting only `E2E_PAYMENT_CHECKOUT` on an already-running external server does not install the fake provider shell; `scripts/run-e2e.mjs` translates it into the bounded server variables. WebGL snapshot pixels can also differ across local GPU backends. Treat functional/geometry assertions as portable gates and use the CI job's documented `--update-snapshots=all` evidence capture for each browser backend rather than rewriting unrelated baselines from another machine.

Run the final Vitest suite without a concurrent lint, typecheck, build or browser matrix. The full premium-report question matrix has a deliberate 5-second ceiling and exceeded it under a three-way local CPU run while passing in the isolated suite; concurrency is not evidence of a product calculation failure.

### Editorial capture runner notes — 2026-09-08

`pnpm start -- -p <port>` passes `-p` as a project directory in this repository's script shape. Start an explicit review server with `pnpm exec next start -p <port>`. For interactive browser checks, use the same hostname printed by the server. A Next development server opened as `localhost` but driven through `127.0.0.1` refuses cross-origin HMR and can leave forms as plain HTML submissions; that is not product-hydration evidence. Build first and use the production server for final interaction, console, and screenshot checks. Import Chromium from `@playwright/test`; the standalone `playwright` package is not installed. These command failures do not justify skipping the same production-server checks.

## Guide assets and public-story sources — 2026-09-08

Monitor guide assets as static route resources: a missing asset or font must not block Space analysis, 3D controls, recommendations or Reality Check. If browser speech fails, keep captions visible and do not retry through a paid provider. If a story source becomes unavailable or materially conflicts with its claim, mark that record insufficient or remove it from discovery until reviewed; never preserve a claim only to avoid an empty result.

### PR22 final quality pass (2026-09-08)

Use the Node 24 runtime required by package.json for release checks. Preserve Worker `innerarc`, its `mygyeol.kr` route, IMAGES binding and deployed secrets. Local Worker smoke checks must use `--local`; do not infer hosted RLS or provider access from local PGlite/mock success. The quality pass applies no migrations and authorizes no deployment. Rollback reference before any later release remains `52a70b80da6287693e09f17c9f8d3945c893c6be`; disable SPACE_ENABLED / SPACE_AI_ENABLED independently when needed. CI retries are diagnostic: flaky outcomes fail the gate. See `Final-Product-Quality-Pass.md` for the final bounded evidence and external launch gates.
