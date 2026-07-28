import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { robotsTagFor } from "@/core/security/headers";
import { refreshSupabaseSession } from "@/lib/supabase/request";

export async function proxy(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (request.nextUrl.pathname === "/" && code) {
    const localeCookie = request.cookies.get("innerarc-auth-locale")?.value;
    const locale = localeCookie === "ko" || localeCookie === "en" ? localeCookie : "en";
    const callback = new URL("/auth/callback", request.url);
    callback.searchParams.set("code", code);
    callback.searchParams.set("next", `/${locale}/me`);
    const response = NextResponse.redirect(callback);
    response.cookies.delete("innerarc-auth-locale");
    return response;
  }

  const response = await refreshSupabaseSession(request);
  // Travels with the response itself, so anything that fetched a purchased reading or
  // the console without reading robots.txt is still told not to index or archive it.
  const robotsTag = robotsTagFor(request.nextUrl.pathname);
  if (robotsTag) response.headers.set("X-Robots-Tag", robotsTag);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
