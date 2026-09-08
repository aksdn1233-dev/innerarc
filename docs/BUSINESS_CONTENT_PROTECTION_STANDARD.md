# BUSINESS_CONTENT_PROTECTION_STANDARD

Version: 1.0.0 · 2026-08-30

Current truthful product level: **B**. Promote to A only after the migration, secrets, retention automation, managed WAF/bot rules, two-account isolation, evidence export, and deployment verification below all pass in production.

## Classification

Public content includes the home page, marketing/education pages, controlled samples, brand information, public product pages, and search discovery documents. Protected content includes purchased reports, pattern profiles and graphs, Reality Check history, life events, user evidence, relationship data, exports, internal prompts/rules, operator tools, and proprietary structured mappings.

Public marketing remains indexable by conventional search. Protected routes rely on server authentication, report proof or owner checks, RLS, bounded queries, no-store responses, and `noindex/noarchive`; hiding a control in the browser is never treated as authorization.

## Implemented P0 controls

- Declared AI/training crawlers are refused in `robots.txt` and at the Worker edge; ordinary Googlebot, Naver Yeti, browsers, payment callbacks, and social previews remain allowed. User-agent identity is advisory and spoofable.
- New pattern APIs require a validated Supabase user. Report-derived writes re-read `purchased_reports` on the server and require exact `owner_user_id`, ready status, order ID, and section index. Missing or foreign objects return the same not-found response.
- Pattern tables use owner foreign keys, RLS, authenticated owner-only select policies, RPC-only writes, opaque UUIDs, bounded text, unique idempotency keys, pagination ceilings, and append-only confidence revisions.
- Sensitive pattern endpoints can consume shared database-backed per-account and pseudonymous per-IP limits. Limits become active only after the migration and separate 32+ character `ABUSE_HASH_SECRET` are installed. Managed Cloudflare WAF/bot rules remain an operational requirement for volumetric protection.
- HTML report exports can carry a report ID, user-scoped HMAC provenance ID, per-export ID, and content fingerprint in response headers and non-rendered metadata. They become active only after `PROVENANCE_HMAC_SECRET` and the migration are installed. P0 adds no deceptive canary text and does not alter deterministic facts.
- Security event rows contain event type, timestamp, pseudonymous account/IP references, endpoint/resource type, count, bounded user-agent summary, decision, and optional provenance reference. They must not contain report text, questions, life-event descriptions, names, birth dates, email, phone, tokens, or raw IP addresses.

## Detection and evidence workflow

Detection → create an incident ID → link the minimum relevant abuse-event and provenance/export references → preserve timestamps and affected pseudonymous resources → contain access only when justified → document scope and false-positive checks → export an integrity-hashed evidence manifest for counsel or authorities.

Operators must not automatically accuse an account. Preserve the original records, record who exported evidence and when, store a cryptographic manifest hash, and work from copies. An incident record may move through `open`, `contained`, `preserved`, and `closed`; closing never rewrites underlying events.

## Retention and operations

Proposed security-log retention is 30–90 days, minimized by event category and legal need. Incident evidence may be held longer only for a documented dispute, legal obligation, or active investigation. The final schedule, deletion job, WAF thresholds, notification owner, and legal escalation contact require production approval before this standard is described as fully operational.

## Out of scope / not claimed

This foundation does not guarantee identification, prevent screenshots or manual copying, prove that every crawler identifies itself, deploy WAF rules, perform device fingerprinting, or authorize automated accusations. Legal/robots signals complement access control and telemetry; they do not create complete technical prevention.
