import { createManifestDocument } from "@/core/site-documents";

export function GET() {
  return Response.json(createManifestDocument(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/manifest+json; charset=utf-8",
    },
  });
}
