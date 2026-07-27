import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const tossPaymentSchema = z.object({
  paymentKey: z.string().min(10).max(300),
  orderId: z.string().min(6).max(64),
  status: z.enum([
    "READY",
    "IN_PROGRESS",
    "WAITING_FOR_DEPOSIT",
    "DONE",
    "CANCELED",
    "PARTIAL_CANCELED",
    "ABORTED",
    "EXPIRED",
  ]),
  method: z.string().min(1).max(100).nullable().optional(),
  currency: z.literal("KRW"),
  totalAmount: z.number().int().nonnegative(),
  suppliedAmount: z.number().int().nonnegative().optional(),
  approvedAt: z.string().datetime({ offset: true }).nullable().optional(),
  requestedAt: z.string().datetime({ offset: true }).optional(),
  virtualAccount: z.object({
    secret: z.string().min(1).max(300).nullable().optional(),
  }).passthrough().nullable().optional(),
}).passthrough();

export type TossPayment = z.infer<typeof tossPaymentSchema>;

export class TossApiError extends Error {
  constructor(
    readonly status: number,
    readonly providerCode: string,
  ) {
    super("Toss Payments request failed.");
  }
}

type TossRequestOptions = Readonly<{
  secretKey: string;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  idempotencyKey?: string;
  signal?: AbortSignal;
}>;

async function tossRequest(options: TossRequestOptions): Promise<TossPayment> {
  // Toss Payments official API authentication:
  // https://docs.tosspayments.com/reference/using-api/authorization
  const response = await fetch(`https://api.tosspayments.com${options.path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${options.secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    signal: options.signal,
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = z.object({ code: z.string().max(100) }).safeParse(body);
    throw new TossApiError(response.status, error.success ? error.data.code : "UNKNOWN_PROVIDER_ERROR");
  }
  return tossPaymentSchema.parse(body);
}

export function confirmTossPayment(input: {
  secretKey: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  signal?: AbortSignal;
}) {
  return tossRequest({
    secretKey: input.secretKey,
    path: "/v1/payments/confirm",
    method: "POST",
    body: { paymentKey: input.paymentKey, orderId: input.orderId, amount: input.amount },
    idempotencyKey: input.orderId,
    signal: input.signal,
  });
}

export function getTossPaymentByOrderId(input: {
  secretKey: string;
  orderId: string;
  signal?: AbortSignal;
}) {
  return tossRequest({
    secretKey: input.secretKey,
    path: `/v1/payments/orders/${encodeURIComponent(input.orderId)}`,
    signal: input.signal,
  });
}

export function matchesTossWebhookSecret(expected: string | null | undefined, received: string) {
  if (!expected) return false;
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return expectedBytes.length === receivedBytes.length &&
    timingSafeEqual(expectedBytes, receivedBytes);
}

export function sanitizeTossSnapshot(payment: TossPayment) {
  return {
    orderId: payment.orderId,
    status: payment.status,
    method: payment.method ?? null,
    currency: payment.currency,
    totalAmount: payment.totalAmount,
    suppliedAmount: payment.suppliedAmount ?? null,
    approvedAt: payment.approvedAt ?? null,
    requestedAt: payment.requestedAt ?? null,
  };
}
