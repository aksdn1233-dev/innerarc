const LOCAL_METADATA_BASE = "http://127.0.0.1:3000";

function isLoopback(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function resolvePublicAppUrl(value: string | undefined): URL {
  const source = value?.trim() || LOCAL_METADATA_BASE;
  let parsed: URL;
  try {
    parsed = new URL(source);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTP or HTTPS.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("NEXT_PUBLIC_APP_URL must not contain credentials.");
  }
  if (parsed.search || parsed.hash) {
    throw new Error("NEXT_PUBLIC_APP_URL must not contain query parameters or a fragment.");
  }
  if (parsed.pathname !== "/") {
    throw new Error("NEXT_PUBLIC_APP_URL must be an origin without a path.");
  }
  if (parsed.protocol !== "https:" && !isLoopback(parsed.hostname)) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS outside local development.");
  }

  return new URL(`${parsed.origin}/`);
}
