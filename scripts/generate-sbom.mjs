import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const artifactDirectory = resolve("artifacts");
const outputPath = resolve(artifactDirectory, "sbom.cdx.json");
mkdirSync(artifactDirectory, { recursive: true });

const pnpmArguments = [
  "sbom",
  "--sbom-format", "cyclonedx",
  "--sbom-spec-version", "1.6",
  "--sbom-type", "application",
  "--prod",
  "--lockfile-only",
  "--out", "artifacts/sbom.cdx.json",
];

if (process.platform === "win32") {
  execFileSync(process.env.ComSpec ?? "cmd.exe", [
    "/d",
    "/s",
    "/c",
    ["pnpm.cmd", ...pnpmArguments].join(" "),
  ], { stdio: "inherit" });
} else {
  execFileSync("pnpm", pnpmArguments, { stdio: "inherit" });
}

const raw = readFileSync(outputPath, "utf8");
const bom = JSON.parse(raw);
if (bom.bomFormat !== "CycloneDX" || bom.specVersion !== "1.6") {
  throw new Error("pnpm produced an unexpected SBOM format or version");
}
if (!Array.isArray(bom.components) || bom.components.length === 0) {
  throw new Error("SBOM contains no production components");
}
if (!Array.isArray(bom.dependencies) || bom.dependencies.length === 0) {
  throw new Error("SBOM contains no dependency graph");
}
if (raw.includes(process.cwd())) {
  throw new Error("SBOM unexpectedly contains the local workspace path");
}

process.stdout.write(`Validated CycloneDX 1.6 SBOM with ${bom.components.length} production components at ${outputPath}\n`);
