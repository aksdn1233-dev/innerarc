import { describe, expect, it } from "vitest";
import jpeg from "jpeg-js";
import { prepareSpaceImage, readBounded, sanitizeJpeg } from "@/server/space/io";
function pixels(width = 720, height = 480) { const data = new Uint8Array(width * height * 4); for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const i = (y * width + x) * 4, value = (x * 5 + y * 3) % 210 + 22; data[i] = value; data[i + 1] = (value + x % 41) % 235 + 10; data[i + 2] = (value + y % 53) % 235 + 10; data[i + 3] = 255; } return data; }
function image() { return jpeg.encode({ width: 720, height: 480, data: pixels(), comments: ["PRIVATE GPS ADDRESS"] }, 82).data; }
describe("space private image trust boundary", () => {
  it("decodes and re-encodes useful pixels without metadata", () => { const source = image(); expect(Buffer.from(source).includes(Buffer.from("PRIVATE GPS ADDRESS"))).toBe(true); const prepared = prepareSpaceImage(source, "image/jpeg"); expect(Buffer.from(prepared.bytes).includes(Buffer.from("PRIVATE GPS ADDRESS"))).toBe(false); const decoded = jpeg.decode(prepared.bytes); expect([decoded.width, decoded.height]).toEqual([720, 480]); expect(prepared.quality.status).toBe("good"); });
  it.each(["image/png", "image/svg+xml", "application/pdf", null])("refuses raw or forged MIME %s", mime => expect(() => sanitizeJpeg(image(), mime)).toThrow());
  it("refuses malformed JPEG beyond just magic bytes", () => expect(() => sanitizeJpeg(new Uint8Array([255,216,1,2,3,4,5,6,7,8,9,10]), "image/jpeg")).toThrow());
  it("refuses oversized body before decoding", () => expect(() => sanitizeJpeg(new Uint8Array(3_500_001), "image/jpeg")).toThrow());
  it("refuses excessive decoded dimensions", () => { const large = jpeg.encode({ width: 2049, height: 480, data: pixels(2049, 480) }, 70).data; expect(() => sanitizeJpeg(large, "image/jpeg")).toThrow("IMAGE_DIMENSIONS"); });
  it("refuses tiny and content-free photos before private storage", () => {
    const tiny = jpeg.encode({ width: 320, height: 240, data: pixels(320, 240) }, 75).data;
    const blank = jpeg.encode({ width: 720, height: 480, data: new Uint8Array(720 * 480 * 4).fill(5) }, 75).data;
    expect(() => sanitizeJpeg(tiny, "image/jpeg")).toThrow("PHOTO_QUALITY_UNUSABLE");
    expect(() => sanitizeJpeg(blank, "image/jpeg")).toThrow("PHOTO_QUALITY_UNUSABLE");
  });
  it("cancels streaming bodies immediately at the byte cap", async () => { let cancelled = false; const stream = new ReadableStream<Uint8Array>({ pull(controller) { controller.enqueue(new Uint8Array(10)); }, cancel() { cancelled = true; } }); await expect(readBounded(stream, 15)).rejects.toThrow("BODY_TOO_LARGE"); expect(cancelled).toBe(true); });
});
