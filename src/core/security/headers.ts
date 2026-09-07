export type RuntimeMode = "development" | "test" | "production";

export type SecurityHeader = Readonly<{ key: string; value: string }>;

function validateHttpsOrigins(origins: readonly string[]): readonly string[] {
  return origins.map((origin) => {
    const url = new URL(origin);
    if (
      url.protocol !== "https:" ||
      url.origin !== origin ||
      url.username ||
      url.password
    ) {
      throw new Error("CSP origins must be credential-free HTTPS origins.");
    }
    return origin;
  });
}

export function buildContentSecurityPolicy(
  mode: RuntimeMode,
  enforceHttps = false,
  connectOrigins: readonly string[] = [],
  scriptOrigins: readonly string[] = [],
  frameOrigins: readonly string[] = [],
): string {
  const connectSources = ["'self'", ...validateHttpsOrigins(connectOrigins)].join(" ");
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...(mode === "development" ? ["'unsafe-eval'"] : []),
    ...validateHttpsOrigins(scriptOrigins),
  ].join(" ");
  const frameSources = ["'self'", ...validateHttpsOrigins(frameOrigins)].join(" ");
  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    // The opening screen plays a looping hero clip served from this origin. Kept to
    // 'self' rather than opened up: no third-party media host is used, and a remote one
    // would be a request to somewhere else on every visit to the home page.
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-src ${frameSources}`,
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];
  if (enforceHttps) directives.push("upgrade-insecure-requests");
  return `${directives.join("; ")};`;
}

// Paths whose contents belong to one buyer or to the operator. robots.txt asks a
// crawler not to fetch these; this header tells anything that fetched one anyway not
// to index or archive it, and it travels with the response rather than a separate file
// a crawler may never read.
const PRIVATE_PATH_PREFIXES = [
  "/ko/space/workspace",
  "/en/space/workspace",
  "/api/",
  "/auth/",
  "/ko/admin",
  "/en/admin",
  "/ko/reports/",
  "/en/reports/",
  "/ko/orders",
  "/en/orders",
  "/ko/me",
  "/en/me",
  "/ko/payments/",
  "/en/payments/",
] as const;

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Value for X-Robots-Tag, or null when the path may be indexed normally. */
export function robotsTagFor(pathname: string): string | null {
  return isPrivatePath(pathname)
    ? "noindex, nofollow, noarchive, nosnippet, noimageindex"
    : null;
}

export function buildSecurityHeaders(
  mode: RuntimeMode,
  enforceHttps = false,
  connectOrigins: readonly string[] = [],
  scriptOrigins: readonly string[] = [],
  frameOrigins: readonly string[] = [],
  allowCrossOriginPopups = false,
): readonly SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(
        mode,
        enforceHttps,
        connectOrigins,
        scriptOrigins,
        frameOrigins,
      ),
    },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    {
      key: "Cross-Origin-Opener-Policy",
      value: allowCrossOriginPopups ? "same-origin-allow-popups" : "same-origin",
    },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ];
  if (enforceHttps) {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
  }
  return headers;
}
