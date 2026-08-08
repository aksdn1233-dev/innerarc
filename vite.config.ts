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
        // Pinned, not derived, and it must match the Worker that actually holds the
        // `mygyeol.kr` custom domain — deploying to any other Worker reports success and
        // passes a health check while visitors keep getting the old build, with no error
        // anywhere to notice. This was `gyeol` until 2026-08-08; that Worker is gone and
        // `innerarc` is now the only one on the account. Verify against the account
        // before changing it — see "Where production actually is" in
        // `docs/Operations-Runbook.md` for the one-line check.
        name: "innerarc",
        routes: [{ pattern: "mygyeol.kr", custom_domain: true }],
        // Keep workers.dev enabled as the rollout fallback host.
        workers_dev: true,
        // `worker/index.ts` calls `env.IMAGES` to serve /_vinext/image. A deploy
        // replaces the Worker's bindings with whatever this config declares, so
        // leaving the binding out here would silently remove it from the deployed
        // Worker and break every optimized image on the live site.
        images: { binding: "IMAGES" },
      },
    }),
  ],
});
