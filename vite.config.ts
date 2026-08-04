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
        // `worker/index.ts` calls `env.IMAGES` to serve /_vinext/image. A deploy
        // replaces the Worker's bindings with whatever this config declares, so
        // leaving the binding out here would silently remove it from the deployed
        // Worker and break every optimized image on the live site.
        images: { binding: "IMAGES" },
      },
    }),
  ],
});
