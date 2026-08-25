import { beforeEach, describe, expect, it, vi } from "vitest";

const { handlerFetch, optimize } = vi.hoisted(() => ({
  handlerFetch: vi.fn(),
  optimize: vi.fn(),
}));

vi.mock("vinext/server/app-router-entry", () => ({
  default: { fetch: handlerFetch },
}));

vi.mock("vinext/server/image-optimization", () => ({
  DEFAULT_DEVICE_SIZES: [640],
  DEFAULT_IMAGE_SIZES: [64],
  handleImageOptimization: optimize,
}));

import worker from "../../worker/index";

const context = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
};

describe("Worker image fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlerFetch.mockResolvedValue(new Response("original asset", { status: 200 }));
  });

  it("redirects to the original local asset when Cloudflare image bindings are absent", async () => {
    const response = await worker.fetch(
      new Request("https://example.test/_vinext/image?url=%2Fimages%2Fcharacter.png&w=640&q=75"),
      {},
      context,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/images/character.png");
    expect(handlerFetch).not.toHaveBeenCalled();
    expect(optimize).not.toHaveBeenCalled();
  });

  it("rejects remote or protocol-relative fallback sources", async () => {
    for (const source of ["https://attacker.test/image.png", "//attacker.test/image.png"]) {
      const response = await worker.fetch(
        new Request(`https://example.test/_vinext/image?url=${encodeURIComponent(source)}`),
        {},
        context,
      );
      expect(response.status).toBe(400);
    }
    expect(handlerFetch).not.toHaveBeenCalled();
  });

  it("refuses declared AI crawlers before pages or assets are served", async () => {
    for (const [path, userAgent] of [
      ["/ko", "Mozilla/5.0 (compatible; GPTBot/1.4; +https://openai.com/gptbot)"],
      ["/images/character.png", "Claude-SearchBot/1.0"],
      ["/api/health", "Perplexity-User/1.0"],
    ]) {
      const response = await worker.fetch(
        new Request(`https://example.test${path}`, { headers: { "user-agent": userAgent } }),
        {},
        context,
      );

      expect(response.status).toBe(403);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
    }
    expect(handlerFetch).not.toHaveBeenCalled();
    expect(optimize).not.toHaveBeenCalled();
  });

  it("lets bots read robots.txt and preserves conventional Google and Naver discovery", async () => {
    handlerFetch.mockResolvedValue(new Response("robots or public page", { status: 200 }));

    for (const request of [
      new Request("https://example.test/robots.txt", { headers: { "user-agent": "GPTBot/1.4" } }),
      new Request("https://example.test/ko", { headers: { "user-agent": "Googlebot/2.1" } }),
      new Request("https://example.test/ko", { headers: { "user-agent": "Yeti/1.1" } }),
    ]) {
      const response = await worker.fetch(request, {}, context);
      expect(response.status).toBe(200);
    }
    expect(handlerFetch).toHaveBeenCalledTimes(3);
  });
});
