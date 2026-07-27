import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";

export async function hasPaidFeatureAccess(): Promise<boolean> {
  const auth = await requireSupabaseUser();
  if (!auth.user) return false;
  const admin = getSupabaseAdminClient();
  if (!admin) return false;
  const { data } = await admin
    .from("account_entitlements")
    .select("valid_until")
    .eq("owner_user_id", auth.user.id)
    .gt("valid_until", new Date().toISOString())
    .maybeSingle();
  return Boolean(data);
}
