import {
  JOURNEY_ROUTES,
  JOURNEY_SOURCES,
} from "./events";

export type JourneyRoute = (typeof JOURNEY_ROUTES)[number];
export type JourneySource = (typeof JOURNEY_SOURCES)[number];

const CAMPAIGN_SOURCES: Readonly<Record<string, JourneySource>> = {
  seenthis: "seenthis",
  disquiet: "disquiet",
  instagram: "instagram",
  insta: "instagram",
  naver: "naver_search",
  naver_blog: "naver_blog",
  blog_naver: "naver_blog",
  google: "google_search",
};

export function classifyJourneyRoute(pathname: string): JourneyRoute {
  const parts = pathname.toLowerCase().split("/").filter(Boolean);
  const route = parts[1] ?? "";
  if (!route) return "home";
  if (route === "samples" && parts[2] === "saju") return "sample_saju";
  if (route === "reports") return "report";
  if (route === "shop") return "shop";
  if (JOURNEY_ROUTES.includes(route as JourneyRoute)) return route as JourneyRoute;
  return "other";
}

export function classifyJourneySource(input: Readonly<{
  utmSource?: string | null;
  referrer?: string | null;
}>): JourneySource {
  const utmSource = input.utmSource?.trim().toLowerCase();
  if (utmSource) return CAMPAIGN_SOURCES[utmSource] ?? "other_campaign";

  if (!input.referrer) return "direct";
  try {
    const host = new URL(input.referrer).hostname.toLowerCase();
    if (!host || host === "mygyeol.kr" || host.endsWith(".mygyeol.kr")) return "direct";
    if (host === "blog.naver.com") return "naver_blog";
    if (host === "naver.com" || host.endsWith(".naver.com")) return "naver_search";
    if (host === "google.com" || host.endsWith(".google.com") || host.endsWith(".google.co.kr")) return "google_search";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
    if (host === "disquiet.io" || host.endsWith(".disquiet.io")) return "disquiet";
    if (host === "seenthis.kr" || host.endsWith(".seenthis.kr")) return "seenthis";
    return "other_referral";
  } catch {
    return "other_referral";
  }
}

export function isOperationalAutomationUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /(bot\b|crawler|spider|headless|playwright|puppeteer|curl\/|wget\/|^node$|python-requests|cloudflare custom hostname|gyeol release verification|automatic-service-review|palo alto networks)/i.test(userAgent);
}
