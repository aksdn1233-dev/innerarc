import type { MetadataRoute } from "next";
import { resolvePublicAppUrl } from "@/core/site-url";

// Crawlers that collect pages to train or answer from a model. Refusing them keeps the
// reading copy — which is the product — out of systems that would reproduce it for
// free, while search engines are still welcome because customers arrive through them.
//
// This is a request, not a control: a well-behaved crawler obeys it and a hostile one
// ignores the file entirely. Enforcement belongs at the edge, in the hosting
// provider's bot rules, which can actually refuse the connection.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "meta-externalagent",
  "FacebookBot",
  "Diffbot",
  "cohere-ai",
  "Omgilibot",
  "Timpibot",
  "ImagesiftBot",
  "AI2Bot",
  "Scrapy",
] as const;

// Purchased readings, order lookup, and the console must never enter an index, whether
// or not a link to one leaks.
const PRIVATE_PATHS = [
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

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
      { userAgent: "*", disallow: [...PRIVATE_PATHS] },
    ],
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
    host: baseUrl.origin,
  };
}
