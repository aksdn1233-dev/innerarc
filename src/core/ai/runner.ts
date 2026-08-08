import { z } from "zod";
import {
  createFallbackInterpretation,
  validateInterpretation,
  type AIInterpretation,
  type AIProfileRequest,
} from "./profile";
import { containsProhibitedOverclaim } from "./safety";

export const AI_RUN_POLICY_VERSION = "1.1.0" as const;

// A single interior slash is allowed because hosted-model catalogues publish names that
// carry a publisher prefix — `meta/llama-3.3-70b-instruct`. The alias goes into the audit
// record, so it stays bounded, lowercase, and free of anything that could be read as a
// path traversal or a second segment: one slash, never leading or trailing.
const alias = z.string().regex(/^[a-z0-9_.-]{2,80}(?:\/[a-z0-9_.-]{2,80})?$/);
export const ProviderUsageSchema = z.object({
  inputTokens: z.number().int().min(0).max(10_000_000),
  outputTokens: z.number().int().min(0).max(10_000_000),
  estimatedCostMicros: z.number().int().min(0).max(100_000_000),
}).strict();
export type ProviderUsage = z.infer<typeof ProviderUsageSchema>;

export type MeteredProviderResponse = Readonly<{
  output: unknown;
  usage: ProviderUsage;
  providerFailure?: "refusal" | "incomplete";
}>;

export interface MeteredInterpretationProvider {
  readonly providerAlias: string;
  readonly modelAlias: string;
  interpret(request: AIProfileRequest, signal: AbortSignal): Promise<MeteredProviderResponse>;
}

export const AIRunFailureReasonSchema = z.enum([
  "provider_disabled",
  "timeout",
  "provider_error",
  "provider_refusal",
  "provider_incomplete",
  "schema_or_fact_error",
  "prohibited_overclaim",
]);
export type AIRunFailureReason = z.infer<typeof AIRunFailureReasonSchema>;

export const AIRunAuditSchema = z.object({
  policyVersion: z.literal(AI_RUN_POLICY_VERSION),
  providerAlias: alias,
  modelAlias: alias,
  inputTokens: z.number().int().min(0).max(10_000_000),
  outputTokens: z.number().int().min(0).max(10_000_000),
  estimatedCostMicros: z.number().int().min(0).max(100_000_000),
  latencyMs: z.number().int().min(0).max(600_000),
  fallback: z.boolean(),
  failureReason: AIRunFailureReasonSchema.nullable(),
}).strict();
export type AIRunAudit = z.infer<typeof AIRunAuditSchema>;

export type AIRunResult = Readonly<{
  interpretation: AIInterpretation;
  audit: AIRunAudit;
}>;

function interpretationText(value: AIInterpretation): string {
  return [
    value.summary,
    ...value.calculated_facts,
    ...value.traditional_interpretation,
    ...value.personalized_inference,
    ...value.strengths,
    ...value.risks,
    ...value.practical_actions,
    value.uncertainty,
    value.safety_note,
    ...value.evidence_refs.map(({ label }) => label),
  ].join("\n");
}

async function emitAudit(
  audit: AIRunAudit,
  onAudit?: (value: AIRunAudit) => void | Promise<void>,
): Promise<AIRunAudit> {
  const safe = AIRunAuditSchema.parse(audit);
  await onAudit?.(safe);
  return safe;
}

export async function runAIInterpretation(input: {
  request: AIProfileRequest;
  provider: MeteredInterpretationProvider | null;
  timeoutMs?: number;
  onAudit?: (value: AIRunAudit) => void | Promise<void>;
}): Promise<AIRunResult> {
  const fallback = createFallbackInterpretation(input.request.numerology, input.request.locale);
  if (!input.provider) {
    const audit = await emitAudit({
      policyVersion: AI_RUN_POLICY_VERSION,
      providerAlias: "disabled",
      modelAlias: "offline",
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostMicros: 0,
      latencyMs: 0,
      fallback: true,
      failureReason: "provider_disabled",
    }, input.onAudit);
    return { interpretation: fallback, audit };
  }

  const providerAlias = alias.parse(input.provider.providerAlias);
  const modelAlias = alias.parse(input.provider.modelAlias);
  const timeoutMs = z.number().int().min(10).max(120_000).parse(input.timeoutMs ?? 20_000);
  const controller = new AbortController();
  const startedAt = Date.now();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let usage: ProviderUsage = { inputTokens: 0, outputTokens: 0, estimatedCostMicros: 0 };
  let failureReason: AIRunFailureReason | null = null;
  let interpretation = fallback;

  try {
    const response = await input.provider.interpret(input.request, controller.signal);
    usage = ProviderUsageSchema.parse(response.usage);
    if (response.providerFailure === "refusal") {
      failureReason = "provider_refusal";
    } else if (response.providerFailure === "incomplete") {
      failureReason = "provider_incomplete";
    } else {
      const validated = validateInterpretation(response.output, input.request.numerology);
      if (containsProhibitedOverclaim(interpretationText(validated))) {
        failureReason = "prohibited_overclaim";
      } else {
        interpretation = validated;
      }
    }
  } catch (caught) {
    if (controller.signal.aborted) failureReason = "timeout";
    else if (caught instanceof z.ZodError || (caught instanceof Error && caught.message.startsWith("AI_CALCULATION_MISMATCH:"))) {
      failureReason = "schema_or_fact_error";
    } else {
      failureReason = "provider_error";
    }
  } finally {
    clearTimeout(timer);
  }

  const audit = await emitAudit({
    policyVersion: AI_RUN_POLICY_VERSION,
    providerAlias,
    modelAlias,
    ...usage,
    latencyMs: Math.min(600_000, Math.max(0, Date.now() - startedAt)),
    fallback: failureReason !== null,
    failureReason,
  }, input.onAudit);
  return { interpretation, audit };
}
