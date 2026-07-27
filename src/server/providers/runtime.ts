import { z } from "zod";
import { OpenAIProviderConfigSchema, type OpenAIProviderConfig } from "./schema";

export type ServerRuntimeMode = "development" | "test" | "production";
export type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

const providerModeSchema = z.enum(["disabled", "openai"]);
const pinnedModel = /-\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const sensitivePublicName = /^NEXT_PUBLIC_.*(?:KEY|SECRET|TOKEN|PASSWORD)/i;
const allowedPublishableCredential = /^sb_publishable_[A-Za-z0-9_-]{16,220}$/;

function requiredInteger(value: string | undefined, name: string, minimum: number, maximum: number): number {
  if (!value?.trim()) throw new Error(`RUNTIME_CONFIG_REQUIRED:${name}`);
  return z.coerce.number().int().min(minimum).max(maximum).parse(value);
}

function assertNoPublicSecrets(env: RuntimeEnvironment): void {
  for (const [name, value] of Object.entries(env)) {
    const cleaned = value?.trim();
    if (
      cleaned &&
      sensitivePublicName.test(name) &&
      !(
        name === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" &&
        allowedPublishableCredential.test(cleaned)
      )
    ) {
      throw new Error(`PUBLIC_SECRET_FORBIDDEN:${name}`);
    }
  }
}

function parseOpenAIConfig(env: RuntimeEnvironment, runtimeMode: ServerRuntimeMode): OpenAIProviderConfig {
  const modelAlias = env.OPENAI_MODEL?.trim() ?? "";
  if (runtimeMode === "production" && !pinnedModel.test(modelAlias)) {
    throw new Error("OPENAI_PRODUCTION_MODEL_MUST_BE_PINNED");
  }
  return OpenAIProviderConfigSchema.parse({
    apiKey: env.OPENAI_API_KEY,
    modelAlias,
    inputCostMicrosPerMillionTokens: requiredInteger(
      env.OPENAI_INPUT_COST_MICROS_PER_MILLION_TOKENS,
      "OPENAI_INPUT_COST_MICROS_PER_MILLION_TOKENS",
      0,
      1_000_000_000,
    ),
    outputCostMicrosPerMillionTokens: requiredInteger(
      env.OPENAI_OUTPUT_COST_MICROS_PER_MILLION_TOKENS,
      "OPENAI_OUTPUT_COST_MICROS_PER_MILLION_TOKENS",
      0,
      1_000_000_000,
    ),
    maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS?.trim()
      ? requiredInteger(env.AI_MAX_OUTPUT_TOKENS, "AI_MAX_OUTPUT_TOKENS", 256, 32_000)
      : 3_500,
  });
}

export type ParsedAIProviderRuntime =
  | Readonly<{ mode: "disabled" }>
  | Readonly<{ mode: "openai"; config: OpenAIProviderConfig }>;

export function parseAIProviderRuntime(
  env: RuntimeEnvironment,
  runtimeMode: ServerRuntimeMode,
): ParsedAIProviderRuntime {
  assertNoPublicSecrets(env);
  const mode = providerModeSchema.parse(env.AI_PROVIDER?.trim() || "disabled");
  return mode === "disabled"
    ? { mode }
    : { mode, config: parseOpenAIConfig(env, runtimeMode) };
}

export type AIProviderReadiness = Readonly<{
  providerAlias: "disabled" | "openai";
  configured: boolean;
  modelAlias: string | null;
  secretPresent: boolean;
  remoteStorage: "disabled";
  productionModelPinned: boolean | null;
}>;

export function inspectAIProviderReadiness(
  env: RuntimeEnvironment,
  runtimeMode: ServerRuntimeMode,
): AIProviderReadiness {
  const parsed = parseAIProviderRuntime(env, runtimeMode);
  if (parsed.mode === "disabled") {
    return {
      providerAlias: "disabled",
      configured: false,
      modelAlias: null,
      secretPresent: false,
      remoteStorage: "disabled",
      productionModelPinned: null,
    };
  }
  return {
    providerAlias: "openai",
    configured: true,
    modelAlias: parsed.config.modelAlias,
    secretPresent: true,
    remoteStorage: "disabled",
    productionModelPinned: pinnedModel.test(parsed.config.modelAlias),
  };
}
