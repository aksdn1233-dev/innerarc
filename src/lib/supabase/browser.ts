"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

let browserClient: SupabaseClient | null | undefined;

export function getBrowserSupabaseClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;
  let config: ReturnType<typeof getSupabasePublicConfig>;
  try {
    config = getSupabasePublicConfig();
  } catch {
    config = null;
  }
  browserClient = config
    ? createBrowserClient(config.url, config.publishableKey)
    : null;
  return browserClient;
}
