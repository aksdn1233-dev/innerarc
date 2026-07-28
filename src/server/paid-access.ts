import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";

export type EntitlementTier = "plus" | "pro";

// 19,000 KRW grants plus; 39,000 and 79,000 grant pro. A feature that belongs to the
// larger readings has to ask for "pro" explicitly, because checking only that some
// unexpired entitlement exists opened two-person compatibility to the cheapest one.
const TIER_RANK: Record<EntitlementTier, number> = { plus: 1, pro: 2 };

export async function hasPaidFeatureAccess(
  minimumTier: EntitlementTier = "plus",
): Promise<boolean> {
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

  const tier = data.tier as EntitlementTier | null;
  // An unrecognized tier fails closed instead of being treated as the highest one.
  if (!tier || !(tier in TIER_RANK)) return false;
  return TIER_RANK[tier] >= TIER_RANK[minimumTier];
}
