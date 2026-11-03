import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const lintRequire = createRequire(require.resolve("eslint/package.json"));
const legacy = lintRequire("minimatch");

describe("patched glob engine and legacy caller compatibility", () => {
  it("routes the legacy ESLint caller to an explicit private adapter, not a vulnerable engine", () => {
    const pkg = JSON.parse(readFileSync(lintRequire.resolve("minimatch/package.json"), "utf8"));
    expect(pkg.name).toBe("@gyeol/minimatch-compat");
    expect(pkg.dependencies.minimatch).toBe("11.0.1");
    const modernRequire = createRequire(lintRequire.resolve("minimatch/package.json"));
    expect(modernRequire("minimatch/package.json").version).toBe("11.0.1");
    expect(modernRequire("minimatch").minimatch).toBeTypeOf("function");
  });

  it("keeps actual ESLint configuration matching and diagnostics active", async () => {
    const { ESLint } = await import("eslint");
    const lint = new ESLint();
    expect(await lint.isPathIgnored("node_modules/synthetic.js")).toBe(true);
    const [result] = await lint.lintText("export const synthetic: any = 1;", { filePath: "src/security-compat-probe.ts" });
    expect(result.messages.some(message => message.ruleId === "@typescript-eslint/no-explicit-any")).toBe(true);
  }, 15_000);

  it("keeps callable, filter, list, defaults, globstar and class APIs used by legacy tools", () => {
    expect(legacy).toBeTypeOf("function");
    expect(legacy("src/core/report.ts", "src/**/*.ts")).toBe(true);
    expect(legacy("src/core/report.js", "src/**/*.ts")).toBe(false);
    expect(["a.ts", "a.js"].filter(legacy.filter("*.ts"))).toEqual(["a.ts"]);
    expect(legacy.match(["a.ts", "a.js"], "*.ts")).toEqual(["a.ts"]);
    expect(legacy.defaults({ nocase: true })("Report.TS", "*.ts")).toBe(true);
    const pattern = new legacy.Minimatch("src/**/report.ts");
    expect(pattern.match("src/core/report.ts")).toBe(true);
    expect(pattern.set[0]).toContain(legacy.GLOBSTAR);
    expect(legacy(".private", "*")).toBe(false);
    expect(legacy(".private", "*", { dot: true })).toBe(true);
    expect(legacy("report.ts", "!*.js")).toBe(true);
  });
});


describe("patched SVG serialization through the actual OG dependency", () => {
  it("keeps crafted SVG attribute values as data rather than injected markup", async () => {
    const vinextRequire = createRequire(resolve("node_modules/vinext/package.json"));
    const ogRequire = createRequire(vinextRequire.resolve("@vercel/og"));
    const imported = ogRequire("satori");
    const render = imported.default ?? imported;
    expect(ogRequire("satori/package.json").version).toBe("0.33.5");
    const svg = await render(createElement("svg", { width: 20, height: 20, viewBox: "0 0 20 20" },
      createElement("circle", { cx: 10, cy: 10, r: 5, id: '\"><g data-injected="yes"></g><circle id="' })),
    { width: 20, height: 20, fonts: [] });
    const embedded = svg.match(/(?:href|xlink:href)="data:image\/svg\+xml[^,]*,([^"]+)"/);
    expect(embedded).not.toBeNull();
    const inner = decodeURIComponent(embedded![1]);
    expect(inner).toContain("<circle");
    expect(inner).toContain("data-injected");
    expect(inner).not.toContain('<g data-injected="yes">');
    expect(inner).toContain("&quot;");
  });
});


describe("CI browser preparation contract", () => {
  it("preserves required check names and the three real browser projects", () => {
    const eslintrcRequire = createRequire(lintRequire.resolve("@eslint/eslintrc"));
    const workflow = eslintrcRequire("js-yaml").load(readFileSync(".github/workflows/ci.yml", "utf8"));
    const job = workflow.jobs["space-browser"];
    expect(job.name).toBe("space-browser (${{ matrix.project }})");
    expect(job.strategy.matrix.include).toEqual([
      { project: "desktop-space", browser: "chromium" },
      { project: "iphone-space", browser: "webkit" },
      { project: "android-space", browser: "chromium" },
    ]);
    const install = job.steps.find((step: { id?: string }) => step.id === "browser_install");
    expect(install.run).toContain("install --with-deps ${{ matrix.browser }}");
    for (const title of ["Run isolated material recovery gate", "Run functional and visual space gates"]) {
      const step = job.steps.find((step: { name?: string }) => step.name === title);
      expect(step.if).toContain("!cancelled()");
      expect(step.if).toContain("steps.browser_install.outcome == 'success'");
    }
  });
});
