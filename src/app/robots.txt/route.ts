import { createRobotsDocument, serializeRobots } from "@/core/site-documents";

export function GET() {
  return new Response(serializeRobots(createRobotsDocument()), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
