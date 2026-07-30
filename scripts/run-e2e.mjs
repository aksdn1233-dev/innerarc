import { once } from "node:events";
import { spawn } from "node:child_process";

const host = "127.0.0.1";
const portInput = process.env.E2E_PORT ?? "3000";
if (!/^\d+$/.test(portInput)) throw new Error("E2E_PORT must be an integer from 1 to 65535.");
const port = Number.parseInt(portInput, 10);
if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error("E2E_PORT must be an integer from 1 to 65535.");
}
const baseURL = `http://${host}:${port}`;
const healthUrl = `http://${host}:${port}/ko`;
const node = process.execPath;
const playwrightArguments = [
  "./node_modules/@playwright/test/cli.js",
  "test",
  ...process.argv.slice(2).filter((argument) => argument !== "--"),
];
const paymentCheckoutTestEnvironment = process.env.E2E_PAYMENT_CHECKOUT === "1"
  ? {
      // These values only unlock the server-rendered checkout shell. Payment E2E
      // tests intercept the order endpoint before it can reach any provider.
      PAYMENTS_PROVIDER: "payapp",
      PAYMENTS_LAUNCH_APPROVED: "true",
      PAYAPP_USER_ID: "e2e-seller",
      PAYAPP_LINK_KEY: "e2e-link-key",
      PAYAPP_LINK_VALUE: "e2e-link-value",
      INNERARC_QUICK_TAROT_PRICE_KRW: "19000",
      INNERARC_COMPREHENSIVE_PRICE_KRW: "39000",
      INNERARC_PREMIUM_PDF_PRICE_KRW: "79000",
      SUPABASE_SERVICE_ROLE_KEY: "e2e-service-role-not-a-secret",
    }
  : {};

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
    ...paymentCheckoutTestEnvironment,
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
    env: { ...process.env, E2E_BASE_URL: baseURL, PLAYWRIGHT_EXTERNAL_SERVER: "1" },
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
