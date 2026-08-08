import type { User } from "@supabase/supabase-js";
import { getServerSupabaseClient } from "./server";

export async function requireSupabaseUser() {
  const client = await getServerSupabaseClient();
  if (!client) return { client: null, user: null, error: "SUPABASE_DISABLED" as const };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return { client, user: null, error: "AUTH_REQUIRED" as const };
  }
  return { client, user: data.user as User, error: null };
}
