import jpeg from "jpeg-js";
import { assessPhotoPixels, type PhotoQuality } from "@/core/space/photo-quality";
import { SPACE_IMAGE_MAX_BYTES } from "./config";

export async function readBounded(stream: ReadableStream<Uint8Array> | null, limit: number): Promise<Uint8Array> {
  if (!stream) throw new Error("EMPTY_BODY");
  const reader = stream.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("BODY_TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
export async function readJson(request: Request, limit = 64_000): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("INVALID_CONTENT_TYPE");
  return JSON.parse(new TextDecoder().decode(await readBounded(request.body, limit)));
}
export function prepareSpaceImage(bytes: Uint8Array, mime: string | null): { bytes: Uint8Array; quality: PhotoQuality } {
  if (mime !== "image/jpeg" || bytes.length > SPACE_IMAGE_MAX_BYTES || bytes.length < 10 || bytes[0] !== 255 || bytes[1] !== 216) throw new Error("INVALID_IMAGE");
  // Decode is a trust boundary. Browser canvas output alone is never trusted.
  const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true, tolerantDecoding: false, maxResolutionInMP: 4.3, maxMemoryUsageInMB: 96 });
  if (decoded.width > 2048 || decoded.height > 2048) throw new Error("IMAGE_DIMENSIONS");
  const quality = assessPhotoPixels(decoded.data, decoded.width, decoded.height);
  if (quality.status === "unusable") throw new Error("PHOTO_QUALITY_UNUSABLE");
  // Deliberately omit decoded EXIF/comments: only raw pixels reach the encoder.
  const result = jpeg.encode({ width: decoded.width, height: decoded.height, data: decoded.data }, 86).data;
  if (result.length > SPACE_IMAGE_MAX_BYTES) throw new Error("IMAGE_TOO_LARGE");
  return { bytes: new Uint8Array(result), quality };
}

export function sanitizeJpeg(bytes: Uint8Array, mime: string | null): Uint8Array {
  return prepareSpaceImage(bytes, mime).bytes;
}
