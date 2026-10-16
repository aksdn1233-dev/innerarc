import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Next and Vinext do not retain side-effect-only CSS Modules identically.
// Check the artifact that is deployed, not just the development stylesheet.
const directory = resolve("dist/client/assets");
const files = (await readdir(directory)).filter(file => file.endsWith(".css"));
const css = (await Promise.all(files.map(file => readFile(resolve(directory, file), "utf8")))).join("\n");
for (const selector of [".harang-renewal", ".saju-story-bubble", ".saju-intake-heading", ".saju-story-progress"]) {
  if (!css.includes(selector)) throw new Error(`PRODUCTION_STYLE_MISSING:${selector}`);
}
console.log("Production homepage and Saju styles are present.");
