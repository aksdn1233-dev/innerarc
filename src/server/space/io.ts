import jpeg from "jpeg-js";
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
export function sanitizeJpeg(bytes: Uint8Array, mime: string | null): Uint8Array {
  if (mime !== "image/jpeg" || bytes.length > SPACE_IMAGE_MAX_BYTES || bytes.length < 10 || bytes[0] !== 255 || bytes[1] !== 216) throw new Error("INVALID_IMAGE");
  // Decode is a trust boundary. Browser canvas output alone is never trusted.
  const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true, tolerantDecoding: false, maxResolutionInMP: 1.1, maxMemoryUsageInMB: 32 });
  if (decoded.width < 16 || decoded.height < 16 || decoded.width > 1024 || decoded.height > 1024) throw new Error("IMAGE_DIMENSIONS");
  // Deliberately omit decoded EXIF/comments: only raw pixels reach the encoder.
  const result = jpeg.encode({ width: decoded.width, height: decoded.height, data: decoded.data }, 75).data;
  if (result.length > SPACE_IMAGE_MAX_BYTES) throw new Error("IMAGE_TOO_LARGE");
  return new Uint8Array(result);
}
