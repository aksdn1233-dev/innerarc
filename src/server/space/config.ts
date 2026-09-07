import { z } from "zod";

const price = z.number().int().nonnegative().max(1_000_000_000);
export const SpaceModelSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9._:-]{1,120}$/), inputMicrosPerMillion: price.positive(), outputMicrosPerMillion: price.positive(),
  cachedInputMicrosPerMillion: price, cacheWriteMicrosPerMillion: price,
  tier: z.enum(["routine", "standard", "strong", "astra"]).default("standard"),
  capabilityEvidence: z.object({ url: z.url().refine(value => { const url = new URL(value); return url.protocol === "https:" && ["developers.openai.com", "platform.openai.com", "openai.com"].includes(url.hostname); }), verifiedAt: z.iso.date() }).strict().nullable().default(null),
  reasoningEfforts: z.array(z.enum(["none", "minimal", "low", "medium", "high", "xhigh", "max"])).max(7).default([]),
  normalEffort: z.string().nullable().default(null), escalationEffort: z.string().nullable().default(null),
  explicitCacheControl: z.boolean().default(false),
}).strict().superRefine((model, ctx) => {
  for (const effort of [model.normalEffort, model.escalationEffort]) if (effort !== null && (!model.capabilityEvidence || !model.reasoningEfforts.includes(effort as typeof model.reasoningEfforts[number]))) ctx.addIssue({ code: "custom", message: "Unverified reasoning capability" });
  if (model.explicitCacheControl && !model.capabilityEvidence) ctx.addIssue({ code: "custom", message: "Unverified cache capability" });
  if (model.cacheWriteMicrosPerMillion < model.inputMicrosPerMillion) ctx.addIssue({ code: "custom", message: "Conservative cache write ceiling required" });
});
export type SpaceModel = z.infer<typeof SpaceModelSchema>;
const ConfigSchema = z.object({
  apiKey: z.string().min(20), models: z.array(SpaceModelSchema).min(1).max(2).refine(models => new Set(models.map(m => m.id)).size === models.length),
  maxInputTokens: z.coerce.number().int().min(256).max(32_000), maxOutputTokens: z.coerce.number().int().min(512).max(8_192),
  maxCostMicros: z.coerce.number().int().min(1).max(2_000_000), timeoutMs: z.coerce.number().int().min(1000).max(60_000),
}).strict();
export type SpaceAIConfig = z.infer<typeof ConfigSchema>;
export function spaceEnabled(env: Readonly<Record<string, string | undefined>> = process.env) { return env.SPACE_ENABLED === "true"; }
export function spaceAIConfig(env: Readonly<Record<string, string | undefined>> = process.env): SpaceAIConfig | null {
  if (!spaceEnabled(env) || env.SPACE_AI_ENABLED !== "true") return null;
  try {
    return ConfigSchema.parse({ apiKey: env.OPENAI_API_KEY, models: JSON.parse(env.SPACE_AI_MODELS_JSON ?? "null"),
      maxInputTokens: env.SPACE_AI_MAX_INPUT_TOKENS ?? "16000", maxOutputTokens: env.SPACE_AI_MAX_OUTPUT_TOKENS ?? "4096",
      maxCostMicros: env.SPACE_AI_MAX_COST_MICROS ?? "500000", timeoutMs: env.SPACE_AI_TIMEOUT_MS ?? "40000" });
  } catch { return null; }
}
export const SPACE_BUCKET = "space-private";
// Sanitized reconstruction evidence. The browser accepts an 8 MB source but sends a
// metadata-free, bounded JPEG. 3.5 MB preserves up to 2048 px detail without buffering
// original phone photos in the Worker or provider request.
export const SPACE_IMAGE_MAX_BYTES = 3_500_000;
export const SPACE_IMAGE_RETENTION_HOURS = 24;
