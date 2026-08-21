import type { MetadataRoute } from "next";
import { resolvePublicAppUrl } from "@/core/site-url";

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

const PUBLIC_ROUTES = [
  "",
  "/fortune",
  "/daily-fortune",
  "/profile",
  "/numerology",
  "/relationship",
  "/question",
  "/reality-check",
  "/plans",
  "/support",
  "/privacy",
  "/terms",
] as const;

export function createRobotsDocument(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): MetadataRoute.Robots {
  const baseUrl = resolvePublicAppUrl(environment.NEXT_PUBLIC_APP_URL);
  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
      { userAgent: "*", disallow: [...PRIVATE_PATHS] },
    ],
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
    host: baseUrl.origin,
  };
}

export function createManifestDocument(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "결 GYEOL — 나·관계·올해의 흐름 리딩",
    short_name: "결 GYEOL",
    description: "나의 성향과 관계, 올해의 흐름을 알기 쉽게 정리하는 개인 리딩.",
    start_url: "/ko",
    scope: "/",
    display: "standalone",
    background_color: "#f5f1e8",
    theme_color: "#3f5142",
    lang: "ko",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

export function createSitemapDocument(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): MetadataRoute.Sitemap {
  const baseUrl = resolvePublicAppUrl(environment.NEXT_PUBLIC_APP_URL);
  const lastModified = new Date();
  const establishedRoutes = (["ko", "en"] as const).flatMap((locale) =>
    PUBLIC_ROUTES.map((route) => ({
      url: new URL(`/${locale}${route}`, baseUrl).toString(),
      lastModified,
      changeFrequency: route === "/daily-fortune" ? "daily" as const : route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : route === "/plans" ? 0.9 : route === "/daily-fortune" ? 0.8 : 0.7,
      alternates: {
        languages: {
          ko: new URL(`/ko${route}`, baseUrl).toString(),
          en: new URL(`/en${route}`, baseUrl).toString(),
        },
      },
    })),
  );
  const japaneseRoutes = ["", "/reading", "/plans"] as const;
  return [
    ...establishedRoutes,
    ...japaneseRoutes.map((route) => ({
      url: new URL(`/ja${route}`, baseUrl).toString(),
      lastModified,
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 0.9 : route === "/plans" ? 0.85 : 0.8,
      alternates: {
        languages: {
          ko: new URL(`/ko${route === "/reading" ? "/reading" : route}`, baseUrl).toString(),
          en: new URL(`/en${route === "/reading" ? "/reading" : route}`, baseUrl).toString(),
          ja: new URL(`/ja${route}`, baseUrl).toString(),
        },
      },
    })),
  ];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function serializeRobots(document: MetadataRoute.Robots): string {
  const rules = Array.isArray(document.rules) ? document.rules : [document.rules];
  const blocks = rules.map((rule) => {
    const userAgents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
    const disallows = rule.disallow === undefined
      ? []
      : Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    const allows = rule.allow === undefined
      ? []
      : Array.isArray(rule.allow) ? rule.allow : [rule.allow];
    return [
      ...userAgents.map((value) => `User-agent: ${value}`),
      ...allows.map((value) => `Allow: ${value}`),
      ...disallows.map((value) => `Disallow: ${value}`),
    ].join("\n");
  });
  const sitemap = document.sitemap
    ? (Array.isArray(document.sitemap) ? document.sitemap : [document.sitemap])
      .map((value) => `Sitemap: ${value}`)
    : [];
  return [...blocks, ...(document.host ? [`Host: ${document.host}`] : []), ...sitemap, ""]
    .join("\n\n");
}

export function serializeSitemap(document: MetadataRoute.Sitemap): string {
  const entries = document.map((entry) => {
    const alternateEntries = entry.alternates?.languages
      ? Object.entries(entry.alternates.languages).map(([language, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(String(href))}" />`)
      : [];
    const lastModified = entry.lastModified instanceof Date
      ? entry.lastModified.toISOString()
      : entry.lastModified;
    return [
      "  <url>",
      `    <loc>${escapeXml(entry.url)}</loc>`,
      ...(lastModified ? [`    <lastmod>${escapeXml(String(lastModified))}</lastmod>`] : []),
      ...(entry.changeFrequency ? [`    <changefreq>${entry.changeFrequency}</changefreq>`] : []),
      ...(entry.priority === undefined ? [] : [`    <priority>${entry.priority}</priority>`]),
      ...alternateEntries,
      "  </url>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}
