import { createImageSitemapXml } from "@/core/site-documents";

export function GET() {
  return new Response(createImageSitemapXml(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
