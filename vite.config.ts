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
        name: "gyeol",
        // A deploy re-enables `<name>.<subdomain>.workers.dev` unless this is explicit,
        // which would republish the site on a preview address that is meant to be
        // retired. `mygyeol.kr` is the only address in use.
        workers_dev: false,
        // `worker/index.ts` calls `env.IMAGES` to serve /_vinext/image. A deploy
        // replaces the Worker's bindings with whatever this config declares, so
        // leaving the binding out here would silently remove it from the deployed
        // Worker and break every optimized image on the live site.
        images: { binding: "IMAGES" },
      },
    }),
  ],
});
