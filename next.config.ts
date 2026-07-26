import type { NextConfig } from "next";
import { buildSecurityHeaders, type RuntimeMode } from "./src/core/security";
import { inspectAIProviderReadiness } from "./src/server/providers/runtime";

const runtimeMode: RuntimeMode = process.env.NODE_ENV === "production"
  ? "production"
  : process.env.NODE_ENV === "test"
    ? "test"
    : "development";
const enforceHttps = process.env.APP_HTTPS_ONLY === "true";
inspectAIProviderReadiness(process.env, runtimeMode);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { typedEnv: true },
  async headers() {
    return [{ source: "/(.*)", headers: [...buildSecurityHeaders(runtimeMode, enforceHttps)] }];
  },
};

export default nextConfig;
