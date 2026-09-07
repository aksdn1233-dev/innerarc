import { describe, expect, it } from "vitest";
import jpeg from "jpeg-js";
import { readBounded, sanitizeJpeg } from "@/server/space/io";
function image() { return jpeg.encode({ width: 32, height: 32, data: new Uint8Array(32 * 32 * 4).fill(255), comments: ["PRIVATE GPS ADDRESS"] }, 75).data; }
describe("space private image trust boundary", () => {
  it("decodes and re-encodes synthetic pixels without metadata", () => { const source = image(); expect(Buffer.from(source).includes(Buffer.from("PRIVATE GPS ADDRESS"))).toBe(true); const clean = sanitizeJpeg(source, "image/jpeg"); expect(Buffer.from(clean).includes(Buffer.from("PRIVATE GPS ADDRESS"))).toBe(false); const decoded = jpeg.decode(clean); expect([decoded.width, decoded.height]).toEqual([32, 32]); });
  it.each(["image/png", "image/svg+xml", "application/pdf", null])("refuses raw or forged MIME %s", mime => expect(() => sanitizeJpeg(image(), mime)).toThrow());
  it("refuses malformed JPEG beyond just magic bytes", () => expect(() => sanitizeJpeg(new Uint8Array([255,216,1,2,3,4,5,6,7,8,9,10]), "image/jpeg")).toThrow());
  it("refuses oversized body before decoding", () => expect(() => sanitizeJpeg(new Uint8Array(1_500_001), "image/jpeg")).toThrow());
  it("refuses excessive decoded dimensions", () => { const large = jpeg.encode({ width: 1200, height: 16, data: new Uint8Array(1200 * 16 * 4) }, 70).data; expect(() => sanitizeJpeg(large, "image/jpeg")).toThrow("IMAGE_DIMENSIONS"); });
  it("cancels streaming bodies immediately at the byte cap", async () => { let cancelled = false; const stream = new ReadableStream<Uint8Array>({ pull(controller) { controller.enqueue(new Uint8Array(10)); }, cancel() { cancelled = true; } }); await expect(readBounded(stream, 15)).rejects.toThrow("BODY_TOO_LARGE"); expect(cancelled).toBe(true); });
});
