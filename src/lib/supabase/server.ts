import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

export async function getServerSupabaseClient(): Promise<SupabaseClient | null> {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        try {
          for (const item of items) {
            cookieStore.set(item.name, item.value, item.options);
          }
        } catch {
          // Server Components cannot always write cookies. The proxy refreshes sessions.
        }
      },
    },
  });
}
