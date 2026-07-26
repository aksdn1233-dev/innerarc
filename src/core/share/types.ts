import { z } from "zod";

export const SHARE_CARD_SCHEMA_VERSION = 1 as const;
export const shareCardKinds = ["core_profile", "romantic_pattern", "compatibility", "celebrity_match"] as const;
export type ShareCardKind = (typeof shareCardKinds)[number];

export const ShareCardPayloadSchema = z.object({
  schemaVersion: z.literal(SHARE_CARD_SCHEMA_VERSION),
  kind: z.enum(shareCardKinds),
  locale: z.enum(["ko", "en"]),
  brand: z.literal("InnerArc"),
  eyebrow: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  subtitle: z.string().min(1).max(220),
  highlights: z.array(z.string().min(1).max(180)).min(1).max(3),
  contextLabel: z.string().min(1).max(160),
  footer: z.string().min(1).max(180),
});

export type ShareCardPayload = z.infer<typeof ShareCardPayloadSchema>;

export class UnsafeSharePayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeSharePayloadError";
  }
}
