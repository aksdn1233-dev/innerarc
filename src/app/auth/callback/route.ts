import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/en/me";
  return value;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const client = await getServerSupabaseClient();
  if (!client || !code) {
    return NextResponse.redirect(new URL(`${next}?auth=invalid_callback`, url.origin));
  }

  const { error } = await client.auth.exchangeCodeForSession(code);
  const status = error ? "auth=callback_failed" : "auth=signed_in";
  return NextResponse.redirect(new URL(`${next}?${status}`, url.origin));
}
