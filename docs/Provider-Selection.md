# Production Provider Selection Gates

Status: Supabase selected for auth/database; other providers remain unselected. A disabled-by-default OpenAI candidate adapter is implemented locally but is not approved or connected.
Last updated: 2026-07-27

No vendor is approved merely because an adapter contract exists. Score each candidate from 0–3 for privacy/security, regional fit, reliability, cost controls, portability, and implementation effort. Privacy/security or deletion scoring below 2 is an automatic rejection.

## Common evidence required

- Contract owner, legal entity, DPA, subprocessors, processing region, and cross-border mechanism.
- Encryption in transit/at rest, key separation, least privilege, MFA/SSO, audit logs, incident notice, backup/restore, and deletion SLA.
- Development/staging/production separation and support for redacted logs.
- Export format and documented exit/migration plan.
- Pricing unit, hard/soft cost cap, alert threshold, expected MVP volume, and shutdown behavior.
- Staging test account that contains no production personal data.

## Service-specific gates

### Auth and database

Email verification, session revocation, social-login isolation, row-level owner policy, regional database, point-in-time recovery, migration transactionality, third-party-only deletion, consent receipts, and administrative-access audit.

#### Selected Supabase foundation

- Project `innerarc` (`ytssrbmjyufphjyafjqa`) is hosted in Singapore (`ap-southeast-1`) and linked to the private GitHub repository.
- Email magic-link auth uses cookie-backed SSR, a public publishable key, and a site-URL callback bridge; no service-role key is present in the application.
- Three applied migrations create owner-scoped profiles, consent receipts, tarot readings, Reality Checks, data-rights receipts, authenticated-only grants, RLS, and atomic retry-safe deletion.
- Anonymous REST table access fails closed. Device records are uploaded only after sign-in and an explicit sync action.
- Still required before public launch: real two-account isolation tests, session revocation, admin audit evidence, DPA/transfer review, retention approval, backup/restore and recovery-time evidence, paid-plan/PITR decision, and production-domain callback validation.

### AI

No training by default, bounded retention, region/DPA, structured JSON, timeout/cancellation, token/cost reporting, model-version pinning, safety compatibility, and a kill switch that preserves deterministic fallback.

#### Current OpenAI candidate

- Uses the official Responses API request shape and strict JSON Schema Structured Outputs.
- Sends `store: false`, a fixed first-party endpoint, no redirects, an abort signal, bounded output size, and no browser-exposed key.
- The minimized envelope omits raw birth date and normalized name. It includes calculated number values, locale, interest, optional concern, depth, prior opaque pattern references, and only separately consented bounded personalization context.
- Refusal, incomplete output, invalid content type, malformed/oversized response, missing usage, timeout, cancellation, schema/fact mismatch, and prohibited claims fail to the deterministic response.
- Token counts are converted to an estimated micro-cost only from explicit reviewed environment rates. Operational audits receive no prompt or response text.
- Production startup rejects a missing secret, missing cost rates, public secret-like environment names, and model aliases that are not date-pinned.
- The default remains `AI_PROVIDER=disabled`. A key or model name in `.env` does not constitute approval.

Required before enablement: provider account owner, contract/DPA and retention evidence, processing region, approved date-pinned model, current official price review, hard cost cap, bilingual regression corpus, injection/safety red team, latency/load test, deletion/incident process, staging evidence, and explicit launch authorization.

Official contract references reviewed on 2026-07-24:

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI text generation and Responses API](https://developers.openai.com/api/docs/guides/text)
- [GPT-5.6 migration guide](https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p6-sol)
- [GPT-5.6 prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6)

### Payments

Hosted PCI boundary, signed/replay-protected webhooks, idempotency, localized tax/invoice support, restore/cancel/refund operations, transparent renewal disclosures, and a customer-accessible portal.

### Analytics and monitoring

Allowlisted event properties only, no raw prompts/journals/dates/names, consent gating for product analytics, redaction before transport, retention cap, environment separation, alert ownership, and sink-disable fallback.

### Hosting, email, and reminders

TLS and custom-domain controls, regional logs, secret management, deployment rollback, email authentication, unsubscribe/suppression, reminder consent, quiet hours/time-zone handling, and deliverability/abuse monitoring.

## Decision record template

For each service record the candidates, evidence links, scores, rejected alternatives, chosen plan/region, estimated monthly range, cost cap, account owner, incident contact, DPA status, staging date, rollback route, and re-evaluation condition in `Decision-Log.md`.
