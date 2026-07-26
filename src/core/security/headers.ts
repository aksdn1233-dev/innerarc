export type RuntimeMode = "development" | "test" | "production";

export type SecurityHeader = Readonly<{ key: string; value: string }>;

export function buildContentSecurityPolicy(mode: RuntimeMode, enforceHttps = false): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${mode === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];
  if (enforceHttps) directives.push("upgrade-insecure-requests");
  return `${directives.join("; ")};`;
}

export function buildSecurityHeaders(mode: RuntimeMode, enforceHttps = false): readonly SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(mode, enforceHttps) },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ];
  if (enforceHttps) {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
  }
  return headers;
}
