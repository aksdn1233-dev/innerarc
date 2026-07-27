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
    "media-src 'none'",
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
