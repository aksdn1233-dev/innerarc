# AI Interpretation Policy

## Purpose

AI translates deterministic facts and canonical symbols into understandable reflection. It does not calculate numerology, draw cards, diagnose, predict with certainty, or make decisions for the user.

## Required structured output

- `summary`
- `calculated_facts`
- `traditional_interpretation`
- `personalized_inference`
- `strengths`
- `risks`
- `practical_actions`
- `uncertainty`
- `safety_note`
- `evidence_refs`

Calculation evidence IDs must match the canonical engine output. Unknown IDs reject the response. User text is delimited as untrusted data and never promoted to system instructions.

## Generation rules

1. Use conditional language: “may,” “can be explored,” or “one possible lens.”
2. Separate facts from tradition and inference.
3. Give at least one observable reality check for decision questions.
4. Prefer small reversible actions.
5. Never imply that numerology itself learns or becomes more accurate.
6. Describe improvement as higher personal relevance from consented history.
7. Do not reveal private context in a share output.
8. Do not invent celebrity facts, sources, outcomes, or user history.
9. Domain-profile generation may use a deterministic bilingual fallback. It must preserve identical domain/role/evidence structure across languages and clearly label symbolic ranking as non-scientific.
10. Money sections discuss habits, responsibility, and decision process only; they never recommend assets, trades, debt, or individualized financial action.

## Quality and regression

Fixed Korean/English cases check calculation integrity, semantic consistency, uncertainty, prohibited certainty, privacy leakage, injection resistance, and provider failure. Provider, model, prompt, safety-policy, and symbol-rule versions are recorded with each generation.

## Failure behavior

Timeout, malformed JSON, schema failure, fact mismatch, or safety failure yields a localized rule-based fallback. A retry must not create duplicate saved results. Raw provider prompts/responses are not logged by default.

## Provider and metering boundary

- A provider adapter returns an untrusted output plus bounded usage metadata: provider/model aliases, input/output token counts, latency, and estimated micro-cost.
- The runner enforces a timeout, parses the structured schema, rechecks canonical calculation references, and screens every rendered text field for prohibited certainty before accepting output.
- Disabled providers, timeouts, network/provider errors, malformed output, calculation mismatch, and overclaim detection all return the deterministic fallback with a machine-readable failure reason.
- The audit callback receives only bounded operational metadata and fallback/failure state. It never receives the concern, prompt, raw response, birth date, name, or interpretation content.
- Cost values are estimates for product operations, not amounts charged to the user. Provider selection requires separate bilingual quality, latency, safety, privacy/DPA, and unit-economics approval.

## Disabled-by-default OpenAI candidate

- Runtime configuration accepts only `AI_PROVIDER=disabled|openai`; disabled is the default and produces the complete deterministic fallback.
- Production requires a server-only key, an explicitly date-pinned model alias, reviewed input/output micro-cost rates, and a bounded output-token setting. Any `NEXT_PUBLIC_*KEY|SECRET|TOKEN|PASSWORD` value fails startup.
- The adapter uses the Responses API with higher-priority static instructions, `store: false`, and `text.format` strict JSON Schema. It uses the provider only for interpretation, never calculation or card selection.
- The request omits raw birth date and normalized name. Optional concern and prior context remain untrusted data and are included only within the established consent and retention boundaries.
- Provider refusal and incomplete output are metered when usage exists and then mapped to explicit fallback reasons. Cancellation is propagated and not automatically retried, preventing duplicate cost or records.
- Transport errors expose bounded codes/status only. Response bodies, authorization headers, prompts, and secrets are not placed in thrown messages or logs.
- This candidate implementation does not mean that OpenAI, a model, price, retention term, or processing region is approved for production.

## NVIDIA candidate (hosted inference)

`AI_PROVIDER=nvidia` selects `NvidiaChatCompletionsProvider`, which posts to NVIDIA's
OpenAI-compatible Chat Completions endpoint. It sits behind the same boundary as every
other provider: it returns an untrusted candidate plus bounded usage, and the runner —
not the adapter — decides whether the answer is usable.

Configuration is `NVIDIA_API_KEY`, `NVIDIA_MODEL`, and both cost rates. None has a
default, and a missing one throws `RUNTIME_CONFIG_REQUIRED:<name>` at startup rather
than starting half-configured. `disabled` remains the default.

Three things differ from the OpenAI adapter and are handled rather than assumed:

- **Model names carry a publisher prefix** (`meta/llama-3.3-70b-instruct`), which the
  OpenAI alias pattern rejects. The NVIDIA schema requires exactly one interior slash,
  and the audit alias accepts the same bounded shape.
- **No date suffix exists to pin.** The production pinning rule cannot apply, so
  readiness reports `productionModelPinned: null` — not `false`, which would read as a
  fault rather than a property of the catalogue. Requiring `NVIDIA_MODEL` to be set
  explicitly is what stands in for pinning.
- **Truncation surfaces as `finish_reason: "length"`**, not a status field. It is mapped
  to `incomplete`, so a half-written reading falls back instead of being published.

### Why a free evaluation tier is safe to point at

Because the fallback is not optional. A rate limit, an exhausted allowance, a schema
miss, a changed calculated number, or an overclaim all produce the complete deterministic
reading with a machine-readable failure reason. `tests/unit/nvidia-provider.test.ts`
asserts that a 429 still yields a full interpretation, and that a response whose evidence
references do not match the canonical engine is rejected.

This does not mean NVIDIA, a model, a retention term, or a processing region is approved
for production. Before enabling it against real buyers, the privacy notice and terms must
name the processor and its processing country, because the concern text and the derived
numbers leave the Worker when it is on.
