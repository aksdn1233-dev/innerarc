# Operations and Rollback Runbook

Status: Supabase account persistence connected; production deployment and remaining service owners are unassigned.

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
7. Actual production deployment requires explicit user authorization.

## Feature rollback

- Set the affected flag's `killSwitch` before changing percentage or tier targeting. Kill switch always wins.
- AI provider incident: disable the provider adapter; deterministic profile fallback remains available. Never disable crisis/reality-first safety text.
- Payment incident: disable checkout creation, preserve current entitlement snapshots through the documented grace boundary, and keep Free access available.
- Analytics/monitoring incident: disable the sink. Product functionality must continue without analytics consent or delivery.
- Suspected privacy leak: disable the affected write/export/share/provider path, preserve masked audit metadata, and begin incident assessment. Do not copy raw user data into chat or tickets.
- Supabase auth/persistence incident: remove both public Supabase variables from the application environment, preserve device-only functionality, and investigate owner isolation before re-enabling sync.

## Technical rollback

- Roll back application code to the last verified build before applying destructive database changes.
- Database migrations must be forward-compatible or have a separately tested restoration plan. Never improvise a destructive down migration in production.
- Re-run smoke, authorization, deletion, and canonical calculation checks after rollback.

## Incident priorities

1. Immediate safety or cross-user data exposure.
2. Irrecoverable deletion/export/auth or billing integrity failure.
3. Calculation/card provenance corruption or unsafe AI output.
4. Availability, latency, cost, and visual regressions.

The final runbook must add named on-call, legal/privacy, security, payment-support, and crisis-escalation owners plus provider dashboards and contact paths. Track the assignments in [Operational Ownership](Operational-Ownership.md), vendor gates in [Provider Selection](Provider-Selection.md), and unresolved launch fields in [Legal Review Packet](Legal-Review-Packet.md).

## Where production actually is

The live site is a **Cloudflare Worker named `gyeol`**, on the account
`Aksdn1233@gmail.com's Account`. Not Vercel — the Vercel project only builds pull-request
previews. Three things have each, on their own, caused merged work not to reach visitors,
so all three are written down.

### 1. The Deploy workflow needs two repository secrets

`.github/workflows/deploy.yml` runs after CI passes on main and calls
`wrangler deploy --keep-vars`. It needs, under **Settings → Secrets and variables →
Actions**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID` — `1ae0834dbdb3644d4cdff2153cffff73`

Without them the build succeeds and the deploy step fails with *"In a non-interactive
environment, it's necessary to set a CLOUDFLARE_API_TOKEN"*. Every merge before
2026-08-07 failed exactly there, which is why main ran ahead of the live site for days.
A red **Deploy** run on main means nobody is seeing the merge.

### 2. `--keep-vars` is not optional

The generated `dist/server/wrangler.json` carries no `vars`. The Supabase keys, the PayApp
credentials, the administrator allowlist and the prices are all `secret_text` bindings held
in the Cloudflare dashboard. A deploy without `--keep-vars` deletes every one of them and
takes payments and the database down on a working site.

### 3. The Worker must be named `gyeol`

`vite.config.ts` sets it explicitly. Derived from the package name it comes out `innerarc`,
which is a different, empty Worker in the same account. A deploy there reports success and
passes a health check while the live site keeps serving the old build.

The account also holds `innerarc`, `innerarc-fix` and `mygyeol` from earlier attempts.
None of them is production; leave them alone or remove them deliberately.

### Token scope

Deploying needs **Account → Workers Scripts → Edit**. Attaching a domain also needs
**Zone → Workers Routes → Edit**. Editing DNS or removing a zone additionally needs
**Zone → DNS → Edit** and **Zone → Zone → Edit** — a deploy-only token returns
`Authentication error` (10000) or `Unauthorized to access requested resource` (9109) on
those calls, which is the expected signal, not a fault.

## Connecting mygyeol.kr

As of 2026-08-07 the domain is **not yet served by this account**. Its registrar,
hosting.co.kr, still answers with `ns1–ns4.hosting.co.kr`, so the `mygyeol.kr` zone here
stays `pending` and something on another Cloudflare account answers the traffic — it
serves an older build and a CSP that predates the hero clip.

The order matters, because doing it in the wrong order takes the apex down:

1. **In the `mygyeol.kr` zone, delete the imported apex `A` records.** Adding the site
   scanned the old DNS and copied them in. While they exist, attaching a Workers Custom
   Domain to the apex is refused with error 100117, *"Hostname already has externally
   managed DNS records"*.
2. **Attach the apex to `gyeol`** — Workers & Pages → `gyeol` → Settings → Domains &
   Routes → Add Custom Domain → `mygyeol.kr`. `www.mygyeol.kr` is already attached.
3. **Only then change the nameservers** at hosting.co.kr to `alice.ns.cloudflare.com` and
   `phil.ns.cloudflare.com`. The zone flips to `active` within the hour.

Flipping the nameservers before step 2 points the apex at records that no longer lead
anywhere, so the site goes dark until the custom domain is attached.

`mygyeol.kr` currently has only `A` records — no `MX`, `TXT`, `CNAME` or `www` — so the
migration breaks no email. Verify that again before switching, with
`curl -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=mygyeol.kr&type=MX'`.

### Verifying a deploy actually reached visitors

Health checks pass just as happily against a healthy *old* build. The only test that
distinguishes deployed from serving is whether the live HTML references the stylesheet the
build just produced:

```sh
asset="$(basename "$(ls dist/client/assets/index-*.css | head -n 1)")"
curl -fsS https://mygyeol.kr/ko | grep -qF "$asset" && echo serving || echo "stale or wrong Worker"
```

The Deploy workflow's last step does exactly this. Until the domain is connected, run it
against `https://gyeol.aksdn1233.workers.dev` instead.
