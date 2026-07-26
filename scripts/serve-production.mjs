import { createServer } from "node:http";
import next from "next";

const hostname = "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer from 1 to 65535.");
}

const app = next({ dev: false, dir: process.cwd(), hostname, port });
await app.prepare();
const handle = app.getRequestHandler();
const server = createServer((request, response) => {
  void handle(request, response);
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(port, hostname, resolve);
});
process.stdout.write(`InnerArc production test server ready at http://${hostname}:${port}\n`);

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.stdout.write(`Closing production test server after ${signal}\n`);
  const forceTimer = setTimeout(() => {
    server.closeAllConnections?.();
  }, 3_000);
  forceTimer.unref();
  await new Promise((resolve) => server.close(resolve));
  await app.close();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void shutdown(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : "Server shutdown failed"}\n`);
        process.exit(1);
      });
  });
}
