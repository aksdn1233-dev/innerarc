import { z } from "zod";

export const OpenAIProviderConfigSchema = z.object({
  apiKey: z.string().trim().min(20).max(512).regex(/^\S+$/),
  modelAlias: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/),
  inputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  outputCostMicrosPerMillionTokens: z.number().int().min(0).max(1_000_000_000),
  maxOutputTokens: z.number().int().min(256).max(32_000).default(3_500),
}).strict();
export type OpenAIProviderConfig = z.infer<typeof OpenAIProviderConfigSchema>;
