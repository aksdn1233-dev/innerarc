import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";

export type EntitlementTier = "plus" | "pro";

// 19,000 KRW grants plus; 39,000 and 79,000 grant pro. A feature that belongs to the
// larger readings has to ask for "pro" explicitly, because checking only that some
// unexpired entitlement exists opened two-person compatibility to the cheapest one.
const TIER_RANK: Record<EntitlementTier, number> = { plus: 1, pro: 2 };

function meetsTier(tier: string | null, minimumTier: EntitlementTier): boolean {
  // An unrecognized tier — including the "none" a pass carries before the provider
  // confirms payment — fails closed instead of being treated as the highest one.
  if (!tier || !(tier in TIER_RANK)) return false;
  return TIER_RANK[tier as EntitlementTier] >= TIER_RANK[minimumTier];
}

export async function hasPaidFeatureAccess(
  minimumTier: EntitlementTier = "plus",
): Promise<boolean> {
  // Purchases are guest-first, so the usual proof is a pass issued from the buyer's
  // own completed order rather than a signed-in account.
  const { ORDER_PASS_COOKIE, readOrderPass } = await import("@/server/order-pass");
  const pass = readOrderPass(
    (await cookies()).get(ORDER_PASS_COOKIE)?.value,
    new Date(),
  );
  if (pass && meetsTier(pass.tier, minimumTier)) return true;

  const auth = await requireSupabaseUser();
  if (!auth.user) return false;
  const admin = getSupabaseAdminClient();
  if (!admin) return false;
  const { data } = await admin
    .from("account_entitlements")
    .select("tier,valid_until")
    .eq("owner_user_id", auth.user.id)
    .gt("valid_until", new Date().toISOString())
    .maybeSingle();
  if (!data) return false;
  return meetsTier(data.tier as EntitlementTier | null, minimumTier);
}
