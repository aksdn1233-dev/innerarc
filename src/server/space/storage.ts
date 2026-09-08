// Scoped to space operations. Existing auth/payment/report client behavior is unchanged.
export const spaceStorageFetch: typeof fetch = (input, init) => fetch(input, {
  ...init,
  signal: AbortSignal.any([AbortSignal.timeout(30_000), ...(init?.signal ? [init.signal] : [])]),
});
