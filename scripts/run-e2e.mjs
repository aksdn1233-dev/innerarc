import { once } from "node:events";
import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = 3_000;
const healthUrl = `http://${host}:${port}/ko`;
const node = process.execPath;
const playwrightArguments = [
  "./node_modules/@playwright/test/cli.js",
  "test",
  ...process.argv.slice(2).filter((argument) => argument !== "--"),
];

async function requestHealth(timeoutMs = 2_000) {
  try {
    return await fetch(healthUrl, { signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    return null;
  }
}

if (await requestHealth(750)) {
  throw new Error(`E2E_PORT_IN_USE:${host}:${port}`);
}

const server = spawn(node, ["./scripts/serve-production.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    AI_PROVIDER: process.env.AI_PROVIDER ?? "disabled",
    NODE_ENV: "production",
    PORT: String(port),
  },
  stdio: ["ignore", "inherit", "inherit"],
  windowsHide: true,
});

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`E2E_SERVER_EXITED:${server.exitCode}`);
    }
    const response = await requestHealth();
    if (response?.ok) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("E2E_SERVER_START_TIMEOUT");
}

async function stopServer() {
  const hasExited = () => server.exitCode !== null || server.signalCode !== null;
  if (hasExited()) return;
  const gracefulExit = once(server, "exit");
  server.kill("SIGTERM");
  const graceful = await Promise.race([
    gracefulExit.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (graceful || hasExited()) return;

  const forcedExit = once(server, "exit");
  server.kill("SIGKILL");
  const forced = await Promise.race([
    forcedExit.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (!forced && !hasExited()) throw new Error("E2E_SERVER_STOP_TIMEOUT");
}

let exitCode = 1;
try {
  await waitForServer();
  const tests = spawn(node, playwrightArguments, {
    cwd: process.cwd(),
    env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: "1" },
    stdio: "inherit",
    windowsHide: true,
  });
  const [code, signal] = await once(tests, "exit");
  if (signal) throw new Error(`E2E_RUNNER_SIGNAL:${signal}`);
  exitCode = typeof code === "number" ? code : 1;
} finally {
  await stopServer();
}

process.exitCode = exitCode;
