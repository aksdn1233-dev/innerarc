const DEFAULT_E2E_BASE_URL = "http://127.0.0.1:3000";

export const E2E_ORIGIN = new URL(
  process.env.E2E_BASE_URL ?? DEFAULT_E2E_BASE_URL,
).origin;
