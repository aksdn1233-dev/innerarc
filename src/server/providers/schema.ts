import { z } from "zod";

export const OpenAIProviderConfigSchema = z.object({
  apiKey: z.string().trim().min(20).max(512).regex(/^\S+$/),
  modelAlias: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/),
  inputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  outputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  maxOutputTokens: z.number().int().min(256).max(32_000).default(3_500),
}).strict();
export type OpenAIProviderConfig = z.infer<typeof OpenAIProviderConfigSchema>;

/**
 * NVIDIA hosts its models behind an OpenAI-compatible Chat Completions endpoint, so the
 * adapter shape is familiar — but the identifiers are not. Model names carry a publisher
 * prefix (`meta/llama-3.3-70b-instruct`), which the OpenAI alias pattern rejects, and
 * they carry no date suffix, so the pinning rule that guards an OpenAI deployment cannot
 * apply here. What replaces it is that the model must always be named explicitly: there
 * is no default, so nobody can ship without having chosen one.
 */
export const NvidiaProviderConfigSchema = z.object({
  apiKey: z.string().trim().min(20).max(512).regex(/^\S+$/),
  modelAlias: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/),
  /**
   * Zero on the free evaluation tier. Kept as a required figure rather than defaulted,
   * because a tier that costs nothing today is not a tier that costs nothing forever, and
   * an operator should have to state what they believe the rate to be.
   */
  inputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  outputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  maxOutputTokens: z.number().int().min(256).max(32_000).default(3_500),
}).strict();
export type NvidiaProviderConfig = z.infer<typeof NvidiaProviderConfigSchema>;
