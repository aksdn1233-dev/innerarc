# Local Security Review

Date: 2026-08-11<br>
Scope: repository source, configuration, local production bundle, and automated tests. This is an engineering baseline, not a substitute for an independent penetration test or legal/privacy review.

## Passed checks

- Full production and development dependency audit: all published-fix advisories are cleared. Two `image-size` denial-of-service advisories remain under the narrow D-060 exception because the advisory-listed patched release is not yet published in npm.
- Recognized-secret scan: no API-key, cloud-access-key, private-key, Google API-key, or GitHub-token pattern found outside ignored build/dependency artifacts.
- Environment handling: `.env.local` is ignored and contains only local flags plus Supabase's public URL/publishable key. Database credentials and service-role secrets are absent from the repository and browser bundle.
- Security headers: content-type sniffing, referrer, frame, permissions, cross-origin resource, and CSP controls are tested.
- AI crawler controls: published AI/model, answer-engine, user-fetch, dataset, and extraction tokens
  are refused in `robots.txt` and by a Worker-level 403 before pages, APIs, static art, or image
  optimization. Ordinary Googlebot, Naver Yeti, browsers, and social link previews remain outside
  the refusal. User-agent identity is spoofable, so this is not a substitute for authorization on
  private reports or a future managed-bot/WAF control.
- HTTPS-only behavior: HSTS and `upgrade-insecure-requests` activate only when `APP_HTTPS_ONLY=true`, preventing local HTTP bundles from breaking while keeping production intent explicit.
- Privacy boundaries: no third-party browser requests in the tested guest flows; share cards render locally; analytics are no-op without separate consent and a configured sink.
- Authorization/idempotency: owner mismatch fails closed, and reused request IDs with different payloads are rejected.
- Supabase boundary: anonymous table access returns 401; account tables use owner RLS and authenticated-only grants; server deletion executes atomically and keeps only request metadata/counts.
- Administrator authentication: the public login bundle contains no owner email or client-side
  allowlist. The dynamic server page validates and passes only the browser-safe Supabase URL and
  publishable key from the request environment, so direct Cloudflare builds do not depend on a local
  secret file. Supabase magic-link authentication only proves mailbox control; the console and every
  administrator API continue to require the server-side `ADMIN_EMAILS` allowlist, and private routes
  remain noindex. A source regression test prevents reintroducing either failure.
- The temporary database password used for migration setup was rotated after the remote migration/lint checks and is not stored by the project.
- Device privacy center: corrupt local records are excluded from counts/exports, no read writes data implicitly, and one explicit action removes preference, tarot-history, Reality Check, and Daily Flow keys.
- Daily Flow: month/day persistence requires an explicit button, malformed values fail closed,
  “view today” leaves storage untouched, and calculation makes no network, AI, account,
  analytics, notification, or payment request.
- AI boundary: user context is delimited as untrusted data; structured output, canonical facts, high-risk routing, prompt-injection normalization, and overclaim screening are tested.
- Campaign/referral boundary: display, order, and provider charge amounts share one exact-week
  server schedule, then return automatically to the standard catalog. Former 1,500 KRW amounts
  remain valid for historical verification. Referral coupons are HMAC-signed, time/product/phone
  bound, and raw phone numbers are neither persisted nor returned. Campaign checkout hides the
  coupon field and the order API independently rejects any stale or forged stacking attempt before
  amount arithmetic, preventing a negative charge. Add database-level uniqueness if referral
  issuance becomes permanent.
- Review-draw consent is separate from feedback submission and public-review consent. A versioned
  server-authored receipt in the existing service-role-only review audit note carries campaign code
  and timestamp; it adds no contact, birth, report, recipient, or external-share result. Moderation
  updates preserve the receipt while keeping the operator note editable.
- Report experience survey: every write is same-origin and requires completed-report proof; all
  retention fields are fixed choices, the optional source detail is 40 characters without the
  envelope delimiter, legacy rows fail open as source-only answers, and only the allowlisted
  operator can see recent responses. Preference research cannot enable notifications, while
  detailed review publication keeps its separate opt-in, moderation, and withdrawal controls.

## Dependency decisions

- Next.js and `eslint-config-next` are pinned to 16.2.12.
- `next>sharp` is overridden to 0.35.3 and `next>postcss` to patched 8.5.19 because the parent dependency graph otherwise resolved advisory-affected releases.
- `brace-expansion` is overridden to 5.0.8 for GHSA-mh99-v99m-4gvg. The legacy `minimatch` 3 consumer receives a two-line compatibility patch because it expects the older callable CommonJS export; full ESLint execution proves the patched import path while the lockfile contains only 5.0.8.
- CI runs the full `pnpm audit`, including development tools, rather than limiting the gate to production dependencies.
- CI uses the current Node 24-based official action majors for checkout, Node setup, and artifact upload. The Node-distributed Corepack activates the exact `pnpm@11.9.0` from `package.json`; `pnpm/action-setup` is intentionally absent because its 11.7.0 bootstrap emitted a high-severity audit finding before self-update.
- Overrides must be reviewed whenever Next.js is upgraded and removed once the upstream graph resolves equally safe or newer compatible releases.
- `image-size@2.0.2` is reached only through vinext's build-time static image inspection. Do not process untrusted ICNS, JXL, or HEIF assets in that path. CI ignores only GHSA-w3rx-r6r6-pgpr and GHSA-5p2g-fcmc-qvqq until `image-size@2.0.3` or another verified upstream fix is actually published; review weekly and remove the exception immediately when resolvable.
- `nanoid` is overridden to 3.3.18 after the 2026-08-21 production audit identified
  GHSA-2v37-7h3g-55p8 in the prior explicit 3.3.17 pin. The patched version remains on the
  PostCSS-compatible 3.x line; audit and build are regression gates for this override.

## Remaining production work

## Traffic-quality controls

- The analytics ingestion route rejects cross-origin requests, validates event time and a strict
  schema, discards declared bot/crawler, headless, curl, node, release-check, and service-review
  user agents, and stores only allowlisted aggregate dimensions.
- User-agent filtering reduces obvious automation but cannot prove humanity; a hostile scanner can
  impersonate a normal browser. Cloudflare unique-network and visit-start metrics therefore remain
  operational signals rather than people counts.
- Internal production verification browsers must set the documented first-party opt-out marker
  before public-route QA. Release probes should retain a named verification user agent so server
  filtering is independently enforceable.

- Supabase DPA/transfer, retention, encryption, key rotation, administrative audit, and paid-plan recovery evidence.
- Real email magic-link, cross-account owner-isolation, session-revocation, and cookie threat exercises in a non-production staging account.
- Database backup/restore, deletion residue, and disaster-recovery exercises. RLS, authenticated grants, migrations, and atomic primary-store deletion are implemented.
- Payment webhook, replay, refund, subscription-state, and tax/invoice verification.
- Redacted monitoring and incident alerting, independent penetration testing, and abuse/rate-limit tuning under realistic load.
- Personal Pattern Intelligence P0 adds owner-scoped RLS, RPC-only writes, exact report ownership checks, idempotency keys, pagination ceilings, append-only confidence revisions, optional database-backed account/IP limits, minimized abuse events, and report/export provenance foundations. These controls are not active in production until migration, secrets, staging isolation tests, retention automation, and WAF tuning are verified.
- Current locale-aware crisis resources and qualified legal/privacy/age-policy review.
- The inactive Saju tables have owner RLS for profile CRUD and read-only owner policies for
  immutable artifacts; service-role-only calculation/audit writes and cost events. They have
  not been applied or penetration-tested. Production collection is blocked on two-account
  isolation, IDOR, export/deletion, backup residue, and recalculation authorization tests.
