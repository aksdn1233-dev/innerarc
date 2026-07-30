import type { SupabaseClient } from "@supabase/supabase-js";

// An in-memory counter does nothing here: the worker runtime may serve consecutive
// requests from different isolates, so each burst request can meet a fresh, empty
// counter. Verified against the deployed site — a limit of three let four through.
//
// These limits therefore count the rows the request would create, which every isolate
// sees. That covers the two endpoints where abuse costs something real: an order calls
// the payment provider, and an inquiry lands in a human's queue.
//
// Volumetric flooding still belongs at the edge, in the hosting provider's own
// rate-limiting rules; no application code can stand in for that.
export type LimitOutcome =
  | Readonly<{ allowed: true }>
  | Readonly<{ allowed: false; retryAfterSeconds: number }>;

const ALLOWED: LimitOutcome = { allowed: true };

async function countSince(
  admin: SupabaseClient,
  table: string,
  column: string,
  value: string,
  sinceIso: string,
): Promise<number | null> {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, value)
    .gte("created_at", sinceIso);
  if (error) return null;
  return count ?? 0;
}

/**
 * Checkout attempts from one phone number. Fails open when the count cannot be read:
 * a database hiccup must not stop a paying customer from buying.
 */
export async function checkCheckoutLimit(
  admin: SupabaseClient,
  phoneHash: string | null,
  now: Date,
): Promise<LimitOutcome> {
  if (!phoneHash) return ALLOWED;
  const windowMinutes = 10;
  const limit = 5;
  const since = new Date(now.getTime() - windowMinutes * 60_000).toISOString();
  const used = await countSince(admin, "payment_orders", "customer_phone_hash", phoneHash, since);
  if (used === null || used < limit) return ALLOWED;
  return { allowed: false, retryAfterSeconds: windowMinutes * 60 };
}

/** Inquiries from one contact address. Same fail-open reasoning. */
export async function checkInquiryLimit(
  admin: SupabaseClient,
  contact: string,
  now: Date,
): Promise<LimitOutcome> {
  const windowMinutes = 60;
  const limit = 5;
  const since = new Date(now.getTime() - windowMinutes * 60_000).toISOString();
  const used = await countSince(admin, "support_inquiries", "contact", contact, since);
  if (used === null || used < limit) return ALLOWED;
  return { allowed: false, retryAfterSeconds: windowMinutes * 60 };
}

export function tooManyRequests(outcome: Extract<LimitOutcome, { allowed: false }>): Response {
  return new Response(
    JSON.stringify({ error: "TOO_MANY_REQUESTS" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Retry-After": String(outcome.retryAfterSeconds),
      },
    },
  );
}
