import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

const SERVICE_ROLE_PREFIX = "sb_secret_";

export function getSupabaseAdminClient(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): SupabaseClient | null {
  const publicConfig = getSupabasePublicConfig(environment);
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!publicConfig && !serviceRoleKey) return null;
  if (!publicConfig || !serviceRoleKey) {
    throw new Error("Supabase public config and service-role key must be configured together.");
  }
  if (
    !serviceRoleKey.startsWith(SERVICE_ROLE_PREFIX) ||
    serviceRoleKey.length < 32 ||
    serviceRoleKey.length > 240
  ) {
    throw new Error("Supabase service-role key is malformed.");
  }

  return createClient(publicConfig.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
