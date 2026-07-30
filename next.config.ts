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
const supabaseConfig = getSupabasePublicConfig(process.env);
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
inspectAIProviderReadiness(process.env, runtimeMode);

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
