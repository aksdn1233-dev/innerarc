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
        // `mygyeol.kr` is still delegated to hosting.co.kr, so its Cloudflare route does
        // not fire and nothing deployed here is reachable at the domain yet. Until that
        // changes, `gyeol.<subdomain>.workers.dev` is the only address that serves this
        // build, and turning it off leaves no way to look at the site at all. Set this to
        // false once the domain is delegated and serving.
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
