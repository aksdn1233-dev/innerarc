import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { OBJECT_KINDS } from "@/core/space/catalog";
type FileRecord = { path: string; bytes: number; sha256: string };
type AssetRecord = Partial<FileRecord> & { category: string; asset_id: string; license: string; source: string; polygon_count: number; texture_resolution: string; lod_availability: boolean; compression_status: string; files?: FileRecord[] };
const manifest = JSON.parse(readFileSync("public/space/assets/manifest.json", "utf8")) as { assets: AssetRecord[] };
it("ships licensed manifest coverage for every scene object kind", () => {
  const ids = new Set<string>();
  for (const asset of manifest.assets) {
    expect(ids.has(asset.asset_id)).toBe(false); ids.add(asset.asset_id);
    expect(["Project-owned", "CC-BY-4.0", "CC0-1.0"]).toContain(asset.license);
    expect(asset.source.length).toBeGreaterThan(10); expect(asset.texture_resolution).toBeTruthy(); expect(asset.compression_status).toBeTruthy(); expect(typeof asset.lod_availability).toBe("boolean");
    expect(asset.polygon_count).toBeGreaterThanOrEqual(0);
  }
  for (const kind of OBJECT_KINDS) expect(manifest.assets.some(asset => asset.category === kind && asset.polygon_count > 0)).toBe(true);
});
it("matches exact distributed asset bytes and hashes without public CDN dependencies", () => {
  const files = manifest.assets.flatMap(asset => [...(asset.files ?? []), ...(asset.path ? [asset as FileRecord] : [])]);
  expect(files).toHaveLength(12);
  for (const file of files) {
    expect(file.path).toMatch(/^\/space\/assets\/[a-z0-9.-]+$/);
    const bytes = readFileSync(`public${file.path}`); expect(bytes.length).toBe(file.bytes); expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
  }
});
