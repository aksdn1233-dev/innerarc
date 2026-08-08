import type { NextConfig } from "next";
import { buildSecurityHeaders, type RuntimeMode } from "./src/core/security";
import { getSupabasePublicConfig } from "./src/lib/supabase/config";
import { inspectAIProviderReadiness } from "./src/server/providers/runtime";
import { inspectPaymentReadiness } from "./src/server/payments/config";

const runtimeMode: RuntimeMode = process.env.NODE_ENV === "production"
  ? "production"
  : process.env.NODE_ENV === "test"
    ? "test"
    : "development";
const enforceHttps = process.env.APP_HTTPS_ONLY === "true";

/**
 * Everything read here exists only to widen the Content-Security-Policy. A rejected
 * value used to throw straight through `next.config.ts` evaluation, which aborts the
 * whole build before a single page renders — so one mistyped browser-public variable
 * took down the deployment of every unrelated page, including the guest reading flow
 * that needs none of it. The narrower failure is to leave the origin out of the policy
 * and say so: the feature that depends on it is broken either way, and the
 * administrator console names the offending variable.
 */
function withoutCrashingTheBuild<T>(label: string, read: () => T, fallback: T): T {
  try {
    return read();
  } catch (cause) {
    console.warn(
      `[config] ${label} is unusable, continuing without it: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    return fallback;
  }
}

const supabaseConfig = withoutCrashingTheBuild(
  "Supabase public configuration",
  () => getSupabasePublicConfig(process.env),
  null,
);
const paymentReadiness = inspectPaymentReadiness(process.env, runtimeMode);
const browserConnectOrigins = [
  ...(supabaseConfig ? [supabaseConfig.url] : []),
  ...(paymentReadiness.enabled && paymentReadiness.config.provider === "toss"
    ? [
        "https://api.tosspayments.com",
        "https://apigw.tosspayments.com",
        "https://apigw-sandbox.tosspayments.com",
        "https://event.tosspayments.com",
        "https://log.tosspayments.com",
      ]
    : []),
  ...(paymentReadiness.enabled && paymentReadiness.config.provider === "portone"
    ? ["https://api.portone.io"]
    : []),
];
const browserScriptOrigins = paymentReadiness.enabled
  ? paymentReadiness.config.provider === "toss"
    ? ["https://js.tosspayments.com"]
    : ["https://cdn.portone.io"]
  : [];
const browserFrameOrigins = paymentReadiness.enabled && paymentReadiness.config.provider === "toss"
  ? [
      "https://payment-widget.tosspayments.com",
      "https://payment-gateway.tosspayments.com",
      "https://payment-gateway-sandbox.tosspayments.com",
      "https://connect.tosspayments.com",
    ]
  : [];
withoutCrashingTheBuild(
  "AI provider configuration",
  () => inspectAIProviderReadiness(process.env, runtimeMode),
  null,
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { typedEnv: true },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        ...buildSecurityHeaders(
          runtimeMode,
          enforceHttps,
          browserConnectOrigins,
          browserScriptOrigins,
          browserFrameOrigins,
          paymentReadiness.enabled,
        ),
      ],
    }];
  },
};

export default nextConfig;
