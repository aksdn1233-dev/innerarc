import { PortOneClient } from "@portone/server-sdk";
import {
  isUnrecognizedPayment,
} from "@portone/server-sdk/payment";

export class PortOneApiError extends Error {
  constructor(readonly code: "NOT_FOUND" | "UNRECOGNIZED" | "REQUEST_FAILED") {
    super("PortOne payment verification failed.");
  }
}

export async function getPortOnePayment(input: {
  apiSecret: string;
  storeId: string;
  paymentId: string;
}) {
  try {
    const client = PortOneClient({ secret: input.apiSecret });
    const payment = await client.payment.getPayment({
      paymentId: input.paymentId,
      storeId: input.storeId,
    });
    if (!payment) throw new PortOneApiError("NOT_FOUND");
    if (isUnrecognizedPayment(payment)) {
      throw new PortOneApiError("UNRECOGNIZED");
    }
    return payment;
  } catch (error) {
    if (error instanceof PortOneApiError) throw error;
    throw new PortOneApiError("REQUEST_FAILED");
  }
}

export type VerifiedPortOnePayment = Awaited<ReturnType<typeof getPortOnePayment>>;

export function toInternalPaymentStatus(status: VerifiedPortOnePayment["status"]) {
  switch (status) {
    case "PAID":
      return "DONE";
    case "VIRTUAL_ACCOUNT_ISSUED":
      return "WAITING_FOR_DEPOSIT";
    case "CANCELLED":
      return "CANCELED";
    case "PARTIAL_CANCELLED":
      return "PARTIAL_CANCELED";
    case "FAILED":
      return "ABORTED";
    case "READY":
      return "READY";
    case "PAY_PENDING":
      return "IN_PROGRESS";
  }
}

export function assertPortOnePaymentMatches(input: {
  payment: VerifiedPortOnePayment;
  paymentId: string;
  storeId: string;
  amount: number;
  currency: "KRW";
}) {
  const { payment } = input;
  if (
    payment.id !== input.paymentId ||
    payment.storeId !== input.storeId ||
    payment.amount.total !== input.amount ||
    payment.currency !== input.currency ||
    (payment.channel && payment.channel.pgProvider !== "KPN")
  ) {
    throw new PortOneApiError("REQUEST_FAILED");
  }
}

export function sanitizePortOneSnapshot(
  payment: VerifiedPortOnePayment,
) {
  return {
    paymentId: payment.id,
    transactionId: payment.transactionId,
    status: payment.status,
    method: payment.method
      ? {
          type: payment.method.type,
          ...("provider" in payment.method
            ? { easyPayProvider: payment.method.provider ?? null }
            : {}),
        }
      : null,
    currency: payment.currency,
    amount: {
      total: payment.amount.total,
      paid: payment.amount.paid,
      cancelled: payment.amount.cancelled,
    },
    pgProvider: payment.channel?.pgProvider ?? null,
    requestedAt: payment.requestedAt,
    statusChangedAt: payment.statusChangedAt,
    ...("paidAt" in payment ? { paidAt: payment.paidAt } : {}),
  };
}
