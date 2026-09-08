import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, isSecretSupabaseKey } from "./config";

export function getSupabaseAdminClient(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  fetchImpl?: typeof fetch,
): SupabaseClient | null {
  const publicConfig = getSupabasePublicConfig(environment);
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!publicConfig && !serviceRoleKey) return null;
  if (!publicConfig || !serviceRoleKey) {
    throw new Error(
      "Supabase public config and service-role key must be configured together: " +
        "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and " +
        "SUPABASE_SERVICE_ROLE_KEY are all required.",
    );
  }
  if (!isSecretSupabaseKey(serviceRoleKey)) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must be a Supabase secret key (sb_secret_…) or a " +
        "legacy service_role key. A publishable or anon key cannot be used here.",
    );
  }

  return createClient(publicConfig.url, serviceRoleKey, {
    ...(fetchImpl ? { global: { fetch: fetchImpl } } : {}),
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export type AdminClientResolution =
  | Readonly<{ client: SupabaseClient; reason: null }>
  | Readonly<{ client: null; reason: "NOT_CONFIGURED" | "MISCONFIGURED" }>;

/**
 * The same client without the throw. A half-configured Supabase deployment is a real
 * misconfiguration, but on a page a visitor is looking at, an exception is an outage
 * rather than a message: the caller gets a reason it can render or fail closed on, and
 * the administrator console names the offending variables.
 */
export function resolveSupabaseAdminClient(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  fetchImpl?: typeof fetch,
): AdminClientResolution {
  try {
    const client = getSupabaseAdminClient(environment, fetchImpl);
    return client ? { client, reason: null } : { client: null, reason: "NOT_CONFIGURED" };
  } catch {
    return { client: null, reason: "MISCONFIGURED" };
  }
}
