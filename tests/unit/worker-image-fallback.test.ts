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
});
