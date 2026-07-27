import { once } from "node:events";
import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = 3_000;
const baseURL = `http://${host}:${port}`;
const healthUrl = `${baseURL}/ko`;
const node = process.execPath;

async function requestHealth(timeoutMs = 2_000) {
  try {
    return await fetch(healthUrl, { signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    return null;
  }
}

if (await requestHealth(750)) {
  throw new Error(`CAPTURE_PORT_IN_USE:${host}:${port}`);
}

const server = spawn(node, ["./scripts/serve-production.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    AI_PROVIDER: "disabled",
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
      throw new Error(`CAPTURE_SERVER_EXITED:${server.exitCode}`);
    }
    const response = await requestHealth();
    if (response?.ok) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("CAPTURE_SERVER_START_TIMEOUT");
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
  if (!forced && !hasExited()) throw new Error("CAPTURE_SERVER_STOP_TIMEOUT");
}

let exitCode = 1;
try {
  await waitForServer();
  const capture = spawn(node, ["./scripts/capture-launch-assets.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, CAPTURE_BASE_URL: baseURL },
    stdio: "inherit",
    windowsHide: true,
  });
  const [code, signal] = await once(capture, "exit");
  if (signal) throw new Error(`CAPTURE_RUNNER_SIGNAL:${signal}`);
  exitCode = typeof code === "number" ? code : 1;
} finally {
  await stopServer();
}

process.exitCode = exitCode;
