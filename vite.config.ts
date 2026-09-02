import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import vinext from "vinext";
import { sites } from "./build/sites-vite-plugin";

export default defineConfig({
  plugins: [
    vinext(),
    sites(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      config: {
        main: "./worker/index.ts",
        compatibility_flags: ["nodejs_compat"],
        // The Worker that `mygyeol.kr/*` routes to is called `gyeol`. Without this the
        // name is derived from the package and comes out `innerarc`, which is a
        // different, empty Worker in the same account holding only a discard route — so
        // a deploy would report success while the live site kept serving the old build.
        // `mygyeol.kr` must route to `innerarc`, so pin the worker name here to
        // prevent accidental deploys to a detached worker.
        name: "innerarc",
        routes: [{ pattern: "mygyeol.kr", custom_domain: true }],
        // Dynamic discovery routes execute after compilation, so a build-time shell
        // variable alone is insufficient. Keep the public origin in the Worker runtime
        // too; it is public configuration, not a secret.
        vars: { NEXT_PUBLIC_APP_URL: "https://mygyeol.kr" },
        // Keep workers.dev enabled as the rollout fallback host.
        workers_dev: true,
        // `worker/index.ts` calls `env.IMAGES` to serve /_vinext/image. A deploy
        // replaces the Worker's bindings with whatever this config declares, so
        // leaving the binding out here would silently remove it from the deployed
        // Worker and break every optimized image on the live site.
        images: { binding: "IMAGES" },
        // `worker/index.ts` needs `env.ASSETS` as well: without it the optimized-image
        // route cannot read the source file, falls back to a 307 to the unoptimized
        // original, and the deploy workflow's own check fails on `image=307`. The
        // generated config only carried `assets.directory`, so the binding was never
        // exposed to the Worker and every image on the live site was served full size.
        assets: { binding: "ASSETS" },
        // 00:00 UTC is 09:00 in Korea. The handler only creates consented,
        // owner-scoped in-site notifications and is idempotent per account/day.
        triggers: { crons: ["0 0 * * *"] },
      },
    }),
  ],
});
