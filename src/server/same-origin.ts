// A browser attaches the page's own origin to every cross-site POST it makes, so a
// state-changing endpoint can refuse anything that did not come from this site. That
// stops a page the operator merely visits from firing an authenticated request — a
// refund, a settings change — using the session cookie the browser sends along.
//
// The session cookie is SameSite=Lax, which already blocks most of this, but that is a
// dependency's default rather than something this application states. This check is
// its own, and costs one header comparison.
//
// Deliberately not applied to the payment provider's callbacks: those are server to
// server with no Origin at all, and the return redirect legitimately arrives from the
// provider's own domain.
export function isSameOriginRequest(request: Request): boolean {
  const target = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin) {
    try {
      return new URL(origin).origin === target.origin;
    } catch {
      return false;
    }
  }

  // No Origin: fall back to Referer, then refuse. Every current browser sends Origin
  // on POST, so a missing one means the caller is not a browser form or fetch.
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === target.origin;
  } catch {
    return false;
  }
}

export function crossOriginRefused(): Response {
  return new Response(
    JSON.stringify({ error: "CROSS_ORIGIN_REQUEST" }),
    {
      status: 403,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    },
  );
}
