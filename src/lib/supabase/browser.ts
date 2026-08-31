"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, type SupabasePublicConfig } from "./config";

let browserClient: SupabaseClient | null = null;
let browserClientConfigKey: string | null = null;

export function getBrowserSupabaseClient(
  runtimeConfig?: SupabasePublicConfig | null,
): SupabaseClient | null {
  let config: SupabasePublicConfig | null;
  try {
    config = runtimeConfig ?? getSupabasePublicConfig();
  } catch {
    config = null;
  }

  if (!config) return null;
  const configKey = `${config.url}\u0000${config.publishableKey}`;
  if (browserClient && browserClientConfigKey === configKey) return browserClient;

  browserClient = createBrowserClient(config.url, config.publishableKey);
  browserClientConfigKey = configKey;
  return browserClient;
}
