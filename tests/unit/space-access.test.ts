import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), admin: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/supabase/auth", () => ({ requireSupabaseUser: mocks.auth }));
vi.mock("@/lib/supabase/admin", () => ({ resolveSupabaseAdminClient: mocks.admin }));
vi.mock("@/server/abuse-protection", () => ({ enforceSensitiveRequestLimit: mocks.limit }));
import { safeSpace, spaceAccess, spaceResponse } from "@/server/space/access";
const request = () => new Request("https://example.test/api/space/projects", { method: "POST", headers: { Origin: "https://example.test" } });
beforeEach(() => { vi.stubEnv("SPACE_ENABLED", "true"); mocks.auth.mockResolvedValue({ user: { id: "owner" }, client: {}, error: null }); mocks.admin.mockReturnValue({ client: {} }); mocks.limit.mockResolvedValue({ configured: true, allowed: true }); });
describe("space API access", () => {
  it("fails closed for missing rate-limit configuration on new writes", async () => { mocks.limit.mockResolvedValue({ configured: false, allowed: true }); await expect(spaceAccess(request(), { write: true })).rejects.toMatchObject({ code: "RATE_LIMIT_UNAVAILABLE" }); });
  it("refuses wrong origin before auth or body processing", async () => { mocks.auth.mockClear(); const response = await safeSpace(async () => { await spaceAccess(new Request("https://example.test/api/space", { headers: { Origin: "https://attacker.test" } }), { write: true }); return spaceResponse({}); }); expect(response.status).toBe(403); expect(mocks.auth).not.toHaveBeenCalled(); });
  it("refuses unauthenticated accounts", async () => { mocks.auth.mockResolvedValue({ user: null }); await expect(spaceAccess(request())).rejects.toMatchObject({ status: 401 }); });
  it("refuses missing private storage configuration", async () => { mocks.admin.mockReturnValue({ client: null }); await expect(spaceAccess(request())).rejects.toMatchObject({ status: 503 }); });
  it("retains read/delete access after feature kill switch", async () => { vi.stubEnv("SPACE_ENABLED", "false"); await expect(spaceAccess(request(), { existing: true, write: true })).resolves.toHaveProperty("owner", "owner"); await expect(spaceAccess(request(), { write: true })).rejects.toMatchObject({ code: "SPACE_DISABLED" }); });
  it("enforces stricter account/IP hourly model quota", async () => { await spaceAccess(request(), { write: true, costly: true }); expect(mocks.limit).toHaveBeenCalledWith(expect.objectContaining({ accountLimit: 3, ipLimit: 10, windowSeconds: 3600 })); });
  it("returns private non-indexable errors without raw diagnostic data", async () => { const response = await safeSpace(async () => { throw new Error("secret signed storage private identity"); }); expect(response.headers.get("cache-control")).toBe("private, no-store"); expect(response.headers.get("x-robots-tag")).toContain("noindex"); expect(await response.text()).not.toContain("secret"); });
  it("returns 429 and retry advice when quota denies access", async () => { mocks.limit.mockResolvedValue({ configured: true, allowed: false }); const response = await safeSpace(async () => { await spaceAccess(request()); return spaceResponse({}); }); expect(response.status).toBe(429); expect(response.headers.get("retry-after")).toBeTruthy(); });
});
