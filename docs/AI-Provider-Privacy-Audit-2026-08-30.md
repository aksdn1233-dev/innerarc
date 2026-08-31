# AI provider privacy audit — 2026-08-30

## Verified in code

- AI is disabled by default (`AI_PROVIDER=disabled`) and every provider is server-only.
- Deterministic numerology and Saju calculations remain outside provider adapters. AI output is schema-validated against canonical calculation references and falls back to deterministic wording on provider or safety failure.
- The OpenAI Responses request sends `store: false`, uses HTTPS, rejects redirects, pins dated model identifiers in production, and omits raw birth date and normalized name. It can still send interest, depth, an optional concern, canonical number facts, prior pattern references, and separately consented bounded personalization context.
- The NVIDIA adapter uses HTTPS and the same bounded input/fact-validation boundary. Its API request has no repository-evidenced zero-retention flag equivalent to OpenAI `store: false`.
- Personalization retrieval requires separate AI-personalization consent. Journal excerpts require an additional raw-journal-retention choice. Context is owner-checked, capped at 20 items/500 characters each, marked untrusted, and excluded from analytics and billing records.
- Provider secrets are rejected from `NEXT_PUBLIC_*`; production configuration fails closed on missing/invalid required values.

## Activation blockers

Do not enable OpenAI or NVIDIA in production until the owner verifies the signed data-processing terms, controller/processor roles, transfer region and mechanism, exact retention and deletion behavior, model-training use, subprocessors, breach notice, data-subject request support, and Korean privacy-notice disclosures. NVIDIA additionally needs written evidence for request retention and training exclusion because the code alone cannot establish those terms.

Optional concern and personalization text can contain sensitive information. Provider enablement therefore also requires an in-product disclosure immediately before consent, a reviewed field allowlist, production deletion/export exercises, and evidence that provider logs and support tooling do not expose raw prompts beyond the approved policy.

## Conclusion

The code provides a conservative technical boundary, but provider privacy compliance is not proven by configuration or `store: false` alone. Production AI remains a documented hold; deterministic functionality continues without it.
