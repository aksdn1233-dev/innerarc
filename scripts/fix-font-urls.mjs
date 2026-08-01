// vinext 0.0.50 emits @font-face `src` values as absolute local filesystem paths
// (e.g. C:/work/innerarc/.vinext/fonts/<family>/<file>.woff2) instead of the public
// asset URL it actually uploads. The bundled site then requests a path that only
// exists on the build machine, so every custom font silently fails in production.
//
// The emitted directory and file names already match dist/client/assets/_vinext_fonts,
// so rewriting the local prefix to the public prefix is enough. Run after `vinext build`.
import { copyFile, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const PUBLIC_PREFIX = "/assets/_vinext_fonts/";
const localPrefix = `${resolve(process.cwd(), ".vinext", "fonts").replaceAll("\\", "/")}/`;

async function* bundleFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* bundleFiles(path);
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".css")) {
      yield path;
    }
  }
}

const serverDirectory = resolve(process.cwd(), "dist", "server");
try {
  await stat(serverDirectory);
} catch {
  throw new Error("dist/server not found. Run `vinext build` first.");
}

// Vinext does not currently copy Next.js file-based icon metadata into its client
// output. Keep the established 512px brand icon available at the URL declared by
// the web manifest without maintaining a second binary source file.
await copyFile(
  resolve(process.cwd(), "src", "app", "icon.png"),
  resolve(process.cwd(), "dist", "client", "icon.png"),
);

let rewrittenFiles = 0;
let rewrittenUrls = 0;
for await (const file of bundleFiles(serverDirectory)) {
  const source = await readFile(file, "utf8");
  if (!source.includes(localPrefix)) continue;
  const occurrences = source.split(localPrefix).length - 1;
  await writeFile(file, source.replaceAll(localPrefix, PUBLIC_PREFIX));
  rewrittenFiles += 1;
  rewrittenUrls += occurrences;
}

if (rewrittenFiles === 0) {
  console.log("No local font paths found; nothing to rewrite.");
} else {
  console.log(`Rewrote ${rewrittenUrls} font URLs across ${rewrittenFiles} file(s).`);
}
