const SUPABASE_HOST_SUFFIX = ".supabase.co";
const LEGACY_JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/** The `role` claim of a JWT, without verifying its signature. */
function readJwtRole(token: string): string | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const claims: unknown = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    );
    if (!claims || typeof claims !== "object") return null;
    const role = (claims as { role?: unknown }).role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

/**
 * Supabase issues two shapes of browser-safe key: the current `sb_publishable_…`
 * string and the legacy anon JWT that most existing projects still hold. Both are
 * meant to reach browsers, and accepting only the newer shape rejected a valid and
 * very common configuration.
 *
 * The check exists to stop a *secret* being published, not to enforce a key vintage,
 * so a legacy token is admitted only after reading its own role claim — a service-role
 * JWT is refused for what it is rather than for its format. The signature is not
 * verified because this decides what may be published, not what is trusted; only the
 * Supabase server can authorize the token.
 */
export function isPublishableSupabaseKey(key: string): boolean {
  if (key.length < 32) return false;
  if (key.startsWith("sb_secret_")) return false;
  if (key.startsWith("sb_publishable_")) return key.length <= 240;
  if (key.length > 500 || !LEGACY_JWT_PATTERN.test(key)) return false;
  return readJwtRole(key) === "anon";
}

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
  if (!isPublishableSupabaseKey(publishableKey)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key " +
        "(sb_publishable_…) or a legacy anon key. A service-role key must never be " +
        "placed in a NEXT_PUBLIC_ variable.",
    );
  }
  return { url: url.origin, publishableKey };
}

export function isSupabaseConfigured(
  environment: PublicEnvironment = process.env,
): boolean {
  return getSupabasePublicConfig(environment) !== null;
}
