import { z } from "zod";

export function dreamEnabled(environment: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return environment.DREAM_INTELLIGENCE_ENABLED === "true";
}

export function dreamAccountSyncEnabled(environment: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return dreamEnabled(environment) && environment.DREAM_ACCOUNT_SYNC_ENABLED === "true";
}

export function dreamAIEnabled(environment: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return dreamEnabled(environment) && environment.DREAM_AI_ENABLED === "true";
}

// No model identifier is defaulted. A model can only be enabled after its availability,
// date pin, context limit and prices have been verified in the deployment environment.
export function dreamAIModel(environment: Readonly<Record<string, string | undefined>> = process.env): string | null {
  if (!dreamAIEnabled(environment)) return null;
  const value = environment.DREAM_AI_MODEL?.trim();
  return value && /^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/.test(value) ? value : null;
}

export const DREAM_AI_LIMITS = Object.freeze({ maxInputCharacters: 4_000, maxFollowUpQuestions: 3, maxOutputTokens: 1_800, timeoutMs: 20_000, retries: 1 });

const configSchema = z.object({
  apiKey: z.string().trim().min(20).max(512).regex(/^\S+$/),
  modelAlias: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/),
  inputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  outputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  maxCostMicros: z.number().int().positive().max(2_000_000),
}).strict();
export type DreamAIConfig = z.infer<typeof configSchema>;

/** A half-configured provider becomes the deterministic fallback; no model is guessed. */
export function dreamAIConfig(environment: Readonly<Record<string, string | undefined>> = process.env): DreamAIConfig | null {
  if (!dreamAIEnabled(environment) || environment.DREAM_AI_PRIVACY_APPROVED !== "true") return null;
  const integer = (name: string) => {
    const value = environment[name]?.trim();
    return value && /^\d+$/.test(value) ? Number(value) : Number.NaN;
  };
  const parsed = configSchema.safeParse({
    apiKey: environment.OPENAI_API_KEY,
    modelAlias: dreamAIModel(environment),
    inputCostMicrosPerMillionTokens: integer("DREAM_AI_INPUT_COST_MICROS_PER_MILLION_TOKENS"),
    outputCostMicrosPerMillionTokens: integer("DREAM_AI_OUTPUT_COST_MICROS_PER_MILLION_TOKENS"),
    maxCostMicros: integer("DREAM_AI_MAX_COST_MICROS"),
  });
  return parsed.success ? parsed.data : null;
}
