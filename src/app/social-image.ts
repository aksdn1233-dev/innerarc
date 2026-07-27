import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const socialImageAlt =
  "InnerArc Personal Pattern Intelligence with the number 11 and three abstract reflective card backs";
export const socialImageSize = { width: 1200, height: 630 } as const;
export const socialImageContentType = "image/png";

export async function createSocialImageResponse(): Promise<Response> {
  const image = await readFile(join(process.cwd(), "public", "og.png"));
  return new Response(new Uint8Array(image), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": socialImageContentType,
    },
  });
}

