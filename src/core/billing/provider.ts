import { z } from "zod";
import { PlanTierSchema } from "./entitlements";

const opaqueRef = z.string().regex(/^[A-Za-z0-9_-]{8,120}$/);
const returnUrl = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
}, "Return URLs must use HTTPS except on localhost");

export const CheckoutRequestSchema = z.object({
  accountRef: opaqueRef,
  tier: PlanTierSchema.exclude(["free"]),
  billingPeriod: z.enum(["month", "year"]),
  currency: z.enum(["KRW", "USD"]),
  locale: z.enum(["ko", "en"]),
  successUrl: returnUrl,
  cancelUrl: returnUrl,
  idempotencyKey: opaqueRef,
}).strict();
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutSessionSchema = z.object({
  provider: z.string().regex(/^[a-z0-9_-]{2,40}$/),
  sessionRef: opaqueRef,
  checkoutUrl: z.string().url().refine((value) => new URL(value).protocol === "https:"),
  expiresAt: z.string().datetime({ offset: true }),
}).strict();
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;

export const CancellationRequestSchema = z.object({
  accountRef: opaqueRef,
  subscriptionRef: opaqueRef,
  atPeriodEnd: z.boolean(),
  idempotencyKey: opaqueRef,
}).strict();
export type CancellationRequest = z.infer<typeof CancellationRequestSchema>;

export interface PaymentProvider {
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  cancelSubscription(request: CancellationRequest): Promise<void>;
}

export class BillingOrchestrator {
  readonly #checkouts = new Map<string, CheckoutSession>();
  readonly #cancellations = new Set<string>();

  constructor(private readonly provider: PaymentProvider) {}

  async createCheckout(candidate: unknown): Promise<CheckoutSession> {
    const request = CheckoutRequestSchema.parse(candidate);
    const existing = this.#checkouts.get(request.idempotencyKey);
    if (existing) return existing;
    const session = CheckoutSessionSchema.parse(await this.provider.createCheckout(request));
    this.#checkouts.set(request.idempotencyKey, session);
    return session;
  }

  async cancel(candidate: unknown): Promise<{ duplicate: boolean }> {
    const request = CancellationRequestSchema.parse(candidate);
    if (this.#cancellations.has(request.idempotencyKey)) return { duplicate: true };
    await this.provider.cancelSubscription(request);
    this.#cancellations.add(request.idempotencyKey);
    return { duplicate: false };
  }
}
