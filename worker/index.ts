import {
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  handleImageOptimization,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { runDailyNotificationBatch } from "../src/server/daily-notifications";

interface WorkerEnv {
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{
          response(): Response;
        }>;
      };
    };
  };
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: WorkerEnv, context: WorkerContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const assets = env.ASSETS;
      const images = env.IMAGES;
      // Sites and local Vite previews do not always expose the optional Cloudflare
      // Images/ASSETS bindings. The optimized-image endpoint must still return the
      // original same-origin asset instead of throwing and replacing the report with
      // a "Cannot read properties of undefined" error.
      if (!assets || !images) {
        const source = url.searchParams.get("url");
        if (!source || !source.startsWith("/") || source.startsWith("//")) {
          return new Response("Invalid image source", { status: 400 });
        }
        const assetUrl = new URL(source, request.url);
        return assets
          ? assets.fetch(new Request(assetUrl, request))
          : Response.redirect(assetUrl, 307);
      }
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) => assets.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const transformed = images
              .input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return (await transformed).response();
          },
        },
        allowedWidths,
      );
    }

    return handler.fetch(request, env, context);
  },
  scheduled(controller: { scheduledTime: number }, env: WorkerEnv, context: WorkerContext) {
    const runtimeEnvironment = {
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    };
    context.waitUntil(runDailyNotificationBatch(runtimeEnvironment, new Date(controller.scheduledTime)));
  },
};

export default worker;
