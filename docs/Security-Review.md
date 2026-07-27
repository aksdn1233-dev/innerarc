# Local Security Review

Date: 2026-07-27<br>
Scope: repository source, configuration, local production bundle, and automated tests. This is an engineering baseline, not a substitute for an independent penetration test or legal/privacy review.

## Passed checks

- Full production and development dependency audit: zero known vulnerabilities.
- Recognized-secret scan: no API-key, cloud-access-key, private-key, Google API-key, or GitHub-token pattern found outside ignored build/dependency artifacts.
- Environment files: only `.env.example`; provider and database values are empty placeholders.
- Security headers: content-type sniffing, referrer, frame, permissions, cross-origin resource, and CSP controls are tested.
- HTTPS-only behavior: HSTS and `upgrade-insecure-requests` activate only when `APP_HTTPS_ONLY=true`, preventing local HTTP bundles from breaking while keeping production intent explicit.
- Privacy boundaries: no third-party browser requests in the tested guest flows; share cards render locally; analytics are no-op without separate consent and a configured sink.
- Authorization/idempotency: owner mismatch fails closed, and reused request IDs with different payloads are rejected.
- Device privacy center: corrupt local records are excluded from counts/exports, no read writes data implicitly, and one explicit action removes preference, tarot-history, and Reality Check keys.
- AI boundary: user context is delimited as untrusted data; structured output, canonical facts, high-risk routing, prompt-injection normalization, and overclaim screening are tested.

## Dependency decisions

- Next.js and `eslint-config-next` are pinned to 16.2.11.
- `next>sharp` is overridden to 0.35.3 and `next>postcss` to patched 8.5.19 because the parent dependency graph otherwise resolved advisory-affected releases.
- `brace-expansion` is overridden to 5.0.8 for GHSA-mh99-v99m-4gvg. The legacy `minimatch` 3 consumer receives a two-line compatibility patch because it expects the older callable CommonJS export; full ESLint execution proves the patched import path while the lockfile contains only 5.0.8.
- CI runs the full `pnpm audit`, including development tools, rather than limiting the gate to production dependencies.
- CI uses the current Node 24-based official action majors: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`, and `pnpm/action-setup@v6`. This removes the prior Node 20 action-runtime deprecation path while the application runtime remains pinned independently.
- Overrides must be reviewed whenever Next.js is upgraded and removed once the upstream graph resolves equally safe or newer compatible releases.

## Remaining production work

- Provider DPA, region, retention, encryption, key rotation, least privilege, webhook verification, and administrative audit design.
- Auth session/cookie and social-login threat review against the selected identity provider.
- Database row-level security, migration, backup/restore, deletion, and disaster-recovery exercises.
- Payment webhook, replay, refund, subscription-state, and tax/invoice verification.
- Redacted monitoring and incident alerting, independent penetration testing, and abuse/rate-limit tuning under realistic load.
- Current locale-aware crisis resources and qualified legal/privacy/age-policy review.
