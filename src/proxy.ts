import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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

  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
