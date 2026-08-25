/**
 * Robots tokens published by AI model, answer-engine, and bulk-dataset
 * operators, plus a small set of established generic extraction agents.
 *
 * Keep ordinary discovery crawlers (Googlebot and Naver Yeti) out of this list:
 * the public marketing pages still need to be discoverable in conventional
 * search. User-agent strings are advisory and spoofable, so this list is one
 * layer rather than an authentication boundary.
 */
export const AI_CRAWLER_ROBOTS_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "GoogleOther",
  "GoogleOther-Image",
  "GoogleOther-Video",
  "Google-CloudVertexBot",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Diffbot",
  "cohere-ai",
  "Omgilibot",
  "Timpibot",
  "ImagesiftBot",
  "AI2Bot",
  "Scrapy",
] as const;

const AI_CRAWLER_HTTP_MARKERS = AI_CRAWLER_ROBOTS_AGENTS.map((agent) =>
  agent.toLocaleLowerCase("en-US"),
);

export function identifyAICrawler(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const normalized = userAgent.toLocaleLowerCase("en-US");
  const index = AI_CRAWLER_HTTP_MARKERS.findIndex((marker) => normalized.includes(marker));
  return index === -1 ? null : AI_CRAWLER_ROBOTS_AGENTS[index];
}

export function isAICrawlerUserAgent(userAgent: string | null): boolean {
  return identifyAICrawler(userAgent) !== null;
}

/**
 * Let a declared bot read the refusal in robots.txt, but deny every other
 * resource before application routing, static assets, or image optimization.
 */
export function shouldBlockAICrawlerRequest(request: Request): boolean {
  const pathname = new URL(request.url).pathname;
  return pathname !== "/robots.txt" && isAICrawlerUserAgent(request.headers.get("user-agent"));
}

export function aiCrawlerRefused(): Response {
  return new Response("AI crawler access denied", {
    status: 403,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "text/plain; charset=utf-8",
      "Vary": "User-Agent",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
    },
  });
}
