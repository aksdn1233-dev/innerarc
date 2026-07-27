const SUPABASE_HOST_SUFFIX = ".supabase.co";

export type SupabasePublicConfig = Readonly<{
  url: string;
  publishableKey: string;
}>;

type PublicEnvironment = Readonly<Record<string, string | undefined>>;

export function getSupabasePublicConfig(
  environment: PublicEnvironment = process.env,
): SupabasePublicConfig | null {
  const rawUrl = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!rawUrl && !publishableKey) return null;
  if (!rawUrl || !publishableKey) {
    throw new Error("Supabase URL and publishable key must be configured together.");
  }

  const url = new URL(rawUrl);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !url.hostname.endsWith(SUPABASE_HOST_SUFFIX)
  ) {
    throw new Error("Supabase URL must be a path-free HTTPS *.supabase.co origin.");
  }
  if (
    !publishableKey.startsWith("sb_publishable_") ||
    publishableKey.length < 32 ||
    publishableKey.length > 240
  ) {
    throw new Error("Supabase publishable key is malformed.");
  }
  return { url: url.origin, publishableKey };
}

export function isSupabaseConfigured(
  environment: PublicEnvironment = process.env,
): boolean {
  return getSupabasePublicConfig(environment) !== null;
}
